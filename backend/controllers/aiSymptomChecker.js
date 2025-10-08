// backend/controllers/aiSymptomChecker.js

const axios = require("axios");

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, sex } = req.body;

    // Input validation
    if (!symptoms || !age || !sex) {
      return res.status(400).json({
        success: false,
        message: "Symptoms, age, and sex are required.",
      });
    }

    if (typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed description of your symptoms.",
      });
    }

    if (age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid age between 1 and 120.",
      });
    }

    if (!["male", "female", "other"].includes(sex.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Sex must be 'male', 'female', or 'other'.",
      });
    }

    // API key check
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return res.status(500).json({
        success: false,
        message:
          "AI service is not properly configured. Please contact support.",
      });
    }

    // ------------------ MASTER PROMPT ------------------
    const masterPrompt = `
You are **MedAI**, an advanced AI Medical Information Assistant. Your goal is to interpret a user's natural, human-like symptom descriptions and provide accurate, safe, and educational information about possible causes — never diagnoses.

Follow these strict guidelines:

---

### 🧠 Step 1: Understanding the User
The user has reported the following:
- **Symptoms:** "${symptoms.trim()}"
- **Age:** ${age}
- **Sex:** ${sex.toLowerCase()}

Interpret their statement like a doctor listening to a patient. People may describe symptoms in vague, conversational ways (e.g., “pain in my eye”, “my stomach feels heavy”, “feeling tired and dizzy lately”). Use your medical reasoning to infer likely symptom categories.

---

### 🩺 Step 2: Validate Input
If the input clearly **does not describe a medical symptom** (e.g., “I like pizza”, “my dog is cute”, “hello”, gibberish, etc.), respond **only** with this exact JSON:

{
  "error": "invalid_input",
  "message": "I can only provide information about medical symptoms. Please describe how you are feeling."
}

---

### ⚙️ Step 3: Generate a Safe, Helpful Response
If the symptoms are valid:
- Identify **3–6 common potential conditions** that could *possibly* cause such symptoms.
- For each, provide:
  - **name** – the condition (simple, recognizable terms)
  - **description** – an easy-to-understand summary (1–2 sentences)
  - **probability** – "High", "Medium", or "Low", based on commonness and symptom fit.
- Include **a short general first aid or self-care tip** relevant to the primary symptom.
- Add a **disclaimer**: “This is not a medical diagnosis. Please consult a doctor for accurate advice.”

---

### ⚖️ Step 4: Tone and Responsibility
- Never use diagnostic language (e.g., “you have”, “you are suffering from”).
- Use educational phrasing such as:
  - “Possible causes could include…”
  - “Common explanations for these symptoms are…”
- Avoid suggesting drugs, tests, or prescriptions.

---

### 🧾 Step 5: Output Format
Your entire response **must** be valid JSON and nothing else:

{
  "potentialConditions": [
    {
      "name": "Condition Name",
      "description": "Brief, clear explanation.",
      "probability": "High" | "Medium" | "Low"
    }
  ],
  "firstAidSuggestion": "Simple, safe first-aid guidance relevant to main symptom.",
  "disclaimer": "This is not a medical diagnosis. Please consult a qualified doctor for accurate advice."
}
`;

    console.log(
      `AI Symptom Check Request - User: ${
        req.user?.id || "guest"
      }, Symptoms: ${symptoms.substring(0, 60)}...`
    );

    // ------------------ OPENROUTER REQUEST ------------------
    const requestPayload = {
      model: "openai/gpt-4o-mini", // Reliable & fast model
      messages: [{ role: "user", content: masterPrompt }],
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponseString = response.data.choices[0].message.content;

    // Clean possible markdown wrapping
    const cleanedText = aiResponseString
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedText);
      return res.status(500).json({
        success: false,
        message:
          "AI service returned an invalid response. Please try again later.",
      });
    }

    // Handle invalid input or malformed response
    if (jsonResponse.error) {
      return res.status(400).json({
        success: false,
        error: jsonResponse.error,
        message: jsonResponse.message,
      });
    }

    if (
      !jsonResponse.potentialConditions ||
      !Array.isArray(jsonResponse.potentialConditions)
    ) {
      return res.status(500).json({
        success: false,
        message:
          "AI service returned an unexpected format. Please try again later.",
      });
    }

    console.log(
      `AI Symptom Check Success - User: ${
        req.user?.id || "guest"
      }, Conditions found: ${jsonResponse.potentialConditions.length}`
    );

    res.status(200).json({
      success: true,
      data: jsonResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Error in AI Symptom Checker:",
      error.response ? error.response.data : error.message
    );

    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        message:
          "AI service authentication failed. Please check your OpenRouter API key.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is temporarily overloaded. Please try again shortly.",
      });
    }

    if (error.response?.status === 402) {
      return res.status(503).json({
        success: false,
        message:
          "AI service quota exceeded. Please check your OpenRouter account balance.",
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request to AI service. Please try again with clearer symptoms.",
      });
    }

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        message: "Unable to connect to AI service. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while analyzing symptoms. Please try again later.",
    });
  }
};
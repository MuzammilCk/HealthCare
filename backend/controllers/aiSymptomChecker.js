// backend/controllers/aiSymptomChecker.js

const axios = require('axios');

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, sex } = req.body;

    // Input validation
    if (!symptoms || !age || !sex) {
      return res.status(400).json({ 
        success: false,
        message: "Symptoms, age, and sex are required." 
      });
    }

    // Additional validation
    if (typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a detailed description of your symptoms." 
      });
    }

    if (!age || age < 1 || age > 120) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid age between 1 and 120." 
      });
    }

    if (!['male', 'female', 'other'].includes(sex.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        message: "Sex must be 'male', 'female', or 'other'." 
      });
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return res.status(500).json({ 
        success: false,
        message: "AI service is not properly configured. Please contact support." 
      });
    }

    const masterPrompt = `
      You are an AI Medical Information Assistant. Your role is to analyze a user's stated symptoms and provide a list of potential, common causes for informational purposes ONLY. You must adhere to the following rules strictly:

      1.  **Analyze the Input:** The user has described their symptoms as: "${symptoms.trim()}". They are ${age} years old and their sex is ${sex.toLowerCase()}.
      2.  **Identify if Symptoms are Valid:** First, determine if the input contains recognizable medical symptoms.
      3.  **Handle Non-Symptom Input:** If the input is NOT a medical symptom (e.g., "I like pizza", "hello", gibberish), you MUST respond with only the following JSON object and nothing else: { "error": "invalid_input", "message": "I can only provide information about medical symptoms. Please describe how you are feeling." }
      4.  **Provide Potential Causes:** If the symptoms are valid, provide a list of 3-5 of the most common potential conditions. For each condition, provide a brief, easy-to-understand description and a probability score from "High" to "Low".
      5.  **Strictly Prohibit Diagnosis:** You are NOT a doctor. You MUST NOT provide a definitive diagnosis. Do not use phrases like "You have..." or "It is likely...". Use phrases like "Potential causes could include..." or "Some possibilities are...".
      6.  **Format the Output:** Your entire response MUST be a single, valid JSON object. Do not include any text before or after the JSON. The JSON structure must be:
          {
            "potentialConditions": [
              {
                "name": "Condition Name",
                "description": "A simple description.",
                "probability": "High" | "Medium" | "Low"
              }
            ],
            "disclaimer": "This is not a medical diagnosis. Please consult a doctor for accurate advice.",
            "firstAidSuggestion": "Provide a general, safe, and simple first-aid suggestion relevant to the primary symptom (e.g., for a fever, suggest rest and hydration)."
          }
    `;

    console.log(`AI Symptom Check Request - User: ${req.user.id}, Symptoms: ${symptoms.substring(0, 50)}...`);

    // Prepare request payload
    const requestPayload = {
      model: "openai/gpt-4o-mini", // Using GPT-4o-mini as a reliable alternative
      messages: [
        { role: "user", content: masterPrompt }
      ]
    };

    // Make request to OpenRouter API
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", requestPayload, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    // Extract the JSON string from the AI's response
    const aiResponseString = response.data.choices[0].message.content;

    // Clean the response text (remove any markdown formatting)
    const cleanedText = aiResponseString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the AI's response into a JSON object
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedText);
      return res.status(500).json({ 
        success: false,
        message: "AI service returned an invalid response. Please try again." 
      });
    }

    // Validate the response structure
    if (jsonResponse.error) {
      return res.status(400).json({
        success: false,
        error: jsonResponse.error,
        message: jsonResponse.message
      });
    }

    if (!jsonResponse.potentialConditions || !Array.isArray(jsonResponse.potentialConditions)) {
      return res.status(500).json({ 
        success: false,
        message: "AI service returned an unexpected response format. Please try again." 
      });
    }

    // Log successful analysis
    console.log(`AI Symptom Check Success - User: ${req.user.id}, Conditions found: ${jsonResponse.potentialConditions.length}`);

    res.status(200).json({
      success: true,
      data: jsonResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in AI Symptom Checker:", error.response ? error.response.data : error.message);
    
    // Handle specific OpenRouter/API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        success: false,
        message: "AI service authentication failed. Please check your OpenRouter API key." 
      });
    }

    if (error.response?.status === 429) {
      return res.status(503).json({ 
        success: false,
        message: "AI service is temporarily unavailable due to high demand. Please try again later." 
      });
    }

    if (error.response?.status === 402) {
      return res.status(503).json({ 
        success: false,
        message: "AI service quota exceeded. Please check your OpenRouter account balance." 
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid request to AI service. Please try again with different symptoms." 
      });
    }

    // Network or connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        success: false,
        message: "Unable to connect to AI service. Please try again later." 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "An error occurred while analyzing symptoms. Please try again." 
    });
  }
};

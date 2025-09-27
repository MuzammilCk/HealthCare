# AI Symptom Checker API Documentation

## Overview
The AI Symptom Checker is an OpenRouter-powered endpoint that uses Gemini AI to analyze user symptoms and provides potential medical conditions for informational purposes only.

## Endpoint
```
POST /api/ai/check-symptoms
```

## Authentication
- **Required**: Yes
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <your_jwt_token>`

## Request Body
```json
{
  "symptoms": "string (required, min 3 characters)",
  "age": "number (required, 1-120)",
  "sex": "string (required, 'male'|'female'|'other')"
}
```

### Example Request
```json
{
  "symptoms": "I have been experiencing severe headaches, nausea, and sensitivity to light for the past 2 days",
  "age": 28,
  "sex": "female"
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "potentialConditions": [
      {
        "name": "Migraine",
        "description": "A severe headache often accompanied by nausea and light sensitivity",
        "probability": "High"
      },
      {
        "name": "Tension Headache",
        "description": "Common headache caused by stress or muscle tension",
        "probability": "Medium"
      }
    ],
    "disclaimer": "This is not a medical diagnosis. Please consult a doctor for accurate advice.",
    "firstAidSuggestion": "Rest in a dark, quiet room and stay hydrated. Consider over-the-counter pain relief if appropriate."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Invalid Input Response (400)
```json
{
  "success": false,
  "error": "invalid_input",
  "message": "I can only provide information about medical symptoms. Please describe how you are feeling."
}
```

### Validation Error Response (400)
```json
{
  "success": false,
  "message": "Symptoms, age, and sex are required."
}
```

### Server Error Response (500)
```json
{
  "success": false,
  "message": "An error occurred while analyzing symptoms. Please try again."
}
```

## Error Codes
- **400**: Bad Request (validation errors, invalid input)
- **401**: Unauthorized (missing or invalid token)
- **500**: Internal Server Error (AI service issues)
- **503**: Service Unavailable (quota exceeded)

## Rate Limiting
- No specific rate limiting implemented
- Subject to Google AI API quotas

## Security Features
- JWT authentication required
- Input validation and sanitization
- API key protection via environment variables
- Error logging without exposing sensitive data

## Usage Examples

### JavaScript (Fetch)
```javascript
const response = await fetch('/api/ai/check-symptoms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    symptoms: "fever, cough, and fatigue",
    age: 35,
    sex: "male"
  })
});

const result = await response.json();
```

### cURL
```bash
curl -X POST http://localhost:5000/api/ai/check-symptoms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "symptoms": "fever, cough, and fatigue",
    "age": 35,
    "sex": "male"
  }'
```

## Setup Requirements

### Environment Variables
```env
OPENROUTER_API_KEY=sk-or-v1-0a20a2fc...your_secret_key_goes_here
```

### Dependencies
```json
{
  "axios": "^1.6.0"
}
```

## Important Notes

1. **Not a Medical Diagnosis**: This service provides informational content only and should never replace professional medical advice.

2. **Privacy**: User symptoms are sent to OpenRouter/Google AI for processing. Ensure compliance with healthcare privacy regulations.

3. **API Key Security**: Keep your OpenRouter API key secure and never expose it in client-side code.

4. **Error Handling**: Always implement proper error handling in your frontend application.

5. **Logging**: All requests are logged for monitoring and debugging purposes (symptoms are truncated for privacy).

## Troubleshooting

### Common Issues
1. **"AI service authentication failed"**: Check if OPENROUTER_API_KEY is properly set
2. **"Invalid response format"**: AI service may be experiencing issues, retry the request
3. **"Service temporarily unavailable"**: API quota exceeded, wait before retrying
4. **"AI service quota exceeded"**: OpenRouter credits exhausted, check your account balance

### Testing
Use the provided examples to test the endpoint. Ensure your JWT token is valid and the user is authenticated.

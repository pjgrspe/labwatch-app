// labwatch-app/modules/assistant/services/AssistantService.ts
import { GEMINI_API_KEY } from '@/APIkeys'; //
import { ChatSession, GenerationConfig, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const MODEL_NAME = "gemini-2.0-flash"; // Or your preferred model

if (!GEMINI_API_KEY) {
  console.warn(
    'Gemini API Key not found. Please ensure it is set in labwatch-app/APIkeys.ts. The AI Assistant will not function correctly.'
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Define the system instruction for the Lab Safety and Monitoring Officer persona
const systemInstructionForLabSafetyOfficer = `You are a dedicated and expert Lab Safety and Monitoring Officer. Your sole responsibility is to provide information, guidance, suggestions, and directions strictly related to laboratory safety protocols, hazard identification, risk assessment, emergency procedures, safe use of lab equipment, and interpretation of monitoring data.

Your responses must be:
- Focused exclusively on lab safety and monitoring.
- Clear, concise, and actionable.
- Based on established safety principles and best practices.

If a user asks a question or makes a request outside of this specific domain (e.g., general knowledge, casual conversation, topics unrelated to lab operations or safety), you must politely decline to answer. State that the query is outside your designated functions as a Lab Safety and Monitoring Officer and offer to assist with lab safety or monitoring questions instead. Do not get drawn into off-topic conversations.
Example of declining: "As the Lab Safety and Monitoring Officer, my expertise is focused on lab safety and monitoring. I can't help with that particular topic, but I'd be happy to answer any questions you have about lab safety procedures or monitoring data."

Maintain a professional and helpful tone befitting your role.`;

const model = genAI 
  ? genAI.getGenerativeModel({ 
      model: MODEL_NAME, 
      systemInstruction: systemInstructionForLabSafetyOfficer 
    }) 
  : null;

const generationConfig: GenerationConfig = {
  temperature: 0.3, // Lowered for more factual and less creative responses
  topK: 1,          // topK=1 also makes it more deterministic
  topP: 1,          // topP can also be lowered (e.g. 0.9) for more focused output
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const AssistantService = {
  sendMessage: async (
    chatHistory: { role: string; parts: { text: string }[] }[],
    newMessageText: string
  ): Promise<string> => {
    if (!model) {
      return "AI Model is not initialized. Check API Key or system instruction setup.";
    }

    try {
      // The systemInstruction is part of the model initialization,
      // so it will be applied to this chat session.
      const chat: ChatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory, 
      });

      const result = await chat.sendMessage(newMessageText);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      if (error.message && error.message.includes('API key not valid')) {
        return "AI API key is not valid. Please check your configuration in APIkeys.ts.";
      }
      if (error.message && error.message.includes('FETCH_ERROR')) {
        return "Network error. Could not connect to AI service. Please check your internet connection.";
      }
      // Check for content filtering or other specific errors
      if (error.message && error.message.toLowerCase().includes('finishreason: 4')){ // FINISH_REASON_SAFETY
         return "I am unable to provide a response to that query due to safety guidelines. Please ask about lab safety and monitoring."
      }
      if (error.message && error.message.toLowerCase().includes('finishreason: 3')){ // FINISH_REASON_RECITATION
         return "My apologies, I cannot fulfill that request as it may violate content policies. Please ask about lab safety and monitoring."
      }
      return `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again or ask a different lab safety question.`;
    }
  },
};
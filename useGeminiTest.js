import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyD92R_jlWrdamYVX2H_bTSWTDPBv1tipRo" });

async function GeminiTest() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Write a short story about a robot learning to love.",
  });
  console.log(response.text);
}

GeminiTest();
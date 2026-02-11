
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeAttendance = async (data: AttendanceRecord[], query: string) => {
  if (!process.env.API_KEY) return "AI insights are unavailable without an API key.";

  try {
    const prompt = `
      You are an AI Education Assistant. Below is the attendance data for a class in JSON format:
      ${JSON.stringify(data)}

      The user asks: "${query}"

      Analyze the data and provide a helpful, concise answer. Identify trends like high absenteeism, students who are always present, or specific dates with low attendance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Sorry, I couldn't analyze the attendance data right now.";
  }
};


import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// Guideline: Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.

export const getSkillRecommendations = async (interests: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these interests: "${interests}", recommend 3 NYSC SAED skills that would be most beneficial for a corper's future career. Provide reasons for each.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              reason: { type: Type.STRING },
              potentialEarnings: { type: Type.STRING }
            },
            required: ["skillName", "reason"]
          }
        }
      }
    });
    // Guideline: The GenerateContentResponse object features a text property (not a method) that directly returns the string output.
    const text = response.text;
    return JSON.parse(text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const analyzeResumeForSkills = async (resumeText: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a career strategist specializing in the Nigerian job market. Analyze this resume/CV content: "${resumeText}". 
      Identify the user's existing strengths, then suggest 3 NYSC SAED (Skill Acquisition and Entrepreneurship Development) skills that would fill market gaps or provide strategic career leverage.
      Consider current Nigerian job market demand (ICT, Agriculture, Fashion, etc.).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: { type: Type.STRING },
            strategicGoal: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  strategicValue: { type: Type.STRING },
                  demandLevel: { type: Type.STRING }
                },
                required: ["skillName", "strategicValue", "demandLevel"]
              }
            }
          },
          required: ["marketAnalysis", "strategicGoal", "recommendations"]
        }
      }
    });
    // Guideline: The GenerateContentResponse object features a text property (not a method).
    const text = response.text;
    return JSON.parse(text || 'null');
  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error);
    return null;
  }
};

export const generateQuarterlyReportSummary = async (data: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this quarterly SAED activity data and provide a professional executive summary for the NYSC Director-General: ${JSON.stringify(data)}. Focus on growth, most active regions, and skills with highest placement rates.`,
    });
    // Guideline: Use the .text property.
    return response.text || "Error generating summary.";
  } catch (error) {
    console.error("Report Generation Error:", error);
    return "Error generating summary.";
  }
};

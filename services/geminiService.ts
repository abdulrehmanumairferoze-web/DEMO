
import { GoogleGenAI, Type } from "@google/genai";

export const summarizeMinutes = async (rawNotes: string) => {
  if (!rawNotes || !rawNotes.trim()) return rawNotes;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize the following pharmaceutical meeting notes into a highly professional and structured "Minutes of Meeting" (MoM) report. 
      
      The output MUST follow this exact structure:
      
      # MINUTES OF MEETING
      
      ## 1. MEETING OBJECTIVES
      (Concise list of what the session aimed to achieve)
      
      ## 2. KEY DISCUSSIONS & DELIBERATIONS
      (Detailed summary of technical and operational points discussed)
      
      ## 3. DECISIONS & RESOLUTIONS
      (Formal record of all items finalized and approved)
      
      ## 4. ACTION ITEMS & DIRECTIVES
      (Bullet points for each directive. CRITICAL: Maintain all @Name mentions exactly as they appear in the original text.)
      
      Ensure the tone is professional, technical, and suitable for a pharmaceutical corporate environment.
      
      Notes:
      ${rawNotes}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    return rawNotes;
  }
};

export const extractTasks = async (minutes: string) => {
  if (!minutes || !minutes.trim()) return [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Examine these meeting minutes and extract a structured list of actionable responsibilities.
      
      CRITICAL INSTRUCTION: Identify ownership tags using the @symbol (e.g., @Sarah). 
      
      For each task, provide:
      1. A high-level professional 'title'.
      2. A 'description' detailing the technical scope.
      3. The 'taggedName' (without the @).
      4. The 'priority' ('Q1', 'Q2', or 'Q3').
      
      Minutes:
      ${minutes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              taggedName: { type: Type.STRING },
              priority: { type: Type.STRING }
            },
            required: ["title", "description", "priority"],
          },
        },
      }
    });
    
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Task Extraction Error:", error);
    return [];
  }
};

export const transcribeAudio = async (base64Data: string, mimeType: string) => {
  if (!base64Data) return null;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Transcribe the audio. The audio may be in English, Urdu, or a mix. CRITICAL: Extract and present ONLY the important points, main decisions, and actionable items in a concise English bulleted list. Do not include conversational filler or irrelevant data.",
          },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    return null;
  }
};

export const transcribeStructuredMoM = async (base64Data: string, mimeType: string) => {
  if (!base64Data) return [];
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Transcribe the following audio which is a mix of English and Urdu. Categorize the content into structured Minutes of Meeting segments. Each segment must have a 'discussion' (deliberation/disagreement), a 'resolution' (decision/task), an 'ownerName' (person mentioned as responsible), and a 'deadline' (any mentioned date or timeline). Return as a JSON array.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              discussion: { type: Type.STRING },
              resolution: { type: Type.STRING },
              ownerName: { type: Type.STRING },
              deadline: { type: Type.STRING }
            },
            required: ["discussion", "resolution"]
          }
        }
      }
    });
    
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Structured Transcription Error:", error);
    return [];
  }
};

export const generateKPIAppraisal = async (userName: string, role: string, kpis: string, records: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Act as a senior auditor for Swiss Pharmaceuticals. Conduct an appraisal for ${userName} (${role}) based on records: ${JSON.stringify(records)} against KPIs: ${kpis}. Return JSON with score and justification.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            justification: { type: Type.STRING },
          },
          required: ["score", "justification"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { score: 0, justification: "Error generating appraisal." };
  }
};

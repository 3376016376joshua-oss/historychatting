// trigger rebuild


import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OrchestratorResponse, SimulationSettings, ChatMessage, PersonaProfile } from "../types.ts";

// Define the schema for the structured output

const orchestratorResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    persona_name: { type: Type.STRING, description: "The name of the historical figure adopted." },
    persona_style: { type: Type.STRING, description: "Brief description of the speaking style." },
    reply: { type: Type.STRING, description: "The first-person response to the student." },
    emotion_tag: { type: Type.STRING, description: "The detected emotion of the student (e.g., curious, confused)." },
    follow_up_question: { type: Type.STRING, description: "A suggested follow-up question to keep engagement." },
    teacher_note: { type: Type.STRING, description: "A note for the teacher explaining the pedagogical value of this interaction." },
    student_focus: { type: Type.STRING, description: "What the student seems most interested in." },
    knowledge_covered: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of key historical facts covered in the reply." 
    },
    possible_confusion: { type: Type.STRING, description: "Areas where the student might still be confused." },
    emotion_guess: { type: Type.STRING, description: "Internal guess of student emotion for analytics." }
  },
  required: [
    "persona_name",
    "persona_style",
    "reply",
    "emotion_tag",
    "follow_up_question",
    "teacher_note",
    "student_focus",
    "knowledge_covered",
    "possible_confusion",
    "emotion_guess"
  ]
};

const profileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Full name of the historical figure (e.g. Qin Shi Huang)" },
    title: { type: Type.STRING, description: "Main title (e.g. First Emperor of Qin)" },
    era: { type: Type.STRING, description: "The era they lived in (e.g. Qin Dynasty (221–206 BC))" },
    bio_quote: { type: Type.STRING, description: "A short, impactful first-person quote describing who they are." },
    key_achievements: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3-4 short bullet points of their key historical achievements." 
    },
    region: {
      type: Type.STRING,
      enum: ['EASTERN', 'WESTERN', 'MIDDLE_EASTERN', 'OTHER'],
      description: "Cultural background for visual style selection."
    },
    gender: {
      type: Type.STRING,
      enum: ['MALE', 'FEMALE'],
      description: "Gender for avatar selection."
    }
  },
  required: ["name", "title", "era", "bio_quote", "key_achievements", "region", "gender"]
};

export const generatePersonaProfile = async (targetPerson: string, language: string): Promise<PersonaProfile> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a historical profile for: ${targetPerson}. Language: ${language}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are a historian database. Provide a concise profile for the UI sidebar. Classify region accurately (China/Japan/Asia -> EASTERN, Europe/Americas -> WESTERN).",
      responseMimeType: "application/json",
      responseSchema: profileSchema,
      temperature: 0.5,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as PersonaProfile;
  }
  throw new Error("Failed to generate profile");
}

export const sendMessageToOrchestrator = async (
  currentMessage: string,
  history: ChatMessage[],
  settings: SimulationSettings
): Promise<OrchestratorResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("VITE_GEMINI_API_KEY =", import.meta.env.VITE_GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct the conversation history for context
  const historyContext = history.map(msg => `${msg.role === 'user' ? 'Student' : 'Historical Figure'}: ${msg.content}`).join('\n');

  const systemInstruction = `
    You are the "Historical Character Empathy Learning Companion System Orchestrator".
    
    Your goal is to manage a roleplay session between a student and a historical figure: ${settings.targetPerson}.
    Student Grade Level: ${settings.studentGrade}
    Language: ${settings.language}

    You must orchestrate three internal experts to produce the final output:
    1. **Advisor**: Adopts the persona of ${settings.targetPerson}. Generates a warm, empathetic, first-person response. Explains history through stories and motives, not just dry facts. Avoids modern internet slang but remains accessible.
    2. **Critiquer**: Fact-checks the Advisor's draft. Ensures safety, grade-appropriateness (no excessive violence/darkness for this grade), and checks if the tone is encouraging.
    3. **Workspace Updater**: Analyzes the learning progress for the teacher dashboard.

    **Execution Rules:**
    - The 'reply' MUST be in the first person as ${settings.targetPerson}.
    - The 'reply' MUST be in ${settings.language}.
    - Do not break character in the 'reply'.
    - If the student is confused, be patient.
    - If the student is frustrated, be encouraging.
  `;

  const prompt = `
    Conversation History:
    ${historyContext}

    Current Student Question: ${currentMessage}

    Generate the response object following the Orchestrator logic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: orchestratorResponseSchema,
        temperature: 0.7, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as OrchestratorResponse;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const getGoogleAI = (): GoogleGenerativeAI => {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
        console.log('✅ Google AI client initialized');
    }
    return genAI;
};

export const MODELS = {
    EMBEDDING: "text-embedding-004",
    GENERATIVE: "gemini-1.5-flash",
    PRO: "gemini-2.5-flash"
} as const;

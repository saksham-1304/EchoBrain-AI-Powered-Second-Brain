import { GoogleGenerativeAI } from "@google/generative-ai";

class GoogleGenAI {
    private client: GoogleGenerativeAI;

    constructor(config: { apiKey: string }) {
        this.client = new GoogleGenerativeAI(config.apiKey);
        console.log('✅ Google AI client initialized');
    }

    get models() {
        return {
            generateContent: async (options: { model: string; contents: string }): Promise<{ text: string; embedding?: { values: number[] } }> => {
                try {
                    const model = this.client.getGenerativeModel({ model: options.model });
                    
                    // Handle embedding models
                    if (options.model.includes('embedding')) {
                        const result = await model.embedContent(options.contents);
                        return {
                            text: "",
                            embedding: {
                                values: result.embedding.values
                            }
                        };
                    }
                    
                    // Handle text generation models
                    const result = await model.generateContent(options.contents);
                    return {
                        text: result.response.text()
                    };
                } catch (error) {
                    console.error("Error in generateContent:", error);
                    throw error;
                }
            }
        };
    }
}

// Exact implementation as requested
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY || "YOUR_API_KEY" });

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

// Export the instance and function for use in the application
export const getGoogleAI = (): GoogleGenAI => ai;

export const MODELS = {
    EMBEDDING: "text-embedding-004",
    GENERATIVE: "gemini-1.5-flash", 
    PRO: "gemini-2.5-flash"
} as const;

export { GoogleGenAI, ai, main };

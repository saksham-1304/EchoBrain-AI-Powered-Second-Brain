import { Types } from "mongoose";
import { getGoogleAI, MODELS } from "../config/modernai";
import { getQdrantClient, COLLECTION_NAME } from "../config/qdrant";
import { ContentParserService } from "./contentParserService";

interface VectorInsertData {
    _id: any;
    url: string;
    type: string;
    description?: string;
    content: string;
    userId: string;
    contentId: Types.ObjectId;
}

export class VectorService {    static async insertToVectorDB(data: VectorInsertData): Promise<void> {
        try {
            console.log("Processing URL for vector insertion:", data.url);
            
            const genAI = getGoogleAI();
            const client = getQdrantClient();
            
            // Parse URL content
            const parsedURLContent = await ContentParserService.parseURL(data.url);
            
            if (!parsedURLContent) {
                console.warn("No parsed content available, using basic data");
            }

            // Format content for embedding
            const formattedContent = parsedURLContent 
                ? ContentParserService.formatParsedContent(parsedURLContent)
                : "No parsed content available";
            
            // Create content string for embedding
            const contentForEmbedding = [
                data.content, 
                data.url, 
                formattedContent, 
                data.type
            ].join(' ');
            
            // Generate embedding using the new API
            const result = await genAI.models.generateContent({
                model: MODELS.EMBEDDING,
                contents: contentForEmbedding
            });

            const point = {
                id: data._id,
                vector: result.embedding!.values,
                payload: {
                    contentId: data.contentId.toString(),
                    content: data.content,
                    userId: data.userId,
                    url: data.url,
                    type: data.type,
                    description: data.description || "",
                    parsedContent: parsedURLContent ? JSON.stringify(parsedURLContent.data) : "{}",
                    parsedContentType: parsedURLContent?.type || "unknown"
                },
            };

            await client.upsert(COLLECTION_NAME, {
                wait: true,
                points: [point],
            });
            
            console.log("✅ Successfully inserted into VectorDB");
        } catch (error) {
            console.error("❌ Error inserting into VectorDB:", error);
            throw error;
        }
    }    static async searchVectorDB(query: string, userId: string): Promise<any> {
        try {
            const genAI = getGoogleAI();
            const client = getQdrantClient();

            const result = await genAI.models.generateContent({
                model: MODELS.EMBEDDING,
                contents: query
            });
            
            const searchResults = await client.search(COLLECTION_NAME, {
                vector: result.embedding!.values,
                limit: 10,
                filter: {
                    must: [
                        { key: "userId", match: { value: userId } }
                    ]
                },
                with_payload: true,
                with_vector: false
            });

            // Generate AI response
            const answer = await this.generateAIResponse(query, searchResults);

            return {
                query,
                answer,
                sources: searchResults.map(result => result.payload),
                searchResults
            };
        } catch (error) {
            console.error("❌ Error searching VectorDB:", error);
            throw error;
        }
    }

    static async deleteFromVectorDB(contentId: Types.ObjectId): Promise<void> {
        try {
            const client = getQdrantClient();
            
            const filter = {
                must: [
                    { key: "contentId", match: { value: contentId.toString() } }
                ]
            };

            await client.delete(COLLECTION_NAME, { filter });

            console.log("✅ Successfully deleted from VectorDB");
        } catch (error) {
            console.error("❌ Error deleting from VectorDB:", error);
            throw error;
        }
    }    private static async generateAIResponse(query: string, searchResults: any[]): Promise<string> {
        try {
            const genAI = getGoogleAI();

            const context = searchResults
                .map(result => JSON.stringify({
                    content: result.payload?.content || "No content available",
                    description: result.payload?.description || "No description",
                    url: result.payload?.url || "No URL available",
                    parsedContent: result.payload?.parsedContent || "No parsed content"
                }))
                .join('\n\n');

            const prompt = `
You are an AI assistant with access to relevant documents. Your goal is to provide a well-rounded, detailed response to the user's query using the provided context.

### Context Details:
Each search result includes parsed content, a description, and a URL. The parsed content contains the most detailed information, so prioritize it in your response. If parsed content is missing, use other details like description or content.

### Context:
${context}

### Query:
${query}

### Instructions:
1. Focus on the **parsed content and description** as the primary source of information.
2. If parsed content is insufficient, refer to the description or general content.
3. Provide a structured and informative response.
4. If no useful context is available, suggest possible actions for the user to improve their data.
5. Be concise but comprehensive.

Respond accurately and helpfully.
            `;

            const answerResult = await genAI.models.generateContent({
                model: MODELS.PRO,
                contents: prompt
            });
            return answerResult.text;
        } catch (error) {
            console.error("❌ Error generating AI response:", error);
            return "I apologize, but I encountered an error while generating a response. Please try again.";
        }
    }
}

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

// Circuit breaker for vector operations
class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private readonly threshold = 5;
    private readonly timeout = 60000; // 1 minute

    isOpen(): boolean {
        if (this.failures >= this.threshold) {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.failures = 0; // Reset after timeout
                return false;
            }
            return true;
        }
        return false;
    }

    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();
    }

    recordSuccess(): void {
        this.failures = 0;
    }
}

const vectorCircuitBreaker = new CircuitBreaker();

export class VectorService {
    static async insertToVectorDB(data: VectorInsertData): Promise<void> {
        if (vectorCircuitBreaker.isOpen()) {
            console.warn("Vector DB circuit breaker is open, skipping insertion");
            return;
        }

        try {
            console.log("Processing URL for vector insertion:", data.url);
            
            const genAI = getGoogleAI();
            const client = getQdrantClient();
            
            // Parse URL content with timeout
            const parsedURLContent = await Promise.race([
                ContentParserService.parseURL(data.url),
                new Promise<null>((_, reject) => 
                    setTimeout(() => reject(new Error("Content parsing timeout")), 30000)
                )
            ]);
            
            if (!parsedURLContent) {
                console.warn("No parsed content available, using basic data");
            }

            // Format content for embedding
            const formattedContent = parsedURLContent 
                ? ContentParserService.formatParsedContent(parsedURLContent)
                : "No parsed content available";
            
            // Create content string for embedding with length limit
            const contentForEmbedding = [
                data.content, 
                data.url, 
                formattedContent, 
                data.type
            ].join(' ').substring(0, 8000); // Limit content length
            
            // Generate embedding with retry logic
            let embedding;
            let retries = 3;
            
            while (retries > 0) {
                try {
                    const result = await Promise.race([
                        genAI.models.generateContent({
                            model: MODELS.EMBEDDING,
                            contents: contentForEmbedding
                        }),
                        new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error("Embedding generation timeout")), 15000)
                        )
                    ]);
                    
                    if (!result.embedding?.values || result.embedding.values.length === 0) {
                        throw new Error("Invalid embedding response");
                    }
                    
                    embedding = result.embedding.values;
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
                }
            }

            // Validate embedding dimensions
            if (!embedding || embedding.length === 0) {
                throw new Error("Failed to generate valid embedding");
            }

            const point = {
                id: data._id,
                vector: embedding,
                payload: {
                    contentId: data.contentId.toString(),
                    content: data.content.substring(0, 1000), // Limit payload size
                    userId: data.userId,
                    url: data.url,
                    type: data.type,
                    description: (data.description || "").substring(0, 1000),
                    parsedContent: parsedURLContent ? JSON.stringify(parsedURLContent.data).substring(0, 2000) : "{}",
                    parsedContentType: parsedURLContent?.type || "unknown",
                    timestamp: Date.now()
                },
            };

            // Insert with retry logic
            retries = 3;
            while (retries > 0) {
                try {
                    await Promise.race([
                        client.upsert(COLLECTION_NAME, {
                            wait: true,
                            points: [point],
                        }),
                        new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error("Vector upsert timeout")), 10000)
                        )
                    ]);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                }
            }
            
            vectorCircuitBreaker.recordSuccess();
            console.log("✅ Successfully inserted into VectorDB");
        } catch (error) {
            vectorCircuitBreaker.recordFailure();
            console.error("❌ Error inserting into VectorDB:", error);
            throw error;
        }
    }

    static async searchVectorDB(query: string, userId: string, page: number = 1, limit: number = 10): Promise<any> {
        if (vectorCircuitBreaker.isOpen()) {
            throw new Error("Vector DB circuit breaker is open");
        }

        try {
            const genAI = getGoogleAI();
            const client = getQdrantClient();

            // Validate inputs
            if (!query.trim() || query.length > 1000) {
                throw new Error("Invalid query length");
            }

            if (limit > 50) {
                limit = 50; // Prevent excessive results
            }

            // Generate query embedding with timeout
            const result = await Promise.race([
                genAI.models.generateContent({
                    model: MODELS.EMBEDDING,
                    contents: query.trim()
                }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("Query embedding timeout")), 10000)
                )
            ]);

            if (!result.embedding?.values || result.embedding.values.length === 0) {
                throw new Error("Failed to generate query embedding");
            }
            
            // Calculate offset for pagination
            const offset = (page - 1) * limit;
            
            // Search with enhanced filters and timeout
            const searchResults = await Promise.race([
                client.search(COLLECTION_NAME, {
                    vector: result.embedding.values,
                    limit: limit + offset, // Get more results for pagination
                    offset: offset,
                    filter: {
                        must: [
                            { key: "userId", match: { value: userId } }
                        ]
                    },
                    with_payload: true,
                    with_vector: false,
                    score_threshold: 0.7 // Only return relevant results
                }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("Vector search timeout")), 15000)
                )
            ]);

            // Filter and process results
            const processedResults = searchResults
                .filter(result => result.score && result.score > 0.7) // Additional score filtering
                .slice(0, limit) // Apply limit after filtering
                .map(result => ({
                    ...result,
                    payload: {
                        ...result.payload,
                        // Sanitize payload for security
                        parsedContent: result.payload?.parsedContent ? 
                            JSON.parse(result.payload.parsedContent) : {}
                    }
                }));

            // Generate AI response with timeout
            const answer = await Promise.race([
                this.generateAIResponse(query, processedResults),
                new Promise<string>((_, reject) => 
                    setTimeout(() => reject(new Error("AI response timeout")), 20000)
                )
            ]);

            vectorCircuitBreaker.recordSuccess();

            return {
                query,
                answer,
                sources: processedResults.map(result => result.payload),
                searchResults: processedResults,
                pagination: {
                    page,
                    limit,
                    total: searchResults.length,
                    hasMore: searchResults.length === limit + offset
                }
            };
        } catch (error) {
            vectorCircuitBreaker.recordFailure();
            console.error("❌ Error searching VectorDB:", error);
            throw error;
        }
    }

    static async deleteFromVectorDB(contentId: Types.ObjectId): Promise<void> {
        if (vectorCircuitBreaker.isOpen()) {
            console.warn("Vector DB circuit breaker is open, skipping deletion");
            return;
        }

        try {
            const client = getQdrantClient();
            
            const filter = {
                must: [
                    { key: "contentId", match: { value: contentId.toString() } }
                ]
            };

            // Delete with timeout
            await Promise.race([
                client.delete(COLLECTION_NAME, { filter }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("Vector delete timeout")), 5000)
                )
            ]);

            vectorCircuitBreaker.recordSuccess();
            console.log("✅ Successfully deleted from VectorDB");
        } catch (error) {
            vectorCircuitBreaker.recordFailure();
            console.error("❌ Error deleting from VectorDB:", error);
            throw error;
        }
    }

    private static async generateAIResponse(query: string, searchResults: any[]): Promise<string> {
        try {
            const genAI = getGoogleAI();

            // Limit context size to prevent token overflow
            const context = searchResults
                .slice(0, 5) // Limit to top 5 results
                .map(result => {
                    const payload = result.payload || {};
                    return JSON.stringify({
                        content: (payload.content || "").substring(0, 500),
                        description: (payload.description || "").substring(0, 300),
                        url: payload.url || "",
                        type: payload.type || "unknown"
                    });
                })
                .join('\n\n');

            const prompt = `
You are an AI assistant with access to relevant documents. Provide a helpful, accurate response to the user's query using the provided context.

### Context Details:
${context}

### Query:
${query}

### Instructions:
1. Use the provided context to answer the query accurately
2. If the context doesn't contain relevant information, say so clearly
3. Provide specific details when available
4. Keep the response concise but informative
5. Cite sources when referencing specific information

Respond helpfully and accurately.
            `.trim();

            // Ensure prompt isn't too long
            const maxPromptLength = 4000;
            const finalPrompt = prompt.length > maxPromptLength ? 
                prompt.substring(0, maxPromptLength) + "..." : prompt;

            const answerResult = await genAI.models.generateContent({
                model: MODELS.PRO,
                contents: finalPrompt
            });

            return answerResult.text || "I apologize, but I couldn't generate a response based on the available information.";
        } catch (error) {
            console.error("❌ Error generating AI response:", error);
            return "I apologize, but I encountered an error while generating a response. The search results are still available above.";
        }
    }

    // Health check method
    static async healthCheck(): Promise<{ vectorDB: boolean; ai: boolean }> {
        const health = { vectorDB: false, ai: false };

        try {
            const client = getQdrantClient();
            await Promise.race([
                client.getCollections(),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("Health check timeout")), 5000)
                )
            ]);
            health.vectorDB = true;
        } catch (error) {
            console.error("Vector DB health check failed:", error);
        }

        try {
            const genAI = getGoogleAI();
            await Promise.race([
                genAI.models.generateContent({
                    model: MODELS.EMBEDDING,
                    contents: "health check"
                }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("AI health check timeout")), 5000)
                )
            ]);
            health.ai = true;
        } catch (error) {
            console.error("AI health check failed:", error);
        }

        return health;
    }
}
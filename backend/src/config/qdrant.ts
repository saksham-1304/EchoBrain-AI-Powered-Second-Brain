import { QdrantClient } from '@qdrant/js-client-rest';

let client: QdrantClient | null = null;

export const getQdrantClient = (): QdrantClient => {
    if (!client) {
        client = new QdrantClient({
            url: process.env.QDRANT_URL!,
            apiKey: process.env.QDRANT_KEY!,
        });
        console.log('✅ Qdrant client initialized');
    }
    return client;
};

export const COLLECTION_NAME = 'test_collection';

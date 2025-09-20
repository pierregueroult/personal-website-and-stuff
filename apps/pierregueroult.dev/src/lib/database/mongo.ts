import { MongoClient } from 'mongodb';
import { env } from '@/lib/env/server';

let mongoClient: MongoClient | null = null;

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(env.NEXT_MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

export { getMongoClient };
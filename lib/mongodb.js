import { MongoClient } from "mongodb";

const globalForMongo = globalThis;

if (!globalForMongo._mongoClientPromise) {
  globalForMongo._mongoClientPromise = (async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const client = new MongoClient(uri);
    return client.connect();
  })();
}

const clientPromise = globalForMongo._mongoClientPromise;

export default clientPromise;
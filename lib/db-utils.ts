
import clientPromise from "./mongodb";

export async function saveConversationMessage(sessionId: string, role: "user" | "model", content: string) {
    try {
        const client = await clientPromise;
        const db = client.db("aimed_guru"); // Use a specific database name
        const collection = db.collection("conversations");

        await collection.updateOne(
            { sessionId },
            {
                $push: {
                    messages: {
                        role,
                        content,
                        timestamp: new Date(),
                    },
                } as any, // Type cast to avoid TS issues with $push if not strictly typed
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );
    } catch (error) {
        console.error("Failed to save message to DB:", error);
        // Don't throw, just log. Persistence failure shouldn't crash the chat.
    }
}

export async function getConversation(sessionId: string) {
    try {
        const client = await clientPromise;
        const db = client.db("aimed_guru");
        const collection = db.collection("conversations");

        return await collection.findOne({ sessionId });
    } catch (error) {
        console.error("Failed to fetch conversation from DB:", error);
        return null;
    }
}

export async function createUser(email: string, passwordHash: string) {
    const client = await clientPromise;
    const db = client.db("aimed_guru");
    return db.collection("users").insertOne({
        email,
        password: passwordHash,
        createdAt: new Date(),
    });
}

export async function findUserByEmail(email: string) {
    const client = await clientPromise;
    const db = client.db("aimed_guru");
    return db.collection("users").findOne({ email });
}

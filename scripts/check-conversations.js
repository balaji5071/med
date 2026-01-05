
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Simple .env parser
const loadEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    } catch (e) {
        console.error('Error loading .env.local file', e);
    }
};

loadEnv();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function checkConversations() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("aimed_guru");
        const collection = db.collection("conversations");

        const count = await collection.countDocuments();
        console.log(`Total conversations: ${count}`);

        const conversations = await collection.find().sort({ _id: -1 }).limit(3).toArray();

        conversations.forEach((conv, i) => {
            console.log(`\n--- Conversation ${i + 1} (${conv.sessionId}) ---`);
            console.log(`Msg Count: ${conv.messages?.length || 0}`);
            if (conv.messages && conv.messages.length > 0) {
                const lastMsg = conv.messages[conv.messages.length - 1];
                console.log(`Last Msg (${lastMsg.role}): ${lastMsg.content.substring(0, 50)}...`);
            }
        });

    } catch (e) {
        console.error('Failed:', e);
    } finally {
        await client.close();
    }
}

checkConversations();

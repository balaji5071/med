
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Simple .env parser since we can't depend on dotenv being installed if we didn't install it
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

async function testConnection() {
    const client = new MongoClient(uri);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB!');

        const adminDb = client.db().admin();
        const info = await adminDb.serverStatus();
        console.log(`Server version: ${info.version}`);

        const dbs = await adminDb.listDatabases();
        console.log('Databases:');
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await client.close();
    }
}

testConnection();

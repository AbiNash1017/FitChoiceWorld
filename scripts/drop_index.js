const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function dropIndex() {
    try {
        // Read .env.local manually
        const envPath = path.resolve(process.cwd(), '.env.local');
        let mongoUri = process.env.MONGODB_URI;

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/MONGODB_URI=(.*)/);
            if (match && match[1]) {
                mongoUri = match[1].trim();
                // Remove quotes if present
                if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
                    mongoUri = mongoUri.slice(1, -1);
                }
            }
        }

        if (!mongoUri) {
            console.error('MONGODB_URI not found in .env.local or environment variables');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const collection = mongoose.connection.collection('user_metadata');
        const indexes = await collection.indexes();

        console.log('Current indexes:', indexes.map(i => i.name));

        const indexName = 'f_uid_1'; // Assuming default name, but we'll check
        const fUidIndex = indexes.find(i => i.key.f_uid);

        if (fUidIndex) {
            console.log(`Found index on f_uid: ${fUidIndex.name}. Dropping...`);
            await collection.dropIndex(fUidIndex.name);
            console.log('Index dropped successfully.');
        } else {
            console.log('Index on f_uid not found.');
        }

        await mongoose.disconnect();
        console.log('Done.');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndex();

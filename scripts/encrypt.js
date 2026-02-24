const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ALGORITHM = 'aes-256-gcm';

async function encryptEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const outPath = path.join(__dirname, '..', 'secrets.enc');

    if (!fs.existsSync(envPath)) {
        console.error('❌ Error: .env file not found.');
        process.exit(1);
    }

    rl.question('Enter a strong password to encrypt .env: ', (password) => {
        if (!password) {
            console.error('❌ Password cannot be empty.');
            process.exit(1);
        }

        try {
            const rawData = fs.readFileSync(envPath);

            // Generate a random salt for key derivation
            const salt = crypto.randomBytes(16);

            // Derive a 32-byte key using PBKDF2
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

            // Generate a random initialization vector
            const iv = crypto.randomBytes(12);

            const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
            let encrypted = cipher.update(rawData);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            // Get the auth tag
            const authTag = cipher.getAuthTag();

            // Store salt, iv, authTag, and encrypted data together
            const finalData = Buffer.concat([salt, iv, authTag, encrypted]);

            fs.writeFileSync(outPath, finalData);
            console.log(`\n✅ Successfully encrypted .env to secrets.enc`);
            console.log(`Remember your password carefully. You will need it for 'npm run judge-setup'.\n`);

            rl.close();
        } catch (error) {
            console.error('❌ Encryption failed:', error.message);
            rl.close();
            process.exit(1);
        }
    });
}

encryptEnv();

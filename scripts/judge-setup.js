const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { spawn } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ALGORITHM = 'aes-256-gcm';

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        console.log(`\n> Running: ${command} ${args.join(' ')}\n`);
        const proc = spawn(command, args, { stdio: 'inherit', shell: true });
        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

async function decryptAndSetup() {
    const encPath = path.join(__dirname, '..', 'secrets.enc');
    const outPath = path.join(__dirname, '..', '.env');

    if (!fs.existsSync(encPath)) {
        console.error('❌ Error: secrets.enc not found. Make sure you cloned the repository correctly.');
        process.exit(1);
    }

    console.log('\n=====================================================');
    console.log('   LogicSnap Cafe - Secure Setup Automation');
    console.log('=====================================================\n');

    rl.question('🔑 Enter the setup password (provided by author): ', async (password) => {
        if (!password) {
            console.error('❌ Password cannot be empty.');
            process.exit(1);
        }

        try {
            console.log('\n[1/4] Decrypting environment variables...');
            const encryptedData = fs.readFileSync(encPath);

            // Extract the pieces
            const salt = encryptedData.subarray(0, 16);
            const iv = encryptedData.subarray(16, 28);
            const authTag = encryptedData.subarray(28, 44);
            const ciphertext = encryptedData.subarray(44);

            // Derive the key
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(ciphertext);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            fs.writeFileSync(outPath, decrypted);
            console.log('   ✅ Decryption successful. (.env generated)');

            console.log('\n[2/4] Installing dependencies...');
            await runCommand('npm', ['install']);

            console.log('\n[3/4] Seeding demo data...');
            await runCommand('node', ['scripts/seed-demo.js']);

            console.log('\n[4/4] Starting development server...');
            console.log('\n=====================================================');
            console.log('   Open: http://localhost:3000');
            console.log('   Developer key: LOGICSNAP-DEMO');
            console.log('=====================================================\n');

            // Transfer control back to the terminal for the dev server
            rl.close();
            const devProc = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });

            devProc.on('close', (code) => {
                process.exit(code);
            });

        } catch (error) {
            console.log('\n❌ Incorrect password or corrupted secrets file.');
            rl.close();
            process.exit(1);
        }
    });
}

decryptAndSetup();

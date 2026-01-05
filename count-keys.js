const fs = require('fs');
const path = require('path');

// যে ফোল্ডারগুলো স্ক্যান করতে হবে
const foldersToScan = ['app', 'components', 'context'];
const foundKeys = new Set();

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            const content = fs.readFileSync(filePath, 'utf8');
            // Regex দিয়ে t('something') বা t("something") খুঁজে বের করা
            const matches = content.matchAll(/t\(['"](.*?)['"]\)/g);
            for (const match of matches) {
                foundKeys.add(match[1]);
            }
        }
    });
}

console.log("🔍 Scanning project for translation keys...");
foldersToScan.forEach(folder => {
    const dirPath = path.join(__dirname, folder);
    if (fs.existsSync(dirPath)) walkDir(dirPath);
});

const finalKeys = Array.from(foundKeys).sort();

console.log("\n--- RESULT ---");
console.log(`✅ Total Unique Words/Keys Found: ${finalKeys.length}`);
console.log("\nList of Keys:");
console.log(finalKeys.join(', '));

// ডাটাটি একটি ফাইলে সেভ করে রাখা যাতে পরে কাজে লাগে
fs.writeFileSync('extracted_keys.json', JSON.stringify(finalKeys, null, 2));
console.log("\n📂 Keys saved to extracted_keys.json");
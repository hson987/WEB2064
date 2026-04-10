const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (db.product_variants) {
    db.product_variants.forEach((v, index) => {
        // We'll make about 8-9 items low stock to make the list look "long"
        if (index % 2 === 0) { 
            v.quantity = Math.floor(Math.random() * 8) + 2;
        } else {
            v.quantity = Math.floor(Math.random() * 85) + 15;
        }
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log("Randomized product_variant quantities successfully.");
} else {
    console.log("No product_variants found.");
}

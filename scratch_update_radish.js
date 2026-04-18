import fs from 'fs';
import { db } from './src/firebase.js';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

const idToUpdate = 'v15'; // Radish
const newEmoji = '🧄'; // Garlic (white vegetable emoji)

async function run() {
  console.log("Updating Radish emoji in Firestore DB...");

  // 1. Update in products collection
  try {
    await updateDoc(doc(db, 'products', idToUpdate), { emoji: newEmoji });
    console.log(`Updated ${idToUpdate} emoji to ${newEmoji} in products.`);
  } catch (e) {
    console.error(`Failed to update ${idToUpdate} in products`, e);
  }

  // 2. Update in vendors inventory
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  for (const vendorDoc of vendorsSnap.docs) {
    const data = vendorDoc.data();
    if (data.inventory && Array.isArray(data.inventory)) {
      let changed = false;
      const newInventory = data.inventory.map(item => {
        if (item.id === idToUpdate && item.emoji !== newEmoji) {
          changed = true;
          return { ...item, emoji: newEmoji };
        }
        return item;
      });

      if (changed) {
        await updateDoc(doc(db, 'vendors', vendorDoc.id), { inventory: newInventory });
        console.log(`Updated vendor ${vendorDoc.id} inventory for Radish.`);
      }
    }
  }

  // 3. Update local file
  console.log("Cleaning up local files...");
  const file = 'src/data/firebaseDB.js';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    const replaceV15 = /(id:\s*['"]v15['"].*?emoji:\s*['"])[^'"](['"])/g;
    content = content.replace(replaceV15, `$1${newEmoji}$2`);
    
    fs.writeFileSync(file, content);
    console.log(`Updated local file ${file}`);
  }

  console.log("Update completed fully!");
  process.exit(0);
}

run().catch(console.error);

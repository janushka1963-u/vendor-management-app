import fs from 'fs';
import { db } from './src/firebase.js';
import { collection, doc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';

const idToDelete = 'f19'; // Jackfruit
const emojiUpdates = {
  'f4': '🥑', // Papaya
  'f7': '🍏'  // Custard Apple
};

async function run() {
  console.log("Updating Firestore DB...");
  const vendorsSnap = await getDocs(collection(db, 'vendors'));

  // 1. Delete Jackfruit
  try {
    await deleteDoc(doc(db, 'products', idToDelete));
    console.log(`Deleted ${idToDelete} from products.`);
  } catch (e) {
    console.error(`Failed to delete ${idToDelete}`, e);
  }

  // 2. Update Emojis in products
  for (const [id, emoji] of Object.entries(emojiUpdates)) {
    try {
      await updateDoc(doc(db, 'products', id), { emoji });
      console.log(`Updated product ${id} emoji to ${emoji}`);
    } catch (e) {
      console.error(`Failed to update ${id}`, e);
    }
  }

  // 3. Update Vendors
  for (const vendorDoc of vendorsSnap.docs) {
    const data = vendorDoc.data();
    if (data.inventory && Array.isArray(data.inventory)) {
      let changed = false;
      const newInventory = data.inventory
        .filter(item => {
          if (item.id === idToDelete) {
             changed = true;
             return false;
          }
          return true;
        })
        .map(item => {
          if (emojiUpdates[item.id] && item.emoji !== emojiUpdates[item.id]) {
            changed = true;
            return { ...item, emoji: emojiUpdates[item.id] };
          }
          return item;
        });

      if (changed) {
        await updateDoc(doc(db, 'vendors', vendorDoc.id), { inventory: newInventory });
        console.log(`Updated vendor ${vendorDoc.id} inventory.`);
      }
    }
  }

  // 4. Update local files
  const files = ['src/data/firebaseDB.js', 'cleanDatabase.js'];
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove Jackfruit
      const delRegex = new RegExp(`\\s*\\{[^}]*id:\\s*['"]${idToDelete}['"].*?\\},?.*\\n?`, 'g');
      content = content.replace(delRegex, '');
      
      // Update Emojis in firebaseDB.js
      if (file === 'src/data/firebaseDB.js') {
        const replaceF4 = /(id:\s*['"]f4['"].*?emoji:\s*['"])[^'"](['"])/g;
        content = content.replace(replaceF4, `$1🥑$2`);

        const replaceF7 = /(id:\s*['"]f7['"].*?emoji:\s*['"])[^'"](['"])/g;
        content = content.replace(replaceF7, `$1🍏$2`);
      }
      
      fs.writeFileSync(file, content);
      console.log(`Cleaned local file ${file}`);
    }
  }

  process.exit(0);
}

run().catch(console.error);

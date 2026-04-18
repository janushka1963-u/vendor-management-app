import fs from 'fs';
import { db } from './src/firebase.js';
import { collection, doc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';

const idsToRemove = ['f11', 'v5', 'v10', 'v12'];

async function run() {
  console.log("Removing products from Firestore DB...");
  
  // 1. Remove from products collection
  for (const id of idsToRemove) {
    try {
      await deleteDoc(doc(db, 'products', id));
      console.log(`Deleted ${id} from products.`);
    } catch (e) {
      console.error(`Failed to delete ${id} from products`, e);
    }
  }

  // 2. Remove from vendors inventory
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  for (const vendorDoc of vendorsSnap.docs) {
    const data = vendorDoc.data();
    if (data.inventory && Array.isArray(data.inventory)) {
      const originalLength = data.inventory.length;
      const newInventory = data.inventory.filter(item => !idsToRemove.includes(item.id));
      if (newInventory.length !== originalLength) {
        await updateDoc(doc(db, 'vendors', vendorDoc.id), { inventory: newInventory });
        console.log(`Removed deleted products from vendor ${vendorDoc.id} inventory.`);
      }
    }
  }

  // 3. Remove from local files
  console.log("Cleaning up local files...");
  const filesToClean = ['src/data/firebaseDB.js', 'cleanDatabase.js'];
  for (const file of filesToClean) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // We will match lines like `{ id: 'f11', ... },` or `{ id: 'f11', ... }`
      for (const id of idsToRemove) {
        const regex = new RegExp(`\\s*\\{[^}]*id:\\s*['"]${id}['"].*?\\},?.*\\n?`, 'g');
        content = content.replace(regex, '');
      }
      
      fs.writeFileSync(file, content);
      console.log(`Cleaned ${file}`);
    } else {
       console.log(`${file} does not exist. Skipping.`);
    }
  }

  console.log("Cleanup completed fully!");
  process.exit(0);
}

run().catch(console.error);

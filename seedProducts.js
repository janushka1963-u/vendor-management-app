import { db } from './src/firebase.js';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getBaseProducts } from './src/data/firebaseDB.js';

async function run() {
  console.log("Seeding Database...");
  const snap = await getDocs(collection(db, 'products'));
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'products', d.id)));
  await Promise.all(deletePromises);
  console.log("Cleared old products. Writing new list...");

  const baseProducts = getBaseProducts();
  const writePromises = baseProducts.map(p => setDoc(doc(db, 'products', p.id), p));
  await Promise.all(writePromises);
  
  console.log("Database reset with 40 categorized items successfully!");
  process.exit(0);
}

run();

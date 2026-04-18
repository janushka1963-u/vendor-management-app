import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function check() {
  console.log("Fetching products...");
  const snap = await getDocs(collection(db, 'products'));
  const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(JSON.stringify(prods, null, 2));
  process.exit(0);
}

check().catch(console.error);

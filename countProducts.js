import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function count() {
  const prodSnap = await getDocs(collection(db, 'products'));
  console.log(`Total root products: ${prodSnap.size}`);
  if (prodSnap.size > 0) {
    prodSnap.docs.forEach((d, i) => {
      if (i < 5) console.log(`${d.data().name} -> API/Image: ${d.data().imageUrl || d.data().image}`);
    });
  }

  const vSnap = await getDocs(collection(db, 'vendors'));
  console.log(`Total vendors: ${vSnap.size}`);
  
  process.exit(0);
}

count();

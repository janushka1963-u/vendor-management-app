import { db } from './src/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const baseProducts = [
  // --- FRUITS ---
  { id: 'f21', name: 'Apple', description: 'Fresh red apples', price: 120, unit: 'kg', category: 'fruits' },
  { id: 'f22', name: 'Grapes', description: 'Seedless green grapes', price: 100, unit: 'kg', category: 'fruits' },
  { id: 'f1', name: 'Banana', description: 'Ripe sweet bananas', price: 50, unit: 'dozen', category: 'fruits' },
  { id: 'f2', name: 'Mango', description: 'Fresh sweet mangoes', price: 150, unit: 'kg', category: 'fruits' },
  { id: 'f3', name: 'Guava', description: 'Fresh sweet guava', price: 80, unit: 'kg', category: 'fruits' },
  { id: 'f4', name: 'Papaya', description: 'Ripe sweet papaya', price: 60, unit: 'kg', category: 'fruits' },
  { id: 'f5', name: 'Watermelon', description: 'Fresh juicy watermelon', price: 40, unit: 'kg', category: 'fruits' },
  { id: 'f6', name: 'Sweet lime', description: 'Fresh sweet lime (Mosambi)', price: 80, unit: 'dozen', category: 'fruits' },  { id: 'f8', name: 'Sapota', description: 'Sweet fresh sapota (Chikoo)', price: 80, unit: 'kg', category: 'fruits' },
  { id: 'f9', name: 'Tamarind', description: 'Raw fresh tamarind', price: 150, unit: 'kg', category: 'fruits' },
  { id: 'f10', name: 'Coconut', description: 'Fresh whole coconut', price: 40, unit: 'pc', category: 'fruits' },  { id: 'f12', name: 'Jamun', description: 'Fresh Indian blackberry', price: 200, unit: 'kg', category: 'fruits' },
  { id: 'f13', name: 'Indian gooseberry', description: 'Fresh amla', price: 80, unit: 'kg', category: 'fruits' },
  { id: 'f14', name: 'Lemon', description: 'Fresh yellow lemons', price: 5, unit: 'pc', category: 'fruits' },
  { id: 'f15', name: 'Orange', description: 'Juicy fresh oranges', price: 100, unit: 'dozen', category: 'fruits' },
  { id: 'f16', name: 'Pineapple', description: 'Fresh whole pineapple', price: 60, unit: 'pc', category: 'fruits' },
  { id: 'f17', name: 'Ber', description: 'Fresh Indian jujube', price: 60, unit: 'kg', category: 'fruits' },
  { id: 'f18', name: 'Wood apple', description: 'Fresh bael fruit', price: 40, unit: 'pc', category: 'fruits' },  { id: 'f20', name: 'Sugarcane', description: 'Fresh sugarcane sticks', price: 20, unit: 'pc', category: 'fruits' },
  // --- VEGETABLES ---
  { id: 'v21', name: 'Onion', description: 'Crisp red onions', price: 50, unit: 'kg', category: 'vegetables' },
  { id: 'v1', name: 'Carrot', description: 'Fresh crunchy carrots', price: 60, unit: 'kg', category: 'vegetables' },
  { id: 'v2', name: 'Potato', description: 'Organic potatoes', price: 40, unit: 'kg', category: 'vegetables' },
  { id: 'v3', name: 'Tomato', description: 'Fresh local tomatoes', price: 50, unit: 'kg', category: 'vegetables' },
  { id: 'v4', name: 'Brinjal', description: 'Fresh purple brinjal (Eggplant)', price: 50, unit: 'kg', category: 'vegetables' },  { id: 'v6', name: 'Cabbage', description: 'Fresh green cabbage', price: 40, unit: 'head', category: 'vegetables' },
  { id: 'v7', name: 'Cauliflower', description: 'Fresh whole cauliflower', price: 50, unit: 'head', category: 'vegetables' },
  { id: 'v8', name: 'Spinach', description: 'Fresh organic spinach leaves (Palak)', price: 20, unit: 'bunch', category: 'vegetables' },
  { id: 'v9', name: 'Bitter gourd', description: 'Fresh bitter gourd (Karela)', price: 60, unit: 'kg', category: 'vegetables' },  { id: 'v11', name: 'Bottle gourd', description: 'Fresh bottle gourd (Lauki)', price: 40, unit: 'pc', category: 'vegetables' },  { id: 'v13', name: 'Pumpkin', description: 'Whole yellow pumpkin', price: 30, unit: 'kg', category: 'vegetables' },
  { id: 'v14', name: 'Beetroot', description: 'Fresh red beetroot', price: 60, unit: 'kg', category: 'vegetables' },
  { id: 'v15', name: 'Radish', description: 'White fresh radish (Mooli)', price: 40, unit: 'kg', category: 'vegetables' },
  { id: 'v16', name: 'Turnip', description: 'Fresh turnip', price: 50, unit: 'kg', category: 'vegetables' },
  { id: 'v17', name: 'Capsicum', description: 'Green bell pepper (Capsicum)', price: 80, unit: 'kg', category: 'vegetables' },
  { id: 'v18', name: 'Beans', description: 'Fresh green french beans', price: 100, unit: 'kg', category: 'vegetables' },
  { id: 'v19', name: 'Peas', description: 'Fresh green peas', price: 80, unit: 'kg', category: 'vegetables' },
  { id: 'v20', name: 'Drumstick', description: 'Fresh green drumsticks', price: 20, unit: 'pc', category: 'vegetables' }
];

async function run() {
  console.log("Cleaning Database...");
  
  // 1. Overwrite all products
  console.log("Wiping all products and replacing with strict defaults...");
  const prodsSnap = await getDocs(collection(db, 'products'));
  for (const p of prodsSnap.docs) {
    await deleteDoc(doc(db, 'products', p.id));
  }
  for (const p of baseProducts) {
    await setDoc(doc(db, 'products', p.id), p);
  }
  
  // 2. Loop over vendors and clean up their inventory
  console.log("Checking vendors for dirty inventory items...");
  const vendorSnap = await getDocs(collection(db, 'vendors'));
  for (const v of vendorSnap.docs) {
    const data = v.data();
    if (data.inventory && Array.isArray(data.inventory)) {
      let changed = false;
      const newInv = data.inventory.map(item => {
        // Find a clean match
        const cleanMatch = baseProducts.find(base => base.id === item.id);
        if (cleanMatch) {
          if (item.name !== cleanMatch.name || item.imageUrl !== cleanMatch.imageUrl) {
            changed = true;
            return {
              ...item,
              name: cleanMatch.name,
              imageUrl: cleanMatch.imageUrl,
              description: cleanMatch.description,
              category: cleanMatch.category
            };
          }
        }
        return item;
      });
      
      if (changed) {
        console.log(`Updating Vendor ${data.name || data.phone} inventory to fix bad names/images...`);
        await updateDoc(doc(db, 'vendors', v.id), { inventory: newInv });
      }
    }
  }

  console.log("Database clean up complete! Reverted to clean images and names.");
  process.exit(0);
}

run().catch(console.error);

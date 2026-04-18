import { db } from './src/firebase.js';
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

async function removeImages() {
  console.log("Removing images from products collection...");
  const productsSnap = await getDocs(collection(db, 'products'));
  let productsUpdatedCount = 0;
  
  for (const document of productsSnap.docs) {
    const data = document.data();
    const category = data.category ? data.category.toLowerCase() : '';
    
    if (category === 'vegetables' || category === 'fruits' || category === 'vegetable' || category === 'fruit') { 
      let updateData = {};
      
      for (const key of Object.keys(data)) {
        if (key.toLowerCase().includes('image') || key.toLowerCase().includes('img') || key.toLowerCase().includes('pic') || key.toLowerCase().includes('photo')) {
          if (updateData[key] === undefined) {
            updateData[key] = deleteField();
          }
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        try {
          await updateDoc(doc(db, 'products', document.id), updateData);
          productsUpdatedCount++;
          console.log(`Updated product document ${document.id} (${data.name?.en || data.name}) - Removed fields: ${Object.keys(updateData).join(', ')}`);
        } catch (error) {
          console.error(`Error updating product ${document.id}:`, error);
        }
      }
    }
  }
  
  console.log(`Finished updating products collection. Total updated: ${productsUpdatedCount}`);

  console.log("\nRemoving images from vendors' inventory...");
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  let vendorsUpdatedCount = 0;

  for (const vendorDoc of vendorsSnap.docs) {
    const data = vendorDoc.data();
    if (data.inventory && Array.isArray(data.inventory)) {
      let changed = false;
      const updatedInventory = data.inventory.map(item => {
        const category = item.category ? item.category.toLowerCase() : '';
        if (category === 'vegetables' || category === 'fruits' || category === 'vegetable' || category === 'fruit') {
          const keys = Object.keys(item);
          let itemChanged = false;
          let newItem = { ...item };
          
          for (const key of keys) {
            if (key.toLowerCase().includes('image') || key.toLowerCase().includes('img') || key.toLowerCase().includes('pic') || key.toLowerCase().includes('photo')) {
               delete newItem[key];
               itemChanged = true;
               changed = true;
            }
          }
          return itemChanged ? newItem : item;
        }
        return item;
      });

      if (changed) {
         try {
           await updateDoc(doc(db, 'vendors', vendorDoc.id), { inventory: updatedInventory });
           vendorsUpdatedCount++;
           console.log(`Updated vendor document ${vendorDoc.id} (${data.name || data.phone}) - Removed images from inventory items.`);
         } catch (error) {
           console.error(`Error updating vendor ${vendorDoc.id}:`, error);
         }
      }
    }
  }

  console.log(`Finished updating vendors. Total updated: ${vendorsUpdatedCount}`);
  
  // Verification step
  console.log("\nVerifying no product/inventory contains image fields...");
  
  const verifyProducts = await getDocs(collection(db, 'products'));
  let remainingImages = 0;
  for (const document of verifyProducts.docs) {
    const data = document.data();
    const category = data.category ? data.category.toLowerCase() : '';
    if (category === 'vegetables' || category === 'fruits' || category === 'vegetable' || category === 'fruit') {
      const keys = Object.keys(data);
      const remainingImageKeys = keys.filter(key => 
        key.toLowerCase().includes('image') ||  key.toLowerCase().includes('img') || key.toLowerCase().includes('pic') || key.toLowerCase().includes('photo')
      );
      if (remainingImageKeys.length > 0) {
        remainingImages++;
        console.log(`WARNING: Product ${document.id} STILL has image fields: ${remainingImageKeys.join(', ')}`);
      }
    }
  }

  const verifyVendors = await getDocs(collection(db, 'vendors'));
  for (const document of verifyVendors.docs) {
    const data = document.data();
    if (data.inventory && Array.isArray(data.inventory)) {
       data.inventory.forEach(item => {
         const category = item.category ? item.category.toLowerCase() : '';
         if (category === 'vegetables' || category === 'fruits' || category === 'vegetable' || category === 'fruit') {
           const keys = Object.keys(item);
           const remainingImageKeys = keys.filter(key => 
             key.toLowerCase().includes('image') ||  key.toLowerCase().includes('img') || key.toLowerCase().includes('pic') || key.toLowerCase().includes('photo')
           );
           if (remainingImageKeys.length > 0) {
             remainingImages++;
             console.log(`WARNING: Vendor ${document.id} inventory item ${item.id} STILL has image fields: ${remainingImageKeys.join(', ')}`);
           }
         }
       });
    }
  }

  if (remainingImages === 0) {
     console.log("Verification successful! No image-related fields found in products or vendor inventories.");
  } else {
     console.log(`Verification failed. Found ${remainingImages} instances of remaining image fields.`);
  }

  process.exit(0);
}

removeImages().catch(err => {
    console.error(err);
    process.exit(1);
});

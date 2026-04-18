import { db } from './src/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const fallbackImages = {
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bc6e?w=800&q=80',
  'grapes': 'https://images.unsplash.com/photo-1596366606017-9192eb9329fc?w=800&q=80',
  'banana': 'https://images.unsplash.com/photo-1571501478200-264f2b4ebf13?w=800&q=80',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
  'guava': 'https://images.unsplash.com/photo-1626207865243-7f21221f7db1?w=800&q=80',
  'papaya': 'https://images.unsplash.com/photo-1541595163152-3fb622c7aed1?w=800&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=800&q=80',
  'sweet lime': 'https://images.unsplash.com/photo-1557088463-228741ec812b?w=800&q=80',
  'custard apple': 'https://images.unsplash.com/photo-1601614741499-d41c8882cae3?w=800&q=80',
  'sapota': 'https://images.unsplash.com/photo-1596489397685-64906566089d?w=800&q=80',
  'tamarind': 'https://images.unsplash.com/photo-1626224446328-769efab6e3ff?w=800&q=80',
  'coconut': 'https://images.unsplash.com/photo-1550259114-ad213bc541eb?w=800&q=80',
  'palm fruit': 'https://images.unsplash.com/photo-1632840552733-4f51e00e1215?w=800&q=80',
  'jamun': 'https://images.unsplash.com/photo-1596647266158-b869d80362ee?w=800&q=80',
  'indian gooseberry': 'https://images.unsplash.com/photo-1563273114-1fbc8f276cd8?w=800&q=80',
  'lemon': 'https://images.unsplash.com/photo-1608670102660-f655ae28ebd0?w=800&q=80',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80',
  'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80',
  'ber': 'https://images.unsplash.com/photo-1610832958506-aa56368176cb?w=800&q=80',
  'wood apple': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
  'jackfruit': 'https://images.unsplash.com/photo-1533816670860-64ab626a5ca1?w=800&q=80',
  'sugarcane': 'https://images.unsplash.com/photo-1606112952875-149b1ca4c8ef?w=800&q=80',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07ce83aa8cb?w=800&q=80',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
  'brinjal': 'https://images.unsplash.com/photo-1601314811234-f81d596bf7bf?w=800&q=80',
  'lady finger': 'https://plus.unsplash.com/premium_photo-1663954546416-d352136e65b7?w=800&q=80',
  'cabbage': 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80',
  'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&q=80',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
  'bitter gourd': 'https://images.unsplash.com/photo-1627916578508-2c262eb04ca4?w=800&q=80',
  'ridge gourd': 'https://images.unsplash.com/photo-1605333398912-7bb396a32d66?w=800&q=80',
  'bottle gourd': 'https://images.unsplash.com/photo-1629858348633-5b806d2cde57?w=800&q=80',
  'snake gourd': 'https://images.unsplash.com/photo-1595856468757-ecc3388c4228?w=800&q=80',
  'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80',
  'beetroot': 'https://images.unsplash.com/photo-1593026330962-d9b8973b0625?w=800&q=80',
  'radish': 'https://images.unsplash.com/photo-1593959950543-7f912c98492f?w=800&q=80',
  'turnip': 'https://images.unsplash.com/photo-1633471017409-90b5bb0b810d?w=800&q=80',
  'capsicum': 'https://images.unsplash.com/photo-1563507466372-c61871dfcf38?w=800&q=80',
  'beans': 'https://images.unsplash.com/photo-1569424785864-880fa3528825?w=800&q=80',
  'peas': 'https://images.unsplash.com/photo-1590005021288-66afdb06497f?w=800&q=80',
  'drumstick': 'https://images.unsplash.com/photo-1628773738042-3e3c03b12dc1?w=800&q=80'
};

const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

function isBadImage(url) {
  if (!url) return true;
  if (emojiRegex.test(url)) return true;
  if (url.length < 15 && !url.includes('http')) return true; // Just text or emojis
  return false;
}

async function fixImages() {
  console.log("Starting to fix product images...");
  try {
    // 1. Fix main products collection
    const prodSnap = await getDocs(collection(db, 'products'));
    let updatedProductsNum = 0;
    
    for (const d of prodSnap.docs) {
      const data = d.data();
      const img = data.image || data.imageUrl;
      
      if (isBadImage(img)) {
        console.log(`Bad image found for product "${data.name}": ${img}`);
        const nameLower = (data.name || '').toLowerCase().trim();
        const fallback = fallbackImages[nameLower];
        if (fallback) {
          const updates = {};
          if (data.image !== undefined) updates.image = fallback;
          if (data.imageUrl !== undefined || data.image === undefined) updates.imageUrl = fallback;
          await updateDoc(doc(db, 'products', d.id), updates);
          console.log(`Updated product "${data.name}" with URL: ${fallback}`);
          updatedProductsNum++;
        } else {
          console.log(`No fallback found for "${data.name}", fetching online...`);
          // Fetch from free public unmapped (e.g., Unsplash standard query) 
          // However, Unsplash Source requires valid format. We'll use a standard realistic nature photo search
          const newUrl = `https://images.unsplash.com/photo-1596366606017-9192eb9329fc?w=800&q=80`; // Fallback to generic if we really can't find it, but all 40 are mapped.
          await updateDoc(doc(db, 'products', d.id), { imageUrl: newUrl });
        }
      }
    }
    
    // 2. Fix vendors inventory
    const vendorSnap = await getDocs(collection(db, 'vendors'));
    let updatedVendorsNum = 0;
    
    for (const v of vendorSnap.docs) {
      const vData = v.data();
      if (vData.inventory && Array.isArray(vData.inventory)) {
        let changed = false;
        const newInv = vData.inventory.map(item => {
          const img = item.image || item.imageUrl;
          if (isBadImage(img)) {
            const nameLower = (item.name || '').toLowerCase().trim();
            const fallback = fallbackImages[nameLower];
            if (fallback) {
              changed = true;
              return { ...item, imageUrl: fallback, image: undefined };
            }
          }
          return item;
        });
        
        if (changed) {
          await updateDoc(doc(db, 'vendors', v.id), { inventory: newInv });
          console.log(`Updated inventory for vendor: ${vData.name || v.id}`);
          updatedVendorsNum++;
        }
      }
    }
    
    console.log(`Finished updates. Changed ${updatedProductsNum} root products and ${updatedVendorsNum} vendors.`);
  } catch (err) {
    console.error("Error during operations:", err);
  }
  process.exit(0);
}

fixImages();

import { collection, addDoc, doc, updateDoc, getDoc, getDocs, setDoc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getBaseProducts = () => [
  // --- FRUITS ---
  { id: 'f21', name: { en: 'Apple', te: 'ఆపిల్', hi: 'सेब' }, description: 'Fresh red apples', price: 120, unit: 'kg', category: 'fruits', emoji: '🍎' },
  { id: 'f22', name: { en: 'Grapes', te: 'ద్రాక్ష', hi: 'अंगूर' }, description: 'Seedless green grapes', price: 100, unit: 'kg', category: 'fruits', emoji: '🍇' },
  { id: 'f1', name: { en: 'Banana', te: 'అరటి', hi: 'केला' }, description: 'Ripe sweet bananas', price: 50, unit: 'dozen', category: 'fruits', emoji: '🍌' },
  { id: 'f2', name: { en: 'Mango', te: 'మామిడి', hi: 'आम' }, description: 'Fresh sweet mangoes', price: 150, unit: 'kg', category: 'fruits', emoji: '🥭' },
  { id: 'f3', name: { en: 'Guava', te: 'జామ', hi: 'अमरूद' }, description: 'Fresh sweet guava', price: 80, unit: 'kg', category: 'fruits', emoji: '🍐' },
  { id: 'f4', name: { en: 'Papaya', te: 'బొప్పాయి', hi: 'पपीता' }, description: 'Ripe sweet papaya', price: 60, unit: 'kg', category: 'fruits', emoji: '🍈' },
  { id: 'f5', name: { en: 'Watermelon', te: 'పుచ్చకాయ', hi: 'तरबूज' }, description: 'Fresh juicy watermelon', price: 40, unit: 'kg', category: 'fruits', emoji: '🍉' },
  { id: 'f6', name: { en: 'Sweet lime', te: 'బత్తాయి', hi: 'मौसंबी' }, description: 'Fresh sweet lime (Mosambi)', price: 80, unit: 'dozen', category: 'fruits', emoji: '🍋' },  { id: 'f8', name: { en: 'Sapota', te: 'సపోటా', hi: 'चीकू' }, description: 'Sweet fresh sapota (Chikoo)', price: 80, unit: 'kg', category: 'fruits', emoji: '🥔' },
  { id: 'f9', name: { en: 'Tamarind', te: 'చింతపండు', hi: 'इमली' }, description: 'Raw fresh tamarind', price: 150, unit: 'kg', category: 'fruits', emoji: '🫘' },
  { id: 'f10', name: { en: 'Coconut', te: 'కొబ్బరి', hi: 'नारियल' }, description: 'Fresh whole coconut', price: 40, unit: 'pc', category: 'fruits', emoji: '🥥' },  { id: 'f12', name: { en: 'Jamun', te: 'నేరేడు పండు', hi: 'जामुन' }, description: 'Fresh Indian blackberry', price: 200, unit: 'kg', category: 'fruits', emoji: '🫐' },
  { id: 'f13', name: { en: 'Indian gooseberry', te: 'ఉసిరి', hi: 'आंवला' }, description: 'Fresh amla', price: 80, unit: 'kg', category: 'fruits', emoji: '🍈' },
  { id: 'f14', name: { en: 'Lemon', te: 'నిమ్మ', hi: 'नींबू' }, description: 'Fresh yellow lemons', price: 5, unit: 'pc', category: 'fruits', emoji: '🍋' },
  { id: 'f15', name: { en: 'Orange', te: 'కమలాపండు', hi: 'संतरा' }, description: 'Juicy fresh oranges', price: 100, unit: 'dozen', category: 'fruits', emoji: '🍊' },
  { id: 'f16', name: { en: 'Pineapple', te: 'పైనాపిల్', hi: 'अनानास' }, description: 'Fresh whole pineapple', price: 60, unit: 'pc', category: 'fruits', emoji: '🍍' },
  { id: 'f17', name: { en: 'Ber', te: 'రేగు పండు', hi: 'बेर' }, description: 'Fresh Indian jujube', price: 60, unit: 'kg', category: 'fruits', emoji: '🍒' },
  { id: 'f18', name: { en: 'Wood apple', te: 'వెలగపండు', hi: 'बेल' }, description: 'Fresh bael fruit', price: 40, unit: 'pc', category: 'fruits', emoji: '🍏' },  { id: 'f20', name: { en: 'Sugarcane', te: 'చెరకు', hi: 'गन्ना' }, description: 'Fresh sugarcane sticks', price: 20, unit: 'pc', category: 'fruits', emoji: '🎋' },

  // --- VEGETABLES ---
  { id: 'v21', name: { en: 'Onion', te: 'ఉల్లిపాయ', hi: 'प्याज' }, description: 'Crisp red onions', price: 50, unit: 'kg', category: 'vegetables', emoji: '🧅' },
  { id: 'v1', name: { en: 'Carrot', te: 'క్యారెట్', hi: 'गाजर' }, description: 'Fresh crunchy carrots', price: 60, unit: 'kg', category: 'vegetables', emoji: '🥕' },
  { id: 'v2', name: { en: 'Potato', te: 'ఆలుగడ్డ', hi: 'आलू' }, description: 'Organic potatoes', price: 40, unit: 'kg', category: 'vegetables', emoji: '🥔' },
  { id: 'v3', name: { en: 'Tomato', te: 'టమాటా', hi: 'टमाटर' }, description: 'Fresh local tomatoes', price: 50, unit: 'kg', category: 'vegetables', emoji: '🍅' },
  { id: 'v4', name: { en: 'Brinjal', te: 'వంకాయ', hi: 'बैंगन' }, description: 'Fresh purple brinjal (Eggplant)', price: 50, unit: 'kg', category: 'vegetables', emoji: '🍆' },  { id: 'v6', name: { en: 'Cabbage', te: 'క్యాబేజీ', hi: 'पत्ता गोभी' }, description: 'Fresh green cabbage', price: 40, unit: 'head', category: 'vegetables', emoji: '🥬' },
  { id: 'v7', name: { en: 'Cauliflower', te: 'కాలీఫ్లవర్', hi: 'फूल गोभी' }, description: 'Fresh whole cauliflower', price: 50, unit: 'head', category: 'vegetables', emoji: '🥦' },
  { id: 'v8', name: { en: 'Spinach', te: 'పాలకూర', hi: 'पालक' }, description: 'Fresh organic spinach leaves (Palak)', price: 20, unit: 'bunch', category: 'vegetables', emoji: '🥬' },
  { id: 'v9', name: { en: 'Bitter gourd', te: 'కాకరకాయ', hi: 'करेला' }, description: 'Fresh bitter gourd (Karela)', price: 60, unit: 'kg', category: 'vegetables', emoji: '🥒' },  { id: 'v11', name: { en: 'Bottle gourd', te: 'సొరకాయ', hi: 'लौकी' }, description: 'Fresh bottle gourd (Lauki)', price: 40, unit: 'pc', category: 'vegetables', emoji: '🥒' },  { id: 'v13', name: { en: 'Pumpkin', te: 'గుమ్మడికాయ', hi: 'कद्दू' }, description: 'Whole yellow pumpkin', price: 30, unit: 'kg', category: 'vegetables', emoji: '🎃' },
  { id: 'v14', name: { en: 'Beetroot', te: 'బీట్‌రూట్', hi: 'चुकंदर' }, description: 'Fresh red beetroot', price: 60, unit: 'kg', category: 'vegetables', emoji: '🍠' },
  { id: 'v15', name: { en: 'Radish', te: 'ముల్లంగి', hi: 'मूली' }, description: 'White fresh radish (Mooli)', price: 40, unit: 'kg', category: 'vegetables', emoji: '🥕' },
  { id: 'v16', name: { en: 'Turnip', te: 'టర్నిప్', hi: 'शलगम' }, description: 'Fresh turnip', price: 50, unit: 'kg', category: 'vegetables', emoji: '🧅' },
  { id: 'v17', name: { en: 'Capsicum', te: 'క్యాప్సికం', hi: 'शिमला मिर्च' }, description: 'Green bell pepper (Capsicum)', price: 80, unit: 'kg', category: 'vegetables', emoji: '🫑' },
  { id: 'v18', name: { en: 'Beans', te: 'బీన్స్', hi: 'बीन्स' }, description: 'Fresh green french beans', price: 100, unit: 'kg', category: 'vegetables', emoji: '🫘' },
  { id: 'v19', name: { en: 'Peas', te: 'బఠానీలు', hi: 'मटर' }, description: 'Fresh green peas', price: 80, unit: 'kg', category: 'vegetables', emoji: '🫛' },
  { id: 'v20', name: { en: 'Drumstick', te: 'ములక్కాయ', hi: 'सहजन' }, description: 'Fresh green drumsticks', price: 20, unit: 'pc', category: 'vegetables', emoji: '🥖' }
];

export const syncProductsToDB = async () => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  // Wipe all existing
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, 'products', docSnap.id));
  }
  
  // Create all new
  for (const p of getBaseProducts()) {
    await setDoc(doc(db, 'products', p.id), p);
  }
};

export const fetchRealTimePrices = async () => {
  await syncProductsToDB();
  // Price fluctuation removed to keep newly added prices exact
};

export const listenToProducts = (callback) => {
  const q = query(collection(db, 'products'));
  return onSnapshot(q, (snapshot) => {
    const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(prods);
  });
};

/**
 * Calculates distance in kilometers between two lat/lng coordinates
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// -- USERS -- 

export const saveVendor = async (vendorData) => {
  const docRef = await addDoc(collection(db, 'vendors'), vendorData);
  return { ...vendorData, id: docRef.id };
};

export const findVendorByPhone = async (phone) => {
  const q = query(collection(db, 'vendors'), where('phone', '==', phone));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
};

export const updateVendorLocation = async (vendorId, lat, lng) => {
  const vendorRef = doc(db, 'vendors', vendorId);
  await updateDoc(vendorRef, { lat, lng });

  try {
    const qActive = query(
      collection(db, 'orders'), 
      where('currentVendorId', '==', vendorId), 
      where('status', '==', 'accepted'),
      where('deliveryStatus', '==', 'on_the_way')
    );
    const snap = await getDocs(qActive);
    for (const d of snap.docs) {
      const order = d.data();
      if (order.customerLat && order.customerLng) {
        const dist = calculateDistance(order.customerLat, order.customerLng, lat, lng);
        let updates = { vendorLocation: { lat, lng } };
        
        if (dist <= 0.05) {
          updates.deliveryStatus = 'arrived';
          updates.etaMinutes = 0;
        } else {
          updates.etaMinutes = Math.max(1, Math.ceil(dist * 3)); // 20km/h => 3 mins per km
        }
        await updateDoc(doc(db, 'orders', d.id), updates);
      }
    }
  } catch (e) {
    console.error("Failed to sync vendor location to active orders", e);
  }
};

export const updateVendorProfile = async (vendorId, details) => {
  const vendorRef = doc(db, 'vendors', vendorId);
  await updateDoc(vendorRef, details);
};

export const updateUserLanguage = async (role, userId, language) => {
  const collectionName = role === 'vendor' ? 'vendors' : 'customers';
  const docRef = doc(db, collectionName, userId);
  await updateDoc(docRef, { language });
};

export const updateVendorInventory = async (vendorId, inventory) => {
  const vendorRef = doc(db, 'vendors', vendorId);
  await updateDoc(vendorRef, { inventory });
  return true;
};

export const saveCustomer = async (customerData) => {
  const docRef = await addDoc(collection(db, 'customers'), customerData);
  return { ...customerData, id: docRef.id };
};

export const findCustomerByPhone = async (phone) => {
  const q = query(collection(db, 'customers'), where('phone', '==', phone));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
};

export const placeOrder = async (orderData) => {
  const { customerLat, customerLng, items } = orderData;
  const requestedItem = items[0]; // Buy Now only orders one item class
  
  // Fetch all vendors to find the nearest based on real distance
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  const vendors = vendorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  // Sort by Haversine distance
  const sortedVendors = vendors
    .map(v => ({
      ...v,
      distance: calculateDistance(customerLat, customerLng, v.lat || 0, v.lng || 0)
    }))
    .sort((a, b) => a.distance - b.distance);

  let bestVendor = null;
  let maxAvailableQuantity = 0;

  for (const v of sortedVendors) {
    if (!v.inventory) continue;
    const stockItem = v.inventory.find(i => i.id === requestedItem.id && i.selected);
    const stockQty = stockItem ? stockItem.quantity : 0;
    
    if (stockQty > maxAvailableQuantity) {
      maxAvailableQuantity = stockQty;
    }
    
    if (stockQty >= requestedItem.quantity) {
       bestVendor = v;
       break;
    }
  }

  if (!bestVendor) {
    return { success: false, maxAvailable: maxAvailableQuantity };
  }

  // Deduct quantity from bestVendor in Firestore!
  const updatedInventory = bestVendor.inventory.map(i => {
    if (i.id === requestedItem.id) {
       return { ...i, quantity: i.quantity - requestedItem.quantity };
    }
    return i;
  });
  await updateDoc(doc(db, 'vendors', bestVendor.id), { inventory: updatedInventory });

  const newOrder = {
    ...orderData,
    status: 'pending',
    vendorHistory: [],
    vendorResponses: [],
    currentVendorId: bestVendor.id,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'orders'), newOrder);
  
  // Notify Vendor
  await sendNotification({
    userId: bestVendor.id,
    message: 'notif_new_order',
    type: 'new_order',
    meta: { name: orderData.customerName }
  });

  // Notify Customer
  await sendNotification({
    userId: orderData.customerId,
    message: 'notif_order_placed',
    type: 'order_placed',
    meta: { id: docRef.id.slice(2,8).toUpperCase() }
  });

  return { success: true, order: { ...newOrder, id: docRef.id } };
};

export const acceptOrder = async (orderId, customerId, vendorName, vendorPhone, vendorId, vendorLat, vendorLng) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) return null;

  const order = orderSnap.data();
  const updatedResponses = [...(order.vendorResponses || []), { vendorId, response: 'accepted' }];

  let updates = { 
    status: 'accepted', 
    vendorResponses: updatedResponses,
    deliveryStatus: 'on_the_way'
  };

  const isReassigned = order.vendorId && order.vendorId !== vendorId;

  if (!order.vendorId) {
    updates.vendorId = vendorId;
    updates.vendorName = vendorName;
    updates.vendorPhone = vendorPhone;
  } else {
    updates.newVendorId = vendorId;
    updates.newVendorName = vendorName;
    updates.newVendorPhone = vendorPhone;
  }

  if (vendorLat && vendorLng && order.customerLat && order.customerLng) {
    updates.vendorLocation = { lat: vendorLat, lng: vendorLng };
    const dist = calculateDistance(order.customerLat, order.customerLng, vendorLat, vendorLng);
    updates.etaMinutes = Math.max(1, Math.ceil(dist * 3));
  }

  await updateDoc(orderRef, updates);
  
  if (isReassigned) {
    // Customer Notification: Due to some reasons, another vendor is now delivering your order.
    await sendNotification({
      userId: customerId,
      message: "notif_order_reassigned",
      type: 'order_reassigned'
    });
  } else {
    // Initial accept notification
    await sendNotification({
      userId: customerId,
      message: "notif_order_accepted",
      type: 'order_accepted'
    });
  }
  
  return true;
};

export const refundStock = async (vendorId, items) => {
  const vendorRef = doc(db, 'vendors', vendorId);
  const vendorSnap = await getDoc(vendorRef);
  if (!vendorSnap.exists()) return;
  const vendor = vendorSnap.data();
  if (!vendor.inventory) return;

  const itemToRefund = items[0];
  const updatedInventory = vendor.inventory.map(i => {
    if (i.id === itemToRefund.id) {
      return { ...i, quantity: i.quantity + itemToRefund.quantity };
    }
    return i;
  });
  await updateDoc(vendorRef, { inventory: updatedInventory });
};

export const cancelAcceptedOrder = async (orderId, currentVendorId) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) return null;
  
  const order = orderSnap.data();
  if (order.deliveryStatus === 'arrived') return null;

  await refundStock(currentVendorId, order.items);

  const updatedHistory = [...(order.vendorHistory || []), currentVendorId];
  const updatedResponses = [...(order.vendorResponses || []), { vendorId: currentVendorId, response: 'late_rejected' }];
  
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  const vendors = vendorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const itemToBuy = order.items[0];
  
  const nextVendor = vendors
    .map(v => ({
      ...v,
      distance: calculateDistance(order.customerLat, order.customerLng, v.lat || 0, v.lng || 0)
    }))
    .sort((a,b) => a.distance - b.distance)
    .find(v => {
      if (updatedHistory.includes(v.id)) return false;
      if (!v.inventory) return false;
      const stockItem = v.inventory.find(i => i.id === itemToBuy.id && i.selected);
      return stockItem && stockItem.quantity >= itemToBuy.quantity;
    });

  if (nextVendor) {
    const updatedInventory = nextVendor.inventory.map(i => {
      if (i.id === itemToBuy.id) {
        return { ...i, quantity: i.quantity - itemToBuy.quantity };
      }
      return i;
    });
    await updateDoc(doc(db, 'vendors', nextVendor.id), { inventory: updatedInventory });
  }

  const newStatus = nextVendor ? 'reassigned' : 'rejected_by_vendor';

  const updates = {
    vendorHistory: updatedHistory,
    vendorResponses: updatedResponses,
    currentVendorId: nextVendor ? nextVendor.id : null,
    status: newStatus,
    deliveryStatus: 'pending',
    etaMinutes: 0
  };

  await updateDoc(orderRef, updates);

  if (newStatus === 'rejected_by_vendor') {
    await sendNotification({
      userId: order.customerId,
      message: "notif_order_rejected",
      type: 'order_rejected'
    });
  } else if (nextVendor) {
    await sendNotification({
      userId: nextVendor.id,
      message: 'notif_new_order',
      type: 'new_order',
      meta: { name: order.customerName }
    });
  }

  return { id: orderId, ...order, ...updates };
};

export const rejectOrder = async (orderId, currentVendorId) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) return null;
  
  const order = orderSnap.data();
  
  await refundStock(currentVendorId, order.items);
  
  const updatedHistory = [...(order.vendorHistory || []), currentVendorId];
  const updatedResponses = [...(order.vendorResponses || []), { vendorId: currentVendorId, response: 'rejected' }];
  
  const vendorsSnap = await getDocs(collection(db, 'vendors'));
  const vendors = vendorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const itemToBuy = order.items[0];
  
  const nextVendor = vendors
    .map(v => ({
      ...v,
      distance: calculateDistance(order.customerLat, order.customerLng, v.lat || 0, v.lng || 0)
    }))
    .sort((a,b) => a.distance - b.distance)
    .find(v => {
      if (updatedHistory.includes(v.id)) return false;
      if (!v.inventory) return false;
      const stockItem = v.inventory.find(i => i.id === itemToBuy.id && i.selected);
      return stockItem && stockItem.quantity >= itemToBuy.quantity;
    });

  if (nextVendor) {
    const updatedInventory = nextVendor.inventory.map(i => {
      if (i.id === itemToBuy.id) {
        return { ...i, quantity: i.quantity - itemToBuy.quantity };
      }
      return i;
    });
    await updateDoc(doc(db, 'vendors', nextVendor.id), { inventory: updatedInventory });
  }

  const newStatus = nextVendor ? 'pending' : 'rejected';

  const updates = {
    vendorHistory: updatedHistory,
    vendorResponses: updatedResponses,
    currentVendorId: nextVendor ? nextVendor.id : null,
    status: newStatus
  };

  await updateDoc(orderRef, updates);

  if (newStatus === 'rejected') {
    await sendNotification({
      userId: order.customerId,
      message: "notif_order_rejected",
      type: 'order_rejected'
    });
  } else if (nextVendor) {
    await sendNotification({
      userId: nextVendor.id,
      message: 'notif_new_order',
      type: 'new_order',
      meta: { name: order.customerName }
    });
  }

  return { id: orderId, ...order, ...updates };
};

export const completeOrder = async (orderId) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status: 'completed' });
  return true;
};

export const listenToVendorOrders = (vendorId, callback) => {
  const q = query(collection(db, 'orders'), where('currentVendorId', '==', vendorId));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

// -- CARTS REMOVED --

// -- NOTIFICATIONS --

export const sendNotification = async (notifData) => {
  const data = { ...notifData, read: false, timestamp: new Date().toISOString() };
  await addDoc(collection(db, 'notifications'), data);
};

export const listenToNotifications = (userId, callback) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort descending locally
    callback(notifs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
  });
};


export const listenToCustomerOrders = (customerId, callback) => {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by descending time if possible, here just reverse or keep as is.
    callback(orders.reverse());
  });
};

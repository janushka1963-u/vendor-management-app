import React, { useState, useEffect } from 'react';
import { listenToProducts, fetchRealTimePrices, placeOrder, listenToCustomerOrders, listenToNotifications, completeOrder } from '../data/firebaseDB';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../App.css';
import { useTranslation } from 'react-i18next';

// Fix leaflet missing icons issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TrackingMap = ({ customerLoc, vendorLoc }) => {
  if (!customerLoc || !vendorLoc) return <div style={{ padding: '1rem', background: '#f8fafc', textAlign: 'center' }}>Map coordinates unavailable.</div>;
  
  const centerLat = (customerLoc.lat + vendorLoc.lat) / 2;
  const centerLng = (customerLoc.lng + vendorLoc.lng) / 2;
  
  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #d5d9d9', marginTop: '1rem', position: 'relative', zIndex: 1 }}>
      <MapContainer center={[centerLat, centerLng]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={[customerLoc.lat, customerLoc.lng]}>
          <Popup>You are here 🏡</Popup>
        </Marker>
        <Marker position={[vendorLoc.lat, vendorLoc.lng]}>
          <Popup>Vendor 🚚</Popup>
        </Marker>
        <Polyline positions={[[customerLoc.lat, customerLoc.lng], [vendorLoc.lat, vendorLoc.lng]]} color="#007185" weight={4} dashArray="10, 10" />
      </MapContainer>
    </div>
  );
};

const CountdownTimer = ({ etaMinutes }) => {
  const [secondsLeft, setSecondsLeft] = useState(etaMinutes ? Math.max(0, etaMinutes * 60) : 0);

  useEffect(() => {
    if (etaMinutes !== undefined) {
      setSecondsLeft(Math.max(0, etaMinutes * 60));
    }
  }, [etaMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  
  return (
    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#B12704', margin: '1rem 0' }}>
      ⏱️ {mins}:{secs.toString().padStart(2, '0')}
    </div>
  );
};

function CustomerDashboard({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('market'); // 'market' | 'orders' | 'notifications'
  const [activeMarketCategory, setActiveMarketCategory] = useState('fruits');
  const [marketSearchTerm, setMarketSearchTerm] = useState('');
  const [pendingQtys, setPendingQtys] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [spokenOrders, setSpokenOrders] = useState({});
  const [mapVisibility, setMapVisibility] = useState({});

  const toggleMap = (orderId) => {
    setMapVisibility(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  useEffect(() => {
    myOrders.forEach(order => {
      if (order.status === 'accepted' && !spokenOrders[order.id + '_accepted']) {
        for(let i=0; i<3; i++) {
          const msg = new SpeechSynthesisUtterance("Mee order accept ayindi");
          window.speechSynthesis.speak(msg);
        }
        setSpokenOrders(prev => ({ ...prev, [order.id + '_accepted']: true }));
      } else if (order.status === 'rejected' && !spokenOrders[order.id + '_rejected']) {
        const msg = new SpeechSynthesisUtterance("Mee order reject ayindi");
        window.speechSynthesis.speak(msg);
        setSpokenOrders(prev => ({ ...prev, [order.id + '_rejected']: true }));
      }
    });
  }, [myOrders, spokenOrders]);

  const handlePendingQty = (productId, delta) => {
    setPendingQtys(prev => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(1, current + delta) };
    });
  };

  // Listeners
  useEffect(() => {
    if (!user) return;
    
    // Simulate real-time API fetch
    fetchRealTimePrices().catch(console.error);

    const unsubProducts = listenToProducts((prods) => setProducts(prods));
    const unsubOrders = listenToCustomerOrders(user.id, (orders) => setMyOrders(orders));
    const unsubNotifs = listenToNotifications(user.id, (notifs) => setNotifications(notifs));
    
    return () => {
      unsubProducts();
      unsubOrders();
      unsubNotifs();
    };
  }, [user]);

  const buyNow = async (product) => {
    setLoading(true);
    const qty = pendingQtys[product.id] || 1;
    const orderData = {
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      customerLat: user.lat,
      customerLng: user.lng,
      items: [{ ...product, quantity: qty }],
      total: product.price * qty,
    };
    
    const result = await placeOrder(orderData);
    setLoading(false);

    if (result && !result.success) {
       alert(`Requested quantity is not available. Only ${result.maxAvailable} ${product.unit} is available with the vendor.`);
       return;
    }

    setActiveTab('orders');
    setPendingQtys(prev => ({ ...prev, [product.id]: 1 }));
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('status_pending')}</span>;
    if (status === 'accepted') return <span style={{ background: '#d1fae5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('status_accepted')}</span>;
    if (status === 'rejected') return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('status_rejected')}</span>;
    if (status === 'reassigned') return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('status_reassigned')}</span>;
    if (status === 'rejected_by_vendor') return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('status_vendor_unavailable')}</span>;
    return status;
  };

  const handleCompleteOrder = async (orderId) => {
    await completeOrder(orderId);
  };
  const activeOrders = myOrders.filter(o => o.status !== 'completed');

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div className="dashboard-nav">
        <button 
          className={`dashboard-nav-item ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          {t('marketplace')}
        </button>
        <button 
          className={`dashboard-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          {t('my_orders')}
        </button>
        <button 
          className={`dashboard-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t('notifications')} {notifications.length > 0 && <span style={{ background: '#f59e0b', color: 'white', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{notifications.length}</span>}
        </button>
      </div>

      {activeTab === 'market' && (
        <div className="animate-fade-in">
          <h2 className="title" style={{ fontSize: '1.8rem' }}>{t('fresh_produce_market')}</h2>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>{t('find_nearest_farms')}</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`dashboard-nav-item ${activeMarketCategory === 'fruits' ? 'active' : ''}`}
              onClick={() => setActiveMarketCategory('fruits')}
              style={{ padding: '0.5rem 1.5rem', flex: 1, minWidth: '150px' }}
            >
              🍎 {t('fruits')}
            </button>
            <button 
              className={`dashboard-nav-item ${activeMarketCategory === 'vegetables' ? 'active' : ''}`}
              onClick={() => setActiveMarketCategory('vegetables')}
              style={{ padding: '0.5rem 1.5rem', flex: 1, minWidth: '150px' }}
            >
              🥦 {t('vegetables')}
            </button>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <input 
              type="text" 
              placeholder={`${t('search')}...`}
              value={marketSearchTerm}
              onChange={(e) => setMarketSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '1rem' }}
            />
          </div>

          <div className="responsive-grid">
            {products
              .filter(p => {
                const pName = p.name[i18n.language] || p.name.en || p.name;
                return (p.category === activeMarketCategory || (!p.category && activeMarketCategory === 'vegetables')) && 
                (typeof pName === 'string' && pName.toLowerCase().includes(marketSearchTerm.toLowerCase()));
              })
              .map(prod => {
                  const pName = prod.name[i18n.language] || prod.name.en || prod.name;
                  return (
                    <div key={prod.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'white' }}>
                  <div style={{ fontSize: '5rem', textAlign: 'center', marginBottom: '1rem', background: '#f8fafc', borderRadius: '0.5rem', padding: '0', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <span style={{ padding: '1rem' }}>{prod.emoji || '📦'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: '#0f1111' }}>{pName}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#565959', marginBottom: '0.5rem', lineHeight: '1.4' }}>{prod.description}</p>
                  
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#B12704', marginBottom: '1rem' }}>
                    ₹{prod.price.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#565959', fontWeight: 'normal' }}>/ {prod.unit}</span>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', background: '#f0f2f2', borderRadius: '100px', padding: '0.25rem' }}>
                      <button type="button" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d5d9d9', background: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); handlePendingQty(prod.id, -1); }}>-</button>
                      <span style={{ fontWeight: 'bold' }}>{pendingQtys[prod.id] || 1}</span>
                      <button type="button" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d5d9d9', background: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); handlePendingQty(prod.id, 1); }}>+</button>
                    </div>
                    <button className="btn-amazon" style={{ width: '100%', background: '#ffa41c', borderColor: '#ff8f00' }} onClick={() => buyNow(prod)} disabled={loading}>
                      {t('buy_now')}
                    </button>
                  </div>
                    </div>
                  );
                })}
              </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{t('your_orders')}</h2>
          
          {activeOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('no_orders_yet')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeOrders.map(order => (
                <div key={order.id} style={{ border: '1px solid #d5d9d9', borderRadius: '0.5rem', overflow: 'hidden', background: 'white' }}>
                  <div style={{ background: '#f0f2f2', padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid #d5d9d9', color: '#565959', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ textTransform: 'uppercase' }}>{t('order_placed')}</div>
                      <div style={{ color: '#0f1111' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ textTransform: 'uppercase' }}>{t('total')}</div>
                      <div style={{ color: '#0f1111' }}>₹{order.total.toFixed(2)}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ textTransform: 'uppercase' }}>{t('order_number')} {order.id.slice(2, 10).toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{t('status')}:</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    {order.status === 'accepted' && (order.vendorName || order.newVendorName) && (
                      <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #10b981', marginBottom: '1.5rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(16,185,129,0.1)' }}>
                        {order.deliveryStatus === 'arrived' ? (
                          <div style={{ fontSize: '1.5rem', color: '#047857', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {t('order_arrived')}
                          </div>
                        ) : order.deliveryStatus === 'on_the_way' ? (
                          <>
                            <div style={{ fontSize: '1.25rem', color: '#047857', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              {t('order_on_the_way', { minutes: order.etaMinutes, unit: order.etaMinutes === 1 ? 'minute' : 'minutes' })} 🚚
                            </div>
                            <CountdownTimer etaMinutes={order.etaMinutes} />
                            <div style={{ margin: '1rem 0' }}>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '0.5rem 1.5rem', borderRadius: '100px', fontSize: '1rem' }}
                                onClick={() => toggleMap(order.id)}
                              >
                                {mapVisibility[order.id] ? t('hide_map') : t('track_on_map')}
                              </button>
                            </div>
                            {mapVisibility[order.id] && order.vendorLocation && order.customerLat && order.customerLng && (
                              <TrackingMap 
                                customerLoc={{ lat: order.customerLat, lng: order.customerLng }} 
                                vendorLoc={order.vendorLocation} 
                              />
                            )}
                          </>
                        ) : (
                          <div style={{ fontSize: '1.25rem', color: '#047857', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {t('order_accepted_congrats')}
                          </div>
                        )}
                        {order.newVendorName ? (
                          <>
                            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#065f46', fontSize: '1rem', fontWeight: 'normal' }}>{t('new_vendor_contact')}</h4>
                            <p style={{ margin: '0', color: '#047857', fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1rem' }}>{order.newVendorName} — 📞 {order.newVendorPhone}</p>
                          </>
                        ) : (
                          <>
                            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#065f46', fontSize: '1rem', fontWeight: 'normal' }}>{t('vendor_contact')}</h4>
                            <p style={{ margin: '0', color: '#047857', fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1rem' }}>{order.vendorName} — 📞 {order.vendorPhone}</p>
                          </>
                        )}
                        <button className="btn-amazon" style={{ background: '#059669', color: 'white', borderColor: '#047857' }} onClick={() => handleCompleteOrder(order.id)}>{t('mark_as_received')}</button>
                      </div>
                    )}

                    {order.status === 'rejected' && (
                      <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #ef4444', marginBottom: '1.5rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(239,68,68,0.1)' }}>
                        <div style={{ fontSize: '1.25rem', color: '#b91c1c', fontWeight: 'bold' }}>
                          {t('order_rejected_msg')}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {order.items.map((item, i) => {
                        const iName = item.name[i18n.language] || item.name.en || item.name;
                        return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
                          <div style={{ fontSize: '2.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {item.emoji || '📦'}
                          </div>
                          <div>
                            <div style={{ color: '#007185', fontWeight: '500' }}>{iName}</div>
                            <div style={{ color: '#565959', fontSize: '0.9rem' }}>
                              {t('qty')}: {item.quantity}
                              {order.status === 'accepted' ? <span style={{ marginLeft: '0.5rem' }}>✔️</span> : order.status === 'rejected' ? <span style={{ marginLeft: '0.5rem' }}>❌</span> : ''}
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- NOTIFICATIONS TAB --- */}
      {activeTab === 'notifications' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{t('notifications')}</h2>
          
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('no_notifications')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map(notif => (
                <div key={notif.id} style={{ background: 'white', borderLeft: notif.type === 'order_accepted' ? '4px solid #10b981' : notif.type === 'order_reassigned' ? '4px solid #f59e0b' : '4px solid var(--primary)', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ margin: 0, fontSize: '1.05rem', color: '#0f1111' }}>{t(notif.message, notif.meta)}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#565959', marginTop: '0.5rem' }}>
                    {new Date(notif.timestamp || notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {toastMessage && (
        <div className="animate-fade-in" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: 'bold' }}>
          🛒 {toastMessage}
        </div>
      )}
      
    </div>
  );
}

export default CustomerDashboard;

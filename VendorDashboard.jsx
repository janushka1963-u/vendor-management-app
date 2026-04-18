import React, { useState, useEffect } from 'react';
import { listenToVendorOrders, acceptOrder, rejectOrder, listenToNotifications, updateVendorLocation, cancelAcceptedOrder } from '../data/firebaseDB';
import VendorInventory from './VendorInventory';
import '../App.css';
import { useTranslation } from 'react-i18next';

function VendorDashboard({ navigate, user }) {
  const { t, i18n } = useTranslation();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'incoming' | 'completed' | 'notifications'
  const [liveLocation, setLiveLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (!user) return;
    
    // Watch position in real-time
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLiveLocation({ lat, lng });
          updateVendorLocation(user.id, lat, lng).catch(e => console.error("Location err", e));
        },
        (err) => console.log('Geolocation watch error', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    const unsubOrders = listenToVendorOrders(user.id, (orders) => {
      setPendingOrders(orders.filter(o => o.status === 'pending' || o.status === 'reassigned'));
      setCompletedOrders(orders.filter(o => o.status === 'accepted'));
    });
    
    const unsubNotifs = listenToNotifications(user.id, (notifs) => {
      setNotifications(notifs);
    });
    
    return () => {
      unsubOrders();
      unsubNotifs();
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  const handleAccept = async (order) => {
    if (!liveLocation.lat || !liveLocation.lng) {
      alert(t('fetching_location'));
      return;
    }
    await acceptOrder(order.id, order.customerId, user.name, user.phone, user.id, liveLocation.lat, liveLocation.lng);
  };

  const handleReject = async (orderId) => {
    await rejectOrder(orderId, user.id);
  };

  const handleCancelAccepted = async (orderId) => {
    if (window.confirm("Are you sure you want to reject this order after accepting it?")) {
      await cancelAcceptedOrder(orderId, user.id);
    }
  };

  const renderOrderList = (orders, isIncoming) => {
    if (orders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '3rem' }}>{isIncoming ? '🏜️' : '📋'}</span>
          <h3 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>{isIncoming ? t('no_pending_orders') : t('no_accepted_orders')}</h3>
          <p style={{ color: 'var(--text-muted)' }}>They will appear here when a customer places an order nearby.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map(order => (
          <div key={order.id} style={{ border: '1px solid #d5d9d9', borderRadius: '0.75rem', overflow: 'hidden', background: 'white' }}>
            {/* Header */}
            <div style={{ background: isIncoming ? '#fef3c7' : '#d1fae5', padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid #d5d9d9', color: '#0f1111', fontSize: '0.95rem' }}>
              <div>
                <div style={{ color: '#565959', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('customer')}</div>
                <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
              </div>
              <div>
                <div style={{ color: '#565959', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('order_amount')}</div>
                <div style={{ fontWeight: 'bold' }}>₹{order.total.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ color: '#565959', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('date')}</div>
                <div style={{ fontWeight: 'bold' }}>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : t('just_now')}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ color: '#565959', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('order_number')} {order.id.slice(2, 10).toUpperCase()}</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h4 style={{ marginBottom: '1rem', color: '#565959' }}>{t('order_items')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items.map((item, i) => {
                    const iName = item.name[i18n.language] || item.name.en || item.name;
                    return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.emoji || '📦'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#007185' }}>{iName}</div>
                        <div style={{ color: '#565959', fontSize: '0.9rem' }}>{t('qty')}: {item.quantity} {item.unit} (₹{(item.price * item.quantity).toFixed(2)})</div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isIncoming ? (
                  <>
                    <button 
                      className="btn-amazon" 
                      style={{ width: '100%', background: '#10b981', color: 'white', borderColor: '#059669' }}
                      onClick={() => handleAccept(order)}
                    >
                      {t('accept_order')}
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ width: '100%', color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => handleReject(order.id)}
                    >
                      {t('reject_routing')}
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ marginBottom: '0.5rem', color: '#565959', fontSize: '0.9rem' }}>{t('contact_customer')}</div>
                      <a href={`tel:${order.customerPhone}`} style={{ color: '#0f1111', fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        📞 {order.customerPhone}
                      </a>
                    </div>
                    {order.deliveryStatus !== 'arrived' && (
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleCancelAccepted(order.id)}
                      >
                        {t('reject_order')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem' }}>{t('vendor_dashboard')}</h2>
          <p className="subtitle" style={{ margin: 0 }}>{t('manage_inventory_msg')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {liveLocation.lat && (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              {t('live_location')} {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
            </div>
          )}
          <button className="btn-secondary" onClick={() => navigate('vendor-profile')}>
            {t('edit_profile')}
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`dashboard-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          {t('tab_inventory')}
        </button>
        <button 
          className={`dashboard-nav-item ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          {t('tab_incoming')} {pendingOrders.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '0.1rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{pendingOrders.length}</span>}
        </button>
        <button 
          className={`dashboard-nav-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          {t('tab_accepted')}
        </button>
        <button 
          className={`dashboard-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t('tab_notifications')} {notifications.length > 0 && <span style={{ background: '#f59e0b', color: 'white', borderRadius: '50%', padding: '0.1rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{notifications.length}</span>}
        </button>
      </div>

      <div>
        {activeTab === 'inventory' && <VendorInventory navigate={navigate} user={user} embedded={true} />}
        {activeTab === 'incoming' && renderOrderList(pendingOrders, true)}
        {activeTab === 'completed' && renderOrderList(completedOrders, false)}
        
        {/* --- NOTIFICATIONS TAB --- */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t('no_notifications')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ background: 'white', borderLeft: '4px solid var(--primary)', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
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
      </div>
    </div>
  );
}

export default VendorDashboard;

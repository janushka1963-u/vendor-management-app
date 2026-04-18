import React, { useState } from 'react';
import { saveVendor, findVendorByPhone, updateVendorLocation } from '../data/firebaseDB';
import '../App.css';
import { useTranslation } from 'react-i18next';

function VendorLogin({ navigate, setUser }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useTranslation();

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => alert("Could not fetch location. Please allow location access.")
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name || !phone || location.lat === null) {
      setErrorMsg(t('error_vendor_details'));
      return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg(t('error_phone_10_digits'));
      return;
    }
    
    setLoading(true);
    // Check if vendor already exists
    const existingVendor = await findVendorByPhone(phone);
    if (existingVendor) {
      // Update location and login
      await updateVendorLocation(existingVendor.id, location.lat, location.lng);
      setUser({ ...existingVendor, lat: location.lat, lng: location.lng });
      setLoading(false);
      navigate('vendor-dashboard');
      return;
    }

    const newVendor = await saveVendor({ name, phone, lat: location.lat, lng: location.lng, role: 'vendor', inventory: [] });
    setUser(newVendor);
    setLoading(false);
    
    // Vendor goes to dashboard
    navigate('vendor-dashboard');
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 className="title" style={{ fontSize: '2rem', textAlign: 'center' }}>🧑‍🌾 {t('vendor_login')}</h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {t('enter_details_sell')}
        </p>

        <form onSubmit={handleLogin}>
          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('vendor_name')}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Green Valley Farms"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('phone_number')}</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="e.g. 5551234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={getLocation}
              style={{ flex: 1 }}
            >
              📍 {t('set_farm_location')}
            </button>
            <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {location.lat ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : t('location_match_required')}
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('processing') : t('login')}
          </button>
        </form>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', marginTop: '1rem', border: 'none', background: 'transparent' }}
          onClick={() => navigate('home')}
        >
          {t('back')}
        </button>
      </div>
    </div>
  );
}

export default VendorLogin;

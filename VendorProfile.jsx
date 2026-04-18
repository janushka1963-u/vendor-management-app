import React, { useState, useEffect } from 'react';
import { updateVendorProfile, updateUserLanguage } from '../data/firebaseDB';
import '../App.css';
import { useTranslation } from 'react-i18next';

function VendorProfile({ navigate, user, setUser }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user]);

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
    
    if (user?.id) {
      await updateUserLanguage(user.role, user.id, newLang);
      setUser({ ...user, language: newLang });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateVendorProfile(user.id, { name, phone });
    // Update local user state
    setUser({ ...user, name, phone, language });
    setLoading(false);
    navigate('vendor-dashboard');
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 className="title" style={{ fontSize: '2rem', textAlign: 'center' }}>⚙️ {t('edit_profile')}</h2>
        
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">{t('vendor_name')}</label>
            <input 
              type="text" 
              className="form-input" 
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
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('language')}</label>
            <select 
              className="form-input" 
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? t('saving') : t('save_profile')}
          </button>
        </form>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', marginTop: '1rem', border: 'none', background: 'transparent' }}
          onClick={() => navigate('vendor-dashboard')}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

export default VendorProfile;

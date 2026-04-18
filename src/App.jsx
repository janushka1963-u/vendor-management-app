import { useState, useEffect } from 'react';
import './index.css';

import { useTranslation } from 'react-i18next';
import './i18n';
import { updateUserLanguage } from './data/firebaseDB';

// Simple Router
import Home from './pages/Home';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import VendorInventory from './pages/VendorInventory';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorProfile from './pages/VendorProfile';

function App() {
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState(null); // { role: 'vendor'|'customer', name, phone, stats..., language: 'en' }
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    if (user && user.language && user.language !== i18n.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  const navigate = (newRoute) => setRoute(newRoute);

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
    if (user) {
      setUser({ ...user, language: newLang });
      if (user.id) {
         await updateUserLanguage(user.role, user.id, newLang);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Background */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <header className="app-header">
        <div className="header-logo" onClick={() => navigate('home')}>
          <span className="logo-icon">🧺</span>
          <h2>FarmDirect</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <select 
            value={language} 
            onChange={handleLanguageChange} 
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
          >
             <option value="en">English</option>
             <option value="te">తెలుగు</option>
             <option value="hi">हिंदी</option>
          </select>

          {user && (
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="user-name">{user.name} ({user.role})</span>
              <button className="btn-logout" onClick={() => { setUser(null); navigate('home'); }}>{t('logout')}</button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {route === 'home' && <Home navigate={navigate} />}
        {route === 'vendor-login' && <VendorLogin navigate={navigate} setUser={setUser} />}
        {route === 'vendor-inventory' && <VendorInventory navigate={navigate} user={user} />}
        {route === 'vendor-dashboard' && <VendorDashboard navigate={navigate} user={user} />}
        {route === 'vendor-profile' && <VendorProfile navigate={navigate} user={user} setUser={setUser} />}
        
        {route === 'customer-login' && <CustomerLogin navigate={navigate} setUser={setUser} />}
        {route === 'customer-dashboard' && <CustomerDashboard navigate={navigate} user={user} />}
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import '../App.css';

function Home({ navigate }) {
  return (
    <div className="home-container animate-fade-in">
      <div className="home-hero" style={{ padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', fontFamily: '"Inter", sans-serif', color: '#B12704', textAlign: 'center', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Welcome</h1>
        <p className="subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Connect directly with local farmers or manage your farm inventory with our smart vendor logic.
        </p>
      </div>

      <div className="role-cards">
        <div 
          className="role-card glass-panel"
          onClick={() => navigate('vendor-login')}
        >
          <span className="role-icon">🧑‍🌾</span>
          <h3>Login as Vendor</h3>
          <p>Manage your inventory, receive orders, and grow your local business.</p>
        </div>

        <div 
          className="role-card glass-panel"
          onClick={() => navigate('customer-login')}
        >
          <span className="role-icon">🛒</span>
          <h3>Login as Customer</h3>
          <p>Browse fresh local produce and order directly from nearby farms.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

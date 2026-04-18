import React, { useState, useEffect } from 'react';
import { listenToProducts, updateVendorInventory } from '../data/firebaseDB';
import { useTranslation } from 'react-i18next';

function VendorInventory({ navigate, user, embedded }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('fruits');
  const [searchTerm, setSearchTerm] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const unsub = listenToProducts((prods) => {
      setInventory(prev => {
        if (prev.length === 0) return prods.map(p => ({ ...p, selected: false, quantity: 0 }));
        return prods.map(p => {
          const existing = prev.find(item => item.id === p.id);
          return existing ? { ...p, selected: existing.selected, quantity: existing.quantity } : { ...p, selected: false, quantity: 0 };
        });
      });
    });
    return () => unsub();
  }, []);

  const toggleProduct = (index) => {
    const newInv = [...inventory];
    newInv[index].selected = !newInv[index].selected;
    if (!newInv[index].selected) newInv[index].quantity = 0;
    setInventory(newInv);
  };

  const updateQuantity = (index, delta) => {
    const newInv = [...inventory];
    const newQty = (newInv[index].quantity || 0) + delta;
    if (newQty >= 0) {
      newInv[index].quantity = newQty;
      if (newQty === 0) newInv[index].selected = false;
      setInventory(newInv);
    }
  };

  const saveInventory = async () => {
    setLoading(true);
    const selectedItems = inventory.filter(p => p.selected && p.quantity > 0);
    await updateVendorInventory(user.id, selectedItems);
    setLoading(false);
    if (!embedded) {
      navigate('vendor-dashboard');
    } else {
      alert("Inventory saved successfully!");
    }
  };

  const totalCost = inventory.reduce((sum, item) => sum + (item.selected ? (item.price * item.quantity) : 0), 0);
  
  const filteredInventory = inventory.map((prod, index) => ({...prod, originalIndex: index})).filter(p => {
    const pName = p.name[i18n.language] || p.name.en || p.name;
    return p.category === activeCategory && (typeof pName === 'string' && pName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: embedded ? '1.5rem' : '2rem' }}>{t('select_produce')}</h2>
          <p className="subtitle" style={{ margin: 0 }}>{t('selling_today')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {t('total_value')}: ₹{totalCost.toFixed(2)}
          </div>
          <button className="btn-primary" onClick={saveInventory} disabled={loading}>
            {loading ? t('saving') : t('save_inventory')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`dashboard-nav-item ${activeCategory === 'fruits' ? 'active' : ''}`}
          onClick={() => setActiveCategory('fruits')}
          style={{ padding: '0.5rem 1.5rem', flex: 1, minWidth: '150px' }}
        >
          🍎 {t('fruits')}
        </button>
        <button 
          className={`dashboard-nav-item ${activeCategory === 'vegetables' ? 'active' : ''}`}
          onClick={() => setActiveCategory('vegetables')}
          style={{ padding: '0.5rem 1.5rem', flex: 1, minWidth: '150px' }}
        >
          🥦 {t('vegetables')}
        </button>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder={`${t('search')}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '1rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredInventory.map((prod) => {
          const pName = prod.name[i18n.language] || prod.name.en || prod.name;
          return (
            <div 
              key={prod.id} 
              className={`glass-panel ${prod.selected ? 'selected-card' : ''}`}
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1rem',
                border: prod.selected ? '2px solid var(--primary)' : '',
                transition: 'all 0.2s ease',
                cursor: prod.selected ? 'default': 'pointer'
              }}
              onClick={() => { if(!prod.selected) toggleProduct(prod.originalIndex); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '3rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {prod.emoji || '📦'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{pName}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>₹{prod.price.toFixed(2)} / {prod.unit}</p>
                </div>
              </div>

              {prod.selected && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }} onClick={e => e.stopPropagation()}>
                  <label className="form-label" style={{ fontSize: '0.9rem' }}>{t('quantity_available')} ({prod.unit}s)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      type="button"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={(e) => { e.stopPropagation(); updateQuantity(prod.originalIndex, -1); }}
                    >-</button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{prod.quantity || 0}</span>
                    <button 
                      type="button"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={(e) => { e.stopPropagation(); updateQuantity(prod.originalIndex, 1); }}
                    >+</button>
                  </div>
                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => toggleProduct(prod.originalIndex)}
                  >
                    {t('remove_item')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VendorInventory;

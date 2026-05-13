import { useState, useEffect } from 'react';
import { getMyLinks, getEarnings, generateLink } from '../services/api';
import InfluencerProfile from './InfluencerProfile';
import BrandDashboard from './BrandDashboard';
import Campaigns from './Campaigns';
import Portfolio from './Portfolio';

export default function Dashboard({ user, onLogout }) {
  const [links,    setLinks]    = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [url,      setUrl]      = useState('');
  const [title,    setTitle]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState('');
  const [tab,      setTab]      = useState('generate');
  const [page,     setPage]     = useState('home');
  const [error,    setError]    = useState('');

  useEffect(() => { if(page==='home') loadData(); }, [page]);

  const loadData = async () => {
    try {
      const [l, e] = await Promise.all([getMyLinks(), getEarnings()]);
      setLinks(l.data);
      setEarnings(e.data);
    } catch(err) { console.log(err); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await generateLink({ url, product_title: title });
      setUrl(''); setTitle('');
      await loadData();
      setTab('links');
    } catch(err) {
      setError(err.response?.data?.detail || 'Error generating link');
    }
    setLoading(false);
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  if (page === 'profile')   return <InfluencerProfile onBack={() => setPage('home')} />;
  if (page === 'portfolio')  return <Portfolio onBack={() => setPage('home')} />;
  if (page === 'brand')     return <BrandDashboard onBack={() => setPage('home')} />;
  if (page === 'campaigns') return <Campaigns onBack={() => setPage('home')} />;

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <span style={S.logo}>🔥 Furies</span>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{color:'#aaa', fontSize:'14px'}}>👤 {user?.full_name}</span>
          <button style={S.navBtn} onClick={() => setPage('profile')}>My Profile</button>
          <button style={S.navBtn} onClick={() => setPage('campaigns')}>Campaigns</button>
          <button style={S.navBtn} onClick={() => setPage('brand')}>Brand View</button>
          <button style={S.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      {earnings && (
        <div style={S.stats}>
          {[
            ['🔗 Links',       earnings.total_links],
            ['👆 Clicks',      earnings.total_clicks],
            ['🛒 Conversions', earnings.total_conversions],
            ['💰 Earned',      `₹${Number(earnings.total_earned).toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} style={S.statBox}>
              <div style={{...S.statVal,
                color: label.includes('Earned') ? '#d4af37' : 'white'}}>
                {value}
              </div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={S.quickActions}>
        <button style={S.actionBtn} onClick={() => setPage('profile')}>
          <span style={{fontSize:'24px'}}>👤</span>
          <span>Build Profile</span>
        </button>
        <button style={S.actionBtn} onClick={() => setPage('portfolio')}>
          <span style={{fontSize:'24px'}}>🖼️</span>
          <span>My Portfolio</span>
        </button>
        <button style={S.actionBtn} onClick={() => setPage('campaigns')}>
          <span style={{fontSize:'24px'}}>📢</span>
          <span>Browse Campaigns</span>
        </button>
        <button style={S.actionBtn} onClick={() => setPage('brand')}>
          <span style={{fontSize:'24px'}}>🏢</span>
          <span>Brand Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[['generate','➕ Generate Link'],['links','🔗 My Links']].map(([id, label]) => (
          <button key={id}
            style={{...S.tab, ...(tab===id ? S.tabActive : {})}}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* Generate Tab */}
      {tab === 'generate' && (
        <div style={S.card}>
          <h2 style={{color:'white', marginTop:0}}>Generate Affiliate Link</h2>
          <p style={{color:'#888', fontSize:'14px', marginBottom:'24px'}}>
            Paste any Amazon, Flipkart, Myntra, Nykaa, Ajio or Meesho product URL
          </p>
          <form onSubmit={handleGenerate}>
            <input style={S.input} placeholder="https://www.amazon.in/dp/..."
              value={url} onChange={e => setUrl(e.target.value)} required />
            <input style={S.input} placeholder="Product title (optional)"
              value={title} onChange={e => setTitle(e.target.value)} />
            {error && <p style={{color:'#ff6b6b', fontSize:'13px'}}>{error}</p>}
            <button style={S.btn} type="submit" disabled={loading}>
              {loading ? 'Generating...' : '⚡ Generate My Link'}
            </button>
          </form>
          <div style={{marginTop:'24px'}}>
            <p style={{color:'#888', fontSize:'13px', marginBottom:'10px'}}>Supported:</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {['Amazon','Flipkart','Myntra','Nykaa','Ajio','Meesho',
                'Snapdeal','Bewakoof','FirstCry'].map(p => (
                <span key={p} style={S.badge}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Links Tab */}
      {tab === 'links' && (
        <div style={{padding:'0 24px 24px'}}>
          {links.length === 0 ? (
            <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
              <p>No links yet</p>
              <button style={{...S.btn, width:'auto', padding:'12px 24px'}}
                onClick={() => setTab('generate')}>Generate First Link</button>
            </div>
          ) : links.map(link => (
            <div key={link.id} style={S.linkCard}>
              <div style={{display:'flex', justifyContent:'space-between',
                           alignItems:'flex-start', marginBottom:'12px'}}>
                <div style={{flex:1, marginRight:'12px'}}>
                  <span style={S.badge}>{link.platform}</span>
                  <p style={{color:'white', fontWeight:'bold', margin:'8px 0 4px'}}>
                    {link.product_title}
                  </p>
                  <p style={{color:'#888', fontSize:'12px', margin:0,
                             wordBreak:'break-all'}}>{link.furies_link}</p>
                </div>
                <button style={{...S.copyBtn,
                  ...(copied===link.id ? {background:'#2e7d32',border:'1px solid #2e7d32'} : {})}}
                  onClick={() => copy(link.furies_link, link.id)}>
                  {copied===link.id ? '✅' : '📋 Copy'}
                </button>
              </div>
              <div style={{display:'flex', gap:'20px', flexWrap:'wrap',
                           color:'#888', fontSize:'13px', borderTop:'1px solid #333',
                           paddingTop:'12px'}}>
                <span>👆 {link.click_count} clicks</span>
                <span>🛒 {link.conversion_count} sales</span>
                <span>💰 ₹{Number(link.total_earned).toFixed(2)} earned</span>
                <span style={{color:'#d4af37'}}>{link.commission_rate}% commission</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page:       { minHeight:'100vh', background:'#0f0f1a', color:'white', fontFamily:'sans-serif' },
  header:     { display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'16px 24px', borderBottom:'1px solid #222', background:'#1a1a2e',
                flexWrap:'wrap', gap:'8px' },
  logo:       { color:'#d4af37', fontSize:'22px', fontWeight:'bold' },
  navBtn:     { background:'transparent', border:'1px solid #444', color:'#aaa',
                padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  logoutBtn:  { background:'transparent', border:'1px solid #ff6b6b', color:'#ff6b6b',
                padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  stats:      { display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                borderBottom:'1px solid #222' },
  statBox:    { background:'#1a1a2e', padding:'20px', textAlign:'center',
                borderRight:'1px solid #222' },
  statVal:    { fontSize:'28px', fontWeight:'bold' },
  statLabel:  { fontSize:'12px', color:'#888', marginTop:'4px' },
  quickActions:{ display:'flex', gap:'12px', padding:'16px 24px',
                 background:'#1a1a2e', borderBottom:'1px solid #222' },
  actionBtn:  { flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                gap:'6px', padding:'16px', background:'#0f0f1a', border:'1px solid #333',
                borderRadius:'12px', color:'white', cursor:'pointer', fontSize:'13px' },
  tabs:       { display:'flex', borderBottom:'1px solid #222', background:'#1a1a2e' },
  tab:        { padding:'14px 24px', background:'transparent', border:'none',
                color:'#888', cursor:'pointer', fontSize:'14px',
                borderBottom:'2px solid transparent' },
  tabActive:  { color:'#d4af37', borderBottom:'2px solid #d4af37' },
  card:       { margin:'24px', background:'#1a1a2e', borderRadius:'12px', padding:'28px',
                maxWidth:'600px' },
  input:      { width:'100%', padding:'12px 16px', marginBottom:'12px',
                background:'#0f0f1a', border:'1px solid #333', borderRadius:'8px',
                color:'white', fontSize:'14px', boxSizing:'border-box' },
  btn:        { width:'100%', padding:'14px', background:'#d4af37', border:'none',
                borderRadius:'8px', color:'#0f0f1a', fontSize:'15px',
                fontWeight:'bold', cursor:'pointer' },
  badge:      { background:'#d4af3722', color:'#d4af37', fontSize:'11px',
                padding:'4px 10px', borderRadius:'20px' },
  linkCard:   { background:'#1a1a2e', borderRadius:'12px', padding:'20px',
                marginBottom:'12px' },
  copyBtn:    { background:'#0f0f1a', border:'1px solid #444', color:'white',
                padding:'8px 14px', borderRadius:'8px', cursor:'pointer',
                fontSize:'13px', whiteSpace:'nowrap' },
};

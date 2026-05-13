import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Campaigns({ onBack }) {
  const [campaigns, setCampaigns]   = useState([]);
  const [applying, setApplying]     = useState(null);
  const [letter, setLetter]         = useState('');
  const [applied, setApplied]       = useState({});
  const [filterNiche, setFilterNiche] = useState('');
  const [error, setError]           = useState('');

  const niches = ['','fashion','beauty','tech','food','travel',
                  'fitness','lifestyle','finance','gaming','education','entertainment'];

  useEffect(() => { loadCampaigns(); }, [filterNiche]);

  const loadCampaigns = async () => {
    try {
      const res = await API.get('/brand/campaigns', {
        params: filterNiche ? { niche: filterNiche } : {}
      });
      setCampaigns(res.data);
    } catch(err) { setError('Failed to load campaigns'); }
  };

  const apply = async (campaignId) => {
    try {
      await API.post(`/brand/campaigns/${campaignId}/apply`, { cover_letter: letter });
      setApplied(prev => ({ ...prev, [campaignId]: true }));
      setApplying(null);
      setLetter('');
    } catch(err) {
      setError(err.response?.data?.detail || 'Error applying');
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← Back</button>
        <h2 style={S.title}>Campaign Marketplace</h2>
      </div>

      {/* Filter */}
      <div style={S.filterBar}>
        <span style={{color:'#888', fontSize:'14px'}}>Filter by niche:</span>
        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {niches.map(n => (
            <button key={n} style={{...S.filterBtn,
              ...(filterNiche===n ? S.filterActive : {})}}
              onClick={() => setFilterNiche(n)}>
              {n || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {error && <p style={{color:'#ff6b6b'}}>{error}</p>}

        {campaigns.length === 0 ? (
          <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
            <p style={{fontSize:'18px'}}>No open campaigns yet</p>
            <p>Check back soon!</p>
          </div>
        ) : campaigns.map(c => (
          <div key={c.id} style={S.card}>
            <div style={{display:'flex', justifyContent:'space-between',
                         alignItems:'flex-start', marginBottom:'12px'}}>
              <div>
                <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
                  <span style={S.badge}>{c.is_paid ? '💰 Paid' : '🎁 Gifting'}</span>
                  {c.target_niche && <span style={S.badge}>🎯 {c.target_niche}</span>}
                </div>
                <h3 style={{color:'white', margin:'0 0 6px'}}>{c.title}</h3>
                <p style={{color:'#888', fontSize:'14px', margin:0}}>{c.description}</p>
              </div>
            </div>

            <div style={{display:'flex', gap:'20px', flexWrap:'wrap',
                         color:'#888', fontSize:'13px', borderTop:'1px solid #333',
                         paddingTop:'12px', marginBottom:'16px'}}>
              {c.budget && <span>💰 Budget: ₹{Number(c.budget).toLocaleString()}</span>}
              <span>📊 {c.commission_pct}% commission</span>
              <span>👥 {Number(c.min_followers).toLocaleString()}+ followers needed</span>
            </div>

            {applied[c.id] ? (
              <div style={S.appliedBadge}>✅ Applied Successfully!</div>
            ) : applying === c.id ? (
              <div>
                <textarea style={{...S.input, height:'80px'}}
                  placeholder="Tell the brand why you're a great fit..."
                  value={letter}
                  onChange={e => setLetter(e.target.value)} />
                <div style={{display:'flex', gap:'8px'}}>
                  <button style={S.btn} onClick={() => apply(c.id)}>
                    Submit Application
                  </button>
                  <button style={S.cancelBtn} onClick={() => setApplying(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button style={S.btn} onClick={() => setApplying(c.id)}>
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  page:       { minHeight:'100vh', background:'#0f0f1a', color:'white', fontFamily:'sans-serif' },
  header:     { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px',
                borderBottom:'1px solid #222', background:'#1a1a2e' },
  back:       { background:'transparent', border:'1px solid #444', color:'#aaa',
                padding:'6px 14px', borderRadius:'6px', cursor:'pointer' },
  title:      { color:'#d4af37', margin:0, fontSize:'20px' },
  filterBar:  { padding:'16px 24px', background:'#1a1a2e', borderBottom:'1px solid #222',
                display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' },
  filterBtn:  { padding:'4px 12px', background:'#0f0f1a', border:'1px solid #333',
                color:'#888', borderRadius:'20px', cursor:'pointer', fontSize:'12px' },
  filterActive:{ background:'#d4af3722', border:'1px solid #d4af37', color:'#d4af37' },
  body:       { padding:'24px', maxWidth:'700px', margin:'0 auto' },
  card:       { background:'#1a1a2e', borderRadius:'12px', padding:'20px',
                marginBottom:'12px' },
  badge:      { background:'#d4af3722', color:'#d4af37', fontSize:'11px',
                padding:'3px 10px', borderRadius:'20px' },
  input:      { width:'100%', padding:'10px 14px', marginBottom:'12px',
                background:'#0f0f1a', border:'1px solid #333', borderRadius:'8px',
                color:'white', fontSize:'14px', boxSizing:'border-box' },
  btn:        { flex:1, padding:'12px', background:'#d4af37', border:'none',
                borderRadius:'8px', color:'#0f0f1a', fontSize:'14px',
                fontWeight:'bold', cursor:'pointer' },
  cancelBtn:  { flex:1, padding:'12px', background:'transparent',
                border:'1px solid #444', color:'#aaa', borderRadius:'8px',
                fontSize:'14px', cursor:'pointer' },
  appliedBadge:{ background:'#2e7d3244', color:'#4caf50', padding:'12px',
                 borderRadius:'8px', textAlign:'center', fontWeight:'bold' },
};

import { useState, useEffect } from 'react';
import API from '../services/api';

export default function BrandDashboard({ onBack }) {
  const [tab, setTab]               = useState('profile');
  const [brandForm, setBrandForm]   = useState({ company_name:'', industry:'other',
                                                   description:'', website:'' });
  const [campaigns, setCampaigns]   = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [camForm, setCamForm]       = useState({ title:'', description:'',
                                                   budget:'', commission_pct:10,
                                                   target_niche:'', min_followers:0,
                                                   is_paid:true });
  const [searchForm, setSearchForm] = useState({ niche:'', city:'', min_followers:0 });
  const [saved, setSaved]           = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    API.get('/brand/campaigns').then(r => setCampaigns(r.data)).catch(() => {});
    API.get('/brand/profile/me').then(r => setBrandForm(f => ({...f, ...r.data}))).catch(() => {});
  }, []);

  const saveBrand = async (e) => {
    e.preventDefault();
    try {
      await API.post('/brand/profile', brandForm);
      setSaved('Brand profile saved!');
      setTimeout(() => setSaved(''), 3000);
    } catch(err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const postCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/brand/campaigns', camForm);
      setCampaigns(prev => [res.data, ...prev]);
      setSaved('Campaign posted!');
      setTimeout(() => setSaved(''), 3000);
      setTab('campaigns');
    } catch(err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const searchInfluencers = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get('/influencer/search', { params: searchForm });
      setInfluencers(res.data);
    } catch(err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const industries = ['fashion','beauty','tech','food','fitness','finance','education','other'];
  const niches     = ['fashion','beauty','tech','food','travel','fitness',
                      'lifestyle','finance','gaming','education','entertainment','other'];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← Back</button>
        <h2 style={S.title}>Brand Dashboard</h2>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[['profile','🏢 Profile'],['campaigns','📢 Campaigns'],
          ['post','➕ Post Campaign'],['search','🔍 Find Influencers']].map(([id,label]) => (
          <button key={id} style={{...S.tab, ...(tab===id ? S.tabActive : {})}}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={S.body}>
        {error && <p style={{color:'#ff6b6b'}}>{error}</p>}
        {saved && <p style={{color:'#4caf50'}}>✅ {saved}</p>}

        {/* Brand Profile */}
        {tab === 'profile' && (
          <form onSubmit={saveBrand} style={S.card}>
            <h3 style={{color:'#d4af37', marginTop:0}}>Company Profile</h3>
            <label style={S.label}>Company Name</label>
            <input style={S.input} placeholder="GlowUp Skincare" required
              value={brandForm.company_name}
              onChange={e => setBrandForm({...brandForm, company_name: e.target.value})} />
            <label style={S.label}>Industry</label>
            <select style={S.input} value={brandForm.industry}
              onChange={e => setBrandForm({...brandForm, industry: e.target.value})}>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <label style={S.label}>Description</label>
            <textarea style={{...S.input, height:'80px'}}
              placeholder="Tell influencers about your brand..."
              value={brandForm.description || ''}
              onChange={e => setBrandForm({...brandForm, description: e.target.value})} />
            <label style={S.label}>Website</label>
            <input style={S.input} placeholder="https://yourbrand.com"
              value={brandForm.website || ''}
              onChange={e => setBrandForm({...brandForm, website: e.target.value})} />
            <button style={S.btn} type="submit">Save Profile</button>
          </form>
        )}

        {/* Campaigns List */}
        {tab === 'campaigns' && (
          <div>
            {campaigns.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
                <p>No campaigns yet</p>
                <button style={{...S.btn, width:'auto', padding:'12px 24px'}}
                  onClick={() => setTab('post')}>Post First Campaign</button>
              </div>
            ) : campaigns.map(c => (
              <div key={c.id} style={S.campaignCard}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div>
                    <span style={S.badge}>{c.is_paid ? '💰 Paid' : '🎁 Gifting'}</span>
                    <h3 style={{color:'white', margin:'8px 0 4px'}}>{c.title}</h3>
                    <p style={{color:'#888', fontSize:'14px', margin:0}}>{c.description}</p>
                  </div>
                  <span style={{...S.badge, background:'#2e7d3244', color:'#4caf50'}}>
                    {c.status}
                  </span>
                </div>
                <div style={{display:'flex', gap:'20px', marginTop:'12px',
                             borderTop:'1px solid #333', paddingTop:'12px',
                             color:'#888', fontSize:'13px', flexWrap:'wrap'}}>
                  {c.budget && <span>💰 Budget: ₹{c.budget}</span>}
                  <span>📊 {c.commission_pct}% commission</span>
                  {c.target_niche && <span>🎯 {c.target_niche}</span>}
                  <span>👥 {c.min_followers.toLocaleString()}+ followers</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Campaign */}
        {tab === 'post' && (
          <form onSubmit={postCampaign} style={S.card}>
            <h3 style={{color:'#d4af37', marginTop:0}}>Post a Campaign</h3>
            <label style={S.label}>Campaign Title</label>
            <input style={S.input} placeholder="Summer Skincare Campaign 2025" required
              value={camForm.title}
              onChange={e => setCamForm({...camForm, title: e.target.value})} />
            <label style={S.label}>Description</label>
            <textarea style={{...S.input, height:'80px'}}
              placeholder="What do you need the influencer to do?"
              value={camForm.description || ''}
              onChange={e => setCamForm({...camForm, description: e.target.value})} />
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Budget (₹)</label>
                <input style={S.input} type="number" placeholder="25000"
                  value={camForm.budget || ''}
                  onChange={e => setCamForm({...camForm, budget: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Commission %</label>
                <input style={S.input} type="number" placeholder="10"
                  value={camForm.commission_pct}
                  onChange={e => setCamForm({...camForm, commission_pct: e.target.value})} />
              </div>
            </div>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Target Niche</label>
                <select style={S.input} value={camForm.target_niche}
                  onChange={e => setCamForm({...camForm, target_niche: e.target.value})}>
                  <option value="">Any niche</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Min Followers</label>
                <input style={S.input} type="number" placeholder="10000"
                  value={camForm.min_followers}
                  onChange={e => setCamForm({...camForm, min_followers: e.target.value})} />
              </div>
            </div>
            <label style={S.label}>Campaign Type</label>
            <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
              {[true, false].map(paid => (
                <button key={String(paid)} type="button"
                  style={{...S.typeBtn, ...(camForm.is_paid===paid ? S.typeBtnActive : {})}}
                  onClick={() => setCamForm({...camForm, is_paid: paid})}>
                  {paid ? '💰 Paid' : '🎁 Gifting / Unpaid'}
                </button>
              ))}
            </div>
            <button style={S.btn} type="submit">🚀 Post Campaign</button>
          </form>
        )}

        {/* Search Influencers */}
        {tab === 'search' && (
          <div>
            <form onSubmit={searchInfluencers} style={{...S.card, marginBottom:'16px'}}>
              <h3 style={{color:'#d4af37', marginTop:0}}>Find Influencers</h3>
              <div style={S.row}>
                <div style={{flex:1}}>
                  <label style={S.label}>Niche</label>
                  <select style={S.input} value={searchForm.niche}
                    onChange={e => setSearchForm({...searchForm, niche: e.target.value})}>
                    <option value="">Any niche</option>
                    {niches.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.label}>City</label>
                  <input style={S.input} placeholder="Mumbai"
                    value={searchForm.city}
                    onChange={e => setSearchForm({...searchForm, city: e.target.value})} />
                </div>
                <div style={{flex:1}}>
                  <label style={S.label}>Min Followers</label>
                  <input style={S.input} type="number" placeholder="10000"
                    value={searchForm.min_followers}
                    onChange={e => setSearchForm({...searchForm, min_followers: e.target.value})} />
                </div>
              </div>
              <button style={S.btn} type="submit">🔍 Search</button>
            </form>

            {influencers.length === 0 ? (
              <p style={{color:'#888', textAlign:'center'}}>
                Search to find matching influencers
              </p>
            ) : influencers.map(inf => (
              <div key={inf.id} style={S.infCard}>
                <div style={{display:'flex', gap:'16px', alignItems:'flex-start'}}>
                  {inf.profile_image_url ? (
                    <img src={inf.profile_image_url} alt={inf.full_name}
                      style={{width:'56px', height:'56px', borderRadius:'50%',
                              objectFit:'cover', flexShrink:0}} />
                  ) : (
                    <div style={{width:'56px', height:'56px', borderRadius:'50%',
                                 background:'#333', display:'flex', alignItems:'center',
                                 justifyContent:'center', fontSize:'24px', flexShrink:0}}>
                      👤
                    </div>
                  )}
                  <div style={{flex:1}}>
                    <div style={{display:'flex', justifyContent:'space-between',
                                 alignItems:'flex-start'}}>
                      <div>
                        <h3 style={{margin:'0 0 4px', color:'white'}}>{inf.full_name}</h3>
                        <span style={S.badge}>{inf.niche}</span>
                        {inf.city && <span style={{...S.badge, marginLeft:'6px'}}>📍 {inf.city}</span>}
                      </div>
                      {inf.credibility && (
                        <div style={{textAlign:'right'}}>
                          <div style={{color:'#d4af37', fontWeight:'bold', fontSize:'18px'}}>
                            {inf.credibility.emoji} {inf.credibility.score}/100
                          </div>
                          <div style={{color:'#888', fontSize:'12px'}}>
                            {inf.credibility.badge}
                          </div>
                        </div>
                      )}
                    </div>
                    <p style={{color:'#888', fontSize:'13px', margin:'8px 0'}}>
                      {inf.bio || 'No bio yet'}
                    </p>
                    <div style={{display:'flex', gap:'16px', color:'#888', fontSize:'13px'}}>
                      <span>👥 {Number(inf.follower_count).toLocaleString()} followers</span>
                      <span>📊 {inf.avg_engagement_rate}% engagement</span>
                      {inf.instagram_handle && <span>📸 {inf.instagram_handle}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
  tabs:       { display:'flex', borderBottom:'1px solid #222', background:'#1a1a2e',
                overflowX:'auto' },
  tab:        { padding:'14px 20px', background:'transparent', border:'none',
                color:'#888', cursor:'pointer', fontSize:'13px', whiteSpace:'nowrap',
                borderBottom:'2px solid transparent' },
  tabActive:  { color:'#d4af37', borderBottom:'2px solid #d4af37' },
  body:       { padding:'24px', maxWidth:'800px', margin:'0 auto' },
  card:       { background:'#1a1a2e', borderRadius:'12px', padding:'24px',
                marginBottom:'16px' },
  label:      { display:'block', color:'#888', fontSize:'13px', marginBottom:'6px' },
  input:      { width:'100%', padding:'10px 14px', marginBottom:'16px',
                background:'#0f0f1a', border:'1px solid #333', borderRadius:'8px',
                color:'white', fontSize:'14px', boxSizing:'border-box' },
  btn:        { width:'100%', padding:'14px', background:'#d4af37', border:'none',
                borderRadius:'8px', color:'#0f0f1a', fontSize:'15px',
                fontWeight:'bold', cursor:'pointer' },
  row:        { display:'flex', gap:'16px' },
  badge:      { background:'#d4af3722', color:'#d4af37', fontSize:'11px',
                padding:'2px 8px', borderRadius:'20px' },
  campaignCard:{ background:'#1a1a2e', borderRadius:'12px', padding:'20px',
                 marginBottom:'12px' },
  infCard:    { background:'#1a1a2e', borderRadius:'12px', padding:'20px',
                marginBottom:'12px' },
  typeBtn:    { flex:1, padding:'10px', background:'#0f0f1a', border:'1px solid #333',
                color:'#888', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  typeBtnActive:{ background:'#d4af3722', border:'1px solid #d4af37', color:'#d4af37' },
};

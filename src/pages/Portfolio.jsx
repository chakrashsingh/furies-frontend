import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Portfolio({ onBack }) {
  const [tab, setTab]           = useState('basic');
  const [form, setForm]         = useState({
    display_name:'', tagline:'', bio:'',
    industry_type:'fashion', city:'',
    profile_image_url:'', instagram_url:'',
    youtube_url:'', twitter_url:''
  });
  const [items, setItems]       = useState([]);
  const [itemForm, setItemForm] = useState({
    item_type:'image', title:'', description:'',
    media_url:'', brand_name:'', results:'', display_order:0
  });
  const [stats, setStats]       = useState({
    height_cm:'', weight_kg:'', bust_cm:'', waist_cm:'',
    hips_cm:'', shoe_size:'', dress_size:'', skin_tone:'',
    hair_color:'', eye_color:'', languages:'', willing_to_travel:true
  });
  const [saved,      setSaved]      = useState('');
  const [error,      setError]      = useState('');
  const [published,  setPublished]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  const industries = ['fashion','modelling','youtube','instagram',
                      'fitness','food','travel','beauty','tech','gaming','education','other'];
  const skinTones  = ['fair','wheatish','medium','olive','dusky','dark'];
  const hairColors = ['black','brown','blonde','red','grey','other'];
  const eyeColors  = ['black','brown','hazel','green','blue','other'];
  const itemTypes  = ['image','video_link','brand_collab','case_study'];

  useEffect(() => {
    API.get('/portfolio/me')
      .then(r => {
        setForm(f => ({...f, ...r.data}));
        setItems(r.data.items || []);
        if (r.data.physical_stats) setStats(s => ({...s, ...r.data.physical_stats}));
        setPublished(r.data.is_published);
      }).catch(() => {});
  }, []);

  const saveBasic = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await API.post('/portfolio/save', form);
      setItems(r.data.items || []);
      setSaved('Portfolio saved!');
      setTimeout(() => setSaved(''), 3000);
    } catch(err) { setError(err.response?.data?.detail || 'Error saving'); }
    setLoading(false);
  };

  const addItem = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/portfolio/items/add', itemForm);
      const r = await API.get('/portfolio/me');
      setItems(r.data.items || []);
      setItemForm({item_type:'image', title:'', description:'',
                   media_url:'', brand_name:'', results:'', display_order:0});
      setSaved('Item added!');
      setTimeout(() => setSaved(''), 3000);
    } catch(err) { setError(err.response?.data?.detail || 'Error adding item'); }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/portfolio/items/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch(err) { setError('Error deleting item'); }
  };

  const saveStats = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/portfolio/physical-stats', stats);
      setSaved('Stats saved!');
      setTimeout(() => setSaved(''), 3000);
    } catch(err) { setError(err.response?.data?.detail || 'Error saving stats'); }
  };

  const publishPortfolio = async () => {
    try {
      await API.post('/portfolio/publish');
      setPublished(true);
      setSaved('🎉 Portfolio published! Brands can now discover you.');
      setTimeout(() => setSaved(''), 5000);
    } catch(err) { setError(err.response?.data?.detail || 'Error publishing'); }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← Back</button>
        <h2 style={S.title}>My Portfolio</h2>
        <button
          style={{...S.publishBtn, ...(published ? S.publishedBtn : {})}}
          onClick={publishPortfolio} disabled={published}>
          {published ? '✅ Published' : '🚀 Publish Portfolio'}
        </button>
      </div>

      <div style={S.tabs}>
        {[['basic','📝 Basic Info'],['items','🖼️ Work & Media'],
          ['stats','📏 Physical Stats'],['preview','👁️ Preview']].map(([id,label]) => (
          <button key={id} style={{...S.tab, ...(tab===id ? S.tabActive : {})}}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={S.body}>
        {error  && <p style={{color:'#ff6b6b'}}>{error}</p>}
        {saved  && <p style={{color:'#4caf50'}}>{saved}</p>}

        {/* Basic Info */}
        {tab === 'basic' && (
          <form onSubmit={saveBasic} style={S.card}>
            <h3 style={S.cardTitle}>Basic Information</h3>
            <label style={S.label}>Display Name *</label>
            <input style={S.input} placeholder="Riya Sharma" required
              value={form.display_name}
              onChange={e => setForm({...form, display_name: e.target.value})} />
            <label style={S.label}>Tagline</label>
            <input style={S.input} placeholder="Mumbai-based fashion model & lifestyle creator"
              value={form.tagline || ''}
              onChange={e => setForm({...form, tagline: e.target.value})} />
            <label style={S.label}>Bio</label>
            <textarea style={{...S.input, height:'100px'}}
              placeholder="Tell brands about yourself, your audience, and what you do..."
              value={form.bio || ''}
              onChange={e => setForm({...form, bio: e.target.value})} />
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Industry</label>
                <select style={S.input} value={form.industry_type}
                  onChange={e => setForm({...form, industry_type: e.target.value})}>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>City</label>
                <input style={S.input} placeholder="Mumbai"
                  value={form.city || ''}
                  onChange={e => setForm({...form, city: e.target.value})} />
              </div>
            </div>
            <label style={S.label}>Profile Image URL</label>
            <input style={S.input} placeholder="https://i.imgur.com/yourphoto.jpg"
              value={form.profile_image_url || ''}
              onChange={e => setForm({...form, profile_image_url: e.target.value})} />
            {form.profile_image_url && (
              <img src={form.profile_image_url} alt="preview"
                style={{width:'80px', height:'80px', borderRadius:'50%',
                        objectFit:'cover', marginBottom:'16px'}} />
            )}
            <h3 style={S.cardTitle}>Social Links</h3>
            <label style={S.label}>Instagram URL</label>
            <input style={S.input} placeholder="https://instagram.com/yourhandle"
              value={form.instagram_url || ''}
              onChange={e => setForm({...form, instagram_url: e.target.value})} />
            <label style={S.label}>YouTube URL</label>
            <input style={S.input} placeholder="https://youtube.com/yourchannel"
              value={form.youtube_url || ''}
              onChange={e => setForm({...form, youtube_url: e.target.value})} />
            <label style={S.label}>Twitter/X URL</label>
            <input style={S.input} placeholder="https://twitter.com/yourhandle"
              value={form.twitter_url || ''}
              onChange={e => setForm({...form, twitter_url: e.target.value})} />
            <button style={S.btn} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Basic Info'}
            </button>
          </form>
        )}

        {/* Work & Media Items */}
        {tab === 'items' && (
          <div>
            <form onSubmit={addItem} style={S.card}>
              <h3 style={S.cardTitle}>Add Work / Media</h3>
              <div style={S.row}>
                <div style={{flex:1}}>
                  <label style={S.label}>Type</label>
                  <select style={S.input} value={itemForm.item_type}
                    onChange={e => setItemForm({...itemForm, item_type: e.target.value})}>
                    {itemTypes.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.label}>Title</label>
                  <input style={S.input} placeholder="Vogue India Shoot"
                    value={itemForm.title}
                    onChange={e => setItemForm({...itemForm, title: e.target.value})} />
                </div>
              </div>
              <label style={S.label}>Media URL (image/video link)</label>
              <input style={S.input} placeholder="https://i.imgur.com/photo.jpg or YouTube link"
                value={itemForm.media_url}
                onChange={e => setItemForm({...itemForm, media_url: e.target.value})} />
              <label style={S.label}>Brand Name (if collab)</label>
              <input style={S.input} placeholder="GlowUp Skincare"
                value={itemForm.brand_name}
                onChange={e => setItemForm({...itemForm, brand_name: e.target.value})} />
              <label style={S.label}>Results</label>
              <input style={S.input} placeholder="2.1M views, 8.4% engagement rate"
                value={itemForm.results}
                onChange={e => setItemForm({...itemForm, results: e.target.value})} />
              <label style={S.label}>Description</label>
              <textarea style={{...S.input, height:'60px'}}
                placeholder="Brief description..."
                value={itemForm.description}
                onChange={e => setItemForm({...itemForm, description: e.target.value})} />
              <button style={S.btn} type="submit">➕ Add Item</button>
            </form>

            {items.length > 0 && (
              <div style={S.card}>
                <h3 style={S.cardTitle}>Your Portfolio Items ({items.length})</h3>
                {items.map(item => (
                  <div key={item.id} style={S.itemRow}>
                    <div style={{flex:1}}>
                      <span style={S.badge}>{item.item_type}</span>
                      <span style={{color:'white', fontWeight:'bold', marginLeft:'8px'}}>
                        {item.title}
                      </span>
                      {item.brand_name && (
                        <span style={{color:'#888', fontSize:'13px', marginLeft:'8px'}}>
                          · {item.brand_name}
                        </span>
                      )}
                      {item.results && (
                        <p style={{color:'#4caf50', fontSize:'12px', margin:'4px 0 0'}}>
                          📊 {item.results}
                        </p>
                      )}
                      {item.media_url && (
                        <a href={item.media_url} target="_blank" rel="noreferrer"
                          style={{color:'#d4af37', fontSize:'12px'}}>
                          🔗 View media
                        </a>
                      )}
                    </div>
                    <button style={S.deleteBtn} onClick={() => removeItem(item.id)}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Physical Stats */}
        {tab === 'stats' && (
          <form onSubmit={saveStats} style={S.card}>
            <h3 style={S.cardTitle}>Physical Measurements</h3>
            <p style={{color:'#888', fontSize:'13px', marginBottom:'20px'}}>
              For fashion/modelling industry. Skip if not applicable.
            </p>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Height (cm)</label>
                <input style={S.input} type="number" placeholder="173"
                  value={stats.height_cm || ''}
                  onChange={e => setStats({...stats, height_cm: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Weight (kg)</label>
                <input style={S.input} placeholder="58.5"
                  value={stats.weight_kg || ''}
                  onChange={e => setStats({...stats, weight_kg: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Dress Size</label>
                <input style={S.input} placeholder="S / M / 32"
                  value={stats.dress_size || ''}
                  onChange={e => setStats({...stats, dress_size: e.target.value})} />
              </div>
            </div>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Bust (cm)</label>
                <input style={S.input} type="number" placeholder="86"
                  value={stats.bust_cm || ''}
                  onChange={e => setStats({...stats, bust_cm: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Waist (cm)</label>
                <input style={S.input} type="number" placeholder="62"
                  value={stats.waist_cm || ''}
                  onChange={e => setStats({...stats, waist_cm: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Hips (cm)</label>
                <input style={S.input} type="number" placeholder="90"
                  value={stats.hips_cm || ''}
                  onChange={e => setStats({...stats, hips_cm: e.target.value})} />
              </div>
            </div>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Skin Tone</label>
                <select style={S.input} value={stats.skin_tone || ''}
                  onChange={e => setStats({...stats, skin_tone: e.target.value})}>
                  <option value="">Select</option>
                  {skinTones.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Hair Color</label>
                <select style={S.input} value={stats.hair_color || ''}
                  onChange={e => setStats({...stats, hair_color: e.target.value})}>
                  <option value="">Select</option>
                  {hairColors.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Eye Color</label>
                <select style={S.input} value={stats.eye_color || ''}
                  onChange={e => setStats({...stats, eye_color: e.target.value})}>
                  <option value="">Select</option>
                  {eyeColors.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.label}>Shoe Size (EU)</label>
                <input style={S.input} placeholder="38"
                  value={stats.shoe_size || ''}
                  onChange={e => setStats({...stats, shoe_size: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Languages</label>
                <input style={S.input} placeholder="Hindi, English, Marathi"
                  value={stats.languages || ''}
                  onChange={e => setStats({...stats, languages: e.target.value})} />
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
              <input type="checkbox" checked={stats.willing_to_travel}
                onChange={e => setStats({...stats, willing_to_travel: e.target.checked})}
                style={{width:'16px', height:'16px'}} />
              <label style={{color:'#aaa', fontSize:'14px'}}>Willing to travel for shoots</label>
            </div>
            <button style={S.btn} type="submit">Save Physical Stats</button>
          </form>
        )}

        {/* Preview */}
        {tab === 'preview' && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>Portfolio Preview</h3>
            <p style={{color:'#888', fontSize:'13px', marginBottom:'20px'}}>
              This is how brands see your portfolio
            </p>
            {form.profile_image_url && (
              <img src={form.profile_image_url} alt="profile"
                style={{width:'100px', height:'100px', borderRadius:'50%',
                        objectFit:'cover', display:'block', margin:'0 auto 16px'}} />
            )}
            <h2 style={{textAlign:'center', color:'white', margin:'0 0 4px'}}>
              {form.display_name || 'Your Name'}
            </h2>
            {form.tagline && (
              <p style={{textAlign:'center', color:'#d4af37', margin:'0 0 16px'}}>
                {form.tagline}
              </p>
            )}
            <div style={{display:'flex', justifyContent:'center', gap:'8px',
                         flexWrap:'wrap', marginBottom:'16px'}}>
              {form.industry_type && <span style={S.badge}>{form.industry_type}</span>}
              {form.city && <span style={S.badge}>📍 {form.city}</span>}
            </div>
            {form.bio && (
              <p style={{color:'#aaa', fontSize:'14px', lineHeight:'1.6',
                         marginBottom:'16px'}}>{form.bio}</p>
            )}
            {items.length > 0 && (
              <div>
                <h3 style={S.cardTitle}>Work & Media ({items.length} items)</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
                             gap:'12px'}}>
                  {items.map(item => (
                    <div key={item.id} style={{background:'#0f0f1a', borderRadius:'8px',
                                              padding:'12px', border:'1px solid #333'}}>
                      {item.media_url && item.item_type === 'image' && (
                        <img src={item.media_url} alt={item.title}
                          style={{width:'100%', height:'120px', objectFit:'cover',
                                  borderRadius:'6px', marginBottom:'8px'}} />
                      )}
                      <span style={S.badge}>{item.item_type}</span>
                      <p style={{color:'white', fontWeight:'bold', fontSize:'13px',
                                 margin:'6px 0 2px'}}>{item.title}</p>
                      {item.brand_name && (
                        <p style={{color:'#888', fontSize:'12px', margin:'0 0 4px'}}>
                          {item.brand_name}
                        </p>
                      )}
                      {item.results && (
                        <p style={{color:'#4caf50', fontSize:'11px', margin:0}}>
                          📊 {item.results}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!published && (
              <button style={{...S.btn, marginTop:'24px'}} onClick={publishPortfolio}>
                🚀 Publish This Portfolio
              </button>
            )}
            {published && (
              <div style={{background:'#2e7d3244', border:'1px solid #4caf50',
                           borderRadius:'8px', padding:'16px', marginTop:'24px',
                           textAlign:'center', color:'#4caf50'}}>
                ✅ Your portfolio is live! Brands can discover you now.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:       { minHeight:'100vh', background:'#0f0f1a', color:'white', fontFamily:'sans-serif' },
  header:     { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px',
                borderBottom:'1px solid #222', background:'#1a1a2e', flexWrap:'wrap' },
  back:       { background:'transparent', border:'1px solid #444', color:'#aaa',
                padding:'6px 14px', borderRadius:'6px', cursor:'pointer' },
  title:      { color:'#d4af37', margin:0, fontSize:'20px', flex:1 },
  publishBtn: { background:'#d4af37', border:'none', color:'#0f0f1a', padding:'8px 20px',
                borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'13px' },
  publishedBtn:{ background:'#2e7d32', color:'white' },
  tabs:       { display:'flex', borderBottom:'1px solid #222', background:'#1a1a2e',
                overflowX:'auto' },
  tab:        { padding:'14px 20px', background:'transparent', border:'none',
                color:'#888', cursor:'pointer', fontSize:'13px', whiteSpace:'nowrap',
                borderBottom:'2px solid transparent' },
  tabActive:  { color:'#d4af37', borderBottom:'2px solid #d4af37' },
  body:       { padding:'24px', maxWidth:'800px', margin:'0 auto' },
  card:       { background:'#1a1a2e', borderRadius:'12px', padding:'24px', marginBottom:'16px' },
  cardTitle:  { color:'#d4af37', marginTop:0, fontSize:'16px' },
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
  itemRow:    { display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 0',
                borderBottom:'1px solid #333' },
  deleteBtn:  { background:'transparent', border:'none', cursor:'pointer',
                fontSize:'18px', padding:'4px' },
};

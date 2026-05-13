import { useState, useEffect } from 'react';
import API from '../services/api';

export default function InfluencerProfile({ onBack }) {
  const [form, setForm] = useState({
    bio: '', niche: 'lifestyle', instagram_handle: '',
    youtube_channel: '', follower_count: '', avg_engagement_rate: '',
    city: '', profile_image_url: '', upi_id: ''
  });
  const [score, setScore]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get('/influencer/profile/me')
      .then(r => setForm(f => ({ ...f, ...r.data })))
      .catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/influencer/profile', form);
      const s = await API.get('/influencer/credibility');
      setScore(s.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(err) {
      setError(err.response?.data?.detail || 'Error saving profile');
    }
    setLoading(false);
  };

  const niches = ['fashion','beauty','tech','food','travel',
                  'fitness','lifestyle','finance','gaming','education','entertainment','other'];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← Back</button>
        <h2 style={S.title}>My Influencer Profile</h2>
      </div>

      <div style={S.body}>
        {/* Score Card */}
        {score && (
          <div style={S.scoreCard}>
            <div style={S.scoreBig}>{score.emoji} {score.score}/100</div>
            <div style={S.scoreBadge}>{score.badge}</div>
            <div style={S.scoreBreakdown}>
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} style={S.scoreRow}>
                  <span style={{color:'#aaa', textTransform:'capitalize'}}>
                    {key.replace(/_/g,' ')}
                  </span>
                  <span style={{color:'#d4af37'}}>{val.points}/{val.max}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={save} style={S.form}>
          <label style={S.label}>Bio</label>
          <textarea style={{...S.input, height:'80px'}}
            placeholder="Tell brands about yourself..."
            value={form.bio || ''}
            onChange={e => setForm({...form, bio: e.target.value})} />

          <label style={S.label}>Niche</label>
          <select style={S.input} value={form.niche || 'lifestyle'}
            onChange={e => setForm({...form, niche: e.target.value})}>
            {niches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <div style={S.row}>
            <div style={{flex:1}}>
              <label style={S.label}>Instagram Handle</label>
              <input style={S.input} placeholder="@yourhandle"
                value={form.instagram_handle || ''}
                onChange={e => setForm({...form, instagram_handle: e.target.value})} />
            </div>
            <div style={{flex:1}}>
              <label style={S.label}>YouTube Channel</label>
              <input style={S.input} placeholder="Channel URL"
                value={form.youtube_channel || ''}
                onChange={e => setForm({...form, youtube_channel: e.target.value})} />
            </div>
          </div>

          <div style={S.row}>
            <div style={{flex:1}}>
              <label style={S.label}>Follower Count</label>
              <input style={S.input} type="number" placeholder="85000"
                value={form.follower_count || ''}
                onChange={e => setForm({...form, follower_count: e.target.value})} />
            </div>
            <div style={{flex:1}}>
              <label style={S.label}>Avg Engagement Rate %</label>
              <input style={S.input} type="number" step="0.1" placeholder="4.2"
                value={form.avg_engagement_rate || ''}
                onChange={e => setForm({...form, avg_engagement_rate: e.target.value})} />
            </div>
          </div>

          <div style={S.row}>
            <div style={{flex:1}}>
              <label style={S.label}>City</label>
              <input style={S.input} placeholder="Mumbai"
                value={form.city || ''}
                onChange={e => setForm({...form, city: e.target.value})} />
            </div>
            <div style={{flex:1}}>
              <label style={S.label}>UPI ID</label>
              <input style={S.input} placeholder="yourname@upi"
                value={form.upi_id || ''}
                onChange={e => setForm({...form, upi_id: e.target.value})} />
            </div>
          </div>

          <label style={S.label}>Profile Image URL</label>
          <input style={S.input} placeholder="https://..."
            value={form.profile_image_url || ''}
            onChange={e => setForm({...form, profile_image_url: e.target.value})} />

          {form.profile_image_url && (
            <img src={form.profile_image_url} alt="preview"
              style={{width:'80px', height:'80px', borderRadius:'50%',
                      objectFit:'cover', marginBottom:'16px'}} />
          )}

          {error && <p style={{color:'#ff6b6b'}}>{error}</p>}
          {saved && <p style={{color:'#4caf50'}}>✅ Profile saved!</p>}

          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

const S = {
  page:   { minHeight:'100vh', background:'#0f0f1a', color:'white', fontFamily:'sans-serif' },
  header: { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px',
            borderBottom:'1px solid #222', background:'#1a1a2e' },
  back:   { background:'transparent', border:'1px solid #444', color:'#aaa',
            padding:'6px 14px', borderRadius:'6px', cursor:'pointer' },
  title:  { color:'#d4af37', margin:0, fontSize:'20px' },
  body:   { padding:'24px', maxWidth:'700px', margin:'0 auto' },
  scoreCard: { background:'#1a1a2e', borderRadius:'12px', padding:'24px',
               marginBottom:'24px', textAlign:'center', border:'1px solid #d4af3744' },
  scoreBig:  { fontSize:'40px', fontWeight:'bold', color:'#d4af37' },
  scoreBadge:{ fontSize:'18px', color:'white', margin:'8px 0 16px' },
  scoreBreakdown: { textAlign:'left' },
  scoreRow:  { display:'flex', justifyContent:'space-between',
               padding:'6px 0', borderBottom:'1px solid #333' },
  form:   { background:'#1a1a2e', borderRadius:'12px', padding:'24px' },
  label:  { display:'block', color:'#888', fontSize:'13px', marginBottom:'6px' },
  input:  { width:'100%', padding:'10px 14px', marginBottom:'16px',
            background:'#0f0f1a', border:'1px solid #333', borderRadius:'8px',
            color:'white', fontSize:'14px', boxSizing:'border-box' },
  row:    { display:'flex', gap:'16px' },
  btn:    { width:'100%', padding:'14px', background:'#d4af37', border:'none',
            borderRadius:'8px', color:'#0f0f1a', fontSize:'15px',
            fontWeight:'bold', cursor:'pointer' },
};

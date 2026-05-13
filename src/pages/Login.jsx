import { useState } from 'react';
import { login, signup } from '../services/api';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signup({ full_name: fullName, email, password });
      }
      const res = await login({ email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>🔥</div>
        <h1 style={S.title}>Furies</h1>
        <p style={S.sub}>Influencer Affiliate Platform</p>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input style={S.input} placeholder="Full Name"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          )}
          <input style={S.input} type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={S.input} type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={S.error}>{error}</p>}
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>
        <p style={S.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span style={S.link} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? ' Login' : ' Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

const S = {
  page:   { minHeight:'100vh', background:'#0f0f1a', display:'flex',
            alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' },
  card:   { background:'#1a1a2e', padding:'40px', borderRadius:'16px',
            width:'360px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' },
  logo:   { fontSize:'48px', textAlign:'center' },
  title:  { color:'#d4af37', fontSize:'32px', margin:'8px 0 4px', textAlign:'center' },
  sub:    { color:'#888', textAlign:'center', marginBottom:'32px', fontSize:'14px' },
  input:  { width:'100%', padding:'12px 16px', marginBottom:'12px',
            background:'#0f0f1a', border:'1px solid #333', borderRadius:'8px',
            color:'white', fontSize:'14px', boxSizing:'border-box' },
  btn:    { width:'100%', padding:'14px', background:'#d4af37', border:'none',
            borderRadius:'8px', color:'#0f0f1a', fontSize:'16px',
            fontWeight:'bold', cursor:'pointer', marginTop:'4px' },
  error:  { color:'#ff6b6b', fontSize:'13px', marginBottom:'8px' },
  toggle: { color:'#888', textAlign:'center', marginTop:'20px', fontSize:'14px' },
  link:   { color:'#d4af37', cursor:'pointer', fontWeight:'bold' },
};

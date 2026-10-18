"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('api_key');
  const [expiresAt, setExpiresAt] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://certroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'secret') {
        setSecrets(prev => {
          const idx = prev.findIndex(s => s.id === data.data.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = data.data; return n; }
          return [...prev, data.data];
        });
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://certroom.devdynamo713.com/room/${params.id}/secrets`);
      if (res.ok) setSecrets(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addSecret = async () => {
    const data = { id: Date.now().toString(), name, type, expiresAt: expiresAt || undefined };
    await fetch(`https://certroom.devdynamo713.com/room/${params.id}/secret`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setType('api_key'); setExpiresAt('');
  };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>CertRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="secret name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={type} onChange={(e) => setType(e.target.value)} className="type-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="api_key">api_key</option>
          <option value="password">password</option>
          <option value="certificate">certificate</option>
          <option value="token">token</option>
        </select>
        <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} placeholder="expires (YYYY-MM-DD)" className="expiry-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addSecret} disabled={!name.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Secret</button>
      </div>
      <div className="secret-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {secrets.map(s => {
          const status = !s.expiresAt ? 'active' : new Date(s.expiresAt) < new Date() ? 'expired' : (new Date(s.expiresAt).getTime() - Date.now()) / (1000*60*60*24) <= 30 ? 'expiring' : 'active';
          return (
            <div key={s.id} style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: status === 'expired' ? '#450a0a' : status === 'expiring' ? '#422006' : '#09090b' }}>
              <strong style={{ fontSize: 18 }}>{s.name}</strong>
              <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Type: {s.type}</div>
              {s.expiresAt && <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Expires: {s.expiresAt}</div>}
              <div style={{ marginTop: 4, fontWeight: 'bold', color: status === 'expired' ? '#f87171' : status === 'expiring' ? '#fbbf24' : '#4ade80' }}>{status.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
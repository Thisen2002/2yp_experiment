import { useEffect, useState } from 'react';

export default function MemoriesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchPending(); }, []);

  async function fetchPending() {
    setLoading(true); setError(null);
    try {
      // fetch unapproved memories
      const res = await fetch('http://localhost:3036/api/memories?approved=false&limit=200', { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setItems(data.memories || []);
    } catch (e: any) { setError(String(e.message || e)); }
    finally { setLoading(false); }
  }

  async function approve(id: number) {
    try {
      const res = await fetch(`http://localhost:3036/api/memories/${id}/approve`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) { setError(String(e.message || e)); }
  }

  async function remove(id: number) {
    try {
      const res = await fetch(`http://localhost:3036/api/memories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) { setError(String(e.message || e)); }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Memories Admin</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && items.length === 0 && <div className="text-gray-500">No pending memories.</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((m) => (
          <div key={m.id} className="bg-white rounded shadow p-3">
            <div className="font-semibold">{m.title || <em className="text-gray-600">(no title)</em>}</div>
            <div className="text-sm mt-1">{m.note}</div>
            {m.image && m.image.mime && m.image.data ? (
              <div className="mt-3"><img src={`data:${m.image.mime};base64,${m.image.data}`} alt={m.image.filename || 'image'} style={{ maxWidth: '100%', maxHeight: 240 }} /></div>
            ) : null}
            <div className="flex gap-2 mt-3">
              <button onClick={() => approve(m.id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={() => remove(m.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

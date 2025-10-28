import { useEffect, useState } from 'react';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:3036/api/memories?limit=200', { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (e: any) { setError(String(e.message || e)); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e?: any) {
    if (e) e.preventDefault();
    setError(null);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('note', note);
      if (file) form.append('image', file, file.name);

      const res = await fetch('http://localhost:3036/api/memories', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setTitle(''); setNote(''); setFile(null);
      await fetchList();
    } catch (e: any) { setError(String(e.message || e)); }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Share Your Memories</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded p-2 w-full" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="border rounded p-2 w-full" rows={4} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Share</button>
          <button type="button" onClick={() => { setTitle(''); setNote(''); setFile(null); }} className="px-3 py-1 border rounded">Clear</button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">Shared Memories</h2>
        {loading && <div>Loading...</div>}
        {!loading && memories.length === 0 && <div className="text-gray-500">No memories yet.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => (
            <div key={m.id} className="bg-white rounded shadow p-3">
              <div className="font-semibold">{m.title || <em className="text-gray-600">(no title)</em>}</div>
              <div className="text-sm mt-1">{m.note}</div>
              {m.image && m.image.mime && m.image.data ? (
                <div className="mt-3"><img src={`data:${m.image.mime};base64,${m.image.data}`} alt={m.image.filename || 'image'} style={{ maxWidth: '100%', maxHeight: 240 }} /></div>
              ) : null}
              <div className="text-xs text-gray-500 mt-2">Posted: {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState('oil-painting');
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<any | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

  const STYLES = ['oil-painting', 'watercolor', 'cyberpunk', 'monochrome', 'cartoon'];

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

  // Generate a stylized variant of the selected file via backend AI endpoint
  async function handleGenerate() {
    if (!file) return setError('Select an image file first');
    setError(null);
    setGenerating(true);
    setGeneratedPreview(null);
    try {
      const form = new FormData();
      form.append('image', file, file.name);
      form.append('style', style);

      const res = await fetch('http://localhost:3036/api/memories/generate', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || `Generate failed: ${res.status}`);
      }
      const data = await res.json();
      setGeneratedPreview(data.generated);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setGenerating(false);
    }
  }

  // Save a generated preview as a new memory (convert base64 to blob and POST to /memories)
  async function saveGeneratedAsMemory() {
    if (!generatedPreview || !generatedPreview.data) return setError('No generated image to save');
    setError(null);
    try {
      const dataUrl = `data:${generatedPreview.mime};base64,${generatedPreview.data}`;
      const fetched = await fetch(dataUrl);
      const blob = await fetched.blob();
      const form = new FormData();
      form.append('title', title || `Generated - ${style}`);
      form.append('note', note || 'Generated image');
      form.append('image', blob, generatedPreview.filename || `generated.${generatedPreview.mime.split('/').pop()}`);

      const res = await fetch('http://localhost:3036/api/memories', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setGeneratedPreview(null);
      setTitle(''); setNote(''); setFile(null);
      await fetchList();
    } catch (e: any) {
      setError(String(e.message || e));
    }
  }

  // Cast a vote (1 or -1) for a memory and update local state with returned counts
  async function handleVote(memoryId: number, value: 1 | -1) {
    try {
      const res = await fetch(`http://localhost:3036/api/memories/${memoryId}/vote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || `Vote failed: ${res.status}`);
      }
      const data = await res.json();
      // update the memory in state with new counts
      setMemories((prev) => prev.map((m) => m.id === memoryId ? { ...m, upvotes: Number(data.counts.upvotes || 0), downvotes: Number(data.counts.downvotes || 0), score: Number(data.counts.score || 0) } : m));
      // if modal open, sync selectedMemory
      if (selectedMemory && selectedMemory.id === memoryId) {
        setSelectedMemory((s: any) => ({ ...s, upvotes: Number(data.counts.upvotes || 0), downvotes: Number(data.counts.downvotes || 0), score: Number(data.counts.score || 0) }));
      }
    } catch (e: any) {
      console.error('Vote error', e);
      setError(String(e.message || e));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Share Your Memories</h1>

      <form onSubmit={handleSubmit} className="bg-white p-3 rounded shadow-sm mb-6 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" className="border rounded p-2 w-full text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="One-line note" className="border rounded p-2 w-full text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="text-sm" />
            </div>
            <div className="ml-auto flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Share</button>
              <button type="button" onClick={() => { setTitle(''); setNote(''); setFile(null); }} className="px-3 py-1 border rounded text-sm">Clear</button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600">Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="border rounded p-1 text-sm">
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={handleGenerate} disabled={generating} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">{generating ? 'Generating…' : 'Generate'}</button>
          {error && <div className="text-red-600 text-sm ml-4">{error}</div>}
        </div>
      </form>

      {/* Generated preview */}
      {generatedPreview && (
        <div className="mb-6 bg-white p-3 rounded shadow-sm border">
          <h3 className="font-semibold mb-2 text-sm">Generated Preview</h3>
          <div className="flex items-center gap-4">
            <div className="w-48 h-32 bg-gray-100 rounded overflow-hidden">
              <img src={`data:${generatedPreview.mime};base64,${generatedPreview.data}`} alt={generatedPreview.filename} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex gap-2">
                <button onClick={saveGeneratedAsMemory} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save as memory</button>
                <button onClick={() => setGeneratedPreview(null)} className="px-3 py-1 border rounded text-sm">Discard</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-3">Shared Memories</h2>
        {loading && <div>Loading...</div>}
        {!loading && memories.length === 0 && <div className="text-gray-500">No memories yet.</div>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {memories.map((m) => (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMemory(m)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedMemory(m); }}
              className="bg-white rounded shadow-sm p-2 text-sm overflow-hidden cursor-pointer hover:shadow-md transition"
            >
              <div className="w-full h-28 bg-gray-100 rounded overflow-hidden">
                {m.image && m.image.mime && m.image.data ? (
                  <img src={`data:${m.image.mime};base64,${m.image.data}`} alt={m.image.filename || 'image'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="mt-2 font-medium truncate">{m.title || <span className="text-gray-600">(no title)</span>}</div>
              <div className="text-xs text-gray-600 truncate">{m.note}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleVote(m.id, 1); }} className="text-sm px-2 py-1 bg-green-100 rounded">▲</button>
                  <span className="text-sm">{typeof m.score !== 'undefined' ? m.score : (m.upvotes ? (Number(m.upvotes) - (Number(m.downvotes)||0)) : 0)}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleVote(m.id, -1); }} className="text-sm px-2 py-1 bg-red-100 rounded">▼</button>
                </div>
                <div className="text-xxs text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen modal / lightbox for selected memory */}
        {selectedMemory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedMemory(null)}
          >
            <div
              className="bg-white rounded shadow-lg max-w-4xl w-full mx-4 overflow-hidden"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between p-2 border-b">
                <div>
                  <div className="font-semibold text-lg">{selectedMemory.title || '(no title)'}</div>
                  <div className="text-sm text-gray-600">{selectedMemory.note}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(selectedMemory.id, 1)} className="px-2 py-1 bg-green-100 rounded">▲</button>
                    <div className="text-sm">{selectedMemory.score ?? (selectedMemory.upvotes ? (Number(selectedMemory.upvotes) - (Number(selectedMemory.downvotes)||0)) : 0)}</div>
                    <button onClick={() => handleVote(selectedMemory.id, -1)} className="px-2 py-1 bg-red-100 rounded">▼</button>
                  </div>
                  <button onClick={() => setSelectedMemory(null)} className="px-3 py-1 text-sm border rounded">Close</button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center bg-gray-50">
                {selectedMemory.image && selectedMemory.image.mime && selectedMemory.image.data ? (
                  <img
                    src={`data:${selectedMemory.image.mime};base64,${selectedMemory.image.data}`}
                    alt={selectedMemory.image.filename || 'image'}
                    className="max-h-[80vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="p-8 text-gray-500">No image available</div>
                )}
              </div>
              <div className="p-3 text-right text-xs text-gray-500">Posted: {selectedMemory.created_at ? new Date(selectedMemory.created_at).toLocaleString() : '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

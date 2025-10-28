import React, { useEffect, useMemo, useState } from 'react';

type NotificationRecord = {
  id: number;
  category: string;
  title?: string | null;
  message: string;
  payload?: any;
  location?: string | null;
  severity?: string | null;
  status?: string | null;
  created_by?: string | null;
  read_by?: any[];
  created_at?: string | null;
  expires_at?: string | null;
};

const ALLOWED_CATEGORIES = ['lost_found', 'missing_person', 'vehicle', 'weather_alert'];
const ALLOWED_SEVERITIES = ['low', 'mid', 'high'];

export default function NotificationsManager() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Form state for create/edit
  const [form, setForm] = useState<Partial<NotificationRecord>>({
    category: ALLOWED_CATEGORIES[0],
    title: '',
    message: '',
    payload: '',
    location: '',
    severity: ALLOWED_SEVERITIES[0],
    expires_at: undefined,
  });

  // Edit mode
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Helper to return a payload preview with any large binary fields removed/replaced
  function getPayloadPreview(p: any) {
    if (p === null || p === undefined) return p;
    if (typeof p !== 'object') return p;
    try {
      const copy = JSON.parse(JSON.stringify(p));
      // remove any image object entirely so metadata and binary data aren't shown
      if (copy.image) {
        delete copy.image;
      }
      return copy;
    } catch (e) {
      return p;
    }
  }

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3036/api/notifications?limit=200', { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      // route returns { notifications: [...] }
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!selectedCategories.length) return notifications;
    return notifications.filter((n) => selectedCategories.includes(n.category));
  }, [notifications, selectedCategories]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function handleChange<K extends keyof NotificationRecord>(key: K, value: NotificationRecord[K] | any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreateOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        // Try PATCH to update. Parse payload if provided as JSON text.
        const bodyObj: any = { ...form };
        if (typeof bodyObj.payload === 'string') {
          try {
            bodyObj.payload = JSON.parse(bodyObj.payload as string);
          } catch (_) {
            // leave as string
          }
        }

        const res = await fetch(`http://localhost:3036/api/notifications/${editingId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj),
        });
        if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
      } else {
        // Create via /api/notifications/now so server returns active grouped list (or just create)
        const payload: any = { ...form };
        // Ensure expires_at is null or ISO string
        if (!payload.expires_at) payload.expires_at = null;
        // If payload provided as string (JSON text), try to parse it
        if (typeof payload.payload === 'string') {
          try {
            payload.payload = JSON.parse(payload.payload as string);
          } catch (_) {
            // leave as string
          }
        }

        // If an image file is selected and category is one that accepts images, send multipart/form-data
        if (imageFile && (payload.category === 'lost_found' || payload.category === 'missing_person')) {
          const formData = new FormData();
          // append simple fields
          formData.append('category', String(payload.category));
          if (payload.title) formData.append('title', String(payload.title));
          formData.append('message', String(payload.message));
          if (payload.location) formData.append('location', String(payload.location));
          if (payload.expires_at) formData.append('expires_at', String(payload.expires_at));
          if (payload.severity) formData.append('severity', String(payload.severity));
          // if user provided a payload object, append it as JSON string
          if (payload.payload !== undefined && payload.payload !== null) {
            try {
              formData.append('payload', typeof payload.payload === 'string' ? payload.payload : JSON.stringify(payload.payload));
            } catch (_) {
              formData.append('payload', String(payload.payload));
            }
          }
          formData.append('image', imageFile, imageFile.name);

          const res = await fetch('http://localhost:3036/api/notifications/now/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
          if (!res.ok) throw new Error(`Failed to create with image: ${res.status}`);
        } else {
          const res = await fetch('http://localhost:3036/api/notifications/now', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
        }
      }

      // Refresh list
      await fetchNotifications();
  // Reset form
  setForm({ category: ALLOWED_CATEGORIES[0], title: '', message: '', payload: '', location: '', severity: ALLOWED_SEVERITIES[0], expires_at: undefined });
      setEditingId(null);
    } catch (err: any) {
      setError(String(err.message || err));
    }
  }

  async function handleDelete(id: number, hard = false) {
    if (!confirm('Delete this notification?')) return;
    setError(null);
    try {
      const url = `http://localhost:3036/api/notifications/${id}${hard ? '?hard=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      await fetchNotifications();
    } catch (err: any) {
      setError(String(err.message || err));
    }
  }

  function startEdit(n: NotificationRecord) {
    setEditingId(n.id);
    setForm({
      category: n.category,
      title: n.title || '',
      message: n.message,
      // Show payload as JSON string if it's an object, otherwise as text
      payload: n.payload && typeof n.payload === 'object' ? JSON.stringify(n.payload, null, 2) : (n.payload ?? ''),
      location: n.location || '',
      severity: n.severity || ALLOWED_SEVERITIES[0],
      expires_at: n.expires_at || undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // If editing a notification that contains an image payload, we don't auto-set imageFile
    // (uploads during edit are not implemented here). Clear any selected file.
    setImageFile(null);
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Notifications Manager</h2>

      {/* Create / Edit form */}
      <form onSubmit={handleCreateOrUpdate} className="space-y-3 mb-6">
        <div className="flex gap-3 flex-wrap">
          <select value={form.category ?? ''} onChange={(e) => handleChange('category', e.target.value)} className="border rounded p-2">
            {ALLOWED_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={form.severity ?? ''} onChange={(e) => handleChange('severity', e.target.value)} className="border rounded p-2">
            {ALLOWED_SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input className="border rounded p-2 flex-1" placeholder="Title (optional)" value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} />

          <input className="border rounded p-2" placeholder="Location" value={form.location || ''} onChange={(e) => handleChange('location', e.target.value)} />

          <input type="datetime-local" className="border rounded p-2" onChange={(e) => handleChange('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </div>

        {/* Image upload for lost_found and missing_person */}
        {(form.category === 'lost_found' || form.category === 'missing_person' || form.category === 'vehicle') && (
          <div>
            <label className="text-sm font-medium mb-1 block">Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
            {imageFile && (
              <div className="mt-2">
                <strong>Selected:</strong> {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
              </div>
            )}
          </div>
        )}

        <textarea required className="w-full border rounded p-2" placeholder="Message" value={form.message || ''} onChange={(e) => handleChange('message', e.target.value)} />

        {/* Payload editor (optional JSON). Stored as text in the form and parsed on submit. */}
        <div>
          <label className="text-sm font-medium mb-1 block">Payload (JSON, optional)</label>
          <textarea
            className="w-full border rounded p-2 font-mono text-sm"
            placeholder='{"key":"value"} - optional JSON payload'
            value={typeof form.payload === 'string' ? form.payload : JSON.stringify(form.payload || '', null, 2)}
            onChange={(e) => handleChange('payload', e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ category: ALLOWED_CATEGORIES[0], title: '', message: '', payload: '', location: '', severity: ALLOWED_SEVERITIES[0], expires_at: undefined }); }} className="px-3 py-1 border rounded">Cancel</button>}
          <button type="button" onClick={() => { setForm({ category: ALLOWED_CATEGORIES[0], title: '', message: '', payload: '', location: '', severity: ALLOWED_SEVERITIES[0], expires_at: undefined }); setEditingId(null); }} className="px-3 py-1 border rounded">Clear</button>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex gap-3 flex-wrap items-center">
          <strong>Filter categories:</strong>
          <button onClick={() => setSelectedCategories([])} className="px-2 py-1 border rounded">All</button>
          {ALLOWED_CATEGORIES.map((c) => (
            <label key={c} className={`px-2 py-1 border rounded cursor-pointer ${selectedCategories.includes(c) ? 'bg-blue-100' : ''}`}>
              <input type="checkbox" checked={selectedCategories.includes(c)} onChange={() => toggleCategory(c)} className="mr-2" />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* List */}
      <div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && filtered.length === 0 && <div className="text-gray-500">No notifications found.</div>}

        <ul className="space-y-3">
          {filtered.map((n) => (
            <li key={n.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">{n.category} · {n.severity} · {n.status || 'unknown'}</div>
                <div className="font-medium">{n.title || <em className="text-gray-600">(no title)</em>}</div>
                <div className="mt-1">{n.message}</div>
                {n.payload ? (
                  <div className="mt-2">
                    {/* If payload contains an image stored as base64, render it */}
                    {n.payload.image && n.payload.image.mime && n.payload.image.data ? (
                      <div className="mb-2">
                        <img src={`data:${n.payload.image.mime};base64,${n.payload.image.data}`} alt={n.payload.image.filename || 'image'} style={{ maxWidth: 240, maxHeight: 240 }} />
                      </div>
                    ) : null}

                    <pre className="bg-gray-50 border rounded p-2 text-xs overflow-auto max-h-40">{typeof n.payload === 'object' ? JSON.stringify(getPayloadPreview(n.payload), null, 2) : String(n.payload)}</pre>
                  </div>
                ) : null}
                <div className="text-xs text-gray-500 mt-2">Posted: {n.created_at ? new Date(n.created_at).toLocaleString() : '—'} {n.expires_at ? `· Expires: ${new Date(n.expires_at).toLocaleString()}` : ''}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => startEdit(n)} className="px-2 py-1 border rounded">Edit</button>
                <button onClick={() => handleDelete(n.id)} className="px-2 py-1 bg-yellow-400 rounded">Cancel</button>
                <button onClick={() => handleDelete(n.id, true)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

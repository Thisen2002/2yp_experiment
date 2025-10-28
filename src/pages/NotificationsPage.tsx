import { useEffect, useMemo, useState } from 'react';

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
  created_at?: string | null;
  expires_at?: string | null;
};

const ALLOWED_CATEGORIES = ['lost_found', 'missing_person', 'vehicle', 'weather_alert'];
const ALLOWED_SEVERITIES = ['low', 'mid', 'high'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categories, setCategories] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3036/api/notifications?limit=500', { credentials: 'include' });
      if (!res.ok) {
        // detect HTML responses (dev server) and give actionable error
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) throw new Error('Backend returned HTML. Is the API server running or proxy configured?');
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const list = Array.isArray(data.notifications) ? data.notifications : (data || []);
      setNotifications(list as NotificationRecord[]);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const toggleCategory = (c: string) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  // sanitize payload for preview: remove image field entirely
  function payloadPreview(p: any) {
    if (p == null) return null;
    if (typeof p !== 'object') return p;
    try {
      const copy = JSON.parse(JSON.stringify(p));
      if (copy.image) delete copy.image;
      return copy;
    } catch (e) {
      return p;
    }
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (categories.length && !categories.includes(n.category)) return false;
      if (severity && String(n.severity || '') !== severity) return false;
      if (status && String(n.status || '') !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!String(n.message || '').toLowerCase().includes(s) && !String(n.title || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [notifications, categories, severity, status, q]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Notifications Explorer</h1>

      <div className="mb-4 bg-white p-4 rounded shadow">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">Search</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or message" className="border rounded p-2" />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border rounded p-2">
              <option value="">Any</option>
              {ALLOWED_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
              <option value="">Any</option>
              <option value="active">active</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Categories</label>
            <div className="flex gap-2">
              {ALLOWED_CATEGORIES.map((c) => (
                <label key={c} className={`px-2 py-1 border rounded cursor-pointer ${categories.includes(c) ? 'bg-blue-100' : ''}`}>
                  <input type="checkbox" checked={categories.includes(c)} onChange={() => toggleCategory(c)} className="mr-2" />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="ml-auto">
            <button onClick={fetchList} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
          </div>
        </div>
      </div>

      <div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && filtered.length === 0 && <div className="text-gray-500">No notifications match your filters.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n) => (
            <div key={n.id} className="bg-white rounded shadow p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-28 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {n.payload && n.payload.image && n.payload.image.mime && n.payload.image.data ? (
                    <img src={`data:${n.payload.image.mime};base64,${n.payload.image.data}`} alt={n.payload.image.filename || 'image'} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-500">{n.category} · {n.severity || '—'} · {n.status || '—'}</div>
                  <div className="font-semibold text-lg mt-1">{n.title || <em className="text-gray-600">(no title)</em>}</div>
                  <div className="mt-2 text-sm">{n.message}</div>

                  {n.payload ? (
                    <details className="mt-3 text-xs text-gray-700">
                      <summary className="cursor-pointer">Payload (preview)</summary>
                      <pre className="mt-2 bg-gray-50 border rounded p-2 text-xs overflow-auto max-h-40">{JSON.stringify(payloadPreview(n.payload), null, 2)}</pre>
                    </details>
                  ) : null}

                  <div className="text-xs text-gray-500 mt-3">Posted: {n.created_at ? new Date(n.created_at).toLocaleString() : '—'} {n.expires_at ? `· Expires: ${new Date(n.expires_at).toLocaleString()}` : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

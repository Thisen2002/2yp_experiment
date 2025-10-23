export const API = "http://localhost:3036";

//Act as a class


//performs a GET to ${API}${path} with cookies included
export async function apiGet(path) {
  const r = await fetch(`${API}${path}`, { credentials: "include" });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

//performs a request with the given HTTP method, sets Content-Type: application/json, sends JSON.stringify(body ?? {}), includes cookies,
export async function apiJSON(method, path, body) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {})
  });
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}`);
  return r.json();
}
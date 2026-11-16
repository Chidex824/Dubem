const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "dubem_token";

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

// Turns Django's error shapes ({detail}, {field: [..]}, or a list) into one readable message.
function messageOf(data, status) {
  if (!data) return `Request failed (${status})`;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat()[0];
  return typeof first === "string" ? first : `Request failed (${status})`;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Token ${token}`;
  const res = await fetch(`${API}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(messageOf(data, res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---- accounts ----
export const signup = (d) => request("/auth/signup/", { method: "POST", body: d, auth: false })
  .then((r) => { setToken(r.token); return r; });
export const login = (email, password) => request("/auth/login/", { method: "POST", body: { email, password }, auth: false })
  .then((r) => { setToken(r.token); return r; });
export const logout = () => request("/auth/logout/", { method: "POST" }).catch(() => {}).finally(() => setToken(null));
export const me = () => request("/auth/me/");
export const resendVerification = (email) => request("/auth/resend/", { method: "POST", body: { email }, auth: false });
export const requestPasswordReset = (email) => request("/auth/password-reset/", { method: "POST", body: { email }, auth: false });
export const resetPassword = (token, password) => request("/auth/password-reset/confirm/", { method: "POST", body: { token, password }, auth: false });
export const deleteAccount = () => request("/auth/me/", { method: "DELETE" }).then(() => setToken(null));

// ---- board (public) ----
export const reportListing = (slug, reason, note = "") => request(`/jobs/${slug}/report/`, { method: "POST", body: { reason, note } });
export const postingTypes = () => request("/posting-types/", { auth: false });

// ---- seekers (verified email) ----
export const savedJobs = () => request("/saved/");
export const saveJob = (slug) => request(`/saved/${slug}/`, { method: "PUT" });
export const unsaveJob = (slug) => request(`/saved/${slug}/`, { method: "DELETE" });
export const alerts = () => request("/alerts/");
export const createAlert = (d) => request("/alerts/", { method: "POST", body: d });          // {name,q,type,mode,country,frequency}
export const updateAlert = (id, d) => request(`/alerts/${id}/`, { method: "PATCH", body: d }); // e.g. {on:false}
export const deleteAlert = (id) => request(`/alerts/${id}/`, { method: "DELETE" });

// ---- organizations ----
// d = {title,type,mode,country,city,employmentType,pay,closesAt,applyUrl,description,shareWhatsapp}
export const postListing = (d) => request("/jobs/", { method: "POST", body: d });
export const myListings = () => request("/my/jobs/");
export const updateListing = (slug, d) => request(`/jobs/${slug}/`, { method: "PATCH", body: d });
export const closeListing = (slug) => request(`/jobs/${slug}/close/`, { method: "POST" });
export const myStats = (days = 7) => request(`/my/stats/?days=${days}`);
export const myOrg = () => request("/orgs/me/");

// ---- analytics (fire and forget, never breaks a page) ----
export const track = (slug, type, source) =>
  request("/events/", { method: "POST", body: { slug, type, source }, auth: false }).catch(() => {});

// Тонкий API-клиент над fetch. Токен берётся из localStorage.

export type Json = any;

function authHeader(): Record<string, string> {
  const t = localStorage.getItem("cr_token");
  return t ? { Authorization: "Bearer " + t } : {};
}

async function request(
  path: string,
  opts: { method?: string; body?: Json; form?: Record<string, string>; auth?: boolean } = {}
): Promise<Json> {
  const { method = "GET", body, form, auth = false } = opts;
  const headers: Record<string, string> = {};
  let payload: string | undefined;

  if (form) {
    payload = new URLSearchParams(form).toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }
  if (auth) Object.assign(headers, authHeader());

  const res = await fetch(path, { method, headers, body: payload });
  const text = await res.text();
  let data: Json = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = data && data.detail ? data.detail : `Ошибка ${res.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

export const api = {
  // Auth
  register: (email: string, password: string, display_name: string) =>
    request("/auth/register", { method: "POST", body: { email, password, display_name } }),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", form: { username: email, password } }),
  me: () => request("/users/me", { auth: true }),
  saveWeights: (w: Record<string, number>) =>
    request("/users/me/weights", { method: "PUT", auth: true, body: w }),

  // Reference
  platforms: () => request("/platforms"),
  categories: () => request("/categories"),
  sellers: () => request("/sellers"),
  products: () => request("/products?limit=300"),

  // Reviews
  createReview: (body: Json) => request("/reviews", { method: "POST", auth: true, body }),
  review: (id: number | string) => request(`/reviews/${id}`),

  // Comments
  comments: (reviewId: number | string) => request(`/reviews/${reviewId}/comments`),
  addComment: (review_id: number, text: string, parent_comment_id: number | null) =>
    request("/comments", { method: "POST", auth: true, body: { review_id, text, parent_comment_id } }),

  // Feedback
  feedback: (review_id: number) =>
    request("/feedback", { method: "POST", auth: true, body: { review_id, is_useful: 1 } }),

  // Search
  search: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params);
    const t = localStorage.getItem("cr_token");
    if (t) qs.set("authorization", t);
    return request("/search?" + qs.toString());
  },

  // Analytics
  byPlatform: () => request("/analytics/by-platform"),
  criteriaAvg: () => request("/analytics/criteria-avg"),
  scoreDistribution: () => request("/analytics/score-distribution"),
};

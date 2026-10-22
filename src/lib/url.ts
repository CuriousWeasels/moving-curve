// Prefix a site-root path with the deploy base (e.g. "/moving-curve" on a GitHub
// project page, "" on a custom domain). Full URLs pass through untouched.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string) =>
  /^([a-z]+:)?\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

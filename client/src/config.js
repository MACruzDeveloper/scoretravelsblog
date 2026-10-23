// API base URL. Set VITE_API_URL at build time (e.g. https://api.example.com).
// Falls back to the local server in development and to the same origin otherwise,
// which is how the Express server serves the built client.
const localHosts = ['localhost', '127.0.0.1', '0.0.0.0']
const URL = import.meta.env.VITE_API_URL
  || (localHosts.includes(window.location.hostname) ? 'http://localhost:3040' : window.location.origin)

export { URL }

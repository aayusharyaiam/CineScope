export default async function handler(req, res) {
  const apiKey = process.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  try {
    const separator = path.includes('?') ? '&' : '?';
    const url = `https://api.themoviedb.org/3${path}${separator}api_key=${apiKey}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'TMDB API request failed' });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    console.error('TMDB proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

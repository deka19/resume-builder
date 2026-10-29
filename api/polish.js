export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing in Vercel settings.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert resume writer. Turn this basic job description into two highly professional, ATS-friendly bullet points using the STAR method. Return ONLY the bullet points, no introduction or extra text.\n\nUser input: ${text}`
          }]
        }]
      })
    });

    const data = await response.json();
    const polishedText = data.candidates[0].content.parts[0].text.trim();
    
    res.status(200).json({ polishedText });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rewrite text.' });
  }
}

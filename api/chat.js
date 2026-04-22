
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API Key not configured. Please add GEMINI_API_KEY to your Vercel Environment Variables.' 
    });
  }

  try {
    const { contents } = req.body;

    // We use gemini-1.5-flash as it is highly efficient for chatbots
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(response.status || 500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Serverless Function Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

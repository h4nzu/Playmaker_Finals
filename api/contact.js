function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Store messages in memory (will reset on redeploy - for production use a database)
let messages = [];

export default function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { name, email, subject, message: messageText } = req.body;

    // Validation
    if (!name || !email || !subject || !messageText) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const newMessage = {
      id: Date.now(),
      name,
      email,
      subject,
      message: messageText,
      timestamp: new Date().toISOString(),
      status: 'unread'
    };

    messages.push(newMessage);

    return res.status(201).json({
      success: true,
      message: 'Message received successfully',
      data: newMessage
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      data: messages,
      total: messages.length
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = 8080;

app.get('/auth/google', (req, res) => {
  const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/gmail.send` +
    `&access_type=offline` +
    `&prompt=consent`;
  res.redirect(oauth2Url);
});

app.get('/oauth2/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code received');

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', qs.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.send(`Access Token: ${tokenResponse.data.access_token}<br>Refresh Token: ${tokenResponse.data.refresh_token}`);
  } catch (err) {
    res.send('Error exchanging code: ' + err);
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

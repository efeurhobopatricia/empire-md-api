const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('site'));
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);
require('dotenv').config();

// Function to get Spotify Access Token
async function getSpotifyAccessToken() {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        return null;
    }
}

// Function to extract Track ID from Spotify URL
function extractTrackId(url) {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

// Spotify API Route
app.get('/api/download/spotify', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'You need to provide a Spotify track URL.' });
    }

    const trackId = extractTrackId(url);
    if (!trackId) {
        return res.status(400).json({ error: 'Invalid Spotify URL. Provide a valid track link.' });
    }

    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) {
        return res.status(500).json({ error: 'Failed to authenticate with Spotify' });
    }

    try {
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const track = response.data;
        res.json({
            success: true,
            creator: "Empire Tech",
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            release_date: track.album.release_date,
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching track info', error: error.response?.data || error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

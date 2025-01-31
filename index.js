const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit'); // For rate limiting

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('site'));
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);
require('dotenv').config();

// In-memory store for tracking daily requests
let dailyRequests = {
    empiretech: 0,
};

// API key middleware
function apiKeyMiddleware(req, res, next) {
    const apiKey = req.query.api_key; // Extract the API key from the query string

    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required.' });
    }

    // Validate API key
    if (apiKey === 'empiretech') {
        if (dailyRequests.empiretech >= 100) {
            return res.status(429).json({ error: 'Daily request limit exceeded for empiretech.' });
        }
        dailyRequests.empiretech += 1; // Increment daily request count for empiretech
    } else if (apiKey === 'empirelimit') {
        // Unlimited requests for empirelimit
        // Do nothing to restrict the number of requests
    } else {
        return res.status(403).json({ error: 'Invalid API key.' });
    }

    next(); // Proceed to the next middleware or route handler
}

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

// Spotify API Route - Download
app.get('/api/download/spotify', apiKeyMiddleware, async (req, res) => {
    const { api_key, url } = req.query;

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
            creator: "Empire Tech",
            success: true,
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

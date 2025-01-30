const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);

// Serve static files (HTML, CSS, JS) from the 'site' folder
app.use(express.static('site'));

// YouTube Downloader API
app.get('/api/youtube-downloader', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'You need to provide a URL.' });
    }

    try {
        // Fetch video info
        const info = await ytdl.getInfo(url);

        // YouTube video details
        const videoDetails = {
            creator: Empire Tech,
            success: true,
            title: info.videoDetails.title,
            creator: info.videoDetails.author,
            description: info.videoDetails.description,
            videoUrl: url,
            formats: info.formats,
            downloadUrl: ytdl.chooseFormat(info.formats, { quality: 'highest' }).url, // URL for the highest quality video
        };

        res.json(videoDetails);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch video info', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

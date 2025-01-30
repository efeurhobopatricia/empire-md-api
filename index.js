const express = require('express');
const playdl = require('play-dl');
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
        return res.status(400).json({ success: false, error: 'You need to provide a URL.' });
    }

    try {
        // Fetch video info
        const info = await playdl.video_basic_info(url);

        // Extract video details
        const videoDetails = {
            success: true,
            creator: "Empire Tech", // Your branding
            title: info.video_details.title,
            uploader: info.video_details.channel.name, // Fixing the creator field
            description: info.video_details.description,
            thumbnail: info.video_details.thumbnails.pop().url, // Highest quality thumbnail
            videoUrl: url,
            downloadUrl: (await playdl.stream(url)).url, // URL for streaming the video
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

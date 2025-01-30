const express = require('express');
const ytdlp = require('yt-dlp-exec');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);
app.use(express.static('site'));

app.get('/api/youtube-downloader', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'You need to provide a URL.' });
    }

    try {
        const videoInfo = await ytdlp(url, { dumpSingleJson: true });

        res.json({
            success: true,
            creator: "Empire Tech",
            title: videoInfo.title,
            description: videoInfo.description,
            videoUrl: url,
            downloadUrl: videoInfo.url // Best available video URL
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching video info', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

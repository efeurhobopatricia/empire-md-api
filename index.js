const express = require('express');
const { exec } = require('child_process'); // To run yt-dlp in the shell
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);

// Serve static files (HTML, CSS, JS) from the 'site' folder
app.use(express.static('site'));

// YouTube Downloader API
app.get('/api/youtube-downloader', (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'You need to provide a URL.' });
    }

    // Use yt-dlp to get video information
    exec(`yt-dlp -j ${url}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ success: false, message: 'Failed to fetch video info', error: error.message });
        }
        
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ success: false, message: 'Error fetching video info', error: stderr });
        }

        try {
            // Parse the JSON response from yt-dlp
            const videoDetails = JSON.parse(stdout);

            // Send the video details as JSON response
            res.json({
                success: true,
                creator: "Empire Tech",
                title: videoDetails.title,
                description: videoDetails.description,
                videoUrl: url,
                downloadUrl: videoDetails.url, // URL for the best quality video
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error parsing video info', error: err.message });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

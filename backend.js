require('dotenv').config(); // Load environment variables
const express = require('express');
const ytdl = require('ytdl-core');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Use the environment variable or default to 3000

// CORS configuration
const corsOptions = {
    origin: 'https://music-mp3-downloader.netlify.app', // Replace with your frontend domain
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// YouTube Data API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Search endpoint
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Missing search query parameter q' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query,
                key: YOUTUBE_API_KEY,
                maxResults: 10,
                type: 'video',
                videoCategoryId: '10' // Music category
            }
        });

        const results = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.json(results);
    } catch (error) {
        console.error('Error fetching YouTube data:', error.message);
        res.status(500).json({ error: 'Unable to fetch search results. Please try again later.' });
    }
});

// Download endpoint
app.get('/download', async (req, res) => {
    const videoId = req.query.id;
    const stream = req.query.stream === 'true';
    if (!videoId) {
        return res.status(400).json({ error: 'Missing video id parameter' });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        if (!format) {
            return res.status(404).json({ error: 'No suitable audio format found' });
        }

        if (!stream) {
            res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
        }
        ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error.message);
        res.status(500).json({ error: 'Unable to download the audio. Please try again later.' });
    }
});

app.listen(port, () => {
    console.log(`Music downloader backend listening at http://localhost:${port}`);
});

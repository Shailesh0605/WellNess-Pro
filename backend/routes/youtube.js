const express = require('express');
const axios = require('axios');
const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Ensure this is set in your environment variables
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

const cache = new Map(); // In-memory cache

// Endpoint to fetch video links based on workout name
router.get('/videos', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Check cache first
  if (cache.has(query)) {
    console.log('Cache hit for query:', query);
    return res.json(cache.get(query));
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
      },
    });

    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    // Store in cache
    cache.set(query, videos);

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

module.exports = router;
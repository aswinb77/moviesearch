const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = "yourapikey";
const Movie = require('./models/Movie');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchDeepDetails(tmdbId, isTv) {
  try {
    const type = isTv ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers`;
    const response = await axios.get(url);
    const data = response.data;

    // Filter Top 5 Cast
    const topCast = data.credits?.cast?.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
    })) || [];

    // Filter 1 Official Trailer
    const trailer = data.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
    const videos = trailer ? [{ type: "Trailer", key: trailer.key, site: "YouTube" }] : [];

    // Filter specific watch providers
    const allowedRegions = ["US", "IN", "GB", "CA", "AU"];
    const watch_providers = {};
    if (data["watch/providers"] && data["watch/providers"].results) {
      for (const region of allowedRegions) {
        if (data["watch/providers"].results[region]) {
          watch_providers[region] = data["watch/providers"].results[region];
        }
      }
    }

    return {
      genres: data.genres || [],
      cast: topCast,
      videos: videos,
      watch_providers: watch_providers,
      number_of_episodes: data.number_of_episodes || null
    };
  } catch (error) {
    console.error(`Error fetching deep details for ${tmdbId}:`, error.message);
    return null;
  }
}

async function scrapeList(endpoint, flagName, isTv = false) {
  console.log(`\nFetching list: ${flagName}...`);
  try {
    const response = await axios.get(`https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}`);
    const items = response.data.results.slice(0, 20); // Limit to 20 for DB space

    let savedCount = 0;
    for (let m of items) {
      const tmdbId = m.id;
      
      // Fetch deep details to get cast/providers
      const deepData = await fetchDeepDetails(tmdbId, isTv);
      if (!deepData) {
        await delay(200); // Rate limit protection
        continue;
      }

      const updateData = {
        title: m.title || m.name,
        overview: m.overview,
        release_date: m.release_date || m.first_air_date,
        vote_average: m.vote_average,
        poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
        isTv: isTv,
        
        genres: deepData.genres,
        cast: deepData.cast,
        videos: deepData.videos,
        watch_providers: deepData.watch_providers,
        number_of_episodes: deepData.number_of_episodes,
        
        // Dynamic flag setting
        [flagName]: true
      };

      // UPSERT: Update if exists, insert if it doesn't. Prevents duplicates!
      await Movie.updateOne(
        { tmdbId: tmdbId }, 
        { $set: updateData }, 
        { upsert: true }
      );
      
      savedCount++;
      console.log(`✅ Upserted: ${updateData.title}`);
      await delay(200); // Respect TMDB rate limits
    }
    console.log(`🎉 Finished ${flagName}: Processed ${savedCount} items.`);
  } catch (error) {
    console.error(`Error fetching list ${endpoint}:`, error.message);
  }
}

async function runFullScrape() {
  if (!process.env.MONGO_URI) {
    console.log("❌ ERROR: Please add your MONGO_URI to the .env file first!");
    process.exit();
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB. Beginning Full Optimized Scrape...");

  // We wipe flags first so old trending movies don't stay trending forever
  await Movie.updateMany({}, { 
    $set: { isTrending: false, isPopular: false, isUpcoming: false, isNowPlaying: false, isTvPopular: false, isTvTopRated: false } 
  });

  await scrapeList("/trending/movie/day", "isTrending", false);
  await scrapeList("/movie/popular", "isPopular", false);
  await scrapeList("/movie/upcoming", "isUpcoming", false);
  await scrapeList("/movie/now_playing", "isNowPlaying", false);
  await scrapeList("/tv/popular", "isTvPopular", true);
  await scrapeList("/tv/top_rated", "isTvTopRated", true);

  console.log("\n🚀 ALL SCRAPING COMPLETE! Your DB is fully optimized.");
  process.exit();
}

runFullScrape();

const axios = require("axios");
const cheerio = require("cheerio");
const { delay } = require("../lib/delay");
const { db } = require("../lib/firebase");
const { mergeMovie } = require("../lib/merge");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

// Search IMDb for a movie title and return the first result's IMDb ID
async function searchImdb(title, year) {
  const query = encodeURIComponent(`${title} ${year}`);
  const url = `https://www.imdb.com/find/?q=${query}&s=tt&ttype=ft`;
  const { data: html } = await axios.get(url, {
    headers: HEADERS,
    timeout: 12000,
  });
  const $ = cheerio.load(html);
  // IMDb search result links look like /title/tt1234567/
  const firstResult = $('a[href*="/title/tt"]').first().attr("href");
  if (!firstResult) return null;
  // Extract the IMDb ID — e.g. tt1234567
  const match = firstResult.match(/\/title\/(tt\d+)/);
  return match ? match[1] : null;
}

// Fetch full details from an IMDb movie page
async function fetchImdbDetails(imdbId) {
  const url = `https://www.imdb.com/title/${imdbId}/`;
  const { data: html } = await axios.get(url, {
    headers: HEADERS,
    timeout: 12000,
  });
  const $ = cheerio.load(html);

  // IMDb stores data in JSON-LD format in the <script> tags
  const scripts = $('script[type="application/ld+json"]');
  let details = {};

  for (let i = 0; i < scripts.length; i++) {
    try {
      const data = JSON.parse($(scripts[i]).text());
      if (data["@type"] === "Movie" || data.type === "Movie") {
        details = {
          rating: parseFloat(data.aggregateRating?.ratingValue) || null,
          director: data.director?.[0]?.name || null,
          cast: data.actor?.slice(0, 5).map((a) => a.name) || [],
          plot: data.description || null,
          image: data.image || null,
        };
        break;
      }
    } catch (e) {
      // Continue to next script tag
    }
  }

  return details;
}

async function runImdbCrawler() {
  console.log("[IMDb Crawler] Starting enrichment...");

  // Get all films from Firestore
  try {
    const snapshot = await db.collection("films").limit(100).get();

    for (const doc of snapshot.docs) {
      const film = doc.data();
      if (film.imdbId) {
        // Already enriched
        continue;
      }

      try {
        // Search for IMDb ID
        const imdbId = await searchImdb(film.title, film.year);
        if (!imdbId) {
          console.log(`  ✗ Not found on IMDb: ${film.title}`);
          continue;
        }

        // Fetch details
        const details = await fetchImdbDetails(imdbId);
        await mergeMovie(doc.id, {
          imdbId,
          ...details,
        });

        console.log(
          `  ✓ Enriched: ${film.title} (${imdbId}, rating: ${details.rating})`,
        );
        await delay(3000, 5000); // IMDb rate limiting
      } catch (err) {
        console.warn(`  ! Error enriching ${film.title}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("[IMDb Crawler] Error:", err);
    throw err;
  }

  console.log("[IMDb Crawler] Finished");
}

module.exports = runImdbCrawler;

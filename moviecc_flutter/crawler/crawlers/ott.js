const axios = require("axios");
const cheerio = require("cheerio");
const { delay } = require("../lib/delay");
const { db, admin } = require("../lib/firebase");
const { mergeMovie } = require("../lib/merge");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Check if a movie is available on SonyLIV
async function checkSonyLiv(title) {
  try {
    const q = encodeURIComponent(title);
    const url = `https://www.sonyliv.com/search?q=${q}`;
    const { data: html } = await axios.get(url, {
      headers: HEADERS,
      timeout: 10000,
    });
    const $ = cheerio.load(html);
    // SonyLIV search shows movie cards with titles
    let found = false;
    $(".search-result-card, [class*='movieCard'], [class*='contentCard']").each((_, el) => {
      const cardTitle = $(el).find("[class*='title'], h3,p").first().text().toLowerCase();
      if (cardTitle.includes(title.toLowerCase())) found = true;
    });
    return found;
  } catch {
    return false;
  }
}

// Check if a movie is available on ZEE5
async function checkZee5(title) {
  try {
    const q = encodeURIComponent(title);
    // ZEE5 has a public search API endpoint
    const url = `https://gwapi.zee5.com/content/search/v1/?q=${q}&limit=5&country=IN`;
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    return data.results?.some((r) =>
      r.title?.toLowerCase().includes(title.toLowerCase()),
    );
  } catch {
    return false;
  }
}

// Check if a movie is available on Netflix (using external API)
async function checkNetflix(title) {
  try {
    // Using a simple approach: check unogsng or similar service
    // For now, return false as a placeholder
    // In production, you might use a Netflix proxy API
    return false;
  } catch {
    return false;
  }
}

// Check if a movie is available on Prime Video
async function checkPrimeVideo(title) {
  try {
    const q = encodeURIComponent(title);
    const url = `https://www.amazon.in/s?k=${q}`;
    const { data: html } = await axios.get(url, {
      headers: HEADERS,
      timeout: 10000,
    });
    const $ = cheerio.load(html);
    // Check if any movie-related results appear
    return $('[data-component-type="s-search-result"]').length > 0;
  } catch {
    return false;
  }
}

async function runOttCrawler() {
  console.log("[OTT Crawler] Starting...");

  try {
    const snapshot = await db.collection("films").limit(50).get();

    for (const doc of snapshot.docs) {
      const film = doc.data();
      console.log(`  Checking OTT availability for: ${film.title}`);

      try {
        const ott = {};
        ott.sonyLiv = await checkSonyLiv(film.title);
        await delay(500, 1000);
        ott.zee5 = await checkZee5(film.title);
        await delay(500, 1000);
        ott.netflix = await checkNetflix(film.title);
        await delay(500, 1000);
        ott.primeVideo = await checkPrimeVideo(film.title);

        // Update Firestore
        await mergeMovie(doc.id, {
          ott,
          lastOttUpdate: admin.firestore.Timestamp.now(),
        });

        console.log(`    ✓ OTT data updated: ${JSON.stringify(ott)}`);
      } catch (err) {
        console.warn(`    ! Error checking OTT for ${film.title}: ${err.message}`);
      }

      await delay(1000, 2000);
    }
  } catch (err) {
    console.error("[OTT Crawler] Error:", err);
    throw err;
  }

  console.log("[OTT Crawler] Finished");
}

module.exports = runOttCrawler;

const axios = require("axios");
const cheerio = require("cheerio");
const { delay } = require("../lib/delay");
const { batchMergeMovies } = require("../lib/merge");

// Scrape Malayalam films for a given year from Wikipedia
async function scrapeYear(year) {
  const url = `https://en.wikipedia.org/wiki/List_of_Malayalam_films_of_${year}`;
  console.log(` Scraping Wikipedia ${year}: ${url}`);
  let html;
  try {
    const res = await axios.get(url, {
      headers: {
        // Identify ourselves politely — Wikipedia requires a valid User-Agent
        "User-Agent":
          "MovieCC-Bot/1.0 (community Malayalam movie app; contact via GitHub)",
      },
      timeout: 15000,
    });
    html = res.data;
  } catch (err) {
    console.warn(` Could not fetch ${year}: ${err.message}`);
    return [];
  }
  const $ = cheerio.load(html);
  const movies = [];
  // Wikipedia film tables have class 'wikitable'
  // Each row (tr) is one film
  $("table.wikitable tbody tr").each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return; // skip header rows

    // Parse: [Title] [Year] [Director] [Notes]
    const titleCell = cells.eq(0).text().trim();
    const yearCell = cells.eq(1).text().trim();
    if (!titleCell) return;

    movies.push({
      title: titleCell,
      year: parseInt(yearCell) || year,
      source: "Wikipedia",
    });
  });

  console.log(` Found ${movies.length} films for ${year}`);
  return movies;
}

async function runWikipediaCrawler() {
  const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
  console.log("[Wikipedia Crawler] Starting...");

  const allMovies = [];
  for (const year of YEARS) {
    const movies = await scrapeYear(year);
    allMovies.push(...movies);
    await delay(2000, 4000); // Be respectful to Wikipedia's servers
  }

  if (allMovies.length > 0) {
    await batchMergeMovies(allMovies);
  }

  console.log("[Wikipedia Crawler] Finished");
}

module.exports = runWikipediaCrawler;

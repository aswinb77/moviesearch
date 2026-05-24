const puppeteer = require("puppeteer");
const { delay } = require("../lib/delay");
const { db, admin } = require("../lib/firebase");

// Kerala cities to check — BookMyShow URL slugs
const CITIES = [
  { name: "Kochi", slug: "kochi" },
  { name: "Thiruvananthapuram", slug: "thiruvananthapuram" },
  { name: "Kottayam", slug: "kottayam" },
  { name: "Kozhikode", slug: "kozhikode" },
];

const MALAYALAM_KEYWORDS = ["Malayalam"];

// Scrape current theatre listings from BookMyShow for a city
async function scrapeCity(browser, city) {
  console.log(`  Scraping ${city.name}...`);
  let page;
  try {
    page = await browser.newPage();
    await page.goto(
      `https://in.bookmyshow.com/explore/home/${city.slug}`,
      { waitUntil: "networkidle2", timeout: 20000 },
    );

    // Wait for movie cards to load
    await page.waitForSelector(".movieCardImg, [class*='movieCard']", {
      timeout: 10000,
    });

    // Extract movie titles
    const movies = await page.evaluate(() => {
      const titles = [];
      document.querySelectorAll(".movieCardImg, [class*='movieCard']").forEach((el) => {
        const title = el.getAttribute("alt") || el.getAttribute("title") || el.textContent;
        if (title) titles.push(title.trim());
      });
      return [...new Set(titles)]; // Deduplicate
    });

    // Filter for Malayalam films
    const malayalamMovies = movies.filter((title) =>
      MALAYALAM_KEYWORDS.some((kw) => title.toLowerCase().includes(kw.toLowerCase())),
    );

    console.log(`    Found ${malayalamMovies.length} Malayalam films in ${city.name}`);

    // Update Firestore with theatre information
    for (const title of malayalamMovies) {
      const query = await db.collection("films").where("title", "==", title).limit(1).get();
      if (!query.empty) {
        const doc = query.docs[0];
        const theatres = doc.data().theatres || [];
        if (!theatres.includes(city.name)) {
          theatres.push(city.name);
          await doc.ref.update({
            theatres,
            lastTheatreUpdate: admin.firestore.Timestamp.now(),
          });
        }
      }
    }

    return malayalamMovies;
  } catch (err) {
    console.warn(`    Error scraping ${city.name}: ${err.message}`);
    return [];
  } finally {
    if (page) await page.close();
  }
}

async function runBookMyShowCrawler() {
  console.log("[BookMyShow Crawler] Starting...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const city of CITIES) {
      await scrapeCity(browser, city);
      await delay(2000, 4000);
    }
  } catch (err) {
    console.error("[BookMyShow Crawler] Error:", err);
    throw err;
  } finally {
    await browser.close();
  }

  console.log("[BookMyShow Crawler] Finished");
}

module.exports = runBookMyShowCrawler;

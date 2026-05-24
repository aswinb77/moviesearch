const { db } = require("./firebase");

// Merge a single movie into Firestore
// If it already exists (by title), update it; otherwise create new
async function mergeMovie(docId, updates) {
  if (!docId) {
    console.warn("  ! mergeMovie called without docId");
    return;
  }

  try {
    await db.collection("films").doc(docId).update(updates);
  } catch (err) {
    if (err.code === "not-found") {
      // Document doesn't exist, create it
      await db.collection("films").doc(docId).set(updates);
    } else {
      throw err;
    }
  }
}

// Batch merge multiple movies (from Wikipedia crawl, for example)
async function batchMergeMovies(movies) {
  console.log(` Batch merging ${movies.length} movies...`);

  const batch = db.batch();
  const BATCH_SIZE = 500; // Firestore batch limit

  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const chunk = movies.slice(i, i + BATCH_SIZE);

    for (const movie of chunk) {
      // Generate a document ID from title + year (for deduplication)
      const docId = `${movie.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")}_${movie.year}`;

      batch.set(
        db.collection("films").doc(docId),
        {
          title: movie.title,
          year: movie.year,
          source: movie.source,
          createdAt: new Date(),
          ...movie,
        },
        { merge: true },
      );
    }

    // Commit this batch
    await batch.commit();
  }

  console.log(` Batch merged successfully`);
}

module.exports = { mergeMovie, batchMergeMovies };

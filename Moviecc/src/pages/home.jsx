import MovieDetailsModal from "../MovieDetailsModal";
import MediaCarouselSection from "../MediaCarouselSection";
import Moviecard from "../moviecard";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { fetchPopularMovies, fetchTrendingMovies, fetchUpcomingMovies, fetchNowPlayingMovies, searchMovies } from "../service/api";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delaySearch = setTimeout(async () => {
        const results = await searchMovies(searchQuery);
        setSearchResults(results?.results || []);
      }, 500);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="hero-section">
        <h1 className="hero-title">Movies at your fingertips.</h1>
        <p className="hero-subtitle">
          Discover, search, and save your favorites instantly.
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies & shows..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <Search size={20} />
          </button>
        </div>
      </form>

      {searchResults ? (
        <div className="media-section">
          <h2 className="section-title">Search Results</h2>
          <div className="movie-list">
            {searchResults.map((item) => {
              const normalizedItem = {
                ...item,
                title: item.title || item.name,
                release_date: item.release_date || item.first_air_date,
                isTv: item.media_type === "tv"
              };
              return <Moviecard key={normalizedItem.id} movie={normalizedItem} onClick={setSelectedMovie} />;
            })}
          </div>
        </div>
      ) : (
        <>
          <MediaCarouselSection title="In Theaters" fetchFunc={fetchNowPlayingMovies} onMovieClick={setSelectedMovie} isTv={false} tag="🎟️ Theaters" />
          <MediaCarouselSection title="Trending Movies" fetchFunc={fetchTrendingMovies} onMovieClick={setSelectedMovie} isTv={false} tag="Trending" />
          <MediaCarouselSection title="Popular Movies" fetchFunc={fetchPopularMovies} onMovieClick={setSelectedMovie} isTv={false} tag="Hot" />
          <MediaCarouselSection title="Upcoming" fetchFunc={fetchUpcomingMovies} onMovieClick={setSelectedMovie} isTv={false} tag="Upcoming" />
        </>
      )}

      <MovieDetailsModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  );
}

export default Home;

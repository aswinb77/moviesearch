import MovieDetailsModal from "../MovieDetailsModal";
import MediaCarouselSection from "../MediaCarouselSection";
import { useState } from "react";
import { fetchPopularTv, fetchTopRatedTv } from "../service/api";

function TvShows() {
  const [selectedShow, setSelectedShow] = useState(null);

  return (
    <>
      <div className="hero-section">
        <h1 className="hero-title">TV Shows & Originals.</h1>
        <p className="hero-subtitle">
          Binge your favorite series and discover new originals.
        </p>
      </div>

      <MediaCarouselSection title="Popular Shows" fetchFunc={fetchPopularTv} onMovieClick={setSelectedShow} isTv={true} tag="Hot" />
      <MediaCarouselSection title="Top Rated TV" fetchFunc={fetchTopRatedTv} onMovieClick={setSelectedShow} isTv={true} tag="Top Rated" />
      
      <MovieDetailsModal movie={selectedShow} onClose={() => setSelectedShow(null)} />
    </>
  );
}

export default TvShows;

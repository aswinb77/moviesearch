import { useState } from "react";
import { Heart, CalendarDays, Play } from "lucide-react";

function Moviecard({ movie, onClick, tag }) {
  const [isFav, setIsFav] = useState(false);

  function toggleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
  }

  const bgImage = movie.poster_url
    ? `https://image.tmdb.org/t/p/w500${movie.poster_url}`
    : "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300";

  return (
    <div className="moviecard" style={{ backgroundImage: `url(${bgImage})` }} onClick={() => onClick && onClick(movie)}>
      {tag && <div className="card-tag">{tag}</div>}
      <div className="play-overlay">
        <Play fill="#fff" size={32} />
      </div>
      <button
        className={`fav-btn ${isFav ? "active" : ""}`}
        onClick={toggleFav}
      >
        <Heart
          size={20}
          fill={isFav ? "var(--accent)" : "transparent"}
          color={isFav ? "var(--accent)" : "white"}
        />
      </button>

      <div className="movie-info">
        <h1>{movie.title}</h1>
        <div className="movie-stats">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ backgroundColor: "#f5c518", color: "#000", fontWeight: "800", fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px" }}>IMDb</span>
            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
          <span>
            <CalendarDays size={16} /> {movie.release_date ? movie.release_date.substring(0, 4) : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Moviecard;

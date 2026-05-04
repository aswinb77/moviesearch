import { X, CalendarDays, Tv, Play, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMovieDetailsFull, fetchTvDetailsFull } from "./service/api";
import { useRegion } from "./RegionContext";

function MovieDetailsModal({ movie, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { region } = useRegion();

  useEffect(() => {
    if (!movie) return;
    
    setLoading(true);
    setShowTrailer(false);
    const getDetails = async () => {
      const isTvShow = movie.isTv || movie.first_air_date;
      const data = isTvShow 
        ? await fetchTvDetailsFull(movie.id) 
        : await fetchMovieDetailsFull(movie.id);
      
      setDetails({ ...data, isTv: isTvShow });
      setLoading(false);
    };
    getDetails();
  }, [movie]);

  if (!movie) return null;

  const bgImage = movie.poster_url
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_url}`
    : movie.poster_url
    ? `https://image.tmdb.org/t/p/w500${movie.poster_url}`
    : "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1280";

  const rtScore = movie.vote_average ? Math.round(movie.vote_average * 10) : "N/A";
  const title = movie.title || movie.name;
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : movie.first_air_date ? movie.first_air_date.substring(0, 4) : "Unknown";
  
  let trailerKey = null;
  if (details?.videos?.results) {
    const trailer = details.videos.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
    if (trailer) trailerKey = trailer.key;
  }

  // Use dynamic region context for providers
  const providers = details?.["watch/providers"]?.results?.[region];
  const flatrate = providers?.flatrate || [];
  const buyRent = [...(providers?.buy || []), ...(providers?.rent || [])];

  // Theaters Logic: If it's a movie and release date is within last 60 days
  let inTheaters = false;
  if (movie.release_date && !details?.isTv) {
    const releaseDate = new Date(movie.release_date);
    const today = new Date();
    const diffTime = Math.abs(today - releaseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 60 && diffDays >= 0) {
      inTheaters = true;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} color="#1d1d1f" />
        </button>
        
        {showTrailer && trailerKey ? (
          <div className="trailer-container">
            <iframe
              width="100%"
              height="280"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="modal-banner" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="modal-banner-gradient"></div>
            {trailerKey && (
              <button className="banner-play-btn" onClick={() => setShowTrailer(true)}>
                <Play fill="#fff" size={24} /> Play Trailer
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body scrollable">
          <h2 className="modal-title">{title}</h2>
          
          <div className="modal-stats">
            <div className="badge-container">
               <span className="imdb-badge">IMDb</span> 
               <span className="badge-text">{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
            </div>
            <div className="badge-container">
               <span className="rt-badge">🍅</span> 
               <span className="badge-text">{rtScore}%</span>
            </div>
            <span>
              <CalendarDays size={16} /> {releaseYear}
            </span>
            {details?.isTv && details?.number_of_episodes && (
              <span>
                <Tv size={16} /> {details.number_of_episodes} Episodes
              </span>
            )}
          </div>

          {loading ? (
            <p className="loading-text">Loading deep details...</p>
          ) : (
            <>
              {details?.genres && (
                <div className="modal-genres">
                  {details.genres.map(g => (
                    <span key={g.id} className="genre-pill">{g.name}</span>
                  ))}
                </div>
              )}

              {/* Watch Providers & Theaters Section */}
              {(flatrate.length > 0 || buyRent.length > 0 || inTheaters) && (
                <div className="providers-section">
                  <h4>Where to Watch ({region})</h4>
                  <div className="provider-logos">
                    {inTheaters && (
                      <span className="theater-alert">
                        <Ticket size={18} /> In Theaters
                      </span>
                    )}
                    {flatrate.slice(0, 4).map(provider => (
                      <img 
                        key={provider.provider_id} 
                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`} 
                        alt={provider.provider_name} 
                        title={`Streaming on ${provider.provider_name}`}
                      />
                    ))}
                    {flatrate.length === 0 && buyRent.length > 0 && (
                      <span className="rent-tag">Available to Rent/Buy</span>
                    )}
                  </div>
                </div>
              )}

              <p className="modal-overview">
                {movie.overview || "No overview available."}
              </p>

              {details?.credits?.cast && details.credits.cast.length > 0 && (
                <div className="modal-section">
                  <h3>Top Cast</h3>
                  <div className="cast-list">
                    {details.credits.cast.slice(0, 5).map(actor => (
                      <div key={actor.id} className="cast-card">
                        {actor.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} />
                        ) : (
                          <div className="cast-placeholder"></div>
                        )}
                        <p>{actor.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsModal;

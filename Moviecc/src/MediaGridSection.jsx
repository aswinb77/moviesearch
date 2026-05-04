import { useEffect, useState } from "react";
import Moviecard from "./moviecard";

function MediaGridSection({ title, fetchFunc, onMovieClick, isTv }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchFunc();
      if (data?.results) {
        // Limit to 20 or 25 depending on api, TMDB defaults to 20.
        setItems(data.results);
      }
      setLoading(false);
    };
    getData();
  }, [fetchFunc]);

  if (loading) {
    return (
      <div className="media-section">
        <h2 className="section-title">{title}</h2>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="media-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-list">
        {items.map((item) => {
          const normalizedItem = {
            ...item,
            title: item.title || item.name,
            release_date: item.release_date || item.first_air_date,
            isTv: isTv,
          };
          return (
            <Moviecard
              key={normalizedItem.id}
              movie={normalizedItem}
              onClick={onMovieClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export default MediaGridSection;

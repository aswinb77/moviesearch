import { useEffect, useState } from "react";
import Moviecard from "./moviecard";

function MediaCarouselSection({ title, fetchFunc, onMovieClick, isTv, tag }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchFunc();
      if (data?.results) {
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
      <div className="carousel-container">
        {items.map((item) => {
          const normalizedItem = {
            ...item,
            title: item.title || item.name,
            release_date: item.release_date || item.first_air_date,
            isTv: isTv
          };
          return (
            <div className="carousel-item" key={normalizedItem.id}>
               <Moviecard movie={normalizedItem} onClick={onMovieClick} tag={tag} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MediaCarouselSection;

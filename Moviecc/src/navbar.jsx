import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { useRegion } from "./RegionContext";

function Navbar() {
  const { region, setRegion } = useRegion();
  return (
    <nav>
      <div className="nav-content">
        <Link to="/" className="logo-link">
          <Film size={20} className="logo-icon" />
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Movies</Link></li>
          <li><Link to="/tvshows">TV Shows</Link></li>
          <li><Link to="/">Originals</Link></li>
          <li><Link to="/fav">Favorites</Link></li>
          <li>
            <select className="region-select" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="US">🇺🇸 US</option>
              <option value="IN">🇮🇳 IN</option>
              <option value="GB">🇬🇧 UK</option>
              <option value="CA">🇨🇦 CA</option>
              <option value="AU">🇦🇺 AU</option>
            </select>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import Fav from "./pages/fav";
import Navbar from "./navbar";
import TvShows from "./pages/tvshows";
import { RegionProvider } from "./RegionContext";
function App() {
  return (
    <RegionProvider>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tvshows" element={<TvShows />} />
          <Route path="/fav" element={<Fav />} />
        </Routes>
      </main>
    </RegionProvider>
  );
}

export default App;

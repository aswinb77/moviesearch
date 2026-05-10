# Movie Search App

A full-stack web application for discovering and exploring movies and TV shows. Built with React on the frontend and Node.js/Express on the backend, featuring a comprehensive database of media content.

## Features

- **Search Functionality**: Search for movies and TV shows by title
- **Browse Categories**: Explore popular, trending, upcoming, and now playing movies
- **TV Shows**: Discover popular and top-rated TV series
- **Detailed Information**: View cast, videos, and watch providers for each title
- **Favorites**: Save your favorite movies and shows
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Lucide React (icons)
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Axios for API calls
- CORS support

## Project Structure

```
Moviecc/          # Frontend React application
Moviecc-Server/   # Backend Node.js server
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- TMDB API key (for scraping)

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd Moviecc-Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB URI:
   ```
   MONGO_URI=mongodb://localhost:27017/movieapp
   ```

4. Run the scraper to populate the database:
   ```bash
   npm run scrape
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Moviecc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set the API base URL in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   Or use the deployed API: `https://moviesearch-api-fkdv.onrender.com/api`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Browse movies and TV shows in different categories
3. Use the search bar to find specific titles
4. Click on any movie/TV show card to view details
5. Add favorites by clicking the heart icon

## API Endpoints

- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/upcoming` - Get upcoming movies
- `GET /api/movies/now_playing` - Get now playing movies
- `GET /api/tv/popular` - Get popular TV shows
- `GET /api/tv/top_rated` - Get top-rated TV shows
- `GET /api/details/:id` - Get detailed information for a specific movie/TV show

## Deployment

### Frontend
The frontend can be deployed to Vercel, Netlify, or any static hosting service.

### Backend
The backend is deployed on Render. Update the `VITE_API_BASE_URL` in the frontend accordingly.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.
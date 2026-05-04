const BASE_URL = "http://localhost:8080/api";

export const fetchPopularMovies = async () => {
    const url = `${BASE_URL}/movies/popular`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchUpcomingMovies = async () => {
    const url = `${BASE_URL}/movies/upcoming`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchTrendingMovies = async () => {
    const url = `${BASE_URL}/movies/trending`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchNowPlayingMovies = async () => {
    const url = `${BASE_URL}/movies/now_playing`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchMovieDetailsFull = async (id) => {
    const url = `${BASE_URL}/details/${id}`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchPopularTv = async () => {
    const url = `${BASE_URL}/tv/popular`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchTopRatedTv = async () => {
    const url = `${BASE_URL}/tv/top_rated`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const fetchTvDetailsFull = async (id) => {
    const url = `${BASE_URL}/details/${id}`; // Reusing details endpoint as it handles both
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}

export const searchMovies = async (query) => {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
    try{ const response = await fetch(url); return response.json(); } catch(error){ console.log(error); }
}
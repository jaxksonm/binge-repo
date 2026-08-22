import { useState } from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function getRandomMovieId() {
  const page = Math.floor(Math.random() * 10) + 1;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  const movie = data.results[Math.floor(Math.random() * data.results.length)];
  return movie.id;
}

async function getMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

async function getMovie() {
  const movieId = await getRandomMovieId();
  const details = await getMovieDetails(movieId);

  return {
    title: details.title,
    overview: details.overview,
    runtime: details.runtime,
    genres: details.genres.map((g) => g.name),
    posterUrl: details.poster_path
      ? `${POSTER_BASE_URL}${details.poster_path}`
      : null,
  };
}

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await getMovie();
      setMovie(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Random Movie</h1>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Loading..." : "Get Random Movie"}
      </button>

      {movie && (
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <h2>{movie.title}</h2>
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%" }} />
          )}
          <p><strong>Genres:</strong> {movie.genres.join(", ")}</p>
          <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
          <p><strong>Overview:</strong> {movie.overview}</p>
        </div>
      )}
    </div>
  );
}

export default App;

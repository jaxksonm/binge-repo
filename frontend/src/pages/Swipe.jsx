import { useState } from "react";
import { supabase } from "../lib/supabase";

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
    id: details.id,
    title: details.title,
    overview: details.overview,
    runtime: details.runtime,
    genres: details.genres.map((g) => g.name),
    genre_ids: details.genres.map((g) => g.id),
    posterUrl: details.poster_path
      ? `${POSTER_BASE_URL}${details.poster_path}`
      : null,
  };
}

async function handleLikeMovie(movie) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user found:", userError);
    return false;         
  }

  const { error } = await supabase.from("swipes").insert({
    profile_id: user.id,
    movie_id: movie.id,
    genre_ids: movie.genre_ids,
    liked: true,
  });

  if (error) {
    console.error("Error saving like:", error);
    return false;          
  }

  console.log("Liked:", movie.title);
  return true;              // ← add this
}

function handleDislikeMovie(movie) {
 
  console.log("Disliked:", movie.title);
}

function ThumbUpIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h.66a2.5 2.5 0 0 1 2.34 3.38Z" />
    </svg>
  );
}

function ThumbDownIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h-.66a2.5 2.5 0 0 1-2.34-3.38Z" />
    </svg>
  );
}

export default function Swipe() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); 

  const handleClick = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await getMovie();
      setMovie(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLike = async () => {
  const success = await handleLikeMovie(movie);
  if (success) setFeedback("liked");
};

  const onDislike = () => {
    handleDislikeMovie(movie);
    setFeedback("disliked");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Random Movie</h1>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            backgroundColor: "transparent",
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
            color: "#666",
          }}
        >
          Sign out
        </button>
      </div>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: 15,
          fontWeight: 600,
          backgroundColor: "#111",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {loading ? "Loading..." : "Get Random Movie"}
      </button>

      {movie && (
        <div
          style={{
            marginTop: 28,
            textAlign: "left",
            backgroundColor: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ width: "100%", display: "block" }}
            />
          )}

          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>{movie.title}</h2>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={onLike}
                  aria-label="Like this movie"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: feedback === "liked" ? "none" : "1px solid #ddd",
                    backgroundColor: feedback === "liked" ? "#22c55e" : "#fff",
                    color: feedback === "liked" ? "#fff" : "#555",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ThumbUpIcon filled={feedback === "liked"} />
                </button>

                <button
                  onClick={onDislike}
                  aria-label="Dislike this movie"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: feedback === "disliked" ? "none" : "1px solid #ddd",
                    backgroundColor: feedback === "disliked" ? "#ef4444" : "#fff",
                    color: feedback === "disliked" ? "#fff" : "#555",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ThumbDownIcon filled={feedback === "disliked"} />
                </button>
              </div>
            </div>

            <p style={{ margin: "12px 0 4px", color: "#666", fontSize: 14 }}>
              <strong style={{ color: "#111" }}>{movie.genres.join(", ")}</strong>
              {" · "}
              {movie.runtime} min
            </p>

            <p style={{ marginTop: 12, lineHeight: 1.5, color: "#333" }}>
              {movie.overview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

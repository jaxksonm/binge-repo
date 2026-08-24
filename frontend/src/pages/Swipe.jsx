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
  return true;
}

async function handleDislikeMovie(movie) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user found:", userError);
    return false;
  }

  const { error } = await supabase.from("swipes").insert({
    profile_id: user.id,
    movie_id: movie.id,
    genre_ids: movie.genre_ids,
    liked: false,
  });

  if (error) {
    console.error("Error saving dislike:", error);
    return false;
  }

  console.log("Disliked:", movie.title);
  return true;
}

async function handleUnswipeMovie(movie) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user found:", userError);
    return false;
  }

  const { error } = await supabase
    .from("swipes")
    .delete()
    .eq("profile_id", user.id)
    .eq("movie_id", movie.id);

  if (error) {
    console.error("Error removing swipe:", error);
    return false;
  }

  console.log("Unswiped:", movie.title);
  return true;
}

function ThumbUpIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h.66a2.5 2.5 0 0 1 2.34 3.38Z" />
    </svg>
  );
}

function ThumbDownIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h-.66a2.5 2.5 0 0 1-2.34-3.38Z" />
    </svg>
  );
}

export default function Swipe({ onSwitchToLikes }) {
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
    if (feedback === "liked") {
      const success = await handleUnswipeMovie(movie);
      if (success) setFeedback(null);
      return;
    }
    if (feedback === "disliked") {
      await handleUnswipeMovie(movie);
    }
    const success = await handleLikeMovie(movie);
    if (success) setFeedback("liked");
  };

  const onDislike = async () => {
    if (feedback === "disliked") {
      const success = await handleUnswipeMovie(movie);
      if (success) setFeedback(null);
      return;
    }
    if (feedback === "liked") {
      await handleUnswipeMovie(movie);
    }
    const success = await handleDislikeMovie(movie);
    if (success) setFeedback("disliked");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px 24px 60px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: 26, margin: 0 }}>Random Movie</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onSwitchToLikes}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              backgroundColor: "transparent",
              border: "1px solid #444",
              borderRadius: 8,
              cursor: "pointer",
              color: "#ccc",
            }}
          >
            My Likes
          </button>
          <button
            onClick={handleSignOut}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              backgroundColor: "transparent",
              border: "1px solid #444",
              borderRadius: 8,
              cursor: "pointer",
              color: "#ccc",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            backgroundColor: "#fff",
            color: "#111",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          {loading ? "Loading..." : "Get Random Movie"}
        </button>
      </div>

      {movie && (
        <div>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={{ width: "100%", display: "block" }}
              />
            )}

            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 8,
              }}
            >
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
                  border: "none",
                  backgroundColor: feedback === "liked" ? "#22c55e" : "rgba(20,20,20,0.6)",
                  color: "#fff",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
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
                  border: "none",
                  backgroundColor: feedback === "disliked" ? "#ef4444" : "rgba(20,20,20,0.6)",
                  color: "#fff",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.15s ease",
                }}
              >
                <ThumbDownIcon filled={feedback === "disliked"} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: "left" }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{movie.title}</h2>

            <p style={{ margin: "10px 0 0", color: "#999", fontSize: 14 }}>
              <strong style={{ color: "#eee" }}>{movie.genres.join(", ")}</strong>
              {" · "}
              {movie.runtime} min
            </p>

            <p style={{ marginTop: 14, lineHeight: 1.6, color: "#ccc", fontSize: 15 }}>
              {movie.overview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
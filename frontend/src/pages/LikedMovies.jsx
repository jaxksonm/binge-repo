import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function getMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default function LikedMovies({ onSwitchToSwipe }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLikedMovies() {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to be logged in to see your liked movies.");
        setLoading(false);
        return;
      }

      const { data: swipes, error: swipesError } = await supabase
        .from("swipes")
        .select("movie_id")
        .eq("profile_id", user.id)
        .eq("liked", true)
        .order("created_at", { ascending: false });

      if (swipesError) {
        setError(swipesError.message);
        setLoading(false);
        return;
      }

      if (!swipes || swipes.length === 0) {
        if (!cancelled) {
          setMovies([]);
          setLoading(false);
        }
        return;
      }

      const details = await Promise.all(
        swipes.map((s) => getMovieDetails(s.movie_id))
      );

      if (!cancelled) {
        setMovies(details.filter(Boolean));
        setLoading(false);
      }
    }

    loadLikedMovies();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUnlike = async (movieId) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return;

    const { error } = await supabase
      .from("swipes")
      .delete()
      .eq("profile_id", user.id)
      .eq("movie_id", movieId)
      .eq("liked", true);

    if (error) {
      console.error("Error unliking movie:", error);
      return;
    }

    setMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Liked Movies</h1>
        <button
          onClick={onSwitchToSwipe}
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
          Back to Swipe
        </button>
      </div>

      {loading && <p style={{ color: "#666" }}>Loading your liked movies...</p>}

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p style={{ color: "#666" }}>You haven't liked any movies yet.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 20,
          }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              style={{
                backgroundColor: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {movie.poster_path ? (
                <img
                  src={`${POSTER_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: "100%", display: "block", aspectRatio: "2/3", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "2/3",
                    backgroundColor: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  No poster
                </div>
              )}
              <div style={{ padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>
                  {movie.title}
                </p>
                {movie.release_date && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
                    {movie.release_date.slice(0, 4)}
                  </p>
                )}
                <button
                  onClick={() => handleUnlike(movie.id)}
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "6px 0",
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: "transparent",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  Unlike
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
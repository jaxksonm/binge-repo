import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LogIn({ onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // If successful, App.jsx's onAuthStateChange listener will automatically
    // detect the new session and switch to the Swipe screen.
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Welcome back</h1>
      <p style={{ color: "#666", marginBottom: 28 }}>MovieMatch</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 14, color: "#666" }}>
        Don't have an account?{" "}
        <button onClick={onSwitchToSignUp} style={linkButtonStyle}>
          Sign up
        </button>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: 400,
  margin: "60px auto",
  padding: "0 24px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111",
};

const inputStyle = {
  padding: "10px 12px",
  fontSize: 15,
  border: "1px solid #ddd",
  borderRadius: 8,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = (loading) => ({
  padding: "12px",
  fontSize: 15,
  fontWeight: 600,
  backgroundColor: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: loading ? "default" : "pointer",
  opacity: loading ? 0.6 : 1,
  transition: "opacity 0.15s ease",
});

const linkButtonStyle = {
  background: "none",
  border: "none",
  color: "#111",
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  fontSize: 14,
  textDecoration: "underline",
};

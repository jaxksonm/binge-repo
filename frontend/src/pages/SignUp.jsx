import { useState } from "react";
import { supabase } from "../lib/supabase";

function generatePairCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function SignUp({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      pair_code: generatePairCode(),
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Create account</h1>
      <p style={{ color: "#666", marginBottom: 28 }}>MovieMatch</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            style={inputStyle}
          />
        </div>

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
            placeholder="At least 6 characters"
            required
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 14, color: "#666" }}>
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} style={linkButtonStyle}>
          Log in
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

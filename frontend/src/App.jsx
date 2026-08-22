import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Swipe from "./pages/Swipe";

export default function App() {
  // `session` is null when logged out, or a Supabase session object when logged in.
  // We use this to decide which screen to show.
  const [session, setSession] = useState(undefined); // undefined = "still checking"
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "signup"

  useEffect(() => {
    // Check if the user is already logged in when the app first loads.
    // Supabase stores the session in localStorage, so this works across page refreshes.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to login/logout events. Whenever the user signs in or out,
    // Supabase fires this callback and we update `session`, which triggers a re-render.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // This cleanup function runs when App unmounts — it stops the listener
    // so we don't have a memory leak.
    return () => subscription.unsubscribe();
  }, []); // The empty [] means "run this effect only once, when the app first mounts"

  // Still waiting on the initial session check — show nothing to avoid a flash
  if (session === undefined) return null;

  // Logged in — show the swipe screen
  if (session) return <Swipe />;

  // Logged out — show sign up or log in based on which the user picked
  if (authScreen === "signup") {
    return <SignUp onSwitchToLogin={() => setAuthScreen("login")} />;
  }

  return <LogIn onSwitchToSignUp={() => setAuthScreen("signup")} />;
}

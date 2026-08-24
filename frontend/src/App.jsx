import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Swipe from "./pages/Swipe";
import LikedMovies from "./pages/LikedMovies";

export default function App() {

  const [session, setSession] = useState(undefined);
  const [authScreen, setAuthScreen] = useState("login");
  const [view, setView] = useState("swipe");

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (session) {
    if (view === "likes") {
      return <LikedMovies onSwitchToSwipe={() => setView("swipe")} />;
    }
    return <Swipe onSwitchToLikes={() => setView("likes")} />;
  }

  if (authScreen === "signup") {
    return <SignUp onSwitchToLogin={() => setAuthScreen("login")} />;
  }

  return <LogIn onSwitchToSignUp={() => setAuthScreen("signup")} />;
}
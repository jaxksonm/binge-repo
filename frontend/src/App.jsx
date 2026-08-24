import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Swipe from "./pages/Swipe";

export default function App() {
 
  const [session, setSession] = useState(undefined);
  const [authScreen, setAuthScreen] = useState("login"); 

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

  if (session) return <Swipe />;

  if (authScreen === "signup") {
    return <SignUp onSwitchToLogin={() => setAuthScreen("login")} />;
  }

  return <LogIn onSwitchToSignUp={() => setAuthScreen("signup")} />;
}

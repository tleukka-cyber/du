import { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Shell from "./components/Shell";

export default function App() {
  const [authed, setAuthed] = useState(false);

  if (!authed) return <AuthScreen onLogin={() => setAuthed(true)} />;
  return <Shell onLogout={() => setAuthed(false)} />;
}

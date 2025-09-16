import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // create async function inside useEffect
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        setError(error);
      } else {
        setProfiles(data);
      }
    };

    fetchProfiles();
  }, []);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Profiles</h1>
      <pre>{JSON.stringify(profiles, null, 2)}</pre>
    </div>
  );
}

export default App;

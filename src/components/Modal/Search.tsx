import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";

export default function Search({ setResults }: { setResults: any }) {
  const [query, setQuery] = useState<string>();

  const searchQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/search?u=${searchQuery}&page=1`,
        );
        setResults(request.data.users);
      } catch (error) {
        console.log("Failed fetch user: ", error);
      }
    };
    fetch();
  }, [searchQuery]);

  
  return (
    <form className="Search_Form">
      <label id="search_label" htmlFor="search_input">
        Search
      </label>
      <input type="text" id="search_input" placeholder="Search..." onChange={(e) => setQuery(e.target.value)}/>
      <button id="search_btn" aria-label="Search" type="submit">
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
    </form>
  );
}

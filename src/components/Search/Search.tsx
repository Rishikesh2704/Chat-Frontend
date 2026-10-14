import './Search.css'
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch } from "../../redux/hooks";
import { setSearchResults } from "../../redux/Modal/ModalSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useSearchMutation } from '../../redux/Modal/modalQuerySlice';

export const Search = () => {
  const [query, setQuery] = useState<string>();
  const dispatch = useAppDispatch();

  const [ search ] = useSearchMutation();

  const searchQuery = useDebounce(query, 500);
  if(searchQuery == "") dispatch(setSearchResults([]));
  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        // const request = await axios.get(
        //   `${import.meta.env.VITE_API}/search?u=${searchQuery}&page=1`,
        // );
        const request = await search(searchQuery).unwrap();
        dispatch(setSearchResults(request.users));
      } catch (error) {
        console.log("Failed fetch user: ", error);
      }
    };
    fetch();
  }, [searchQuery]);

  return (
    <div className="Search_Users">
      <form className="Search_Form">
        <label id="search_label" htmlFor="search_input">
          Search
        </label>
        <input
          type="text"
          id="search_input"
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button id="search_btn" aria-label="Search" type="submit">
          {/* <i className="fa-solid fa-magnifying-glass"></i> */}
          <FontAwesomeIcon icon={faMagnifyingGlass}/>
        </button>
      </form>
    </div>
  );
};

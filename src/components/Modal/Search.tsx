import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";

type propsType = {
  // setResults: any;
  setViewSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Search(props: propsType) {
  const {  setViewSearchModal } = props;
  const [query, setQuery] = useState<string>();

  const searchQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/search?u=${searchQuery}&page=1`,
        );
        // setResults(request.data.users);
      } catch (error) {
        console.log("Failed fetch user: ", error);
      }
    };
    fetch();
  }, [searchQuery]);

  const handleCloseModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const element = e.target as HTMLDivElement;
    if (element.classList.contains("Modal_Background")) {
      setViewSearchModal(false);
      document.getElementsByTagName("main")[0].style.alignItems = "center";
    }
  };

  return (
    <div className="Modal_Background" onClick={handleCloseModal}>
      <div className="Modal_Box">
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
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
         {/* <div className="Search_Results">
            {Results &&
              searchResults.map((user: any) => {
                if (Object.hasOwn(user, "roomId")) return;
                return (
                  <div
                    key={user._id}
                    className="User_Wrapper"
                    onClick={(e) => handleClick(e, user)}
                  >
                    <figure>
                      <div className="profile_picture">
                        <img src={user.profile} />
                      </div>
                      <div
                      // className={`${Object.keys(onlineUsers).includes(user._id) ? "online" : ""}`}
                      ></div>
                    </figure>
                    <div className="User_Details">
                      <h2>{user.username}</h2>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>*/}
      </div>   
    </div>
  );
}

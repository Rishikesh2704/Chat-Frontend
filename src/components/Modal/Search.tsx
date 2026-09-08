import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSearchResults, setViewSearchModal } from "../../redux/Slicers/ModalSlice";

export const Search = () => {
  const [query, setQuery] = useState<string>();
  const { searchResults } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const searchQuery = useDebounce(query, 500);

  const [selected, setSelected] = useState<User[]>([]);

  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/search?u=${searchQuery}&page=1`,
        );
        dispatch(setSearchResults(request.data.users));
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
      dispatch(setViewSearchModal(false));
      document.getElementsByTagName("main")[0].style.alignItems = "center";
    }
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    const selectedMember = e.currentTarget;
    const isSelected = selected?.find((users) => users._id == user._id);
    if (isSelected) {
      const afterRemovingGroupMember = selected?.filter(
        (users) => users._id != user._id,
      );
      selectedMember.style.backgroundColor = "white";

      if (afterRemovingGroupMember) {
        setSelected(afterRemovingGroupMember);
      }
    } else {
      selectedMember.style.backgroundColor = "#ff6a0d";
      setSelected((prev: any) => [...prev, user]);
    }
    console.log();
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
        {/* <div className="Search_Selected">
          <h4>Selected</h4>
          
        </div> */}
        <div className="Search_Results">
          {selected &&
            selected.map((user: any) => {
              if (Object.hasOwn(user, "roomId")) return;
              return (
                <div
                  key={user._id}
                  className="Selecetd_User_Wrapper"
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
          {searchResults &&
            searchResults.filter((users:User) => !selected.map(user => user._id).includes(users._id)).map((user: any) => {
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
      </div>
    </div>
  );
}

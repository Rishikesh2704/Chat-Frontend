import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setViewSearchModal } from "../../redux/Slicers/ModalSlice";

export const AddMembersModal = () => {
  const { selectedUser } = useAppSelector((state) => state.chat);
  const [query, setQuery] = useState<string>();
  const [searchResults, setSearchResults] = useState([]);

  const searchQuery = useDebounce(query, 500);
  const [selected, setSelected] = useState<User[]>([]);

  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/search?u=${searchQuery}&page=1`,
        );
        setSearchResults(request.data.users);
      } catch (error) {
        console.log("Failed fetch user: ", error);
      }
    };
    fetch();
  }, [searchQuery]);

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

  const handleAddMember = async () => {
    const selectedIds = selected.map((u) => u._id)
    try {
      const response = await axios.put("/group/addMember", {
        groupId: selectedUser?._id,
        members: selectedIds,
      });
      console.log("Response : ", response);
    } catch (error) {
      console.log("Failed To Add Member: ", error);
    }
  };

  return (
    <>
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
          searchResults
            .filter(
              (users: User) =>
                !selected.map((user) => user._id).includes(users._id),
            )
            .map((user: any) => {
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
      <button onClick={handleAddMember}>Add Member</button>
    </>
  );
};

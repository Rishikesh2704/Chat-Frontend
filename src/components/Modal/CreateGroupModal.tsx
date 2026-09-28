import "./Modal.css";
import { useEffect, useState } from "react";

import axios from "../../lib/axios";

import { useDebounce } from "../../hooks/useDebounce";

export const CreateGroupModal = () => {
  const [groupName, setGroupName] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [query, setQuery] = useState<string>();
  const [selected, setSelected] = useState<User[]>([]);
  // const [groupMembers, setGroupMembers] = useState<Pick<User, "_id">[] | null>(
  //   [],
  // );
  const searchQuery = useDebounce(query, 500);

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

  const handleCreateGroup = async () => {
    try {
      const userId = JSON.parse(
        localStorage.getItem("Current_User") as string,
      )._id;
      const group = {
        groupName: groupName,
        selected,
        admin: userId,
      };
      const request = await axios.post(
        `${import.meta.env.VITE_API}/group/createGroup`,
        group,
      );
      console.log("Request", request);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
        <div className="GroupName">
          <label htmlFor="GroupName_Input" id="GroupName_Label">
            Group Name
          </label>
          <input
            id="GroupName_Input"
            type="text"
            maxLength={10}
            placeholder="Group Name"
            onChange={(e) => setGroupName(e.target.value)}
          />

        </div>
        <h1 className="Members_H1">Group Members</h1>
        <div className="GroupMembers">
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
        </div>
        <button
          className={`Create_Group_Button ${selected && selected.length > 0 ? "" : "disabled"}`}
          onClick={handleCreateGroup}
        >
          Create Group
        </button>
        </>
  );
};

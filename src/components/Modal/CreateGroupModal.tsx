import "./Modal.css";
import { useEffect, useState } from "react";

import { useDebounce } from "../../hooks/useDebounce";
import { useSearchMutation } from "../../redux/Modal/modalQuerySlice";
import { useCreateGroupMutation } from "../../redux/Group/groupQuerySlice";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faUser } from "@fortawesome/free-solid-svg-icons";

export const CreateGroupModal = () => {
  const [preview, setPreview] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [query, setQuery] = useState<string>();
  const [selected, setSelected] = useState<User[]>([]);

  const searchQuery = useDebounce(query, 500);

  const [createGroup] = useCreateGroupMutation();
  const [search, { isLoading }] = useSearchMutation();

  useEffect(() => {
    if (!searchQuery) return;
    const fetch = async () => {
      try {
        const request = await search(searchQuery).unwrap();
        setSearchResults(request.users);
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
      console.log("Selected: ", user);
      selectedMember.style.backgroundColor = "#ff6a0d";
      setSelected((prev: any) => [...prev, user]);
    }
  };

  const handleUploadFile = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const blob = URL.createObjectURL(e.target.files[0]);
      setPreview(blob);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const userId = JSON.parse(
        localStorage.getItem("Current_User") as string,
      )._id;
      const group = {
        groupName: groupName,
        members: selected,
        admin: userId,
      };
      console.log("Selected ", selected);
      const request = await toast.promise(createGroup(group).unwrap(), {
        pending: "Creating Group",
        success: "Created Group",
        error: "Failed to create Group",
      });
      console.log("Request", request);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="Group_Wrapper">
      <div className="Group_Details">
        <div className="Group_nameProfileWrapper">
          <div className="Group_Profile">
            {preview?(<img
              id="Group_ProfileImg"
              src={preview}
              alt=""
            ></img>):(
              <FontAwesomeIcon id="Group_ProfileIcon" icon={faUser}/>
            )
            }

            <label
              htmlFor="Group_ProfileUpload"
              className="Group_ProfileUploadBtn"
              aria-label="Upload Profile"
            >
              <FontAwesomeIcon icon={faCamera} />
              <input
                id="Group_ProfileUpload"
                type="file"
                onChange={(e) => handleUploadFile(e)}
              />
            </label>
          </div>
          <div className="GroupName">
            <label htmlFor="GroupName_Input" id="GroupName_Label">
              Group Name
            </label>
            <input
              id="GroupName_Input"
              type="text"
              maxLength={10}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>
        <div className="GroupMembers">
          <h1 className="GroupMembers_H1">Group Members</h1>
          <div className="GroupMembers_Selected">
            {selected.length > 0 ? (
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
                    </figure>
                    <div className="ModalUser_Details">
                      <h2>{user.username}</h2>
                      <div
                        // className={`${Object.keys(onlineUsers).includes(user._id) ? "online" : ""}`}
                        className="Modal_online"
                      >
                        online
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p id="GroupMembers_NoMembers">No members added</p>
            )}
          </div>
        </div>
      </div>

      <div className="MembersSelection">
        <h1 id="MemeberSelection_H1">Search Members</h1>
        <div className="Search_Users ModalSearch">
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
          {isLoading && <div className="blackloader"> </div>}
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
                    className="Modal_User_Wrapper"
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
                    <div className="ModalUser_Details">
                      <h2>{user.username}</h2>
                      <div
                        // className={`${Object.keys(onlineUsers).includes(user._id) ? "online" : ""}`}
                        className="Modal_online"
                      >
                        online
                      </div>
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
    </div>
  );
};

import { useState } from "react";
import "./Modal.css";
import { useUser } from "../../lib/context";
import axios from "../../lib/axios";

type props = {
  setViewModal: React.Dispatch<React.SetStateAction<boolean>>;
  Users: User[] | null;
};

export default function Modal(props: props) {
  const { onlineUsers } = useUser();
  const { setViewModal, Users } = props;
  const [groupName, setGroupName] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<Pick<User, "_id">[] | null>(
    [],
  );

  const handleCloseModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const element = e.target as HTMLDivElement;
    if (element.classList.contains("Modal_Background")) {
      setViewModal(false);
      document.getElementsByTagName("main")[0].style.alignItems = "center";
    }
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    const selectedMember = e.currentTarget;
    const isSelected = groupMembers?.find((users) => users._id == user._id);
    if (isSelected) {
      const afterRemovingGroupMember = groupMembers?.filter(
        (users) => users._id != user._id,
      );
      selectedMember.style.backgroundColor = "white";

      if (afterRemovingGroupMember) {
        setGroupMembers(afterRemovingGroupMember);
      }
    } else {
      selectedMember.style.backgroundColor = "#ff6a0d";
      setGroupMembers((prev: any) => [...prev, user._id]);
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
        groupMembers,
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
    <div className="Modal_Background" onClick={handleCloseModal}>
      <div className="Modal_Box">
        <div className="GroupName">
          <label htmlFor="name" id="GroupName_Label">
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
              <input type="text" id="search_input" placeholder="Search..." />
              <button id="search_btn" aria-label="Search" type="submit">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>
          <div className="Search_Results">
            {Users &&
              Users.map((user: any) => {
                console.log("Group Members", groupMembers);
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
          className={`Create_Group_Button ${groupMembers && groupMembers.length > 1 ? "" : "disabled"}`}
          onClick={handleCreateGroup}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import axios from "../../lib/axios";
import Search from "./Search";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [groupMembers, setGroupMembers] = useState<Pick<User, "_id">[] | null>(
    [],
  );
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
    <>
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
          {/* <Search setResults={setSearchResults} /> */}
        </div>
        <div className="Search_Results">
          {searchResults &&
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
      </div>
      <button
        className={`Create_Group_Button ${groupMembers && groupMembers.length > 0 ? "" : "disabled"}`}
        onClick={handleCreateGroup}
      >
        Create Group
      </button>
    </>
  );
}

import { useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import axios from "../../lib/axios";
import useGroupMembers from "../../hooks/useGroupMembers";

export const RemoveMemberModal = () => {
  const { selectedUser } = useAppSelector((state) => state.chat);
  const groupMembers = useGroupMembers();
  const [selected, setSelected] = useState<string[]>([]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    userId: string,
  ) => {
    const selectedMember = e.currentTarget;
    const isSelected = selected?.find((users) => users == userId);
    if (isSelected) {
      const afterRemovingGroupMember = selected?.filter(
        (users) => users != userId,
      );
      selectedMember.style.backgroundColor = "white";

      if (afterRemovingGroupMember) {
        setSelected(afterRemovingGroupMember);
      }
    } else {
      selectedMember.style.backgroundColor = "#ff6a0d";
      setSelected((prev: any) => [...prev, userId]);
    }
    console.log();
  };

  const handleRemoveMember = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API}/group/removeMember`,
        {
          groupId: selectedUser?._id,
          memberId: selected,
        },
      );
      console.log("Response : ", response);
    } catch (error) {
      console.log("Failed To Add Member: ", error);
    }
  };

  return (
    <>
      <div className="Search_Results">
        <h3>Group Members</h3>
        {groupMembers && Array.from(groupMembers.entries()).map(([id,user]:[id:any, user:any]) => {
              if (Object.hasOwn(user, "roomId")) return;
              return (
                <div
                  key={id}
                  className="User_Wrapper"
                  onClick={(e) => handleClick(e, id)}
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
      <button onClick={handleRemoveMember}>Remove Member</button>
    </>
  );
};

import { useState } from "react";
import profile from "../../../assets/profile.jpg";
import "./MessageHeader.css";
import { useUser } from "../../../lib/context";
import axios from "../../../lib/axios";
import { useAppSelector } from "../../../redux/hooks";

type propsType = {
  // selectedUser: User | Group;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  setViewSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
};

export default function MessageHeader(props: propsType) {
  const { setShowDetails, setViewSearchModal } = props;
  const { selectedUser } = useAppSelector((state) => state.chat);
  const { getUser } = useUser();
  const [showOptions, setShowOptions] = useState(false);
  const [users, setUser] = useState<User[] | null>(null);

  if (!selectedUser) {
    console.log("No selected User");
    return;
  }

  const handleAddMember = async () => {
    setViewSearchModal(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API}/group/${selectedUser._id}/addMember`,
        {
          groupId: selectedUser._id,
        },
      );
    } catch (error) {
      console.log("Failed To Add Member: ", error);
    }
  };
  return (
    <div className="Chat_header">
      <div className="profile">
        <img height={30} width={30} src={selectedUser.profile || profile} />
        <h1>
          {isGroup(selectedUser)
            ? selectedUser.groupName
            : selectedUser.username}
        </h1>
      </div>

      <div className="Private_Options">
        <button
          className="options_button"
          aria-label="options"
          onClick={() => setShowOptions((prev) => (prev ? false : true))}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </button>
        {showOptions && (
          <div className="options">
            <button
              onClick={() => setShowDetails((prev) => (prev ? false : true))}
            >
              Details
            </button>
            {isGroup(selectedUser) &&
              selectedUser.admins.includes(getUser()?._id) && (
                <>
                  <button onClick={() => handleAddMember()}>Add Member</button>
                </>
              )}
          </div>
        )}
      </div>
      <div className="line"></div>
    </div>
  );
}

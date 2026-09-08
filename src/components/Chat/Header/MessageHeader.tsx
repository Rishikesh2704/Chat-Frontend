import { useState } from "react";
import profile from "../../../assets/profile.jpg";
import "./MessageHeader.css";
import { useUser } from "../../../lib/context";
import axios from "../../../lib/axios";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setModalType, setViewModal, setViewSearchModal } from "../../../redux/Slicers/ModalSlice";

type propsType = {
  // selectedUser: User | Group;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
};

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
};

export default function MessageHeader(props: propsType) {
  const { setShowDetails } = props;
  const { selectedUser } = useAppSelector((state) => state.chat);
  const { searchResults } = useAppSelector((state) => state.modal );
  const { getUser } = useUser();

  const dispatch = useAppDispatch();
  
  const [showOptions, setShowOptions] = useState(false);
  const [users, setUser] = useState<User[] | null>(null);

  if (!selectedUser) {
    console.log("No selected User");
    return;
  }

  const handleAddMember = async () => {
    dispatch(setModalType("addMember"));
    dispatch(setViewModal(true));
  };

  const handleRemoveMember = async () => {
    dispatch(setModalType("removeMember"));
    dispatch(setViewModal(true));
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
                  <button onClick={() => handleRemoveMember()}>Remove Member</button>
                </>
              )}
          </div>
        )}
      </div>
      <div className="line"></div>
    </div>
  );
}

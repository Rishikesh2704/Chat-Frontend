import { useRef, useState } from "react";
import profile from "../../../assets/profile.jpg";
import "./MessageHeader.css";
import { useUser } from "../../../lib/context";
import axios from "../../../lib/axios";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setModalType,
  setViewModal,
  setViewSearchModal,
} from "../../../redux/Slicers/ModalSlice";
import { setShowDetails } from "../../../redux/Slicers/ChatSlice";
import { useOutsideElement } from "../../../hooks/useOutsideElement";

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
};

export default function MessageHeader() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser } = useAppSelector((state) => state.chat);

  const dispatch = useAppDispatch();

  const [showOptions, setShowOptions] = useState(false);
  let optionsRef = useRef<any>(null);

  if (!selectedUser) {
    console.log("No selected User");
    return;
  }

  function closeOptions(){ setShowOptions(false)}

  useOutsideElement(optionsRef, closeOptions)

  const handleAddMember = async () => {
    dispatch(setModalType("addMember"));
    dispatch(setViewModal(true));
  };

  const handleRemoveMember = async () => {
    dispatch(setModalType("removeMember"));
    dispatch(setViewModal(true));
  };

  const handleShowOptions = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    optionsRef.current = e.target;
    setShowOptions((prev) => !prev);
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
          onClick={(e) => handleShowOptions(e)}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </button>
        {showOptions && (
          <div className="options" onClick={() => setShowOptions(false)}>
            <button onClick={() => dispatch(setShowDetails({currentUser:false, state:true}))}>
              Details
            </button>
            {isGroup(selectedUser) &&
              selectedUser.admins.includes(currentUser?._id) && (
                <>
                  <button onClick={() => handleAddMember()}>Add Member</button>
                  <button onClick={() => handleRemoveMember()}>
                    Remove Member
                  </button>
                </>
              )}
          </div>
        )}
      </div>
      <div className="line"></div>
    </div>
  );
}

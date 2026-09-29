import "./MessageHeader.css";
import profile from "../../../assets/profile.jpg";

import { useRef, useState } from "react";
import { faArrowLeft, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setModalType, setViewModal } from "../../../redux/Slicers/ModalSlice";
import {
  setSelectedUser,
  setShowDetails,
} from "../../../redux/Slicers/ChatSlice";
import { useOutsideElement } from "../../../hooks/useOutsideElement";
import { isGroup } from "../../../utils/IsGroup";

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

  function closeOptions() {
    setShowOptions(false);
  }

  useOutsideElement(optionsRef, closeOptions);

  const handleAddMember = async () => {
    dispatch(setModalType("addMember"));
    dispatch(setViewModal(true));
  };

  const handleRemoveMember = async () => {
    dispatch(setModalType("removeMember"));
    dispatch(setViewModal(true));
  };

  const handleShowOptions = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    optionsRef.current = e.target;
    setShowOptions((prev) => !prev);
  };
  const handleMobileBackBtn = () => {
    const chatSpace = document.querySelector(".Chat_Space");
    chatSpace?.classList.remove("mobileChat");
    dispatch(setSelectedUser(null));
    console.log("Clicked Back Button");
  };

  return (
    <div className="Chat_header">
      <div className="profile">
      <button className="Mobile_Back" onClick={() => handleMobileBackBtn()}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
        <img
          height={30}
          width={30}
          src={selectedUser.profile || profile}
          alt=""
        />
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
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
        {showOptions && (
          <div className="options" onClick={() => setShowOptions(false)}>
            <button
              onClick={() =>
                dispatch(setShowDetails({ currentUser: false, state: true }))
              }
            >
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

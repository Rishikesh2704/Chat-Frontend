import "./MessageHeader.css";
import profile from "../../../assets/profile.jpg";

import { useRef, useState } from "react";
import {
  faArrowLeft,
  faEllipsis,
  faPhone,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setCallId,
  setModalType,
  setVideoCallModal,
  setViewModal,
} from "../../../redux/Modal/ModalSlice";
import { setSelectedUser, setShowDetails } from "../../../redux/Chat/ChatSlice";
import { useOutsideElement } from "../../../hooks/useOutsideElement";
import { isGroup } from "../../../utils/IsGroup";
import { useUser } from "../../../lib/context";
import { useCallMutation } from "../../../redux/Modal/modalQuerySlice";

export default function MessageHeader() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, onlineUsers } = useAppSelector((state) => state.chat);
  const { socket } = useUser();
  const dispatch = useAppDispatch();

  const [makeCall] = useCallMutation();

  const [showOptions, setShowOptions] = useState(false);
  let optionsRef = useRef<any>(null);

  if (!selectedUser || !currentUser) {
    console.log("No selected or current User");
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

  const handleVideoModal = async () => {
    try {
      const {
        data: { callId },
      } = await makeCall({
        receiverId: selectedUser._id,
        conversationId: selectedUser.conversationId || null,
        callType: "video",
      });

      dispatch(setCallId(callId));
      const user = {
        _id: currentUser._id,
        username: currentUser.username,
        profile: currentUser.profile,
      };
      const recipientSocketId = onlineUsers[selectedUser._id];
      socket.emit("Call_Request", {
        to: recipientSocketId,
        roomId: 1,
        user,
      });
    } catch (error) {
         console.log("audio Call error", error);
    }

    dispatch(setVideoCallModal(true));
  };

  const handleAudioCall = async () => {
    try {
      const {
        data: { callId },
      } = await makeCall({
        receiverId: selectedUser._id,
        conversationId: selectedUser.conversationId || null,
        callType: "audio",
      });
      const user = {
        _id: currentUser._id,
        username: currentUser.username,
        profile: currentUser.profile,
      };
      const recipientSocketId = onlineUsers[selectedUser._id];
      dispatch(setCallId(callId));
      socket.emit("Call_Request", {
        to: recipientSocketId,
        roomId: 1,
        user,
        callId,
      });
    } catch (error) {
      console.log("audio Call error", error);
    }
    const call = {
      view: true,
      isAudio: true,
      isVideo: false,
    };
    dispatch(setVideoCallModal(call));
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
      <div className="Features">
        <div className="Call_Options">
          <button className="voiceCall_btn" onClick={handleAudioCall}>
            <FontAwesomeIcon icon={faPhone} />
          </button>
          <button className="videoCall_btn" onClick={handleVideoModal}>
            <FontAwesomeIcon icon={faVideo} />
          </button>
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
                currentUser &&
                selectedUser.admins.includes(currentUser?._id) && (
                  <>
                    <button onClick={() => handleAddMember()}>
                      Add Member
                    </button>
                    <button onClick={() => handleRemoveMember()}>
                      Remove Member
                    </button>
                  </>
                )}
            </div>
          )}
        </div>
      </div>
      <div className="line"></div>
    </div>
  );
}

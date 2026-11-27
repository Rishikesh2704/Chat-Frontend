import "./Home.css";

import { lazy, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";

import { useAppDispatch, useAppSelector } from "../../redux/hooks.js";
import { setModalType, setViewModal } from "../../redux/Modal/ModalSlice.js";
import useChatUsers from "../../hooks/useChatUsers.js";

import Friends from "../Chat/Friends/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import Account from "../Account/Account.js";
import { Search } from "../Search/Search.js";

import BoundaryWrapper from "../../lib/BoundaryWrapper.js";
import useChatSocket from "../../hooks/useChatSocket.js";
import VideoCallModal from "../Chat/VideoCall/VideoCall.js";
import { ChatNavbar } from "../Chat/ChatNavbar/ChatNavbar.js";
import { Calls } from "../Chat/Calls/Calls.js";

const Modal = lazy(() =>
  import("../Modal/Modal.js").then((m) => ({ default: m.Modal })),
);

export default function Home() {
  const dispatch = useAppDispatch();

  const { selectedUser, showDetails } = useAppSelector((state) => state.chat);
  const { viewModal, videoCallModal } = useAppSelector((state) => state.modal);
  const [section, setSection] = useState<string | null>("messages");
  const [isTyping, setIsTyping] = useState<any>({ id: "", isTyping: false });

  const { isError, isLoading, refetch } = useChatUsers();

  useChatSocket(setIsTyping);

  const handleCreateGroup = () => {
    dispatch(setModalType("createGroup"));
    dispatch(setViewModal(true));
    document.getElementsByTagName("main")[0].style.alignItems = "initial";
  };
  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <ChatNavbar setSection={setSection} />
        {section == "messages" && (
          <BoundaryWrapper resetFunction={refetch}>
            <Search />
            <Friends error={isError} isLoading={isLoading} />
          </BoundaryWrapper>
        )}
        {section == "calls" && (
          <BoundaryWrapper resetFunction={refetch}>
            <Calls />
          </BoundaryWrapper>
        )}
        {section === "messages" && (
          <button
            className="Create_Group_Btn"
            aria-label="Create Group"
            onClick={() => handleCreateGroup()}
          >
            +
          </button>
        )}
      </section>

      {viewModal && <Modal />}
      {videoCallModal.view && <VideoCallModal />}

      <section className="Chat_Space ">
        {selectedUser ? (
          <BoundaryWrapper>
            <MessageMain isTyping={isTyping} />
          </BoundaryWrapper>
        ) : (
          <div className="NoChats">
            <FontAwesomeIcon id="NoChat_icon" icon={faMessage} />
            <span>No Chats Selected</span>
          </div>
        )}
      </section>

      {showDetails.state && (
        <aside className="Account_Details">
          <Account />
        </aside>
      )}
    </div>
  );
}

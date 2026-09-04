import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.js";

import "./Home.css";
import Friends from "../Chat/Friends/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import Modal from "../Modal/Modal.js";
import Account from "../Account/Account.js";

import { setViewModal } from "../../redux/Slicers/ModalSlice.js";
import useChatUsers from "../../hooks/useChatUsers.js";
import useChatSocket from "../../hooks/useChatSocket.js";

export default function Home() {
  const dispatch = useAppDispatch();

  const { selectedUser } = useAppSelector((state) => state.chat);
  const { viewModal } = useAppSelector((state) => state.modal);

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<any>({ id: "", isTyping: false });

  useChatUsers();

  useChatSocket(setIsTyping);

  const handleCreateGroup = () => {
    dispatch(setViewModal(true));
    document.getElementsByTagName("main")[0].style.alignItems = "initial";
  };

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="Heading">Messages</h1>
        </div>

        <Friends />
        <button
          className="Create_Group_Btn"
          aria-label="Create Group"
          onClick={handleCreateGroup}
        >
          +
        </button>
      </section>

      {viewModal && <Modal />}

      <section className="Chat_Space">
        {selectedUser ? (
          <MessageMain setShowDetails={setShowDetails} isTyping={isTyping} />
        ) : (
          <div className="NoChats">
            <i className="fa-solid fa-message"></i>
            <span>No Chats Selected</span>
          </div>
        )}
      </section>

      {showDetails && (
        <aside className="Account_Details">
          <Account />
        </aside>
      )}
    </div>
  );
}

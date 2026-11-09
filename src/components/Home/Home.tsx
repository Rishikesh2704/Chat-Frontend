import "./Home.css";

import { lazy, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";

import { useAppDispatch, useAppSelector } from "../../redux/hooks.js";
import { setModalType, setViewModal } from "../../redux/Modal/ModalSlice.js";
import useChatUsers from "../../hooks/useChatUsers.js";
import useChatSocket from "../../hooks/useChatSocket.js";

import Friends from "../Chat/Friends/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import Account from "../Account/Account.js";
import { Search } from "../Search/Search.js";

import BoundaryWrapper from "../../lib/BoundaryWrapper.js";
import axiosInstance from "../../lib/axios.js";
import { generateUserKeyPairs, storePrivateKey } from "../../utils/End2End.js";

const Modal = lazy(() =>
  import("../Modal/Modal.js").then((m) => ({ default: m.Modal })),
);

export default function Home() {
  const dispatch = useAppDispatch();

  const { selectedUser, showDetails } = useAppSelector((state) => state.chat);
  const { viewModal } = useAppSelector((state) => state.modal);

  const [isTyping, setIsTyping] = useState<any>({ id: "", isTyping: false });
  useEffect(() => {
    async function sendPublicKey() {
      try {
        const { publicKey, rawKeyPair } = await generateUserKeyPairs();
        storePrivateKey(rawKeyPair.privateKey)
        await axiosInstance.post("/users/publicKey", { publicKey });
      } catch (error) {
        console.log(error);
      }
    }

    sendPublicKey();
    
  }, []);

  useChatUsers();

  useChatSocket(setIsTyping);

  const handleCreateGroup = () => {
    dispatch(setModalType("createGroup"));
    dispatch(setViewModal(true));
    document.getElementsByTagName("main")[0].style.alignItems = "initial";
  };

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="Heading">Messages</h1>
        </div>

        <Search />
        <BoundaryWrapper>
          <Friends />
        </BoundaryWrapper>
        <button
          className="Create_Group_Btn"
          aria-label="Create Group"
          onClick={() => handleCreateGroup()}
        >
          +
        </button>
      </section>

      {viewModal && <Modal />}

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

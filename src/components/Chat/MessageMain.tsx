import { lazy, useLayoutEffect, useRef, useState } from "react";

import "./MessageMain.css";

import useGroupMembers from "../../hooks/useGroupMembers";
import useChatMessages from "../../hooks/useChatMessages";
import useMessagesSeen from "../../hooks/useMessagesSeen";
import { useAppSelector } from "../../redux/hooks";
import MessageHeader from "./Header/MessageHeader";
import MessageForm from "./MessageForm/MessageForm";


const Messages = lazy(() => import("./MessageSpace/Messages"))

type MessageSpaceProps = {
  isTyping:any;
};

export default function MessageSpace(props: MessageSpaceProps) {
  const { isTyping } = props;
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  

  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number | null>(null);
  const lastMessageRef = useRef(null);


  useChatMessages(MessageSpaceRef, scrollPosRef, setIsTop);

  useMessagesSeen(lastMessageRef);

  const groupMembers = useGroupMembers();

  useLayoutEffect(() => {
    if (!selectedUser) return;

    const messageSpaceDiv = MessageSpaceRef.current;
    if (messageSpaceDiv && allMessages.length === 15) {
      messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight;
    }

    if (messageSpaceDiv && isTop) {
      messageSpaceDiv.scrollTo({
        top: messageSpaceDiv.scrollHeight - (scrollPosRef.current as number),
      });
    }
    setIsTop(false);
  }, [allMessages, selectedUser]);

  return (
    <>
      <MessageHeader  />

      <div className="chat_messages">
        <div className="Messages" ref={MessageSpaceRef}>
          <Messages
            lastMessageRef={lastMessageRef}
            groupMembers={groupMembers}
          />

          {isTyping.isTyping && (
            <div className="Typing_Wrapper">
              {groupMembers && (
                <img
                  src={groupMembers?.get(isTyping.id)?.profile}
                  width={25}
                  height={25}
                />
              )}
              <div className="messageStyle received">
                <div className="typing ">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MessageForm message={message} setMessage={setMessage} />
    </>
  );
}

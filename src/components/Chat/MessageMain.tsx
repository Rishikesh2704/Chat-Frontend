import { useLayoutEffect, useRef, useState } from "react";

import "./MessageMain.css";

import MessageForm from "./MessageForm/MessageForm";
import MessageHeader from "./Header/MessageHeader";
import Messages from "./MessageSpace/Messages";

import useGroupMembers from "../../hooks/useGroupMembers";
import useChatMessages from "../../hooks/useChatMessages";
import useMessagesSeen from "../../hooks/useMessagesSeen";
import { useAppSelector } from "../../redux/hooks";

type MessageSpaceProps = {
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  isTyping:any;
};

export default function MessageSpace(props: MessageSpaceProps) {
  const { setShowDetails,isTyping } = props;
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
      <MessageHeader setShowDetails={setShowDetails} />

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

// try {
//       const string = localStorage.getItem("Recent_Messages");
//       if (string === null) {
//         let recent: any = {};
//         recent[selectedUser._id] = allMessages[allMessages.length - 1];
//         console.log("Setting Recent: ", recent);
//         localStorage.setItem("Recent_Messages", JSON.stringify(recent));
//       }
//       const recentMessagesArray = JSON.parse(string as string);
//       recentMessagesArray[selectedUser._id] =
//         allMessages[allMessages.length - 1];
//       localStorage.setItem(
//         "Recent_Messages",
//         JSON.stringify(recentMessagesArray),
//       );
//     } catch (error) {
//       console.log("Failed to Set Recent Message In Local Storage: ", error);
//     }

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import "./MessageMain.css";

import axios from "../../lib/axios";
import MessageForm from "./MessageForm";
import EmojiPicker, {
  EmojiStyle,
  type EmojiClickData,
} from "emoji-picker-react";
import MessageHeader from "./MessageHeader";
import Messages from "./MessageSpace/Messages";

type MessageSpaceProps = {
  selectedUser: User;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  socketRef: React.RefObject<Socket | null>;
  setShowDetails:React.Dispatch<React.SetStateAction<boolean>>
};

// function toLocaleTime(time: string) {
//   const date = new Date(time);
//   const hoursAndSecs = date.toLocaleTimeString().split(":");
//   const formattedTime =
//     hoursAndSecs[0] +
//     ":" +
//     hoursAndSecs[1] +
//     " " +
//     hoursAndSecs[2]?.split(" ")[1];
//   return formattedTime;
// }
function toLocaleTime(time: string) {
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const fetchMessages = async (selectedUser: User, skipMessages: number) => {
  const response = await axios(
    `${import.meta.env.VITE_API}/messages/${selectedUser._id}/${skipMessages}`,
  );
  const reversed = response.data.messages.toReversed();
  return reversed;
};

const getDayOfMessages = (
  time: string,
  previousMessageTime: React.RefObject<string>,
) => {
  const date = new Date(time);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  // if (
  //   date.toLocaleDateString() === new Date().toLocaleDateString() &&
  //   date.toLocaleDateString() !== previousMessageTime.current
  // ) {
  //   previousMessageTime.current = date.toLocaleDateString();
  //   return "Today";
  // }
  if (
    isSameDay(date, new Date()) &&
    date.toLocaleDateString() !== previousMessageTime.current
  ) {
    previousMessageTime.current = date.toLocaleDateString();
    return "Today";
  }
  if (
    previousMessageTime.current.length === 0 ||
    previousMessageTime.current !== date.toLocaleDateString()
  ) {
    previousMessageTime.current = date.toLocaleDateString();
    const formattedDate =
      date.getDate() +
      " " +
      date.toLocaleString("default", { month: "long" }) +
      " " +
      date.getFullYear();
    return formattedDate;
  } else return "";
};

export default function MessageSpace(props: MessageSpaceProps) {
  const { selectedUser, allMessages, setAllMessages, socketRef, setShowDetails } = props;
  // const { socketRef } = useUser();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [seenMessage, setSeenMessage] = useState<AllMessageType | null>(null);

  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const scrollPosRef = useRef<number | null>(null);
  const skipMessages = useRef(0);
  const lastMessageRef = useRef(null);
  const socket = socketRef.current;

  //isTyping
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIsTyping = (user: any) => setIsTyping(user.isTyping);
    const handleSeenMessage = (message: any) => setSeenMessage(message);
    const handleReaction = (res: AllMessageType) => {
      const updatedMessages = allMessages.map((message) => {
        if (message._id === res._id) {
          return { ...message, reactions: res.reactions };
        } else return message;
      });
      setAllMessages([...updatedMessages]);
    };
    const handleDeleteReaction = (message: any) => {
      const updatedMessages = allMessages.map((m) => {
        if (m._id === message._id) {
          m.reactions = message.reactions;
          return m;
        } else return m;
      });

      setAllMessages([...updatedMessages]);
    };

    socket.on("Typing", handleIsTyping);
    socket.on("Seen_Message", handleSeenMessage);
    socket.on("Reaction_Update", handleReaction);
    socket.on("Deleted_Reaction", handleDeleteReaction);

    return () => {
      socket.off("Typing", handleIsTyping);
      socket.off("Seen_Message", handleSeenMessage);
      socket.off("Reaction_Update", handleReaction);
      socket.off("Deleted_Reaction", handleDeleteReaction);
    };
  }, [allMessages]);

  //Seen Message
  useEffect(() => {
    const messages = document.querySelectorAll(".ReceivedMessages_Wrapper");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            const message = allMessages.find((message) => message._id == id);
            socketRef.current &&
              socketRef.current.emit("Seen_Message", message);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      },
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }
    messages.forEach((message) => observer.observe(message));
  }, [allMessages]);

  //Initial Recent Messages
  useEffect(() => {
    console.log("Selected User id: ", selectedUser);
    try {
      const user = JSON.parse(localStorage.getItem("Current_User") as string);
      const setRecentMessages = async () => {
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
        );
        const lastSeenMessage = messages.filter(
          (message: AllMessageType) => message.SenderId === user._id,
        );

        setSeenMessage(lastSeenMessage[lastSeenMessage?.length - 1]);
        setAllMessages([...messages, ...allMessages]);
      };

      setRecentMessages();
    } catch (error: any) {
      console.log(error.response.data);
    }
  }, [selectedUser]);

  //Fetch Recent Messages
  useEffect(() => {
    // const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    const messageSpaceDiv = MessageSpaceRef.current;
    if (!messageSpaceDiv) return;

    const windw = () => {
      if (Math.floor(messageSpaceDiv.scrollTop) <= 1 && !loadingRef.current) {
        setIsTop(true);

        scrollPosRef.current = messageSpaceDiv.scrollHeight;
        skipMessages.current += 15;

        const MoreRecentMessages = async () => {
          loadingRef.current = true;
          try {
            const messages1 = await fetchMessages(
              selectedUser,
              skipMessages.current,
            );
            setAllMessages((prev) => [...messages1, ...prev]);
          } catch (error) {
            console.log(error);
          } finally {
            loadingRef.current = false;
          }
        };
        MoreRecentMessages();
      }
    };
    if (messageSpaceDiv) {
      setTimeout(
        () => (messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight),
        39,
      );
      messageSpaceDiv.addEventListener("scroll", windw);
    }

    return () => {
      if (messageSpaceDiv) messageSpaceDiv.removeEventListener("scroll", windw);
    };
  }, []);

  //Infinite Scroll(up)
  useLayoutEffect(() => {
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    if (messageSpaceDiv && isTop) {
      messageSpaceDiv.scrollTo({
        top: messageSpaceDiv.scrollHeight - (scrollPosRef.current as number),
      });
    }
    localStorage.setItem(
      "Last_Message",
      JSON.stringify(allMessages[allMessages.length - 1]),
    );
    setIsTop(false);
  }, [allMessages]);

  useEffect(() => {
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    if (messageSpaceDiv) {
      messageSpaceDiv.scrollTo({
        top: messageSpaceDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [message, isTyping]);

  return (
    <>
      <MessageHeader selectedUser={selectedUser} setShowDetails={setShowDetails} />
      <div className="chat_messages">
        <div className="Messages" ref={MessageSpaceRef}>
          <Messages
            socketRef={socketRef}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            selectedUser={selectedUser}
            lastMessageRef={lastMessageRef}
            seenMessage={seenMessage}
          />
          {isTyping && (
            <div className="messageStyle received">
              <div className="typing ">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <MessageForm
        selectedUser={selectedUser}
        message={message}
        setMessage={setMessage}
        setAllMessages={setAllMessages}
        socketRef={socketRef}
      />
    </>
  );
}

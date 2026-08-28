import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import "./MessageMain.css";

import MessageForm from "./MessageForm/MessageForm";

import MessageHeader from "./Header/MessageHeader";
import Messages from "./MessageSpace/Messages";
import { useUser } from "../../lib/context";
import axios from "../../lib/axios";

type MessageSpaceProps = {
  selectedUser: User | Group;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  socketRef: React.RefObject<Socket | null>;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
};

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
};

const fetchMessages = async (
  selectedUser: User | Group,
  skipMessages: number,
  currentUser: User | null,
) => {
  if (!currentUser || !selectedUser) {
    console.log(
      "Current User:",
      currentUser,
      "\n Selected User:",
      selectedUser,
    );
    return;
  }
  const isGroup = Object.hasOwn(selectedUser, "roomId");
  const UserMessageAPI = `${import.meta.env.VITE_API}/messages/${selectedUser._id}/${skipMessages}`;
  const response = await axios.get(UserMessageAPI);
  const reversed = isGroup
    ? response.data.groupMessages.toReversed()
    : response.data.messages.toReversed();
  return reversed;
};

export default function MessageSpace(props: MessageSpaceProps) {
  const {
    selectedUser,
    allMessages,
    setAllMessages,
    socketRef,
    setShowDetails,
  } = props;
  const { getUser } = useUser();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<any>({ id: "", isTyping: false });
  const [seenMessage, setSeenMessage] = useState<AllMessageType | null>(null);
  const [groupMembers, setGroupMembers] = useState<Map<any, any>>();
  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const scrollPosRef = useRef<number | null>(null);
  const skipMessages = useRef(0);
  const lastMessageRef = useRef(null);
  // const socket = socketRef.current;

  //isTyping
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleIsTyping = (user: any) => {
      if (user.typerId === getUser()._id) return;
      setIsTyping({ id: user.typerId, isTyping: user.isTyping });
    };

    const handleSeenMessage = (mss: AllMessageType) => {
      const updatedMessage = allMessages.map((messages) => {
        if (mss._id === messages._id) {
          console.log("Message: ", message);
          return { ...messages, seen: mss.seen };
        } else return messages;
      });
      console.log("Updated Messages: ", updatedMessage);
      setAllMessages([...updatedMessage]);
    };

    const handleGroupSeenMessages = (mess: AllMessageType) => {
      console.log("Message: ", allMessages);
      const updatedMessage = allMessages.map((messages) => {
        console.log("Message Id: ", mess._id === messages._id);
        if (mess._id === messages._id) {
          return { ...messages, seen: mess.seen };
        } else return messages;
      });
      console.log("Updated Group Messages: ", updatedMessage);
      setAllMessages([...updatedMessage]);
    };

    const handleReaction = (res: AllMessageType) => {
      const updatedMessages = allMessages.map((message) => {
        if (message._id === res._id) {
          return { ...message, reactions: res.reactions };
        } else return message;
      });
      setAllMessages([...updatedMessages]);
    };

    const handleGroupMessageReaction = (res: AllMessageType) => {
      console.log("Response:", res);
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
          return { ...m, reactions: message.reactions };
        } else return m;
      });
      setAllMessages([...updatedMessages]);
    };

    const handleDeleteGroupReaction = (res: AllMessageType) => {
      console.log("Deleted Reaction: ", res);
      const updatedMessages = allMessages.map((m) => {
        if (m._id === res._id) {
          return { ...m, reactions: res.reactions };
        } else return m;
      });
      setAllMessages([...updatedMessages]);
    };

    socket.on("Typing", handleIsTyping);
    socket.on("Seen_Message", handleSeenMessage);
    socket.on("SeenBy_GroupMembers", handleGroupSeenMessages);
    socket.on("Reaction_Update", handleReaction);
    socket.on("Reaction_For_GroupMessage", handleGroupMessageReaction);
    socket.on("Deleted_Reaction", handleDeleteReaction);
    socket.on("Deleted_GroupMessage_Reaction", handleDeleteGroupReaction);

    return () => {
      socket.off("Typing", handleIsTyping);
      socket.off("Seen_Message", handleSeenMessage);
      socket.off("SeenBy_GroupMembers", handleGroupSeenMessages);
      socket.off("Reaction_Update", handleReaction);
      socket.off("Reaction_For_GroupMessage", handleGroupMessageReaction);
      socket.off("Deleted_Reaction", handleDeleteReaction);
      socket.off("Deleted_GroupMessage_Reaction", handleDeleteGroupReaction);
    };
  }, [allMessages]);

  useEffect(() => {
    if (!Object.hasOwn(selectedUser, "roomId")) return;
    const fetchMemberDetails = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/group/${selectedUser._id}/details`,
        );
        const updatedMap = new Map(
          request.data.members.map((member: any) => [
            member._id,
            { username: member.username, profile: member.profile },
          ]),
        );
        setGroupMembers(updatedMap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMemberDetails();
  }, [selectedUser]);

  //Seen Message
  useEffect(() => {
    const messages = document.querySelectorAll(".ReceivedText_Wrapper");
    const groupMessageSeenHandler = (message: AllMessageType | undefined) => {
      const currentUser = getUser();
      const seen = message?.seen as string[];
      if (seen.includes(currentUser._id)) return;
      if (socketRef.current)
        socketRef.current.emit(
          "groupMessage_Seen",
          message,
          currentUser,
          isGroup(selectedUser) ? selectedUser.roomId : "",
        );
    };

    const privateMessageSeenHandler = (message: AllMessageType | undefined) => {
      if (allMessages[allMessages.length - 1].seen) return;
      if (socketRef.current) socketRef.current.emit("Seen_Message", message);
    };

    const observerFunction = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          const isGroup = Object.hasOwn(selectedUser, "roomId");
          const message = allMessages.find((message) => message._id == id);
          if (isGroup) groupMessageSeenHandler(message);
          else privateMessageSeenHandler(message);
        }
      });
    };

    const observer = new IntersectionObserver(observerFunction, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }
    messages.forEach((message) => observer.observe(message));
    return () => {
      observer.disconnect();
    };
  }, [allMessages]);

  //Initial Recent Messages
  useEffect(() => {
    const setRecentMessages = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("Current_User") as string);
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
          getUser(),
        );
        const lastSeenMessage = messages.filter(
          (message: AllMessageType) => message.SenderId === user._id,
        );
        setSeenMessage(lastSeenMessage[lastSeenMessage?.length - 1]);
        setAllMessages([...messages]);
      } catch (error) {
        console.log(error);
      }
    };

    setRecentMessages();
    return () => {
      setAllMessages([]);
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  //Fetch Recent Messages
  useEffect(() => {
    const messageSpaceDiv = MessageSpaceRef.current;

    if (!messageSpaceDiv) return;
    messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight;

    const MoreRecentMessages = async () => {
      loadingRef.current = true;
      try {
        const messages1 = await fetchMessages(
          selectedUser,
          skipMessages.current,
          getUser(),
        );
        setAllMessages((prev) => [...messages1, ...prev]);
      } catch (error) {
        console.log(error);
      } finally {
        loadingRef.current = false;
      }
    };

    const windw = () => {
      if (
        Math.floor(messageSpaceDiv.scrollTop) >= 1 &&
        Math.floor(messageSpaceDiv.scrollTop) <= 5 &&
        !loadingRef.current
      ) {
        setIsTop(true);
        console.log("Messages Length", allMessages);
        console.log("Fetch More Recent Messages");

        scrollPosRef.current = messageSpaceDiv.scrollHeight;
        skipMessages.current += 15;

        MoreRecentMessages();
      }
    };
    // if (messageSpaceDiv) {
    //   setTimeout(
    //     () => (messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight),
    //     39,
    //   );
    // }
    messageSpaceDiv.addEventListener("scroll", windw);

    return () => {
      messageSpaceDiv.removeEventListener("scroll", windw);
      setAllMessages([]);
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  //Infinite Scroll(up)
  useLayoutEffect(() => {
    const messageSpaceDiv = MessageSpaceRef.current;
    if (messageSpaceDiv && allMessages.length === 15) {
      messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight;
    }

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

  // useEffect(() => {
  //   const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
  //   if (messageSpaceDiv) {
  //     messageSpaceDiv.scrollTo({
  //       top: messageSpaceDiv.scrollHeight,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [message]);

  return (
    <>
      <MessageHeader
        selectedUser={selectedUser}
        setShowDetails={setShowDetails}
      />
      <div className="chat_messages">
        <div className="Messages" ref={MessageSpaceRef}>
          <Messages
            socketRef={socketRef}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            selectedUser={selectedUser}
            lastMessageRef={lastMessageRef}
            seenMessage={seenMessage}
            groupMembers={groupMembers}
          />
          {isTyping.isTyping && (
            <div className="Typing_Wrapper">
              <img
                src={groupMembers?.get(isTyping.id).profile}
                width={25}
                height={25}
              />
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

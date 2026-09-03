import { useEffect, useLayoutEffect, useRef, useState } from "react";

import axios from "../../lib/axios";
import { useUser } from "../../lib/context";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { prependMessages, setAllMessages } from "../../redux/Slicers/ChatSlice";
import { isGroup } from "../../utils/IsGroup";
import "./MessageMain.css";

import MessageForm from "./MessageForm/MessageForm";
import MessageHeader from "./Header/MessageHeader";
import Messages from "./MessageSpace/Messages";


type MessageSpaceProps = {
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
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
  const { setShowDetails } = props;
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);
  const { socket } = useUser();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<any>({ id: "", isTyping: false });
  const [groupMembers, setGroupMembers] = useState<Map<any, any>>();
  
  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const scrollPosRef = useRef<number | null>(null);
  const skipMessages = useRef(0);
  const lastMessageRef = useRef(null);

  //isTyping
  useEffect(() => {
    if (!socket) return;
    const handleIsTyping = (user: any) => {
      if (user.typerId === currentUser._id) return;
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
      dispatch(setAllMessages([...updatedMessage]));
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
      dispatch(setAllMessages([...updatedMessage]));
    };

    const handleReaction = (res: AllMessageType) => {
      const updatedMessages = allMessages.map((message) => {
        if (message._id === res._id) {
          return { ...message, reactions: res.reactions };
        } else return message;
      });
      dispatch(setAllMessages([...updatedMessages]));
    };

    const handleGroupMessageReaction = (res: AllMessageType) => {
      console.log("Response:", res);
      const updatedMessages = allMessages.map((message) => {
        if (message._id === res._id) {
          return { ...message, reactions: res.reactions };
        } else return message;
      });
      dispatch(setAllMessages([...updatedMessages]));
    };

    const handleDeleteReaction = (message: any) => {
      const updatedMessages = allMessages.map((m) => {
        if (m._id === message._id) {
          return { ...m, reactions: message.reactions };
        } else return m;
      });
      dispatch(setAllMessages([...updatedMessages]));
    };

    const handleDeleteGroupReaction = (res: AllMessageType) => {
      console.log("Deleted Reaction: ", res);
      const updatedMessages = allMessages.map((m) => {
        if (m._id === res._id) {
          return { ...m, reactions: res.reactions };
        } else return m;
      });
      dispatch(setAllMessages([...updatedMessages]));
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
    if (!selectedUser) return;
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
    if (!socket) return;
    if (!selectedUser) return;

    const messages = document.querySelectorAll(".ReceivedText_Wrapper");
    const groupMessageSeenHandler = (message: AllMessageType | undefined) => {
      const seen = message?.seen as string[];
      if (seen.includes(currentUser._id)) return;
      socket.emit(
        "groupMessage_Seen",
        message,
        currentUser,
        isGroup(selectedUser) ? selectedUser.roomId : "",
      );
    };

    const privateMessageSeenHandler = (message: AllMessageType | undefined) => {
      if (allMessages[allMessages.length - 1].seen) return;
      socket.emit("Seen_Message", message);
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
    if (!selectedUser) return;

    const setRecentMessages = async () => {
      try {
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
          currentUser,
        );

        dispatch(setAllMessages(messages));
      } catch (error) {
        console.log(error);
      }
    };

    setRecentMessages();
    return () => {
      dispatch(setAllMessages([]));
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  //Fetch Recent Messages
  useEffect(() => {
    if (!selectedUser) return;
    const messageSpaceDiv = MessageSpaceRef.current;

    if (!messageSpaceDiv) return;
    messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight;

    const MoreRecentMessages = async () => {
      loadingRef.current = true;
      try {
        const messages1 = await fetchMessages(
          selectedUser,
          skipMessages.current,
          currentUser,
        );
        console.log("effect : ", allMessages);
        console.log("recent : ", messages1);
        dispatch(prependMessages(messages1));
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

    messageSpaceDiv.addEventListener("scroll", windw);

    return () => {
      messageSpaceDiv.removeEventListener("scroll", windw);
      dispatch(setAllMessages([]));
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  //Infinite Scroll(up)
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
    try {
      const string = localStorage.getItem("Recent_Messages");
      if (string === null) {
        let recent: any = {};
        recent[selectedUser._id] = allMessages[allMessages.length - 1];
        console.log("Setting Recent: ", recent);
        localStorage.setItem("Recent_Messages", JSON.stringify(recent));
      }
      const recentMessagesArray = JSON.parse(string as string);
      recentMessagesArray[selectedUser._id] =
        allMessages[allMessages.length - 1];
      localStorage.setItem(
        "Recent_Messages",
        JSON.stringify(recentMessagesArray),
      );
    } catch (error) {
      console.log("Failed to Set Recent Message In Local Storage: ", error);
    }

    setIsTop(false);
  }, [allMessages]);

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

      <MessageForm message={message} setMessage={setMessage} />

    </>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import "./MessageMain.css";

import axios from "../../lib/axios";
import MessageForm from "./MessageForm";
import EmojiPicker, {
  EmojiStyle,
  type EmojiClickData,
} from "emoji-picker-react";

type MessageSpaceProps = {
  selectedUser: User;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  socketRef: React.RefObject<Socket | null>;
};

function toLocaleTime(time: string) {
  const date = new Date(time);
  const hoursAndSecs = date.toLocaleTimeString().split(":");
  const formattedTime =
    hoursAndSecs[0] +
    ":" +
    hoursAndSecs[1] +
    " " +
    hoursAndSecs[2]?.split(" ")[1];
  return formattedTime;
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
  if (
    date.toLocaleDateString() === new Date().toLocaleDateString() &&
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
  const { selectedUser, allMessages, setAllMessages, socketRef } = props;
  // const { socketRef } = useUser();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [seenMessage, setSeenMessage] = useState<AllMessageType | null>(null);
  

  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number | null>(null);
  let skipMessages = useRef(0);
  let previousMessageTime = useRef<string>("");
  const lastMessageRef = useRef(null);
  const socket = socketRef.current;

  //isTyping
  useEffect(() => {
    if (socket) {
      socket.on("Typing", (user) => {
        setIsTyping(user.isTyping);
      });
      socket.on("Seen_Message", (message) => setSeenMessage(message));
      socket.on("Reaction_Update", (res: AllMessageType) => {
        const updatedMessages = allMessages.map((message) => {
          if (message._id == res._id) {
            console.log("Found Message: ", message);
            message.reactions = res.reactions;
            return message;
          } else return message;
        });

        setAllMessages([...updatedMessages]);
      });
    }
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
    console.log("Selected User id: ", selectedUser)
    try {
      const user = JSON.parse(localStorage.getItem("Current_User") as string);
      const setRecentMessages = async () => {
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
        );
        const lastSeenMessage = messages.filter(
          (message: AllMessageType) => message.SenderId == user._id,
        );
        setSeenMessage(lastSeenMessage[lastSeenMessage?.length - 1]);
        setAllMessages([...messages, ...allMessages]);
      };

      setRecentMessages();
    } catch (error: any) {
      console.log(error.response.data);
    }
  }, []);

  //Fetch Recent Messages
  useEffect(() => {
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    const windw = () => {
      if (Math.floor(messageSpaceDiv.scrollTop) <= 1) {
        setIsTop(true);
        try {
          scrollPosRef.current = messageSpaceDiv.scrollHeight;
          skipMessages.current += 15;
          const MoreRecentMessages = async () => {
            const messages1 = await fetchMessages(
              selectedUser,
              skipMessages.current,
            );
            setAllMessages((prev) => [...messages1, ...prev]);
          };
          MoreRecentMessages();
        } catch (error: any) {
          console.log(error);
        }
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

  const handleDeleteMessage = (messageId: string) => {
    try {
      const deleteMessage = async () => {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/messages/${messageId}`,
        );
        if (response.status === 200) {
          const filteredMessages = allMessages.filter(
            (messages) => messages._id !== messageId,
          );
          setAllMessages([...filteredMessages]);
        }
      };
      deleteMessage();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOptions = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const options = e.currentTarget.nextElementSibling as HTMLDivElement;
    options?.style.setProperty("--displayOptions", "block");
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const optiions = e.currentTarget.lastChild as HTMLDivElement;
    optiions.style.setProperty("--displayOptions", "none");
  };

  const handleReactionEmojis = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const reactionPicker = e.currentTarget.nextElementSibling as HTMLDivElement;
    const isVisible = reactionPicker.classList.contains("reactionVisible");
    console.log(reactionPicker);
    if (isVisible) {
      reactionPicker.classList.remove("reactionVisible");
    } else {
      reactionPicker.classList.add("reactionVisible");
    }
  };

  const reactToMessage = (messageId: string, emojiObject: EmojiClickData) => {
    if (socket) {
      socket.emit("Reacted_To_Message", {
        messageId,
        reaction: emojiObject.emoji,
      });
    }
  };

  const handleHoverOut = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // console.log(e.currentTarget.children[0].children[0])
  };

  const handleDeleteReaction = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    messageId: string,
  ) => {
    e.preventDefault()
    if (socket) {
      socket.emit("Delete_Reaction", { messageId, reaction: "" });
      socket.on("Deleted_Reaction", (message) => {
        const updatedMessages = allMessages.map((m) => {
          if (m._id == message._id) {
            m.reactions = message.reactions;
            return m;
          } else return m;
        });

        setAllMessages([...updatedMessages]);
      });
    }
  };

  return (
    <>
      {/* <div className="Chat_header">
        <div className="profile">
          <img height={30} width={30} src={selectedUser.profile || profile} />
          <h1>{selectedUser.username}</h1>
        </div>

        <div className="line"></div>
      </div> */}
      <div className="chat_messages">
        <div className="Messages" ref={MessageSpaceRef}>
          {allMessages.map((messages: AllMessageType) => {
            if (messages.ReceiverId !== selectedUser._id) {
              return (
                <>
                  <h6 className="Messages_Day">
                    {getDayOfMessages(messages.createdAt, previousMessageTime)}
                  </h6>
                  <div
                    className="ReceivedMessages_Wrapper"
                    onMouseOut={(e) => handleHoverOut(e)}
                  >
                    <div className="Reactions">
                      <div
                        id="ReactionEmoji_Button"
                        aria-label="reaction emojis"
                        role="button"
                        onClick={(e) => handleReactionEmojis(e)}
                      >
                        <i className="fa-regular fa-face-grin"></i>
                      </div>
                      <div className="Reaction_Wrapper">
                        <EmojiPicker
                          className="Emojis_Main"
                          open={true}
                          emojiStyle={"native" as EmojiStyle}
                          reactionsDefaultOpen={true}
                          onEmojiClick={(emojiObject) =>
                            reactToMessage(messages._id, emojiObject)
                          }
                        />
                      </div>
                    </div>
                    <div
                      className="ReceivedText_Wrapper"
                      id={messages._id}
                      ref={lastMessageRef}
                    >
                      {messages.image && (
                        <div className="messageimg_wrapper">
                          <img
                            className="message_img"
                            height={150}
                            width={250}
                            src={messages.image}
                          />
                        </div>
                      )}

                      <div className="messageStyle received">
                        {messages.text}
                        {messages.reactions && (
                          <p
                            className="reaction"
                            onContextMenu={(e) =>
                              handleDeleteReaction(e, messages._id)
                            }
                          >
                            {messages.reactions}
                          </p>
                        )}
                      </div>
                      <p className="receivedTime time">
                        {toLocaleTime(messages.createdAt)}
                      </p>
                    </div>
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <h6 className="Messages_Day">
                    {getDayOfMessages(messages.createdAt, previousMessageTime)}
                  </h6>
                  <div className="SentMessages_Wrapper">
                    <div className="SentText_Wrapper">
                      {messages.image && (
                        <div className="messageimg_wrapper">
                          <img
                            className="message_img"
                            height={150}
                            width={250}
                            src={messages.image}
                          />
                        </div>
                      )}
                      <div className="messageStyle ">
                        {messages.text}
                        {messages.reactions && (
                          <p className="reaction sentMessage_reaction">
                            {messages.reactions}
                          </p>
                        )}
                      </div>
                      <p className="sentTime time">
                        {toLocaleTime(messages.createdAt)}
                      </p>

                      {seenMessage?._id == messages._id && (
                        <p id="Seen_Message">Seen</p>
                      )}
                    </div>
                    <div
                      className="Options"
                      onMouseLeave={(e) => handleMouseLeave(e)}
                    >
                      <i
                        className="fa-solid fa-ellipsis-vertical"
                        onClick={(e) => handleOptions(e)}
                      ></i>
                      <div className="option">
                        <button
                          aria-label="Delete"
                          onClick={() => handleDeleteMessage(messages._id)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            }
          })}
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

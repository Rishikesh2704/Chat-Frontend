import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "../../lib/axios";
import MessageForm from "./MessageForm";
import "./MessageMain.css";
import profile from "../../assets/profile.jpg";
import type { Socket } from "socket.io-client";

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

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isTop, setIsTop] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [seenMessage, setSeenMessage] = useState<AllMessageType | null>(null)

  const MessageSpaceRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number | null>(null);
  let skipMessages = useRef(0);
  let previousMessageTime = useRef<string>("");
  const lastMessageRef = useRef(null);

  //isTyping
  useEffect(() => {
    const socket = socketRef.current as Socket;
    socket.on("Typing", (user) => setIsTyping(user.isTyping));
    socket.on('Seen_Message',(message) => setSeenMessage(message))

  }, [allMessages]);

  //Seen Message
  useEffect(() => {
    const messages = document.querySelectorAll(".ReceivedMessages_Wrapper") ;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id')
            const message = allMessages.find((message) => message._id == id);
            socketRef.current?.emit('Seen_Message', message)
            console.log("Observer: ",entry.target)
          };
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      },
    );

    if(lastMessageRef.current) {
      observer.observe(lastMessageRef.current)
    }
    messages.forEach((message) => observer.observe(message));
  }, [allMessages]);

  //Initial Recent Messages
  useEffect(() => {
    try {
      const setRecentMessages = async () => {
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
        );
        setSeenMessage(messages[messages?.length - 1])
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
  }, [message]);

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

  return (
    <>
      <div className="Chat_header">
        <div className="profile">
          <img height={30} width={30} src={selectedUser.profile || profile} />
          <h1>{selectedUser.username}</h1>
        </div>

        <div className="line"></div>
      </div>
      <div className="chat_messages">
        <div className="Messages" ref={MessageSpaceRef}>
          {allMessages.map((messages: AllMessageType) => {
            if (messages.ReceiverId !== selectedUser._id) {
              return (
                <>
                  <h6 className="Messages_Day">
                    {getDayOfMessages(messages.createdAt, previousMessageTime)}
                  </h6>
                  <div className="ReceivedMessages_Wrapper">
                    <div className="Options">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                      <div className="option">
                        <button aria-label="Delete">
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                    <div className="ReceivedText_Wrapper" id={messages._id} ref={lastMessageRef}>
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

                      <p className="messageStyle received">{messages.text}</p>
                      <p className="receivedTime time">
                        {toLocaleTime(messages.createdAt)}
                      </p>
                    </div>
                  </div>
                </>
              );
            } else {
              console.log("All Messages: ", allMessages)
              return (
                <>
                  <h6 className="Messages_Day">
                    {getDayOfMessages(messages.createdAt, previousMessageTime)}
                  </h6>
                  <div className="SentMessages_Wrapper"  >
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
                      <p className="messageStyle">{messages.text}</p>
                      <p className="sentTime time">
                        {toLocaleTime(messages.createdAt)}
                      </p>
                      
                      { seenMessage?._id==messages._id &&<p id="Seen_Message">Seen</p>}
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

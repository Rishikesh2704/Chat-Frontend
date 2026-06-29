import { useEffect, useRef, useState } from "react";
import axios from "../../lib/axios";
import MessageForm from "./MessageForm";
import "./MessageMain.css";

type MessageSpacePros = {
  selectedUser: User;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
};

function toLocaleTime(time: string) {
  const date = new Date(time);
  const hoursAndSecs = date.toLocaleTimeString().split(":");
  const formattedTime =
    hoursAndSecs[0] +
    ":" +
    hoursAndSecs[1] +
    " " +
    hoursAndSecs[2].split(" ")[1];
  return formattedTime;
}

const fetchMessages = async (selectedUser: User, skipitems: number) => {
  const response = await axios(
    `${import.meta.env.VITE_API}/messages/${selectedUser._id}/${skipitems}`,
  );
  const reversed = response.data.messages.toReversed();
  return reversed;
};

const getDayOfMessages = (
  time: string,
  previousMessageTime: React.RefObject<string>,
) => {
  const date = new Date(time);
  if (date.toLocaleDateString() === new Date().toLocaleDateString())
    return "Today";
  if (previousMessageTime.current.length === 0) {
    previousMessageTime.current = date.toLocaleDateString();
    const formattedDate =
      date.getDate() +
      " " +
      date.toLocaleString("default", { month: "long" }) +
      " " +
      date.getFullYear();
    return formattedDate;
  } else if (previousMessageTime.current !== date.toLocaleDateString()) {
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

export default function MessageSpace(props: MessageSpacePros) {
  const { selectedUser, allMessages, setAllMessages } = props;
  const [message, setMessage] = useState<string | undefined>(undefined);
  let skipitems = useRef(0);
  let previousMessageTime = useRef<string>("");

  useEffect(() => {
    try {
      const setRecentMessages = async () => {
        const messages = await fetchMessages(selectedUser, skipitems.current);
        setAllMessages([...messages, ...allMessages]);
      };
      setRecentMessages();
    } catch (error: any) {
      console.log(error.response.data);
    }
  }, []);

  useEffect(() => {
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    const windw = () => {
      if (Math.floor(messageSpaceDiv.scrollTop) === 0) {
        try {
          skipitems.current += 15;
          const MoreRecentMessages = async () => {
            const messages1 = await fetchMessages(
              selectedUser,
              skipitems.current,
            );
            console.log("Messages: ", messages1);
            setAllMessages((prev) => [...messages1, ...prev]);
          };
          MoreRecentMessages();
        } catch (error: any) {
          console.log(error);
        }
      }
    };

    if (messageSpaceDiv) messageSpaceDiv.addEventListener("scroll", windw);

    return () => {
      if (messageSpaceDiv) messageSpaceDiv.removeEventListener("scroll", windw);
    };
  }, []);

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
        console.log("Delete Request: ", response);
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
          <i className="fa-solid fa-circle-user"></i>
          <h1>{selectedUser.username}</h1>
        </div>

        <div className="line"></div>
      </div>

        <div className="chat_messages">
          <div className="Messages">
            {allMessages.map((messages: AllMessageType) => {
              if (messages.ReceiverId !== selectedUser._id) {
                return (
                  <>
                    <h6 className="Messages_Day">
                      {getDayOfMessages(
                        messages.createdAt,
                        previousMessageTime,
                      )}
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
                      <div className="ReceivedText_Wrapper">
                        <p className="messageStyle">{messages.text}</p>
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
                      {getDayOfMessages(
                        messages.createdAt,
                        previousMessageTime,
                      )}
                    </h6>
                    <div className="SentMessages_Wrapper">
                      <div className="SentText_Wrapper">
                        <p className="messageStyle">{messages.text}</p>
                        <p className="sentTime time">
                          {toLocaleTime(messages.createdAt)}
                        </p>
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
          </div>
      </div>
        <MessageForm
          selectedUser={selectedUser}
          message={message}
          setMessage={setMessage}
          setAllMessages={setAllMessages}
        />
    </>
  );
}

import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useUser } from "../../lib/context";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type OnlineUsers = {
  [index: string]: string;
};

type AllMessageType = {
  SenderId: string;
  ReceiverId: string;
  text: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type MessageSpacePros = {
  selectedUser: User;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<AllMessageType[]>;
};

function toLocaleTime(time: string) {
  const date = new Date(time);
  return date.toLocaleTimeString();
}

function getSelectedUserSocketId(
  SocketIds: OnlineUsers[] | null,
  selectedUser: User,
) {
  let selectedUserSocketId;
  for (let id in SocketIds) {
    if (id === selectedUser?._id) selectedUserSocketId = SocketIds[id as any];
  }
  return selectedUserSocketId;
}

export default function MessageSpace(props: MessageSpacePros) {
  const { selectedUser, allMessages, setAllMessages } = props;
  const { onlineUsers: SocketIds } = useUser();
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const fetchMessages = async () => {
        const response = await axios(
          `${import.meta.env.VITE_API}/messages/${selectedUser._id}`,
        );
        setAllMessages([...response.data.messages, ...allMessages]);
      };

      fetchMessages();
      
    } catch (error: any) {
      console.log(error.response.data);
    }
  }, []);

  useEffect(() => {
    const messageSpaceDiv = document.getElementsByClassName('Messages')[0]
    if(messageSpaceDiv) {
      messageSpaceDiv.scrollTo({top:messageSpaceDiv.scrollHeight,behavior:'smooth'})
    }
  },[allMessages])

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    if (!message) return;
    try {
      const userSocketId = getSelectedUserSocketId(SocketIds, selectedUser);
      const messageRequest = await axios.post(
        `${import.meta.env.VITE_API}/messages/sendMessage/${selectedUser._id}`,
        { message, receiverSocketId: userSocketId },
      );
      if (messageRequest.status === 201) {
        setAllMessages([...allMessages, messageRequest.data.data]);
        setMessage("");
        messageSpaceDiv.scrollTo({
          top: messageSpaceDiv.scrollHeight,
          behavior: "smooth",
        });
      }
    } catch (error: any) {
      console.log(error.response.data);
    }
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

      <div className="Chat_main">
        <div className="chat_messages">
          <div className="Messages">
            {allMessages.map((messages: AllMessageType) => {
              
              if (messages.ReceiverId !== selectedUser._id) {
                console.log("Received Messaged: ", messages);
                return (
                  <div className="ReceivedMessage_Wrapper">
                    <p className="messageStyle">{messages.text}</p>
                  </div>
                );
              } else {
                console.log("Sent Messages: ", messages);
                return (
                  <div className="SentMessage_Wrapper">
                    <p className="messageStyle">{messages.text}</p>
                  </div>
                );
              }
            })}
          </div>
        </div>

        <form className="message_form" onSubmit={(e) => sendMessage(e)}>
          <label id="message_label" htmlFor="message_input">
            message
          </label>
          <input
            type="text"
            id="message_input"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>
          <button
            type="submit"
            id="sendMessage_button"
            aria-label="send message"
          >
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </>
  );
}

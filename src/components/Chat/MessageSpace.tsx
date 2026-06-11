import { useRef, useState } from "react";
import axios from "../../lib/axios";
import { useUser } from "../../lib/context";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type AllMessageType = {
  [index: string]: string;
  message: string;
};

type MessageSpacePros = {
  selectedUser: User;
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<AllMessageType[]>;
};

export default function MessageSpace(props: MessageSpacePros) {
  const { selectedUser, allMessages, setAllMessages } = props;
  const { users: SocketIds } = useUser();
  const [message, setMessage] = useState<string | undefined>(undefined);
  
  function getSelectedUserSocketId() {
    let selectedUserSocketId;
    for (let id in SocketIds) {
      if (id === selectedUser?._id) selectedUserSocketId = SocketIds[id as any];
    }
    return selectedUserSocketId;
  }

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message) return;
    try {
      const userSocketId = getSelectedUserSocketId();
      const messageRequest = await axios.post(
        `${import.meta.env.VITE_API}/messages/sendMessage/${selectedUser._id}`,
        { message, receiverSocketId:userSocketId },
      );
      console.log(messageRequest);
      setAllMessages([...allMessages, { to: selectedUser._id, message }]);
      setMessage('')
    } catch (error: any) {
      console.log(error.response);
    }
  };

  return (
    <>
      <div className="Chat_header">
        <div className="profile">
          <i className="fa-solid fa-circle-user"></i>
          <h1>{selectedUser.username}</h1>
        </div>
        <div className="chatheader_options">
          <i className="fa-solid fa-call"></i>
        </div>
      </div>

      <div className="Chat_main">
        <div className="chat_messages">
          <div className="Messages">
            {allMessages.map((messages: any) => {
              if (Object.hasOwn(messages, "from")) {
                return (
                  <div className="ReceivedMessage_Wrapper">
                    <p className="messageStyle">{messages.message}</p>
                  </div>
                );
              } else {
                return (
                  <div className="SentMessage_Wrapper">
                    <p className="messageStyle">{messages.message}</p>
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

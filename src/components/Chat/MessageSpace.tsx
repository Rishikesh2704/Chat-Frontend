import axios from "../../lib/axios";
import { useUser } from "../../lib/context";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type MessageSpacePros = {
  selectedUser: User;
  allMessages: { sent: string[]; received: string[] };
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setAllMessages: React.Dispatch<
    React.SetStateAction<{ sent: string[]; received: string[] }>
  >;
};

export default function MessageSpace(props: MessageSpacePros) {
  const { selectedUser, allMessages, message, setMessage, setAllMessages } =
    props;
  const { users: SocketIds } = useUser();

  function getSelectedUserSocketId() {
    let selectedUserSocketId;
    for (let id in SocketIds) {
      if (id === selectedUser?._id) selectedUserSocketId = SocketIds[id as any];
    }
    return selectedUserSocketId
  }


  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userSocketId = getSelectedUserSocketId()
      const messageRequest = await axios.post(
        `${import.meta.env.VITE_API}/messages/sendMessage/${userSocketId}`,
        { message },
      );
      console.log(messageRequest);
      setAllMessages({ sent: [...allMessages.sent, message], received: [] });
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
          {Object.entries(allMessages).map(([key, value]) => {
            if (key === "sent") {
              return <h3>{value}</h3>;
            }
          })}
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

// <>
//   <div className="Chat_header">
//     <div className="profile">
//       <i className="fa-solid fa-circle-user"></i>
//       <h1>{selectedUser.username}</h1>
//     </div>
//     <div className="chatheader_options">
//       <i className="fa-solid fa-call"></i>
//     </div>
//   </div>

//   <div className="Chat_main">
//     <div className="chat_messages">
//       {Object.entries(allMessages).map(([key, value]) => {
//         if (key === "sent") {
//           return <h3>{value}</h3>;
//         }
//       })}
//     </div>
//     <form className="message_form" onSubmit={(e) => sendMessage(e)}>
//       <label id="message_label" htmlFor="message_input">
//         message
//       </label>
//       <input
//         type="text"
//         id="message_input"
//         onChange={(e) => setMessage(e.target.value)}
//         value={message}
//       ></input>
//       <button
//         type="submit"
//         id="sendMessage_button"
//         aria-label="send message"
//       >
//         <i className="fa-regular fa-paper-plane"></i>
//       </button>
//     </form>
//   </div>
// </>

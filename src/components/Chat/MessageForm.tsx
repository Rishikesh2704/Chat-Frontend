import { useState } from "react";
import axios from "../../lib/axios";
import { useUser } from "../../lib/context";
import "./MessageForm.css";

type propsType = {
  message: string | undefined;
  setMessage: (message: string) => void;
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  selectedUser: User;
};

// type OnlineUsers = {
//   [index: string]: string;
// };

function getSelectedUserSocketId(SocketIds: any[] | null, selectedUser: User) {
  let selectedUserSocketId;
  for (let id in SocketIds) {
    if (id === selectedUser?._id) selectedUserSocketId = SocketIds[id as any];
  }
  return selectedUserSocketId;
}

export default function MessageForm(props: propsType) {
  const { message, setMessage, setAllMessages, selectedUser } = props;
  const { onlineUsers: SocketIds } = useUser();
  const [file, setFile] = useState<any>();

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    if (!message) return;
    try {
      const userSocketId = getSelectedUserSocketId(SocketIds, selectedUser);
      console.log("Image file: ", file);
      const form = new FormData();
      form.append("image", file);
      form.append("message", message);
      form.append("receiverSocketId", userSocketId);
      const messageRequest = await axios.post(
        `${import.meta.env.VITE_API}/messages/sendMessage/${selectedUser._id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (messageRequest.status === 201) {
        setAllMessages((prev) => [...prev, messageRequest.data.data]);
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
    <form className="message_form" onSubmit={(e) => sendMessage(e)}>
      <label id="message_label" htmlFor="message_input">
        message
      </label>
      <input
        type="text"
        id="message_input"
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message..."
        value={message}
      ></input>
      <div className="select_image_wrapper">
        <label id="ImageInputFor" htmlFor="select_image">
          <i id="ImageIcon" className="fa-regular fa-image"></i>
        </label>
        <input
          type="file"
          name="image"
          id="select_image"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      <button type="submit" id="sendMessage_button" aria-label="send message">
        <i className="fa-regular fa-paper-plane"></i>
      </button>
      <button />
    </form>
  );
}

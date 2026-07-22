import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useUser } from "../../lib/context";
import "./MessageForm.css";
import type { Socket } from "socket.io-client";

type propsType = {
  message: string | undefined;
  setMessage: (message: string) => void;
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  selectedUser: User;
  socketRef: React.RefObject<Socket | null>;
};

function getSelectedUserSocketId(SocketIds: any[] | null, selectedUser: User) {
  let selectedUserSocketId;
  for (let id in SocketIds) {
    if (id === selectedUser?._id) selectedUserSocketId = SocketIds[id as any];
  }
  return selectedUserSocketId;
}

export default function MessageForm(props: propsType) {
  const { message, setMessage, setAllMessages, selectedUser, socketRef } = props;
  const { onlineUsers: SocketIds } = useUser();
  const [file, setFile] = useState<any>();
  const [preview, setPreview] = useState("");
  
  let selectedUserSocketId: any = Object.entries(SocketIds as any).filter(
    ([key, value]) => key == selectedUser._id,
  );

  if (selectedUserSocketId[0]) {
    selectedUserSocketId = selectedUserSocketId[0][1];
  }

  const handleImageUploadChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const preview = URL.createObjectURL(e.target.files[0]);
      setPreview(preview);
      setFile(e.target.files ? e.target.files[0] : null);
    }
  };

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageSpaceDiv = document.getElementsByClassName("Messages")[0];
    if (!message) return;
    try {
      const userSocketId = getSelectedUserSocketId(SocketIds, selectedUser);
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
        setAllMessages((prev) => [...prev, messageRequest.data.newMessage]);
        setMessage("");
        messageSpaceDiv.scrollTo({
          top: messageSpaceDiv.scrollHeight,
          behavior: "smooth",
        });
      }
      setFile("");
      setPreview("");
    } catch (error: any) {
      console.log(error.response.data);
    }
  };

  const handleTextOnChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setMessage(e.target.value);
  };

  const handleOnFocus = () => {
    if (socketRef.current) {
      socketRef.current.emit("Typing", {
        id: selectedUserSocketId,
        isTyping: true,
      });
    }
  };

  const handleOffFocus = () => {
    if (socketRef.current) {
      socketRef.current.emit("Typing", {
        id: selectedUserSocketId,
        isTyping: false,
      });
    }
  };

  return (
    <div className="SendMessageFrom_Wrapper">
      <form className="message_form" onSubmit={(e) => sendMessage(e)}>
        <label id="message_label" htmlFor="message_input">
          message
        </label>

        <input
          type="text"
          id="message_input"
          onChange={(e) => handleTextOnChange(e)}
          onFocus={handleOnFocus}
          onBlur={handleOffFocus}
          placeholder="Message..."
          value={message}
        ></input>
        <label id="ImageInputFor" htmlFor="select_image">
          <i id="ImageIcon" className="fa-regular fa-image"></i>
          <input
            type="file"
            name="image"
            id="select_image"
            onChange={(e) => handleImageUploadChange(e)}
          />
        </label>

        <button type="submit" id="sendMessage_button" aria-label="send message">
          <i className="fa-regular fa-paper-plane"></i>
        </button>
        <button />
        {preview && (
          <div className="Preview_Wrapper">
            <div className="Preview">
              <img
                className="Preview_Img"
                width={175}
                height="auto"
                src={preview}
                alt=""
              />
              <button
                className="Cancel_Button"
                onClick={() => {
                  setPreview("");
                  setFile("");
                }}
              >
                <i className="fa-solid fa-x"></i>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

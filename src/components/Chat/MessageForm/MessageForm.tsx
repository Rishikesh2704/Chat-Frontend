import React, { useState } from "react";
import { Socket } from "socket.io-client";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import "./MessageForm.css";

import axios from "../../../lib/axios"; 
import { useUser } from "../../../lib/context";

type propsType = {
  message: string | undefined;
  setMessage: (message: any) => void;
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  selectedUser: User | Group ;
  socketRef: React.RefObject<Socket | null>;
};

function getSelectedUserSocketId(SocketIds: any[] | null, selectedUser:any) {
 const isGroup = Object.hasOwn(selectedUser,'RoomId');
  if(isGroup) return selectedUser.RoomId as Group ;
  if (SocketIds) {
    const selectedUserSocketId = Object.entries(SocketIds).find(
      ([key, _]) => key == selectedUser._id,
    );
    return selectedUserSocketId && selectedUserSocketId[1];
  } else {
    return null;
  }
  // if (SocketIds) return SocketIds[selectedUser._id as any];
}

async function messageFriendRequest(
  SocketIds: any[] | null,
  selectedUser: User,
  file: any,
  message: string,
) {
  // const userSocketId = getSelectedUserSocketId(SocketIds, selectedUser);
  const userSocketId = SocketIds ? SocketIds[selectedUser._id as any] : "";
  console.log("Socket Ids : ", SocketIds, "\n Receiver socket id: ", userSocketId);
  const form = new FormData();
  form.append("image", file);
  form.append("message", message);
  form.append("receiverSocketId", userSocketId );
  return await axios.post(
    `${import.meta.env.VITE_API}/messages/sendMessage/${selectedUser._id}`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

async function  groupMessageRequest(
  group: Group,
  message: string,
  file: string,
) {
  const form = new FormData();
  form.append("message", message);
  form.append("image", file);
  form.append("room", group.roomId);
  return await axios.post(
    `${import.meta.env.VITE_API}/group/${group._id}/message`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

export default function MessageForm(props: propsType) {
  const { message, setMessage, setAllMessages, selectedUser, socketRef } =
    props;
  const { onlineUsers: SocketIds } = useUser();
  const [file, setFile] = useState<any>();
  const [preview, setPreview] = useState("");
  const [emojiVisible, setEmojiVisible] = useState(false);
  let selectedUserSocketId: any = getSelectedUserSocketId(
    SocketIds,
    selectedUser ,
  );

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
      const isGroup = Object.hasOwn(selectedUser, "roomId");
      const messageRequest = !isGroup
        ? await messageFriendRequest(SocketIds, selectedUser as User, file, message)
        : await groupMessageRequest(selectedUser as Group, message, file);

      if (messageRequest.status === 201) {
        console.log("Message request: ", messageRequest)
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
      const socket = socketRef.current;
      socket.emit("Typing", {
        id: selectedUserSocketId,
        isTyping: true,
      });
    }
  };

  const handleOffFocus = () => {
    if (socketRef.current) {
      const socket = socketRef.current;
      socket.emit("Typing", {
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
          value={message as string}
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

        <button
          aria-label="Emojis"
          type="button"
          id="Emojis"
          onClick={() =>
            setEmojiVisible((prev) => (prev == true ? false : true))
          }
        >
          <i className="fa-regular fa-face-grin"></i>
        </button>

        <button type="submit" id="sendMessage_button" aria-label="send message">
          <i className="fa-regular fa-paper-plane"></i>
        </button>

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
                type="button"
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

        {emojiVisible && (
          <div className="Emoji_Wrapper">
            <EmojiPicker
              open={emojiVisible}
              className="Emojis_Main"
              emojiStyle={"native" as EmojiStyle}
              height={"100%"}
              onEmojiClick={(emojiObject) => {
                setMessage((prev: any) =>
                  prev !== undefined
                    ? prev + emojiObject.emoji
                    : emojiObject.emoji,
                );
                console.log(emojiObject);
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
}

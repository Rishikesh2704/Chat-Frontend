import React, { useRef, useState } from "react";
import { Socket } from "socket.io-client";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import "./MessageForm.css";

import axios from "../../../lib/axios";
import { useUser } from "../../../lib/context";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  addNewMessage,
  updateUserConversation,
} from "../../../redux/Slicers/ChatSlice";
import { isGroup } from "../../../utils/IsGroup";
import { useOutsideElement } from "../../../hooks/useOutsideElement";

type propsType = {
  message: string | undefined;
  setMessage: (message: any) => void;
  // setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  // selectedUser: User | Group;
};

function getSelectedUserSocketId(onlineUsers: any[] | null, selectedUser: any) {
  if (isGroup(selectedUser)) return selectedUser.roomId;
  if (onlineUsers) {
    const selectedUserSocketId = Object.entries(onlineUsers).find(
      ([key, _]) => key == selectedUser._id,
    );
    return selectedUserSocketId && selectedUserSocketId[1];
  } else {
    return null;
  }
}

async function messageFriendRequest(
  onlineUsers: any[] | null,
  selectedUser: User,
  file: File | null,
  message: string | undefined,
  conversationId: string | "",
) {
  if (!onlineUsers || !selectedUser) {
    console.log("One of the args is missing");
    return;
  }
  if (!file && !message) {
    console.log("NO Message and File Provided");
  }
  const userSocketId = onlineUsers ? onlineUsers[selectedUser._id as any] : "";

  const form = new FormData();
  form.append("image", file || "");
  form.append("message", message || "");
  form.append("conversationId", conversationId);
  form.append("receiverSocketId", userSocketId);
  return await axios.post(`/messages/sendMessage/${selectedUser._id}`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function groupMessageRequest(
  group: Group,
  message: string | undefined,
  file: File | null,
  conversationId:string | ""
) {
  if (!file && !message) {
    console.log("NO Messag and File Provided");
  }

  const form = new FormData();
  form.append("message", message || "");
  form.append("image", file || "");
  form.append("conversationId", conversationId);
  form.append("room", group.roomId);
  return await axios.post(
    `/group/${group._id}/message`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

export default function MessageForm(props: propsType) {
  const { message, setMessage } = props;
  const { selectedUser, onlineUsers, allMessages } = useAppSelector(
    (state) => state.chat,
  );
  const { currentUser } = useAppSelector((state) => state.auth);
  const { socket } = useUser();

  const dispatch = useAppDispatch();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [emojiVisible, setEmojiVisible] = useState(false);

  const emojiBtnRef = useRef<any>(null);
  const lastMessage = allMessages.at(-1);

  function closeEmojiBtn(){
    setEmojiVisible(false)
  }

  useOutsideElement(emojiBtnRef, closeEmojiBtn);

  let selectedUserSocketId: any = getSelectedUserSocketId(
    onlineUsers,
    selectedUser,
  );

  if (!selectedUser) {
    console.log("No SelectedUser");
    return;
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
    // if(!lastMessage?.conversationId){
    //   console.log("No conversation Id: ", lastMessage);
    //   return;
    // }
    try {
      const messageRequest = !isGroup(selectedUser)
        ? await messageFriendRequest(
            onlineUsers,
            selectedUser as User,
            file,
            message,
            lastMessage?.conversationId || "",
          )
        : await groupMessageRequest(selectedUser as Group, message, file, lastMessage?.conversationId || "");
      console.log("Message Request : ", messageRequest);
      if (messageRequest?.status === 201) {
        console.log(messageRequest.data);
        !isGroup(selectedUser) && dispatch(updateUserConversation(messageRequest.data.conversation));
        dispatch(addNewMessage(messageRequest.data.newMessage));
        setMessage("");
        messageSpaceDiv.scrollTo({
          top: messageSpaceDiv.scrollHeight,
          behavior: "smooth",
        });
      }
      setFile(null);
      setPreview("");
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleTextOnChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setMessage(e.target.value);
  };

  const handleOnFocus = () => {
    if (socket) {
      let roomId = isGroup(selectedUser)
        ? selectedUser.roomId
        : selectedUserSocketId;
      socket.emit("Typing", {
        roomId: roomId,
        typerId: currentUser._id,
        isTyping: true,
      });
    }
  };

  const handleOffFocus = () => {
    if (socket) {
      let roomId = isGroup(selectedUser)
        ? selectedUser.roomId
        : selectedUserSocketId;
      socket.emit("Typing", {
        roomId: roomId,
        typerId: currentUser._id,
        isTyping: false,
      });
    }
  };

  const handleEmojiBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    emojiBtnRef.current = e.target;
    setEmojiVisible((prev) => !prev);
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
          onClick={(e) => handleEmojiBtn(e)}
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
                  setFile(null);
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

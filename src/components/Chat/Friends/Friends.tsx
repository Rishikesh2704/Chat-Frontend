import "./Friends.css";
import profile from "../../../assets/profile.jpg";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setAllMessages, setSelectedUser } from "../../../redux/Chat/ChatSlice";

import { toLocaleTime } from "../../../utils/MessagesTime";
import axiosInstance from "../../../lib/axios";
import { deriveSharedKey } from "../../../utils/End2End";
// import { generateSharedKey, storeSharedKey } from "../../../utils/End2End";

async function getUserPublicKey(userId: string) {
  try {
    const response = await axiosInstance.get(`/users/publicKey/${userId}`);
    const key = await response.data.publicKey;
    return key;
  } catch (error) {
    console.log("Error in retrieving public key: ", error);
  }
}

export default function Friends({error}:{error:any}) {
  const { users, selectedUser, onlineUsers } = useAppSelector(
    (state) => state.chat,
  );
  const { searchResults } = useAppSelector((state) => state.modal);
  const { currentUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [onlineUsersIds, setOnlineUsersIds] = useState<string[]>([]);

  useEffect(() => {
    if (onlineUsers) {
      setOnlineUsersIds(Object.keys(onlineUsers));
    }
  }, [onlineUsers]);

  const isFriendsOrSearch = () => {
    return searchResults.length > 0 ? searchResults : users;
  };

  const handleClick = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    const allElements = document.querySelectorAll(".User_Wrapper");
    const mobileChatSpace = document.querySelector(".Chat_Space");
    if (allElements.length > 0) {
      allElements.forEach((element) => {
        if (
          element.classList.contains("selectedUser") &&
          e.currentTarget !== element
        )
          element.classList.remove("selectedUser");
      });
    }
    e.currentTarget.classList.add("selectedUser");
    mobileChatSpace?.classList.add("mobileChat");
    const publicKey = await getUserPublicKey(user._id);
    const derivedSecret = await deriveSharedKey(publicKey.publicKey);
    if(!derivedSecret) return;
    const newUser = {
      ...user,
      publicKey,
      sharedSecret:JSON.stringify(derivedSecret),
    };
    dispatch(setSelectedUser(newUser));
    dispatch(setAllMessages([]));
  };

  if(error){
    throw error
  }

  
  return (
    <div className="Chat_Friends">
      {isFriendsOrSearch().map((user: any) => {
        return (
          <div
            key={user?._id}
            className="User_Wrapper"
            onClick={(e) => handleClick(e, user)}
          >
            <figure>
              <div className="profile_picture">
                <img
                  height={37}
                  width={37}
                  src={user?.profile || profile}
                  loading="lazy"
                  alt=""
                />
              </div>
              <div
                className={`${onlineUsersIds.includes(user?._id) ? "online" : ""}`}
              ></div>
            </figure>
            <div className="User_Details">
              <div className="User_Details_Username">
                <h2>{user.username || user?.groupName}</h2>
                <p className="Last_message_time">
                  {toLocaleTime(user?.updatedAt)}
                </p>
              </div>
              <div id="Last_message">
                <p className={`${user.messagesCount !== 0 ? "Unseen" : ""}`}>
                  {user.lastMessage &&
                    user?.lastMessage?.senderId === currentUser?._id &&
                    "You :"}
                  {user.lastMessage &&
                  user?.lastMessage?.messageType === "image" ? (
                    <>
                      <i className="fa-regular fa-image" /> Photo
                    </>
                  ) : (
                    user?.lastMessage?.message
                  )}
                </p>
                {selectedUser?._id !== user.lastMessage?.senderId &&
                  user.messagesCount > 0 && (
                    <p className="MessageCount">{user.messagesCount}</p>
                  )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

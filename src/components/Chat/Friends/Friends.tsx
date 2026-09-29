import "./Friends.css";
import profile from "../../../assets/profile.jpg";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setAllMessages,
  setSelectedUser,
} from "../../../redux/Slicers/ChatSlice";

import { toLocaleTime } from "../../../utils/MessagesTime";

export default function Friends() {
  const { users, onlineUsers } = useAppSelector((state) => state.chat);
  const { searchResults } = useAppSelector((state) => state.modal);
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

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    const allElements = document.querySelectorAll(".User_Wrapper");
    const mobileChatSpace = document.querySelector(".Chat_Space")
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
    mobileChatSpace?.classList.add('mobileChat')
    dispatch(setSelectedUser(user));
    dispatch(setAllMessages([]));
  };
  
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
                <img height={37} width={37} src={user?.profile || profile} loading="lazy" alt="" />
              </div>
              <div
                className={`${onlineUsersIds.includes(user?._id) ? "online" : ""}`}
              ></div>
            </figure>
            <div className="User_Details">
              <h2>{user.username || user?.groupName}</h2>
              {
                <div id="Last_message">
                  <p>
                    {user.lastMessage &&
                    user?.lastMessage?.messageType === "image" ? (
                      <>
                        <i className="fa-regular fa-image" /> Photo
                      </>
                    ) : (
                      user?.lastMessage?.message
                    )}
                  </p>
                  <p>{toLocaleTime(user?.updatedAt)}</p>
                </div>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

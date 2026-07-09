import { useEffect, useState } from "react";
import "./Friends.css";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type FriendsProps = {
  users: User[];
  setSelectedUser: (user: User) => void;
  onlineUsers: any;
  lastMessage: AllMessageType;
};

export default function Friends(props: FriendsProps) {
  const { users, setSelectedUser, onlineUsers, lastMessage } = props;
  const [onlineUsersIds, setOnlineUsersIds] = useState<string[]>([]);
  const [recentMessage, setRecentMessage] = useState<AllMessageType>();
  useEffect(() => {
    if (onlineUsers) {
      setOnlineUsersIds(Object.keys(onlineUsers));
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (!lastMessage) {
      const storedMessage = JSON.parse(
        localStorage.getItem("Last_Message") as string,
      );
      setRecentMessage(storedMessage);
    }
    else setRecentMessage(lastMessage);
  }, [lastMessage]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    const allElements = document.querySelectorAll(".User_Wrapper");
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
    setSelectedUser(user);
  };

  return (
    <div className="Chat_Friends">
      {users &&
        users.map((user: any) => {
          return (
            <div
              key={user._id}
              className="User_Wrapper"
              onClick={(e) => handleClick(e, user)}
            >
              <figure>
                <div className="profile_picture">
                  <img src={user.profile} />
                </div>
                <div
                  className={`${onlineUsersIds.includes(user._id) ? "online" : ""}`}
                ></div>
              </figure>
              <div className="User_Details">
                <h2>{user.username}</h2>
                <p>
                  {(recentMessage && recentMessage.text)}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}

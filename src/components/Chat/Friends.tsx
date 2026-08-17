import { useEffect, useState } from "react";
import "./Friends.css";

type FriendsProps = {
  users: User[];
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  onlineUsers: any;
  lastMessage: AllMessageType;
  setAllMessages: React.Dispatch<React.SetStateAction<any[]>>;
};

function toLocaleTime(time: string) {
  const date = new Date(time);
  const hoursAndSecs = date.toLocaleTimeString().split(":");
  const formattedTime =
    hoursAndSecs[0] +
    ":" +
    hoursAndSecs[1] +
    " " +
    hoursAndSecs[2]?.split(" ")[1];
  return formattedTime;
}

export default function Friends(props: FriendsProps) {
  const { users, setSelectedUser, onlineUsers, lastMessage, setAllMessages } =
    props;
  const [onlineUsersIds, setOnlineUsersIds] = useState<string[]>([]);
  const [recentMessage, setRecentMessage] = useState<AllMessageType>();
  useEffect(() => {
    if (onlineUsers) {
      setOnlineUsersIds(Object.keys(onlineUsers));
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (!lastMessage) {
      try {
        const storedMessage = JSON.parse(
          localStorage.getItem("Last_Message") as string,
        );

        setRecentMessage(storedMessage);
      } catch (error) {
        console.log(error);
      }
    } else setRecentMessage(lastMessage);
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
    setAllMessages([]);
    console.log(user);
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
                <div id="Last_message">
                  <p
                    className={`${recentMessage && !recentMessage.seen && recentMessage?.ReceiverId !== user._id ? "Unseen" : ""}`}
                  >
                    {recentMessage && recentMessage.text}
                  </p>
                  <p>
                    {recentMessage && toLocaleTime(recentMessage.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

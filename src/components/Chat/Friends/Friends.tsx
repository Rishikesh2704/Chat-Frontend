import { useEffect, useState } from "react";
import "./Friends.css";
import profile from "../../../assets/profile.jpg";
import { useAppDispatch } from "../../../redux/hooks";
import { setSelectedUser } from "../../../redux/Slicers/ChatSlice";

type FriendsProps = {
  users: User[];
  // setSelectedUser: React.Dispatch<React.SetStateAction<User | Group | null>>;
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
  const { users, onlineUsers, lastMessage, setAllMessages } = props;
  const dispatch = useAppDispatch();

  const [onlineUsersIds, setOnlineUsersIds] = useState<string[]>([]);
  const [recentMessages, setRecentMessages] = useState<any>();

  useEffect(() => {
    if (onlineUsers) {
      setOnlineUsersIds(Object.keys(onlineUsers));
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (!lastMessage) {
      try {
        const storedMessage = JSON.parse(
          localStorage.getItem("Recent_Messages") as string,
        );
        console.log("Recent Message: ", storedMessage)
        setRecentMessages(storedMessage);
      } catch (error) {
        console.log(error);
      }
    }
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
    
    // setSelectedUser(user);
    console.log("Clicked on ", user)
    dispatch(setSelectedUser(user));
    setAllMessages([]);
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
                  <img src={user.profile || profile} />
                </div>
                <div
                  className={`${onlineUsersIds.includes(user._id) ? "online" : ""}`}
                ></div>
              </figure>
              <div className="User_Details">
                <h2>{user.username || user.groupName}</h2>
                {recentMessages && recentMessages[user._id] && (
                  <div id="Last_message">
                    <p
                      className={`${recentMessages[user._id] && !recentMessages[user._id].seen && recentMessages[user._id]?.ReceiverId !== user._id ? "Unseen" : ""}`}
                    >
                      {recentMessages[user._id] && recentMessages[user._id].text}
                    </p>
                    <p>
                      {recentMessages[user._id] && toLocaleTime(recentMessages[user._id].createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

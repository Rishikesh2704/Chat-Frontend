import { useEffect, useState } from "react";
import './Friends.css'

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type FriendsProps = {
  users: User[];
  setSelectedUser: (user: User) => void;
  onlineUsers: any;
};

export default function Friends(props: FriendsProps) {
  const { users, setSelectedUser, onlineUsers } = props;
  const [onlineUsersIds, setOnlineUsersIds ] = useState<string[]>([])
  useEffect(() => {
    if (onlineUsers) {
      setOnlineUsersIds(Object.keys(onlineUsers))
    }
  }, [,onlineUsers]);

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
          return(
            <div
            key={user._id}
            className="User_Wrapper"
            onClick={(e) => handleClick(e, user)}
          >
            <figure>
              <i className="fa-solid fa-circle-user "></i>
              <div
                className={`${onlineUsersIds.includes(user._id) ? "online" : ""}`}
              ></div>
            </figure>
            <div className="User_Details">
              <h2>{user.username}</h2>
              <p>Hi</p>
            </div>
          </div>
          )
          
        })}
    </div>
  );
}

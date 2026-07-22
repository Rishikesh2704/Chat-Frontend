import { useEffect, useRef, useState } from "react";
import { useUser } from "../../lib/context.js";
import { io, Socket } from "socket.io-client";

import "./Home.css";
import axios from "../../lib/axios.js";
import Friends from "../Chat/Friends.js";
import MessageMain from "../Chat/MessageMain.js";

// type ReceivedMessageType = {
//   SenderId: string;
//   ReceiverId: string;
//   text: string;
//   image?: string;
//   _id: string;
//   createdAt: string;
//   updatedAt: string;
//   isSent?:boolean;
// };

export default function Home() {
  const { setOnlineUsers, onlineUsers } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  const socketRef = useRef<Socket|null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        setUsers(data?.data);
      } catch (error: any) {
        console.log(error.response);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("Current_User") as string);
    socketRef.current = io(`${import.meta.env.VITE_API}`, {
      query: { userId: user?._id, username: user?.username },
    });

    const socket = socketRef.current;

    socket.on("get_Online_Users", (UsersList: any) => {
      setOnlineUsers(UsersList);
    });

    socket.on("privateMessage", (message: AllMessageType, ack: any) => {
      console.log(message);
      setAllMessages((prev: any) => [...prev, message]);
      ack(true);
    });
    
    socket.on("Users_Online", (onlineUsers: any) => {
      setOnlineUsers(onlineUsers);
    });

    
    
  }, []);

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="AppName">Convo</h1>
        </div>

        <form className="Search_Form">
          <label id="search_label" htmlFor="search_input">
            Search
          </label>
          <input type="text" id="search_input" />
          <button id="search_btn" aria-label="Search" type="submit">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <Friends
          users={users}
          setSelectedUser={setSelectedUser}
          onlineUsers={onlineUsers}
          lastMessage={allMessages[allMessages.length - 1]}
        />
      </section>

      <section className="Chat_Space">
        {selectedUser ? (
          <MessageMain
            selectedUser={selectedUser}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            socketRef={socketRef}
          />
        ) : (
          <div className="NoChats">
            <i className="fa-solid fa-message"></i>
            <span>No Chats Selected</span>
          </div>
        )}
      </section>
    </div>
  );
}

import { useNavigate } from "react-router";
import "./Home.css";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../lib/context.js";
import { io } from "socket.io-client";
import axios from "../../lib/axios.js";
import Friends from "../Chat/Friends.js";
import MessageSpace from "../Chat/MessageSpace.js";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

type ReceivedMessageType = {
  SenderId: string;
  ReceiverId: string;
  text: string;
  image?: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
};

type AllMessageType = {
  SenderId: string;
  ReceiverId: string;
  text: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

function toLocaleTime(time: string) {
  const date = new Date(time);
  return date.toLocaleTimeString();
}

export default function Home() {
  const { setOnlineUsers, onlineUsers } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  useEffect(() => {
    console.log(JSON.parse(localStorage.getItem('Current_User') as string))
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
    const socket = io(`${import.meta.env.VITE_API}`, {
      query: { userId: user?.id, username: user?.username },
    });

    try {
      socket.on("get_Online_Users", (UsersList: any) => {
        setOnlineUsers(UsersList);
      });

      socket.on("privateMessage", (message: ReceivedMessageType, ack) => {
        setAllMessages((prev: any) => [
          ...prev,
          message
        ]);
        ack(true);
      });

      socket.on("Users_Online", (onlineUsers) => setOnlineUsers(onlineUsers));
    } catch (error: any) {
      console.log(error.response);
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API}/auth/logout`);
      localStorage.removeItem("Current_User");
      console.log(
        "Logout Handler: ",
        JSON.parse(localStorage.getItem("Current_User") as string),
      );
      navigate("/authentication/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="AppName">Convo</h1>
          {/* <a href="/account" className="Account">
            <i className="fa-solid fa-circle-user"></i>
          </a> */}
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
        />
        <button
          className="Logout_Btn"
          aria-label="Logout"
          onClick={handleLogOut}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </section>

      <section className="Chat_Space">
        {selectedUser && (
          <MessageSpace
            selectedUser={selectedUser}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
          />
        )}
      </section>
    </div>
  );
}

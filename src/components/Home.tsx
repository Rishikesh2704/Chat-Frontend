import { useNavigate } from "react-router";
import "./Home.css";
import { useEffect, useState } from "react";
import { useUser } from "../lib/context.js";
import { io } from "socket.io-client";
import axios from "../lib/axios.js";
import Friends from "./Chat/Friends.js";
import MessageSpace from "./Chat/MessageSpace.js";

type User = {
  _id: string;
  username: string;
  profile?: string;
};

export default function Home() {
  const { setUsers: setUserSocketIds } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [allMessages, setAllMessages] = useState<{
    sent: string[];
    received: string[];
  }>({ sent: [], received: [] });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("CurrentUser") as string);
    console.log(user);
    const socket = io(`${import.meta.env.VITE_API}`, {
      query: { userId: user?.id, username: user?.username },
    });
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
        console.log(error.response)
      }
    };
    socket.on("connect", () => {
      socket.emit("chat", "Connected to the server!");
    });
    console.log("My SocketId : ", socket);
    socket.on("getUsers", (UsersList: any) => {
      console.log("UsersList: ", UsersList);
      setUserSocketIds(UsersList);
    });
    socket.on("privateMessage", (message) => console.log(message));

    fetchUsers();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogOut = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/auth/logout`,
      );
      navigate("/authentication/login");
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="Home_Wrapper">
      <nav className="Navbar">
        <div className="Header">
          <h1 id="AppName">Convo</h1>
          <a href="/account" className="Account">
            <i className="fa-solid fa-circle-user"></i>
          </a>
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

        <Friends users={users} setSelectedUser={setSelectedUser} />
        <button
          className="Logout_Btn"
          aria-label="Logout"
          onClick={handleLogOut}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </nav>

      <section className="Chat_Space">
        {selectedUser && (
          <MessageSpace
            selectedUser={selectedUser}
            allMessages={allMessages}
            message={message}
            setAllMessages={setAllMessages}
            setMessage={setMessage}
          />
        )}
      </section>
    </div>
  );
}

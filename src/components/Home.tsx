import { useNavigate } from "react-router";
import "./Home.css";
import { useEffect, useState } from "react";
import axios from "../lib/axios.js";

type User = {
  id: number;
  username: string;
  profile?: string;
};

export default function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectChat] = useState<User | undefined>();
  const [message, setMessage] = useState<string>("");
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
        
        // if (error.response.data.message === "Unauthorized")
        //   navigate("/authentication/login");
      }
    };
    fetchUsers();
  }, []);

  const handleLogOut = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/auth/logout`,
      );

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

        <div className="Chat_Friends">
          {users &&
            users.map((user: any) => (
              <>
                <div
                  key={user.username + 2}
                  className="User_Wrapper"
                  onClick={() => setSelectChat(user)}
                >
                  <figure>
                    <i className="fa-solid fa-circle-user"></i>
                  </figure>
                  <div className="User_Details">
                    <h2>{user.username}</h2>
                    <p>Hi</p>
                  </div>
                </div>
              </>
            ))}
        </div>
        <button
          className="Logout_Btn"
          aria-label="Logout"
          onClick={handleLogOut}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </nav>
      <section className="Chat_Space">
        {selectedChat && (
          <>
            <div className="Chat_header">
              <div className="profile">
                <i className="fa-solid fa-circle-user"></i>
                <h1>{selectedChat.username}</h1>
              </div>
              <div className="chatheader_options">
                <i className="fa-solid fa-call"></i>
              </div>
            </div>

            <div className="Chat_main">
              <div className="chat_messages">Messages</div>
              <form className="message_form">
                <label id="message_label" htmlFor="message_input">
                  message
                </label>
                <input
                  type="text"
                  id="message_input"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                ></input>
                <button
                  type="submit"
                  id="sendMessage_button"
                  aria-label="send message"
                >
                  <i className="fa-regular fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

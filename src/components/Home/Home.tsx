import React, { useEffect, useState } from "react";
import { useUser } from "../../lib/context.js";

import "./Home.css";
import axios from "../../lib/axios.js";
import Friends from "../Chat/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import { Socket } from "socket.io-client";
import Modal from "../Modal/Modal.js";
import Account from "../Account/Account.js";

type props = {
  socketRef: React.RefObject<Socket | null>;
};
export default function Home(props: props) {
  const { setOnlineUsers, onlineUsers } = useUser();
  const { socketRef } = props;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        setUsers([...data?.data.Friends, ...data.data.Groups]);
        console.log(data.data);
      } catch (error: any) {
        console.log(error.response);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // const user = JSON.parse(localStorage.getItem("Current_User") as string);
    //  socketRef.current = io(`${import.meta.env.VITE_API}`, {
    //   query: { userId: user?._id, username: user?.username },
    // });

    if (socketRef.current) {
      const socket = socketRef.current;
      socket.on("Online_Users", (UsersList: any) => {
        setOnlineUsers(UsersList);
      });

      socket.on("privateMessage", (message: AllMessageType, ack: any) => {
        setAllMessages((prev: any) => [...prev, message]);
        ack(true);
      });

      socket.on("AfterDisconnection_Online_Users", (onlineUsers: any) => {
        setOnlineUsers(onlineUsers);
      });
    }
  }, [socketRef.current]);

  const handleCreateGroup = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setViewModal(true);
    document.getElementsByTagName("main")[0].style.alignItems = "initial";
  };

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="Heading">Messages</h1>
        </div>

        <Friends
          users={users}
          setSelectedUser={setSelectedUser}
          setAllMessages={setAllMessages}
          onlineUsers={onlineUsers}
          lastMessage={allMessages[allMessages.length - 1]}
        />
        <button
          className="Create_Group_Btn"
          aria-label="Create Group"
          onClick={handleCreateGroup}
        >
          +
        </button>
      </section>
      {viewModal && <Modal setViewModal={setViewModal} Users={users} />}
      <section className="Chat_Space">
        {selectedUser ? (
          <MessageMain
            selectedUser={selectedUser}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            socketRef={socketRef}
            setShowDetails={setShowDetails}
          />
        ) : (
          <div className="NoChats">
            <i className="fa-solid fa-message"></i>
            <span>No Chats Selected</span>
          </div>
        )}
      </section>
      {showDetails&&<aside className="Account_Details">
        <Account />
      </aside>}
    </div>
  );
}

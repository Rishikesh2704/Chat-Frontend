import React, { useEffect, useState } from "react";
import { useUser } from "../../lib/context.js";

import "./Home.css";
import Friends from "../Chat/Friends/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import { Socket } from "socket.io-client";
import Modal from "../Modal/Modal.js";
import Account from "../Account/Account.js";
import axios from "../../lib/axios.js";
import Search from "../Modal/Search.js";
import { useAppSelector } from "../../redux/hooks.js";

export default function Home() {
  const { setOnlineUsers, onlineUsers, getUser, socket } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const { selectedUser } = useAppSelector(state => state.chat)
  // const [selectedUser, setSelectedUser] = useState<User | Group | null>(null);
  const [allMessages, setAllMessages] = useState<any>([]);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [searchViewModal, setViewSearchModal] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [groupRoomIds, setGroupRoomIds] = useState<Pick<Group, "roomId">[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        setUsers([...data?.data?.Friends, ...data.data.Groups]);
        const groups = data.data.Groups || [];
        const roomIds = groups.map((group: Group) => {
          return group.roomId;
        });
        setGroupRoomIds(roomIds);
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // const user = JSON.parse(localStorage.getItem("Current_User") as string);
    //  socketRef.current = io(`${import.meta.env.VITE_API}`, {
    //   query: { userId: user?._id, username: user?.username },
    // });
    // if (!socketRef.current) return;
    // const socket = socketRef.current;

    if (!socket) return;

    const groupMessageHandler = (message: AllMessageType, ack: any) => {
      ack(true);
      console.log("Group Messages: ", message);
      if (message.SenderId !== getUser()?._id){
        setAllMessages((prev: any) => [...prev, message]);
      }
        
    };

    const onlineUsersHandler = (UsersList: any) => {
      setOnlineUsers(UsersList);
    };

    const privateMessageHandler = (message: AllMessageType, ack: any) => {
      console.log("Private Message: ", message);
      setAllMessages((prev: any) => [...prev, message]);
      ack(true);
    };

    const afterDisconnectedUsers = (onlineUsers: any) => {
      setOnlineUsers(onlineUsers);
    };

    if (groupRoomIds.length > 0) {
      groupRoomIds.forEach((room) => {
        socket.emit("join_group", room);
      });
    }

    socket.on("groupMessage", groupMessageHandler);
    socket.on("Online_Users", onlineUsersHandler);
    socket.on("privateMessage", privateMessageHandler);
    socket.on("AfterDisconnection_Online_Users", afterDisconnectedUsers);

    return () => {
      socket.off("groupMessage", groupMessageHandler);
      socket.off("Online_Users", onlineUsersHandler);
      socket.off("privateMessage", privateMessageHandler);
      socket.off("AfterDisconnection_Online_Users", afterDisconnectedUsers);
    };
  }, [socket, groupRoomIds]);

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
          // setSelectedUser={setSelectedUser}
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

      {viewModal && <Modal setViewModal={setViewModal} Users={users}  />}
      {searchViewModal && <Search setViewSearchModal={setViewSearchModal}  />}
      
      <section className="Chat_Space">
        {selectedUser ? (
          <MessageMain
            // selectedUser={selectedUser}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            setShowDetails={setShowDetails}
            setViewModal={setViewModal}
            setViewSearchModal={setViewSearchModal}
          />
        ) : (
          <div className="NoChats">
            <i className="fa-solid fa-message"></i>
            <span>No Chats Selected</span>
          </div>
        )}
      </section>
      {showDetails && (
        <aside className="Account_Details">
          <Account />
        </aside>
      )}
    </div>
  );
}

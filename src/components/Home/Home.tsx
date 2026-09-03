import React, { useEffect, useState } from "react";
import axios from "../../lib/axios.js";
import { useUser } from "../../lib/context.js";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.js";

import "./Home.css";
import Friends from "../Chat/Friends/Friends.js";
import MessageMain from "../Chat/MessageMain.js";
import Modal from "../Modal/Modal.js";
import Account from "../Account/Account.js";

import {
  addNewMessage,
  setOnlineUsers,
  setUsers,
} from "../../redux/Slicers/ChatSlice.js";
import { setViewModal } from "../../redux/Slicers/ModalSlice.js";

export default function Home() {
  const { getUser, socket } = useUser();
  const dispatch = useAppDispatch();

  const { selectedUser } = useAppSelector((state) => state.chat);
  const { viewModal } = useAppSelector((state) => state.modal);

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
        const userList = [...data?.data?.Friends, ...data.data.Groups];
        dispatch(setUsers(userList));
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
    if (!socket) return;

    const groupMessageHandler = (message: AllMessageType, ack: any) => {
      ack(true);
      console.log("Group Messages: ", message);
      if (message.SenderId !== getUser()?._id) {
        dispatch(addNewMessage(message));
      }
    };

    const onlineUsersHandler = (UsersList: any) => {
      dispatch(setOnlineUsers(UsersList));
    };

    const privateMessageHandler = (message: AllMessageType, ack: any) => {
      console.log("Private Message: ", message);
      dispatch(addNewMessage(message));
      ack(true);
    };

    const afterDisconnectedUsers = (onlineUsers: any) => {
      dispatch(setOnlineUsers(onlineUsers));
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
    dispatch(setViewModal(true));
    document.getElementsByTagName("main")[0].style.alignItems = "initial";
  };

  return (
    <div className="Home_Wrapper">
      <section className="ContentSection">
        <div className="Header">
          <h1 className="Heading">Messages</h1>
        </div>

        <Friends />
        <button
          className="Create_Group_Btn"
          aria-label="Create Group"
          onClick={handleCreateGroup}
        >
          +
        </button>
      </section>

      {viewModal && <Modal />}

      <section className="Chat_Space">
        {selectedUser ? (
          <MessageMain setShowDetails={setShowDetails} />
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

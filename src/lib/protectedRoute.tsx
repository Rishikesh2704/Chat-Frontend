import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import type { Socket } from "socket.io-client";
import type React from "react";

type props = {
  socketRef:React.RefObject<Socket|null>
}

export default function ProtectedRoute(props:props) {
  const { socketRef } = props;
  const user = JSON.parse(localStorage.getItem("Current_User") as string);
  return user ? (
    <>
      <Navbar socketRef={socketRef} />
      <Outlet />
    </>
  ) : (
    <Navigate to="/authentication/login"></Navigate>
  );
}

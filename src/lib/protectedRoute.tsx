import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import type { Socket } from "socket.io-client";
import type React from "react";
import { useUser } from "./context";

type props = {
  socketRef:React.RefObject<Socket|null>
}

export default function ProtectedRoute(props:props) {
  const { socketRef } = props;
  const { getUser } = useUser();
  const user = getUser();
  return user ? (
    <>
      <Navbar socketRef={socketRef} />
      <Outlet />
    </>
  ) : (
    <Navigate to="/authentication/login"></Navigate>
  );
}

import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import type { Socket } from "socket.io-client";
import type React from "react";
import { useUser } from "./context";



export default function ProtectedRoute() {
  const { getUser } = useUser();
  const user = getUser();
  return user ? (
    <>
      <Navbar  />
      <Outlet />
    </>
  ) : (
    <Navigate to="/authentication/login"></Navigate>
  );
}

import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import { useAppSelector } from "../redux/hooks";



export default function ProtectedRoute() {
  const { currentUser:user } = useAppSelector(state => state.auth);
  return user ? (
    <>
      <Navbar  />
      <Outlet />
    </>
  ) : (
    <Navigate to="/authentication/login"></Navigate>
  );
}

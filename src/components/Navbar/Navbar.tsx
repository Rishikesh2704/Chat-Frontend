import { useLocation, useNavigate } from "react-router";
import "./Navbar.css";
import axios from "../../lib/axios";
export default function Navbar() {
  const navigate = useNavigate();
  const page = useLocation();
  const pagePath = page.pathname;
  const icons = [
    { id: 23, name: "", icon: "fa-solid fa-message", path: "/" },
    { id: 2, name: "calls", icon: "fa-solid fa-phone", path: "/calls" },
    {
      id: 13,
      name: "account",
      icon: "fa-solid fa-circle-user",
      path: "/account",
    },
  ];

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
    <nav>
      {icons.map((icon) => (
        <a
          className={`${pagePath === icon.path ? "selectedPage" : ""}`}
          href={`/${icon.name}`}
          aria-label={icon.name}
        >
          <i className={icon.icon}></i>
        </a>
      ))}
      <button className="Logout_Btn" aria-label="Logout" onClick={handleLogOut}>
        <i className="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </nav>
  );
}

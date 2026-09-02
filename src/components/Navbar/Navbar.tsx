import { useLocation, useNavigate } from "react-router";
import "./Navbar.css";
import axios from "../../lib/axios";
import { useUser } from "../../lib/context";
import { removeCurrentUser } from "../../redux/Slicers/AuthSlice";
import { useAppDispatch } from "../../redux/hooks";

export default function Navbar() {
  const { logoutUser, socket } = useUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const page = useLocation();
  const pagePath = page.pathname;
  const icons = [
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
      // logoutUser();
      dispatch(removeCurrentUser())
      socket && socket.disconnect();
      navigate("/authentication/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <nav>
      <h1 className="App_Symbol">Convo</h1>
      <div className="Nav_Options">
        <form className="Search_Form">
          <label id="search_label" htmlFor="search_input">
            Search
          </label>
          <input type="text" id="search_input" placeholder="Search..." />
          <button id="search_btn" aria-label="Search" type="submit">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
        <div className="Icons_Wrapper">
          {icons.map((icon) => (
            <a
              key={icon.id}
              className={`Anchor ${pagePath === icon.path ? "selectedPage" : ""}`}
              href={`/${icon.name}`}
              aria-label={icon.name}
            >
              <i className={icon.icon}></i>
            </a>
          ))}
          <button
            className="Logout_Btn Anchor"
            aria-label="Logout"
            onClick={handleLogOut}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

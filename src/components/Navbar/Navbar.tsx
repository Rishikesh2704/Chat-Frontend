import "./Navbar.css";
import { useLocation, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import axios from "../../lib/axios";
import { useUser } from "../../lib/context";
import { removeCurrentUser } from "../../redux/Auth/AuthSlice";
import { useAppDispatch } from "../../redux/hooks";
import { setShowDetails } from "../../redux/Chat/ChatSlice";

export default function Navbar() {
  const {  socket } = useUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const page = useLocation();
  const pagePath = page.pathname;
  const icons = [
    {
      id: 13,
      name: "account",
      icon: (<FontAwesomeIcon icon={faCircleUser}/>),
      path: "/account",
    },
  ];

  const handleLogOut = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API}/auth/logout`);
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
      
        <div className="Icons_Wrapper">
          {icons.map((icon) => (
            <button
              key={icon.id}
              className={`Anchor ${pagePath === icon.path ? "selectedPage" : ""}`}
              aria-label={icon.name}
              onClick={() => dispatch(setShowDetails({currentUser:true, state:true}))}
            >
              {icon.icon}
            </button>
          ))}
          <button
            className="Logout_Btn Anchor"
            aria-label="Logout"
            onClick={handleLogOut}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket}/>
          </button>
        </div>
      </div>
    </nav>
  );
}

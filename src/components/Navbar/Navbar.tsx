import "./Navbar.css";
import { useLocation, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { useUser } from "../../lib/context";
import { removeCurrentUser } from "../../redux/Auth/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setShowDetails } from "../../redux/Chat/ChatSlice";
import { useLogoutMutation } from "../../redux/Auth/authQuerySlice";

export default function Navbar() {
  const { socket } = useUser();
  const { currentUser } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const page = useLocation();
  const pagePath = page.pathname;
  const icons = [
    {
      id: 13,
      name: "account",
      icon: <FontAwesomeIcon icon={faCircleUser} />,
      path: "/account",
    },
  ];

  const [ logout ] = useLogoutMutation();


  const handleLogOut = async () => {
    try {
       await logout().unwrap();
    } catch (error) {
      console.log("Failed to logout: ", error);
    }
    dispatch(removeCurrentUser());
    socket && socket.disconnect();
    navigate("/authentication/login");
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
              onClick={() =>
                dispatch(setShowDetails({ currentUser: true, state: true }))
              }
            >
              {currentUser?
              <img id="navbar_profileImg" src={currentUser.profile} height={50} width={50}/>:
              icon.icon}
            </button>
          ))}
          <button
            className="Logout_Btn Anchor"
            aria-label="Logout"
            onClick={handleLogOut}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>
        </div>
      </div>
    </nav>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import axios from "../../lib/axios.js";
import { useAppDispatch } from "../../redux/hooks.js";
import { setCurrentUser } from "../../redux/Slicers/AuthSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function Login() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const User = {
      email,
      password,
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/auth/login`,
        User,
        {
          withCredentials: true,
        },
      );
      console.log(res.data);
      const user = res.data.user;
      dispatch(setCurrentUser(user));
      navigate("/");
    } catch (error: any) {
      console.log(error.response);
      alert(error.response.data.message || error.response.data);
    }
  };

  return (
    <section className="Sigin_Wrapper">
      <div className="Auth_Wrapper">
        <h1 className="AppName Auth">Login</h1>
        <form
          id="SignIn_Form"
          onSubmit={(e) => {
            handleLogInSubmit(e);
          }}
        >
          <div className="fields">
            <label>Email</label>
            <input
              type="email"
              placeholder="fake@email.com..."
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              autoFocus
            />
          </div>

          <div className="fields">
            <label>Password</label>
            <input
              type={showPassword?"text":"password"}
              placeholder="Rajesh1234..."
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <FontAwesomeIcon
              id="showPassword_btn"
              icon={showPassword?faEyeSlash:faEye}
              onClick={() => setShowPassword((prev) => !prev)}
            />
          </div>

          <p id="CreateAccount">
            Create an Account.{" "}
            <a id="CreateAccount_Link" href="/Authentication/signin">
              Sign In{" "}
            </a>
          </p>
          <button id="Submit_Button" type="submit">
            Login
          </button>
        </form>
      </div>
      <div id="Logo_Wrapper">
        <h1 id="Logo">
          C<span>onvo</span>
        </h1>
      </div>
    </section>
  );
}

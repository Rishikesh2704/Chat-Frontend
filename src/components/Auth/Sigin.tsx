import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import axios from "../../lib/axios.js";
import { io, Socket } from "socket.io-client";
import { useUser } from "../../lib/context.js";
import { setCurrentUser } from "../../redux/Slicers/AuthSlice.js";
import { useAppDispatch } from "../../redux/hooks.js";
type props = {
  socketRef: React.RefObject<Socket | null>;
};

export default function SignIn() {
  const { socket } = useUser();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const navigate = useNavigate();

  const handleSignInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const User = {
      email: email,
      username: username,
      password: password,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/auth/signup`,
        User,
        {
          withCredentials: true,
        },
      );
      const user = res.data.User;
      dispatch(setCurrentUser(user));
      // socketRef.current = io(import.meta.env.VITE_API, {
      //   query: { userId: user?._id, username: user?.username },
      // })
      console.log("User", user);
      navigate("/");
    } catch (error: any) {
      setEmail("");
      setPassword("");
      alert(error.response.data[0].msg);
      console.log(error);
    }
  };

  return (
    <section className="Sigin_Wrapper">
      <div className="Auth_Wrapper">
        <h1 className="Auth">Sign In </h1>
        <form
          id="SignIn_Form"
          onSubmit={(e) => {
            handleSignInSubmit(e);
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
            <label>Username</label>
            <input
              type="text"
              placeholder="Rajesh..."
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
            />
          </div>

          <div className="fields">
            <label>Password</label>
            <input
              type="password"
              placeholder="Rajesh1234..."
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <p id="CreateAccount">
            Already have an Account ?
            <a id="CreateAccount_Link" href="/Authentication/login">
              Login
            </a>
          </p>
          <button id="Submit_Button" type="submit">
            SignIn
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

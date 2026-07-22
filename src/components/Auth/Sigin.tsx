import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import axios from "../../lib/axios.js";
import { io } from "socket.io-client";

export default function SignIn({
  setSocket,
}: {
  setSocket: React.Dispatch<React.SetStateAction<null>>;
}) {
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
      console.log("AccessToken:", res.data);
      localStorage.set("Current_User", JSON.stringify(res.data.User));
      const socket = io(`${import.meta.env.VITE_API}`, {
        query: {
          userId: res.data.User?._id,
          username: res.data.User?.username,
        },
      });
      setSocket(socket as any);
      navigate("/");
    } catch (error: any) {
      setEmail("");
      setPassword("");
      alert(error.response.data.message);
      console.log(error.response.data.message);
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

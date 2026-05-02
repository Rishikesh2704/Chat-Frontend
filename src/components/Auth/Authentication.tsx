import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "./AuthStyle.css";
import axios from "axios";

export default function Authentication() {
  const params = useLocation();
  const type = params.pathname.split("/")[2];
  const [email, setEmail] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const navigate = useNavigate();
  const handleLogInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const User = {
      email,
      password,
    };
    console.log("LogIn: \n", User);
    try {
      await axios.post(`${import.meta.env.VITE_API}/auth/login`, User, {
        withCredentials: true,
      });
      navigate("/");
    } catch (error: any) {
      console.log(error.response.data);
      setEmail("");
      setPassword("");
    }
  };

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
      navigate("/");
    } catch (error: any) {
      setEmail("");
      setPassword("");
      console.log(error.response.data.message);
    }
  };

  return (
    <section className="Auth_Wrapper">
      <h1 id="AppName">Convo</h1>
      <form
        id="SignIn_Form"
        onSubmit={(e) => {
          type === "signin" ? handleSignInSubmit(e) : handleLogInSubmit(e);
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
          />
        </div>

        {type !== "login" && (
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
        )}

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

        <button id="Submit_Button" type="submit">
          {type.toUpperCase()}
        </button>
      </form>
    </section>
  );
}

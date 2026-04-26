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
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const User = {
      email: email,
      username: username,
      password: password,
    };
    
    axios
      .post(`http://localhost:3000/auth/signup`, User)
      .then((res) => {
        console.log(res);
        localStorage.setItem("Token", res.data?.accessToken);
        localStorage.setItem("RefreshToken", res.data?.refreshToken);
        navigate("/");
      })
      .catch((err) => err.response);
  };

  return (
    <section className="Auth_Wrapper">
      <h1 id="AppName">Convo</h1>
      <form id="SignIn_Form" onSubmit={(e) => handleSubmit(e)}>
        <div className="fields">
          <label>Email</label>
          <input
            type="email"
            placeholder="fake@email.com..."
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="fields">
          <label>Username</label>
          <input
            type="text"
            placeholder="Rajesh..."
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="fields">
          <label>Password</label>
          <input
            type="password"
            placeholder="Rajesh1234..."
            onChange={(e) => setPassword(e.target.value)}
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

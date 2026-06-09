import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import axios from "../../lib/axios.js";
import { useUser } from "../../lib/context.js";

export default function Login() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
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
      navigate("/");
      console.log(res.data.User)
      localStorage.setItem('CurrentUser',JSON.stringify(res.data.User))
    } catch (error: any) {
      console.log(error.response.data);
      alert(error.response.data[0].msg || error.response.data);
    }
  };

  return (
    <section className="Auth_Wrapper">
      <h1 id="AppName">Convo</h1>
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

        <button id="Submit_Button" type="submit">
          Login
        </button>
      </form>
    </section>
  );
}

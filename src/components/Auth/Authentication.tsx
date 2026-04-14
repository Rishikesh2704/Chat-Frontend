import { useState } from "react";
import { useLocation } from "react-router";
import "./AuthStyle.css";

export default function Authentication() {
  const params = useLocation();
  const type = params.pathname.split('/')[2]
  const [email, setEmail] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // make a request to create user
    console.log(
      "Email: ",
      email,
      "/nUsername: ",
      username,
      "/nPassword: ",
      password,
    );
  };

  

  return (
    <section className="Auth_Wrapper">
      <h1>Convo</h1>
      <form id="SigIn_Form" onSubmit={(e) => handleSubmit(e)}>
        <div className="fields">
          <label>Email</label>
          <input
            type="email"
            placeholder="fake@email.com"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="fields">
          <label>Username</label>
          <input
            type="text"
            placeholder="Rajesh"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="fields">
          <label>Password</label>
          <input
            type="password"
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

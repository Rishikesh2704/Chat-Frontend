import "./AuthStyle.css";
import { useState } from "react";
import { useNavigate } from "react-router";

import { setCurrentUser } from "../../redux/Auth/AuthSlice.js";
import { useAppDispatch } from "../../redux/hooks.js";
import { useSignUpQuery } from "../../redux/AuthQuery/authQuerySlice.js";

export default function SignUp() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();

  const [user, setUser] = useState<{
    email: string | null;
    username: string | null;
    password: string | null;
  }>({ email: null, username: null, password: null });

  const navigate = useNavigate();

  const { data, isLoading, isSuccess, error } = useSignUpQuery(user, {
    skip: !user.email,
  });

  if (isSuccess) {
    const user = data.user;
    dispatch(setCurrentUser(user));
    navigate("/");
  }

  if(error){
    console.log('Failed to SignUp: ', error);
  }

  const handleSignUpSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUser({
      email: email || null,
      username: username || null,
      password: password || null,
    });
  };

  return (
    <section className="Sigin_Wrapper">
      <div className="Auth_Wrapper">
        <h1 className="Auth">Sign In </h1>
        <form
          id="SignIn_Form"
          onSubmit={(e) => {
            handleSignUpSubmit(e);
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
            {isLoading ? <div className="loader"></div> : <p>Sign Up</p>}
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

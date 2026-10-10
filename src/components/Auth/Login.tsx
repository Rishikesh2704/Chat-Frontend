import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import { useAppDispatch } from "../../redux/hooks.js";
import { setCurrentUser } from "../../redux/Auth/AuthSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useLoginQuery } from "../../redux/AuthQuery/authQuerySlice.js";

export default function Login() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    email: string | null;
    password: string | null;
  }>({ email: null, password: null });

  const { data, isLoading, isSuccess } = useLoginQuery(user, {
    skip: !user.email,
  });

  if (isSuccess) {
    const user = data.user;
    dispatch(setCurrentUser(user));
    navigate("/");
  }

  const handleLogInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUser({
      email: email || null,
      password: password || null,
    });
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
              type={showPassword ? "text" : "password"}
              placeholder="Rajesh1234..."
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <FontAwesomeIcon
              id="showPassword_btn"
              icon={showPassword ? faEyeSlash : faEye}
              onClick={() => setShowPassword((prev) => !prev)}
            />
          </div>

          <p id="CreateAccount">
            Create an Account.{" "}
            <a id="CreateAccount_Link" href="/Authentication/signUp">
              Sign Up{" "}
            </a>
          </p>

          <button id="Submit_Button" type="submit">
            {isLoading ? <div className="loader"></div> : <p>Login</p>}
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

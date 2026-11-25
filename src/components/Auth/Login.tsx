import { useState } from "react";
import { useNavigate } from "react-router";
import "./AuthStyle.css";
import { useAppDispatch } from "../../redux/hooks.js";
import { setCurrentUser } from "../../redux/Auth/AuthSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useLoginMutation } from "../../redux/Auth/authQuerySlice.js";
import {
  decryptEncryptedPrivate,
  storePrivateKey,
} from "../../utils/End2End.js";

export default function Login() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const handleLogInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      const response = await login({
        email: email,
        password: password,
      }).unwrap();
      const user = response.user;
      const { encryptedKey } = user;
      const { key, salt, iv } = encryptedKey;
      const decryptedPrivateKey = await decryptEncryptedPrivate(
        key,
        password,
        salt,
        iv,
      );
      await storePrivateKey(decryptedPrivateKey);
      dispatch(setCurrentUser(user));
      navigate("/");
    } catch (err: any) {
      console.log("Error while login: ", err.message === "wrong password");
      if (err.message === "wrong password") {
        const ele = document.getElementsByClassName(
          "Form_Password",
        )[0] as HTMLInputElement;
        ele?.style.setProperty("--borderColor", "red");
      }
      setErrorMessage(err.message);
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
              className="Form_Password"
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
            {errorMessage === "wrong password" && (
              <p id="Form_PasswordError">{errorMessage}</p>
            )}
          </div>
          {errorMessage === "user doesn't exist" && (
            <span className="Form_ErrorMessage">{errorMessage}</span>
          )}

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

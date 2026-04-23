import { Link } from "react-router";
import "./Home.css";

export default function Home() {
  return (
    <div className="Home_Wrapper">
      <nav className="Navbar">
        <div className="Header">
          <h1 id="AppName">Convo</h1>
          <a href="/account" className="Account">
            <i className="fa-solid fa-circle-user"></i>
          </a>
        </div>
      </nav>
      <section className="Chat_Space"></section>
    </div>
  );
}

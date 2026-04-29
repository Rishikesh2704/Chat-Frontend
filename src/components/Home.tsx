import { Link } from "react-router";
import "./Home.css";
import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await axios.get(`${import.meta.env.VITE_API}/messages/users`,{
        withCredentials:true
      })
     console.log("Users:", data)
    } 
    fetchUsers()
  },[])
  return (
    <div className="Home_Wrapper">
      <nav className="Navbar">
        <div className="Header">
          <h1 id="AppName">Convo</h1>
          <a href="/account" className="Account">
            <i className="fa-solid fa-circle-user"></i>
          </a>
        </div>
        <form className="Search_Form">
          <label id="search_label" htmlFor="search_input">
            Search
          </label>
          <input type="text" id="search_input" />
          <button id="search_btn" aria-label="Search" type="submit">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <div className="Chat_Friends">
          <div className="User_Wrapper">
            <figure>
              <i className="fa-solid fa-circle-user"></i>
            </figure>
            <div className="User_Details">
              <h2>User 1</h2>
              <p>Hi</p>
            </div>
          </div>
        </div>
      </nav>
      <section className="Chat_Space"></section>
    </div>
  );
}

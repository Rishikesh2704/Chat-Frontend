import "./Account.css";
import profile from '../../assets/profile.jpg'
import axiosInstance from "../../lib/axios";
import { useState } from "react";
export default function Account() {
  const [ user , setUser ] = useState(null)
  const current_user = JSON.parse(localStorage.getItem("Current_User") as string);
  console.log("Current User: ", current_user);

  const handleUploadFile = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    try{
      const uploadProfile  = async() => {
        const form = new FormData();
        if(e.target.files) form.append('profile', e.target.files[0])
        const response = await axiosInstance.post(`${import.meta.env.VITE_API}/auth/uploadProfile`,form,{
          headers:{
            'Content-Type': 'multipart/form-data'
          }
        })
        setUser(response.data.user)
        const stringUser = JSON.stringify(response.data.user)
        localStorage.setItem('Current_User', stringUser)
      }
      uploadProfile();
    }catch(error){  
      console.log("Error", error)
    }
  };
  return (
    <section className="Account">
      <header className="Account_Header">
        <figure className="Account_User">
          <div className="Profile_Wrapper">
            <img className="Profile" src={current_user.profile|| profile}></img>
            <label htmlFor="profileUpload" className="Upload_Button" aria-label="Upload Profile">
              <i className="fa-regular fa-camera "></i>
              <input  id="profileUpload" type="file" onChange={(e) => handleUploadFile(e)} />
            </label>
          </div>
          <figcaption>{current_user?.username}</figcaption>
        </figure>
      </header>
    </section>
  );
}

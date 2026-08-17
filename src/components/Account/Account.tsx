import "./Account.css";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

function toLocaleTime(time: string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false)
   const current_user = JSON.parse(
      localStorage.getItem("Current_User") as string,
    );
    console.log("Start", current_user)
  // useEffect(() => {
  //   const current_user = JSON.parse(
  //     localStorage.getItem("Current_User") as string,
  //   );
  //   console.log(current_user)
  //   setUser(current_user);
  // }, []);


  const handleUpdateProfile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    try {
      const uploadProfile = async () => {
        const form = new FormData();

        if (file) form.append("profile", file);
        form.append('oldProfile', current_user.profile)
        const response = await axiosInstance.post(
          `${import.meta.env.VITE_API}/auth/uploadProfile`,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setUser(response.data.user);
        console.log("Updated Profile: ", response.data);
        const stringUser = JSON.stringify(response.data.user);
        console.log("Response", stringUser)
        localStorage.setItem("Current_User", stringUser);
        console.log("After Response",JSON.parse(localStorage.getItem('Current_User') as string))
      };
      uploadProfile();
     
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleUploadFile = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const blob = URL.createObjectURL(e.target.files[0]);
      setFile(e.target.files[0]);
      setPreview(blob);
    }
  };

  return (
    <main className="Account">
      <div className="Account_Profile">
        <figure className="Account_Image">
          <div className="Profile_Wrapper">
            <img
              className="Profile"
              src={preview||current_user.profile}
            ></img>

            <label
              htmlFor="profileUpload"
              className="Upload_Button"
              aria-label="Upload Profile"
            >
              <i className="fa-solid fa-camera "></i>
              <input
                id="profileUpload"
                type="file"
                onChange={(e) => handleUploadFile(e)}
              />
            </label>
          </div>
          <figcaption id="Profile_Username">
            {user?.username||current_user.username}
          </figcaption>
        </figure>
        {preview && (
          <button
            onClick={(e) => handleUpdateProfile(e)}
            id="UpdateProfile_Btn"
          >
            {loading
            ?<div className="loader"></div>
            :<p>Update Profile</p>}
          </button>
        )}
      </div>

      <div className="Account_Info">
        <h3 id="Heading">Account Details</h3>

        <div className="rows">
          <h4>
            Email: <span> {current_user.email}</span>
          </h4>
        </div>
        <div className="rows">
          <h4>
            Created At: <span> {(user&&toLocaleTime(user.createdAt))||current_user.createdAt}</span>
          </h4>
        </div>
        <div className="rows">
          <h4>
            Updated At: <span>{(user&&toLocaleTime(user.updatedAt)||current_user.updatedAt)}</span>
          </h4>
        </div>
      </div>
    </main>
  );
}

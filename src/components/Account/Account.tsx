import "./Account.css";
import profile from "../../assets/profile.jpg";
import axiosInstance from "../../lib/axios";
import { useState } from "react";

function toLocaleTime(time: string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}

export default function Account() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File>();
  const current_user = JSON.parse(
    localStorage.getItem("Current_User") as string,
  );
  console.log("Current User: ", current_user);

  const handleUpdateProfile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    try {
      const uploadProfile = async () => {
        const form = new FormData();

        if (file) form.append("profile", file);
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
        const stringUser = JSON.stringify(response.data.user);
        localStorage.setItem("Current_User", stringUser);
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
              src={preview || current_user.profile}
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
            {current_user?.username}
          </figcaption>
        </figure>
       {preview&& <button onClick={(e) => handleUpdateProfile(e)} id="UpdateProfile_Btn">
          Update Profile
        </button>}
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
            Created At: <span> {toLocaleTime(current_user.createdAt)}</span>
          </h4>
        </div>
        <div className="rows">
          <h4>
            Updated At: <span>{toLocaleTime(current_user.updatedAt)}</span>
          </h4>
        </div>
      </div>
    </main>
  );
}

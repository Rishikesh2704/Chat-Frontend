import "./Account.css";
import axiosInstance from "../../lib/axios";
import profile from "../../assets/profile.jpg";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { isGroup } from "../../utils/IsGroup";
import useGroupMembers from "../../hooks/useGroupMembers";
import { setShowDetails } from "../../redux/Slicers/ChatSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";
import { setCurrentUser } from "../../redux/Slicers/AuthSlice";

function toLocaleTime(time: string) {
  const date = new Date(time);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File>();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, showDetails } = useAppSelector((state) => state.chat);
  const current_user = showDetails.currentUser ? currentUser : selectedUser;
  const groupMembers = useGroupMembers();

  const dispatch = useAppDispatch();

  const handleUpdateProfile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    try {
      const uploadProfile = async () => {
        const form = new FormData();

        if (file) form.append("profile", file);
        form.append("oldProfile", current_user.profile);
        const response = await axiosInstance.post(`/auth/uploadProfile`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Response: ", response)
        dispatch(setCurrentUser(response.data.user))
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
      <div
        className="Close_Details"
        aria-label="close details"
        onClick={() =>
          dispatch(setShowDetails({ currentUser: true, state: false }))
        }
      >
        <FontAwesomeIcon icon={faXmark} className="Close_Icon" />
      </div>
      <div className="Account_Profile">
        <figure className="Account_Image">
          <div className="Profile_Wrapper">
            <img
              className="Profile"
              src={preview || current_user?.profile || profile}
              alt=""
            ></img>

            <label
              htmlFor="profileUpload"
              className="Upload_Button"
              aria-label="Upload Profile"
            >
              <FontAwesomeIcon icon={faCamera} />
              <input
                id="profileUpload"
                type="file"
                onChange={(e) => handleUploadFile(e)}
              />
            </label>
          </div>
          <figcaption id="Profile_Username">
            {user?.username || current_user.username || current_user?.groupName}
          </figcaption>
        </figure>
        {preview && (
          <button
            onClick={(e) => handleUpdateProfile(e)}
            id="UpdateProfile_Btn"
          >
            <p>Update Profile</p>
          </button>
        )}
      </div>

      <div className="Account_Info">
        <h1 id="Heading">Account Details</h1>

        {!isGroup(currentUser) && (
          <div className="rows">
            <h2>Email</h2>
            <span> {current_user.email}</span>
          </div>
        )}
        <div className="rows">
          <h2>Created At</h2>
          <span>
            {" "}
            {(user && toLocaleTime(user.createdAt)) ||
              toLocaleTime(current_user.createdAt)}
          </span>
        </div>
        <div className="rows">
          <h2>Updated At</h2>
          <span>
            {(user && toLocaleTime(user.updatedAt)) ||
              toLocaleTime(current_user.updatedAt)}
          </span>
        </div>
      </div>
      {groupMembers && (
        <div className="GroupMembers_Info">
          <h1 id="Heading">Members</h1>

          {Array.from(groupMembers.entries()).map(
            ([id, user]: [id: any, user: any]) => {
              if (Object.hasOwn(user, "roomId")) return;
              return (
                <div key={id} className="User_Wrapper">
                  <figure>
                    <div className="profile_picture">
                      <img src={user.profile} />
                    </div>
                    <div
                    // className={`${Object.keys(onlineUsers).includes(user._id) ? "online" : ""}`}
                    ></div>
                  </figure>
                  <div className="User_Details">
                    <h2>{user.username}</h2>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </main>
  );
}

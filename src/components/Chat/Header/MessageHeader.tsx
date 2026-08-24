import { useState } from "react";
import profile from "../../../assets/profile.jpg"
import './MessageHeader.css'
type propsType = {
  selectedUser:User | Group;
  setShowDetails:React.Dispatch<React.SetStateAction<boolean>>
}

export default function MessageHeader(props:propsType){
    const { selectedUser, setShowDetails } = props
    const [showOptions, setShowOptions] = useState(false);
  return(
    <div className="Chat_header">
        <div className="profile">
          <img height={30} width={30} src={selectedUser.profile || profile} />
          <h1>{selectedUser.username || selectedUser.groupName}</h1>
        </div>

        <div className="Private_Options">
          <button className="options_button" aria-label="options" onClick={() => setShowOptions((prev) => prev?false:true)}>
            <i className="fa-solid fa-ellipsis"></i>
          </button>
         {showOptions&& <div className="options">
            <button onClick={() => setShowDetails((prev) => prev?false:true)}>Details</button>
          </div>}
        </div>
        <div className="line"></div>
      </div>
  )
}
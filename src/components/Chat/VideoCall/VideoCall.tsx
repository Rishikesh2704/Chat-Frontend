import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import usePeerToPeer from "../../../hooks/usePeerToPeer";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setVideoCallModal } from "../../../redux/Modal/ModalSlice";
import "./VideoCall.css";
import {
  faMicrophone,
  faMicrophoneSlash,
  faPhoneSlash,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../../lib/context";
import userProfile from "../../../assets/user.png";

export default function VideoCallModal() {
  const ROOM_ID = 1;
  const { socket } = useUser();
  const { videoCallModal, callId } = useAppSelector((state) => state.modal);
  const { remoteVideoRef, localVideoRef, cleanUp } = usePeerToPeer(ROOM_ID);
  const dispatch = useAppDispatch();

  const handleEndCall = () => {
    cleanUp();
    dispatch(setVideoCallModal(false));
    socket.emit("end_Call", { roomId: ROOM_ID, callId });
  };

  const handleCloseModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const element = e.target as HTMLDivElement;
    cleanUp();
    if (element.classList.contains("VideoCallModal_Background")) {
      dispatch(setVideoCallModal(false));
      document.getElementsByTagName("main")[0].style.alignItems = "center";
    }
  };

  const handleMic = () =>{
    const call = {
      view:true,
      isAudio:!videoCallModal.isAudio,
      isVideo:true
    }
    dispatch(setVideoCallModal(call))
  }
  const handleVideo = () =>{
    const call = {
      view:true,
      isAudio:true,
      isVideo:!videoCallModal.isVideo
    }
    dispatch(setVideoCallModal(call))
  }

  return (
    <div className="VideoCallModal_Background" onClick={handleCloseModal}>
      <div className="VideoCallModal_Box">
        <div className="Video_Call">
          <div className="LocalVideo">
            
            {videoCallModal.isVideo ? (
              <video
                className="video"
                ref={localVideoRef}
                playsInline
                autoPlay
                muted
              />
            ) : (
              <img src={userProfile} height={150} width={150} />
            )}
            
            {/* {!videoCallModal.isVideo && (
              <audio ref={localVideoRef} autoPlay playsInline muted />
            )} */}
          </div>
          <div className="LocalVideo">
           
              <video
                className="video remote"
                ref={remoteVideoRef}
                playsInline
                autoPlay
              />
              {/* <audio ref={remoteAudioRef} autoPlay playsInline  /> */}
          </div>

          <div className="Video_Options">
            {/* <span className="VideoCall_User">Other</span>
            <span className="VideoCall_User">You</span> */}
            <button className="Btn mic" onClick={handleMic}>
              <FontAwesomeIcon icon={!videoCallModal.isAudio ? faMicrophone : faMicrophoneSlash} />
            </button>
            <button className="Btn end" onClick={handleEndCall}>
              <FontAwesomeIcon icon={faPhoneSlash} />
            </button>
            <button className="Btn videoCall" onClick={handleVideo}>
              <FontAwesomeIcon icon={!videoCallModal.isVideo ? faVideo : faVideoSlash} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

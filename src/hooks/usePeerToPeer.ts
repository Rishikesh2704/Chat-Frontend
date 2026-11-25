import { useEffect, useRef } from "react";
import { useUser } from "../lib/context";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setVideoCallModal } from "../redux/Modal/ModalSlice";
import { toast } from "react-toastify";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // In production, add TURN servers here for NAT traversal fallback
  ],
};

export default function usePeerToPeer(roomId: any) {
  const { socket } = useUser();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { videoCallModal } = useAppSelector((state) => state.modal);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<any>(null);
  const remoteAudioRef = useRef<any>(null);
  const localStreamRef = useRef<any>(null);
  const peersRef = useRef<RTCPeerConnection | null>(null); // Tracks multiple peer connections
  const dispatch = useAppDispatch();

  const createPeerConnection = (peerId: any) => {
    const pc = new RTCPeerConnection(ICE_CONFIG);

    localStreamRef.current.getTracks().forEach((track: any) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("iceCandidate", { to: peerId, candidate });
    };

    pc.ontrack = ({ streams: [stream] }) => {
      // if(e.track.kind === 'audio') remoteAudioRef.current.srcObject = e.streams[0]
      // if(e.track.kind === 'video') remoteVideoRef.current.srcObject = e.streams[0];
      remoteVideoRef.current.srcObject = stream;
    };
    peersRef.current = pc;
    return pc;
  };

  const cleanUp = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (peersRef.current) {
      peersRef.current.close();
      peersRef.current = null;
    }
  };

  useEffect(() => {
    

    navigator.mediaDevices
      .getUserMedia({
        video: videoCallModal.isVideo,
        audio: videoCallModal.isAudio,
      })
      .then((stream) => {
        cleanUp();
      
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socket.emit("join_callRoom", {
          roomId,
          username: currentUser?.username,
        });
      
      })
      .catch((err) => console.log("Access denied.", err));

    const handleUserJoined = async (data: any) => {
      const { socketId } = data;
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, sdp: offer });
    };

    const handleOffer = async (data: any) => {
      const { from, sdp } = data;
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    };
    const handleAnswer = async (data: any) => {
      const { sdp } = data;
      const pc = peersRef.current;
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };
    const handleIceCandidate = async (data: any) => {
      const { candidate } = data;
      const pc = peersRef.current;
      if (pc && candidate)
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleEndCall = () => {
      cleanUp();
      dispatch(setVideoCallModal(false));
    };

    const handleCallRejected = () => {
      cleanUp();
      dispatch(setVideoCallModal(false));
      toast("Call Rejected");
    };

    socket.on("user_joined", handleUserJoined);

    socket.on("offer", handleOffer);

    socket.on("answer", handleAnswer);

    socket.on("iceCandidate", handleIceCandidate);

    socket.on("end_Call", handleEndCall);

    socket.on("CallRequest_Rejected", handleCallRejected);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("end_videoCall", handleEndCall);
      cleanUp();
    };
  }, [currentUser, videoCallModal.isAudio, videoCallModal.isVideo]);

  return { remoteVideoRef, remoteAudioRef, localVideoRef, cleanUp };
}

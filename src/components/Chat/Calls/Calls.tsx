import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Call.css";
import {
  faArrowLeftLong,
  faArrowRightLong,
} from "@fortawesome/free-solid-svg-icons";
import { useGetCallLogQuery } from "../../../redux/Modal/modalQuerySlice";
import { useAppSelector } from "../../../redux/hooks";
import { toLocaleTime } from "../../../utils/MessagesTime";
import { getDayOfMessages } from "../../../utils/MessagesDay";
import { useRef } from "react";
export const Calls = () => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const previousTime = useRef<any>("");
  if (!currentUser) {
    console.log("Not logged in ");
    return;
  }

  const { data, isLoading, isError } = useGetCallLogQuery(currentUser._id);

  if (isLoading) {
    return (
      <div className="CallSection">
        <div className="blackloader callLoader"></div>
      </div>
    );
  }
  if (isError) {
    return;
  }
  const callLogs = data?.callLogs.toReversed();
  return (
    <div className="CallSection">
      {callLogs.map((log: any) => (
        <div key={log._id} className="CallLog_Wrapper">
          <h1 className="CallSection_Day">
            {getDayOfMessages(log.createdAt, previousTime)}
          </h1>
          <div className="CallSection_Wrapper">
            <div className="CallSection_log">
              <div className="CallLog_ProfileWrapper">
                {/* <FontAwesomeIcon id="CallLog_ProfileIcon" icon={faUser} /> */}
                <img src={log.receiverId.profile} />
              </div>
              <div className="CallLog_Details">
                <p className="CallLog_username">
                  {log.receiverId.username}{" "}
                  {log.receiverId._id === currentUser._id ? (
                    <FontAwesomeIcon
                      id="CallLog_incomingSign"
                      icon={faArrowLeftLong}
                    />
                  ) : (
                    <FontAwesomeIcon
                      id="CallLog_outgoingSign"
                      icon={faArrowRightLong}
                    />
                  )}
                </p>
                <span className="CallLog_type">
                  {<p className="CallLog_State">{log?.callState}</p>}
                  {log.callType}
                  {/* <FontAwesomeIcon
                  id=""
                  icon={log.callType === 'audio'? faPhone : faVideo}
                />*/}{" "}
                  call
                </span>
              </div>
              <div className="CallLog_time">
                <p>{toLocaleTime(log.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

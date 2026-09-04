import { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import axios from "../lib/axios";
import { setUsers } from "../redux/Slicers/ChatSlice";

export default function useChatUser() {
    const dispatch= useAppDispatch();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        const userList = [...data?.data?.Friends, ...data.data.Groups];
        dispatch(setUsers(userList));
        // const groups = data.data.Groups || [];
        // const roomIds = groups.map((group: Group) => {
        //   return group.roomId;
        // });
        // setGroupRoomIds(roomIds);
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);
}

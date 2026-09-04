import { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import axios from "../lib/axios";

export default function useGroupMembers() {
  const { selectedUser } = useAppSelector((state) => state.chat);
  const [groupMembers, setGroupMembers] =
    useState<Map<string, { username: string; profile: string }>>();

  useEffect(() => {
    if (!selectedUser) return;
    if (!Object.hasOwn(selectedUser, "roomId")) return;
    const fetchMemberDetails = async () => {
      try {
        const request = await axios.get(
          `${import.meta.env.VITE_API}/group/${selectedUser._id}/details`,
        );
        const updatedMap: Map<string, { username: string; profile: string }> =
          new Map(
            request.data.members.map((member: any) => [
              member._id,
              { username: member.username, profile: member.profile },
            ]),
          );
        console.log("updateMap : ", updatedMap);
        setGroupMembers(updatedMap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMemberDetails();
  }, [selectedUser]);

  return groupMembers;
}

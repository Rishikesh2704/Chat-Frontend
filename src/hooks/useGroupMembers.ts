import { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { useGetMemberDetailsMutation } from "../redux/Group/groupQuerySlice";

export default function useGroupMembers() {
  const { selectedUser } = useAppSelector((state) => state.chat);
  const [groupMembers, setGroupMembers] =
    useState<Map<string, { username: string; profile: string }>>();

  const [getMemberDetails] = useGetMemberDetailsMutation();

  useEffect(() => {
    if (!selectedUser) return;
    if (!Object.hasOwn(selectedUser, "roomId")) return;

    const fetchMemberDetails = async () => {
      try {
        // const response = await axios.get(
        //   `${import.meta.env.VITE_API}/group/${selectedUser._id}/details`,
        // );
        const response = await getMemberDetails(selectedUser._id).unwrap();
        const updatedMap: Map<string, { username: string; profile: string }> =
          new Map(
            response.members.map((member: any) => [
              member._id,
              { username: member.username, profile: member.profile },
            ]),
          );
        setGroupMembers(updatedMap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMemberDetails();
  }, [selectedUser]);

  return groupMembers;
}

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setUsers } from "../redux/Chat/ChatSlice";
import { useGetUsersQuery } from "../redux/Chat/chatQuerySlice";

export default function useChatUser() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { data, isSuccess } = useGetUsersQuery();

  function transformConversation(
    friendsConvos: Conversation[],
    groupConvos: Conversation[],
    groups: Group[],
  ) {
    let friendsConversations = friendsConvos.map((convos: Conversation) => {
      if (!convos.isGroup && currentUser) {
        let participants = convos.participants.filter(
          (parti) => parti._id !== currentUser._id,
        );
        return {
          _id: participants[0]?._id,
          username: participants[0]?.username,
          profile: participants[0]?.profile,
          lastMessage: convos.lastMessage,
          updatedAt: convos.updatedAt,
        };
      }
    });
    let groupConversations = groupConvos.map((convos: Conversation) => {
      return {
        _id: convos.group?._id,
        groupName: convos.group?.groupName,
        admins: convos.group?.admins,
        members: convos.group?.members,
        profile: convos.group?.profile,
        roomId: convos.group?.roomId,
        lastMessage: convos.lastMessage,
        createdAt: convos.createdAt,
        updatedAt: convos.updatedAt,
      };
    });

    const filtered = groups.map((g: Group) => {
      const k = groupConversations.filter((c: any) => c._id == g._id);
      return k.length > 0 ? k : g;
    });
    // let conversations = [...data?.data?.Friends, ...data?.data?.Groups]
    return [...friendsConversations, ...filtered];
  }
  useEffect(() => {
    const friendsConvo =
      data?.Conversations.filter((u: Conversation) => !u.isGroup) || [];
    const groupsConvo =
      data?.Conversations.filter((u: Conversation) => u.isGroup) || [];
    const groups = data?.Groups || [];

    const userList = transformConversation(friendsConvo, groupsConvo, groups);
    dispatch(setUsers(userList));
  }, [isSuccess]);
}

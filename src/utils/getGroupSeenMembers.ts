import { useAppSelector } from "../redux/hooks";

export const getGroupSeenMembers = (
  messages: AllMessageType,
  currentUser:User,
  allMessages:AllMessageType[],
  groupMembers: Map<string, { username: string; profile: string }>,
) => {

  if(!Array.isArray(messages.seen)) return [];

  let seenProfile: string[] = [];
  let mess = messages.seen ;

  const seenMessage = mess.filter((m) => m !== currentUser._id);

  if (
    messages.SenderId !== currentUser._id &&
    !mess.includes(messages.SenderId)
  ) {
    // mess.push(messages.SenderId);
  }

  if (seenMessage.length < 1) return [];

  const latestMessage = allMessages[allMessages.length - 1];

  if(!Array.isArray(latestMessage.seen)) return [] ;

  const latestMessageSeenArray = latestMessage.seen;

  if (latestMessage._id == messages._id) {
    let seenProfile = seenMessage.map((mem) => groupMembers?.get(mem)?.profile);
    return seenProfile;
  }

  seenMessage.forEach((mem) => {
    !latestMessageSeenArray.includes(mem) ? seenProfile.push(mem) : null;
  });

  let messageIndex = allMessages.findIndex((mess) => mess._id === messages._id);
  if (messageIndex + 1 === allMessages.length) return seenProfile;

  let nextMesssage = allMessages[messageIndex + 1];

  if(!Array.isArray(nextMesssage.seen)) return [] ;

  const nextMessageSeenArray = nextMesssage.seen ;
  const updatedSeenProfile: string[] = [];

  seenProfile.forEach((mem) => {
    if (!nextMessageSeenArray.includes(mem)) {
      const profile = groupMembers?.get(mem)?.profile;
      profile && updatedSeenProfile.push(profile);
    }
  });

  return updatedSeenProfile;
};

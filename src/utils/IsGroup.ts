export const isGroup = (user: User | Group | Conversation): user is Group => {
  return "roomId" in user;
};
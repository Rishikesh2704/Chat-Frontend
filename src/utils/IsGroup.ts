export const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
};
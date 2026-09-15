type User = {
 _id: string,
  email: string,
  username: string,
  GroupName?:string,
  password: null,
  profile: string,
  createdAt: string,
  updatedAt: string,
};

type Group = {
  _id:string,
  groupName:string,
  admins:string[],
  members:string[],
  roomId:string,
  profile:string;
  createdAt: string,
  updatedAt:string,
}


type AllMessageType = {
  conversationId:string,
  _id:string
  senderId: string ;
  receiverId: string;
  text: string;
  messageContent:string,
  seen:boolean|string[];
  image: string;
  createdAt: string;
  updatedAt: string;
  reactions:string;
 
};


type groupMembersType = {
  id:string,
  username:string,
  profile:string,
}

type Conversation = {
  _id:string,
  participants:{_id:string, username:string, profile:string,}[],
  isGroup:boolean,
  group?:{
    _id:string,
    groupName:string,
    profile:string,
    roomId:string,
  }
  lastMessage:{
    message:string,
    senderId:string,
    messageType:string,
  }
  updatedAt:string,
  createdAt:string,
}
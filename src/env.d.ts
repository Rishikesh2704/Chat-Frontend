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
}


type AllMessageType = {
  _id:string
  SenderId: string | {
    _id:string,
    username:string, 
    profile:string,
  };
  ReceiverId: string;
  text: string;
  seen:boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  reactions:string;
 
};



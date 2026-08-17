type User = {
 _id: string,
  email: string,
  username: string,
  password: null,
  profile: string,
  createdAt: string,
  updatedAt: string,
};


type AllMessageType = {
  _id:string
  SenderId: string;
  ReceiverId: string;
  text: string;
  seen:boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  reactions:string;
};


type User = {
  _id: string;
  username: string;
  profile?: string;
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
};


type User = {
  _id: string;
  username: string;
  profile?: string;
};

type FriendsProps = {
  users: User[];
  setSelectedUser: (user: User) => void;
};

export default function Friends(props: FriendsProps) {
  const { users, setSelectedUser } = props;
  return (
    <div className="Chat_Friends">
      {users &&
        users.map((user: any) => (
          <>
            <div
              key={user.username + 2}
              className="User_Wrapper"
              onClick={() => setSelectedUser(user)}
            >
              <figure>
                <i className="fa-solid fa-circle-user"></i>
              </figure>
              <div className="User_Details">
                <h2>{user.username}</h2>
                <p>Hi</p>
              </div>
            </div>
          </>
        ))}
    </div>
  );
}

{
  /* 
        <div className="Chat_Friends">
          {users &&
            users.map((user: any) => (
              <>
                <div
                  key={user.username + 2}
                  className="User_Wrapper"
                  onClick={() => setSelectUser(user)}
                >
                  <figure>
                    <i className="fa-solid fa-circle-user"></i>
                  </figure>
                  <div className="User_Details">
                    <h2>{user.username}</h2>
                    <p>Hi</p>
                  </div>
                </div>
              </>
            ))}
        </div> */
}

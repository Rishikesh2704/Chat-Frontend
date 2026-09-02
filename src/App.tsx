import { createBrowserRouter, RouterProvider } from "react-router";

import Home from "./components/Home/Home.tsx";
import Account from "./components/Account/Account.tsx";
import Login from "./components/Auth/Login.tsx";
import SignIn from "./components/Auth/Sigin.tsx";
import ProtectedRoute from "./lib/protectedRoute.tsx";

function App() {
    // const user = JSON.parse(localStorage.getItem("Current_User") as string);
    // useEffect(() => {
    //   if (user) {
    //   socketRef.current = io(import.meta.env.VITE_API, {
    //     query: { userId: user?._id, username: user?.username },
    //   });
    // }
     
    // // return () => {
    // //   socketRef.current?.disconnect();
    // //   socketRef.current = null;
    // // }
    // },[])
    
 
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute  />,
      children: [
        {
          path: "/",
          element: <Home  />,
        },
        {
          path: "/account",
          element: <Account />,
        },
      ],
    },
    {
      path: "/authentication/signin",
      element: <SignIn />,
    },
    {
      path: "/authentication/login",
      element: <Login  />,
    },
  ]);

  return (
    <main>
      <RouterProvider router={routes} />
    </main>
  );
}

export default App;

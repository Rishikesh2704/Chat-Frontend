import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Home from "./components/Home.tsx";
import Account from "./components/Account.tsx";
import Login from "./components/Auth/Login.tsx";
import SignIn from "./components/Auth/Sigin.tsx";

function App() {
  const  user  = localStorage.getItem('CurrentUser');
  console.log(user)
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/authentication/signin",
      element: <SignIn />,
    },
    {
      path: "/authentication/login",
      element: <Login />,
    },
    {
      path: "/account",
      element: <Account />,
    },
  ]);

  return (
    <main>
      <RouterProvider router={routes} />
    </main>
  );
}

export default App;

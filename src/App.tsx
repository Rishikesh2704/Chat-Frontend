import { createBrowserRouter, RouterProvider } from "react-router";

import ProtectedRoute from "./lib/protectedRoute.tsx";
import { lazy } from "react";

const Home = lazy(() => import("./components/Home/Home.tsx"));
const Login = lazy(() => import("./components/Auth/Login.tsx"));
const SignIn = lazy(() => import("./components/Auth/Sigin.tsx"));
const Account = lazy(() => import("./components/Account/Account.tsx"));

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <Home />,
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
      element: <Login />,
    },
  ]);

  return (
    <main>
      <RouterProvider router={routes} />
    </main>
  );
}

export default App;

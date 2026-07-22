import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Home from "./components/Home/Home.tsx";
import Account from "./components/Account/Account.tsx";
import Login from "./components/Auth/Login.tsx";
import SignIn from "./components/Auth/Sigin.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import ProtectedRoute from "./lib/protectedRoute.tsx";
import { useState } from "react";

function App() {
  const [ socket, setSocket ] = useState<any|null>(null)
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <>
            <Navbar />
            <Home />
          </>
        </ProtectedRoute>
      ),
    },
    {
      path: "/authentication/signin",
      element: <SignIn setSocket={setSocket} />,
    },
    {
      path: "/authentication/login",
      element: <Login setSocket={setSocket} />,
    },
    {
      path: "/account",
      element: (
          <ProtectedRoute>
            <Navbar />
            <Account />
          </ProtectedRoute>
      ),
    },
  ]);

  return (
    <main>
      <RouterProvider router={routes} />
    </main>
  );
}

export default App;

import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Home from "./components/Home/Home.tsx";
import Account from "./components/Account.tsx";
import Login from "./components/Auth/Login.tsx";
import SignIn from "./components/Auth/Sigin.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import ProtectedRoute from "./lib/protectedRoute.tsx";


function App() {
 
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <>
            <Navbar />
            <Home  />
          </>
        </ProtectedRoute>
      ),
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
      element: <><Navbar/><Account /></>,
    },
  ]);

  return (
    <main>
      <RouterProvider router={routes} />
    </main>
  );
}

export default App;

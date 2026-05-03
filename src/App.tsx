import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Home from "./components/Home.tsx";
import Authentication from "./components/Auth/Authentication.tsx";
import Account from "./components/Account.tsx";
import Toast from "./utils/toast.tsx";
import './utils/toast.css'

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/authentication/signin",
      element: <Authentication />,
    },
    {
      path: "/authentication/login",
      element: <><Authentication /> <Toast/> </>,
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

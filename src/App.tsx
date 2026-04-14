import { createBrowserRouter, RouterProvider } from "react-router"
import Home from "./components/Home.tsx"
import Authentication from "./components/Auth/Authentication.tsx"

function App() {
  const routes =  createBrowserRouter([
    {
      path:"/",
      element:<Home/>
    },
    {
      path:"/Authentication/signin",
      element:<Authentication/>
    },

  ])
  return (
    <main>
     <RouterProvider router={routes}/>
    </main>
  )
}

export default App

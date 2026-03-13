import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/ui";
import { Login } from "@/pages/auth/login";
import { Home } from "@/pages/home";
import ProtectedRoute from "@/app/router/guards/ProtectedRoute";
import AuthRedirect from "@/app/router/guards/AuthRedirect";
import { Outgoing } from "@/pages/debts/outgoing";
import { Incoming } from "@/pages/debts/incoming";
import { CreateDebtPage } from "@/pages/debts/new";
import { EditDebtPage } from "@/pages/debts/edit";
import { AppLayout } from "@/widgets/layout";

const router = createBrowserRouter([
  {
    element: <AuthRedirect />,
    children: [{ path: "/", element: <Login /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/home", element: <Home /> },
          { path: "/debts/outgoing", element: <Outgoing /> },
          { path: "/debts/incoming", element: <Incoming /> },
          { path: "/debts/new", element: <CreateDebtPage /> },
          { path: "/debts/:id/edit", element: <EditDebtPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;

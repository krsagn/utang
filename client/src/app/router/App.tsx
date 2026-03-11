import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthRedirect />}>
              <Route path="/" element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/debts/outgoing" element={<Outgoing />} />
                <Route path="/debts/incoming" element={<Incoming />} />
                <Route path="/debts/new" element={<CreateDebtPage />} />
                <Route path="/debts/:id/edit" element={<EditDebtPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;

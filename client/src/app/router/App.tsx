import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "@/pages/auth/login";
import { Home } from "@/pages/home";
import ProtectedRoute from "@/app/router/guards/ProtectedRoute";
import AuthRedirect from "@/app/router/guards/AuthRedirect";
import { Outgoing } from "@/pages/debts/outgoing";
import { Incoming } from "@/pages/debts/incoming";
import { AppLayout } from "@/widgets/layout";
import { Friends } from "@/pages/friends";

function App() {
  return (
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
            <Route path="/friends" element={<Friends />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

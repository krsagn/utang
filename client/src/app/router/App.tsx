import { AuthProvider } from "@/app/providers/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/login/Login";
import Home from "@/pages/home/Home";
import ProtectedRoute from "@/app/router/guards/ProtectedRoute";
import AuthRedirect from "@/app/router/guards/AuthRedirect";
import Outgoing from "@/pages/debts/outgoing/Outgoing";
import Incoming from "@/pages/debts/incoming/Incoming";
import { AppLayout } from "@/widgets/layout";
import Friends from "@/pages/friends/Friends";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

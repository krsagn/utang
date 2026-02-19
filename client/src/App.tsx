import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/layout/AuthRedirect";
import Outgoing from "./pages/Outgoing";
import Incoming from "./pages/Incoming";
import { AppLayout } from "./components/common/AppLayout";
import Friends from "./pages/Friends";

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

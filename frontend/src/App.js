import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import CreatePostPage from "./pages/CreatePostPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/signin" element={<AuthPage mode="signin" />} />

            {/* Public Routes - Accessible to everyone */}
            <Route element={<PublicRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Routes - Require Authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/create-post" element={<CreatePostPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        <ToastContainer theme="dark" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

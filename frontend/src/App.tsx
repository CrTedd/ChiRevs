import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import SearchPage from "./pages/SearchPage";
import ReviewPage from "./pages/ReviewPage";
import NewReviewPage from "./pages/NewReviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";

export default function App() {
  const { ready } = useAuth();
  if (!ready) return <div className="spinner" />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/review/:id" element={<ReviewPage />} />
        <Route path="/new" element={<NewReviewPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </Layout>
  );
}

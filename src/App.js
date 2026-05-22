import logo from "./logo.svg";
import "./App.css";
import MainPage from "./pages/main";
import HomePage from "./pages/homePage";
import UserReportsPage from "./pages/userReportsPage";
import LoginPage from "./pages/LoginPage";
import DraftsPage from "./pages/DraftsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Feedback360Report from "./pages/feedback360Report";
import Dav360SummaryReport from "./pages/dav360SummaryReport";

function App() {
  return (
    // <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="reports/user/list" element={<UserReportsPage />} />
          <Route path="reports/drafts" element={<DraftsPage />} />
          <Route path="reports/user/:id" element={<MainPage />} />
          <Route path="reports/user/draft" element={<MainPage />} />
          <Route path="user/feedback" element={<Feedback360Report />} />
          <Route path="user/dav360" element={<Dav360SummaryReport />} />
        </Route>
        {/* <Route path="/" element={<Feedback360Report />} /> */}
      </Routes>
    </BrowserRouter>
    // </div>
  );
}

export default App;

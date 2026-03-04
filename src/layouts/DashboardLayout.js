import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import CommonHeader from "../components/commonHeader";
import { useLocation, useNavigate } from "react-router-dom";

const DashboardLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHeader, setIsHeader] = useState(true);
  const [headerName, setHeaderName] = useState("dashboard");
  const location = useLocation();

  const navigate = useNavigate();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const showBackIcon = pathSegments.length > 1;

  const handleBackNavigate = () => {
    navigate(-1);
  };
  return (
    <div className="d-flex w-100">
      <Navbar />
      <div className="app-main-container">
        {
          <CommonHeader
            headerName={headerName}
            handleBackNavigate={handleBackNavigate}
            showBackIcon={showBackIcon}
          />
        }
        <main className={`app-main-content p-6`}>
          <Outlet
            context={{
              searchQuery,
              setIsHeader,
              setHeaderName,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

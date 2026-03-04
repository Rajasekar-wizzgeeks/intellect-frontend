import React, { useEffect } from "react";
import UserTable from "../components/UserTable";
import "../styles/userReportsPage.scss";
import { useNavigate, useOutletContext } from "react-router-dom";

const UserReportsPage = () => {
  const navigate = useNavigate();
  const { setIsHeader, setHeaderName } = useOutletContext();

  const handleNavigate = (user) => {
    navigate(`/reports/user/${user.id}`);
  };

  useEffect(() => {
    setHeaderName("User list");
  }, []);

  return (
    <div>
      {/* <div className="user-reports-page-header">
        <div className="user-reports-page-header__inner">
          <div className="user-reports-page-header__title">User List</div>
          <div className="user-reports-page-header__subtitle">
            Manage and view user reports
          </div>
        </div>
      </div> */}
      <div className="user-reports-page">
        <UserTable onViewReport={handleNavigate} />
      </div>
    </div>
  );
};

export default UserReportsPage;

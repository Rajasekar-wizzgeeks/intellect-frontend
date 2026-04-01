import React, { useEffect, useMemo, useState } from "react";
import { Eye, Mail, User } from "lucide-react";
import "../styles/userTable.scss";
import ReorderableTableBody, {
  ReorderableTr,
  ReorderHandle,
} from "./ReorderableTableBody";

const defaultUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Marketing",
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Engineering",
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Sales",
    status: "Active",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@company.com",
    department: "Finance",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Jessica Williams",
    email: "jessica.williams@company.com",
    department: "HR",
    status: "Active",
  },
  {
    id: 6,
    name: "Robert Taylor",
    email: "robert.taylor@company.com",
    department: "Operations",
    status: "Active",
  },
];

const UserTable = ({
  users = defaultUsers,
  onViewReport,
  reorderable = false,
  onUsersReorder,
}) => {
  const countLabel = useMemo(() => `${users.length} Users`, [users.length]);
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const renderedUsers = reorderable ? localUsers : users;

  return (
    <div className="user-table">
      {/* <div className="user-table__header">
        <div className="user-table__header-left">
          <div className="user-table__title">User List</div>
          <div className="user-table__subtitle">Manage and view user reports</div>
        </div>

        <div className="user-table__count">{countLabel}</div>
      </div> */}

      <div className="user-table__table-wrap">
        <table className="user-table__table">
          <thead>
            <tr>
              {reorderable ? <th style={{ width: 32 }} /> : null}
              <th>Name</th>
              <th>Email</th>
              {/* <th>Department</th> */}
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          {reorderable ? (
            <ReorderableTableBody
              as="tbody"
              items={localUsers}
              onReorder={(next) => {
                setLocalUsers(next);
                onUsersReorder?.(next);
              }}
            >
              {renderedUsers.map((user) => (
                <ReorderableTr as="tr" key={user.id} value={user}>
                  {(dragControls) => (
                    <>
                      <td>
                        <ReorderHandle
                          className="reorder-handle"
                          onPointerDown={(e) => dragControls.start(e)}
                        />
                      </td>
                      <td>
                        <div className="user-table__name">
                          <div className="user-table__avatar">
                            <User className="user-table__avatar-icon" />
                          </div>
                          <span className="user-table__name-text">{user.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-table__email">
                          <Mail className="user-table__email-icon" />
                          <span className="user-table__email-text">{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`user-table__status ${
                            user.status === "Active"
                              ? "user-table__status--active"
                              : "user-table__status--inactive"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="user-table__action"
                          onClick={() => onViewReport?.(user)}
                        >
                          <Eye className="user-table__action-icon" />
                          <span className="user-table__action-text">View Report</span>
                        </button>
                      </td>
                    </>
                  )}
                </ReorderableTr>
              ))}
            </ReorderableTableBody>
          ) : (
            <tbody>
              {renderedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-table__name">
                      <div className="user-table__avatar">
                        <User className="user-table__avatar-icon" />
                      </div>
                      <span className="user-table__name-text">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-table__email">
                      <Mail className="user-table__email-icon" />
                      <span className="user-table__email-text">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`user-table__status ${
                        user.status === "Active"
                          ? "user-table__status--active"
                          : "user-table__status--inactive"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="user-table__action"
                      onClick={() => onViewReport?.(user)}
                    >
                      <Eye className="user-table__action-icon" />
                      <span className="user-table__action-text">View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* <div className="user-table__footer">
        <div className="user-table__footer-left">
          Showing {users.length} of {users.length} users
        </div>

        <div className="user-table__pager">
          <button type="button" className="user-table__pager-btn user-table__pager-btn--ghost">
            Previous
          </button>
          <button type="button" className="user-table__pager-btn user-table__pager-btn--solid">
            Next
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default UserTable;

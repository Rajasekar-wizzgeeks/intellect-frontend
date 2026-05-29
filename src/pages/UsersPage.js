import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { UserPlus, Check, AlertCircle, RefreshCw, Users } from "lucide-react";
import { createUserApi } from "../helper/apicalls/auth";
import { getAllUsers } from "../helper/apicalls/feedback";
import { getApiErrorMessage } from "../helper/getApiErrorMessage";
import "../styles/usersPage.scss";

const ROLES = ["admin", "user", "viewer"];

const UsersPage = () => {
  const { setHeaderName } = useOutletContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "user" });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    setHeaderName("Users");
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await getAllUsers();
      // handle both { users: [...] } and plain array responses
      setUsers(Array.isArray(data) ? data : (data?.users ?? data?.data ?? []));
    } catch (err) {
      setUsersError(getApiErrorMessage(err, "Failed to load users."));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) return;
    try {
      setFormLoading(true);
      setFormStatus(null);
      await createUserApi(form);
      setFormStatus({ type: "success", message: "User created successfully!" });
      setForm({ email: "", password: "", role: "user" });
      fetchUsers(); // refresh table
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setFormStatus(null);
      }, 1500);
    } catch (err) {
      setFormStatus({
        type: "error",
        message: getApiErrorMessage(err, "Failed to create user. Please try again."),
      });
    } finally {
      setFormLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ email: "", password: "", role: "user" });
    setFormStatus(null);
  };

  return (
    <div className="users-page">
      {/* ── Users table ── */}
      <div className="users-table-section">
        <div className="users-table-section__header">
          <div className="users-table-section__title">
            <Users size={20} />
            <span>All Users</span>
            {!usersLoading && (
              <span className="users-table-section__count">{users.length}</span>
            )}
          </div>
          <div className="users-table-section__actions">
            <button
              className="users-table-section__refresh"
              onClick={fetchUsers}
              disabled={usersLoading}
              title="Refresh"
            >
              <RefreshCw size={15} className={usersLoading ? "spin" : ""} />
            </button>
            <button
              className="users-table-section__create-btn"
              onClick={() => setIsModalOpen(true)}
              title="Create new user"
            >
              <UserPlus size={16} />
              <span>Create User</span>
            </button>
          </div>
        </div>

        {usersError && (
          <div className="users-form__status users-form__status--error" style={{ marginBottom: 12 }}>
            <AlertCircle size={15} />
            <span>{usersError}</span>
          </div>
        )}

        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={3} className="users-table__empty">Loading…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="users-table__empty">No users found.</td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id ?? u.id ?? i}>
                    <td>{i + 1}</td>
                    <td>{u.email ?? "—"}</td>
                    <td>
                      <span className={`users-role-badge users-role-badge--${u.role ?? "user"}`}>
                        {u.role ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UserPlus size={22} />
                <span>Create New User</span>
              </div>
              <button className="modal-close" onClick={closeModal} title="Close">
                ✕
              </button>
            </div>

            <form className="users-form" onSubmit={handleSubmit} noValidate>
              <div className="users-form__field">
                <label className="users-form__label" htmlFor="email">Email</label>
                <input
                  id="email" name="email" type="email"
                  className="users-form__input"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required autoComplete="off"
                />
              </div>

              <div className="users-form__field">
                <label className="users-form__label" htmlFor="password">Password</label>
                <input
                  id="password" name="password" type="password"
                  className="users-form__input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required autoComplete="new-password"
                />
              </div>

              <div className="users-form__field">
                <label className="users-form__label" htmlFor="role">Role</label>
                <select
                  id="role" name="role"
                  className="users-form__select"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {formStatus && (
                <div className={`users-form__status users-form__status--${formStatus.type}`}>
                  {formStatus.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>{formStatus.message}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn modal-btn--cancel"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--submit"
                  disabled={formLoading || !form.email || !form.password}
                >
                  {formLoading ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

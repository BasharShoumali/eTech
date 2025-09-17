import { useEffect, useMemo, useState } from "react";
import "./UsersSection.css";
import SearchBar from "../components/SearchBar";

export default function UsersSection({ API, currentUser }) {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [query, setQuery] = useState("");

  // Modal state for role change
  const [roleModal, setRoleModal] = useState({
    open: false,
    target: null, // the selected user row
    nextRole: "user", // "admin" | "user"
    confirmerId: "", // your username or email
    password: "", // your password
    submitting: false,
    error: "",
  });

  // Load users once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/users`);
        if (!res.ok) throw new Error(`Load failed (${res.status})`);
        const data = await res.json();
        if (alive) {
          // first → last (ascending id)
          const sorted = Array.isArray(data)
            ? [...data].sort((a, b) => a.userNumber - b.userNumber)
            : [];
          setRows(sorted);
          setState({ loading: false, error: "" });
        }
      } catch (e) {
        if (alive) setState({ loading: false, error: e.message || "Failed" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [API]);

  // Simple client-side search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
      return (
        String(u.userNumber || "").includes(q) ||
        (u.userName || "").toLowerCase().includes(q) ||
        fullName.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.userRole || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  // Open modal with prefilled confirmer id
  const openRoleModal = (user) => {
    const nextRole = user.userRole === "admin" ? "user" : "admin";
    const prefill = currentUser?.userName || currentUser?.email || "";
    setRoleModal({
      open: true,
      target: user,
      nextRole,
      confirmerId: prefill,
      password: "",
      submitting: false,
      error: "",
    });
  };

  const closeRoleModal = () => {
    setRoleModal((m) => ({ ...m, open: false, password: "", error: "" }));
  };

  // Submit role change
  const submitRoleChange = async (e) => {
    e?.preventDefault?.();
    if (!roleModal.target) return;

    const confirmerId = (roleModal.confirmerId || "").trim();
    const pwd = (roleModal.password || "").trim();

    if (!confirmerId) {
      return setRoleModal((m) => ({
        ...m,
        error: "Please enter your username or email.",
      }));
    }
    if (!pwd) {
      return setRoleModal((m) => ({
        ...m,
        error: "Password is required.",
      }));
    }

    setRoleModal((m) => ({ ...m, submitting: true, error: "" }));
    try {
      const res = await fetch(
        `${API}/api/users/${roleModal.target.userNumber}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userRole: roleModal.nextRole, // expected field name
            currentUsernameOrEmail: confirmerId, // confirmer identity
            currentPassword: pwd, // confirmer password
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Role update failed (${res.status})`);
      }

      // Update UI
      setRows((prev) =>
        prev.map((u) =>
          u.userNumber === roleModal.target.userNumber
            ? { ...u, userRole: roleModal.nextRole }
            : u
        )
      );
      closeRoleModal();
    } catch (err) {
      setRoleModal((m) => ({
        ...m,
        submitting: false,
        error: err.message || "Failed to update role",
      }));
    }
  };

  // Hide action for self (optional safety)
  const isSelf = (u) =>
    currentUser &&
    (currentUser.userNumber === u.userNumber ||
      currentUser.userName === u.userName ||
      currentUser.email === u.email);

  return (
    <section className="card usersSection">
      <div className="cardHead">
        <h3>Users</h3>
        <small className="muted">
          {filtered.length}/{rows.length} shown
        </small>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by #, username, name, email, role…"
          disabled={state.loading}
        />
      </div>

      {state.loading && <p className="muted">Loading…</p>}
      {state.error && <p className="formMsg danger">Error: {state.error}</p>}

      {!state.loading && !state.error && (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const nextRole = u.userRole === "admin" ? "user" : "admin";
                const label =
                  u.userRole === "admin" ? "Back to user" : "Set as admin";

                return (
                  <tr key={u.userNumber}>
                    <td>{u.userNumber}</td>
                    <td>{u.userName}</td>
                    <td>{`${u.firstName || ""} ${u.lastName || ""}`.trim()}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`roleBadge ${u.userRole}`}>
                        <span className="dot" />
                        {u.userRole}
                      </span>
                    </td>
                    <td>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {!isSelf(u) && (
                        <button
                          type="button"
                          className={`roleBtn ${
                            u.userRole === "admin" ? "demote" : "promote"
                          }`}
                          onClick={() => openRoleModal(u)}
                          title={`Change role to ${nextRole}`}
                          disabled={state.loading}
                        >
                          <span className="dot" />
                          <span className="label">{label}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted center">
                    No matching users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModal.open && (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) =>
            e.target === e.currentTarget &&
            !roleModal.submitting &&
            closeRoleModal()
          }
        >
          <div
            className="modalCard"
            style={{ maxWidth: 420 }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !roleModal.submitting) closeRoleModal();
            }}
          >
            <header className="modalHead">
              <h2 className="modalTitle">Confirm Role Change</h2>
              <button
                type="button"
                className="iconBtn"
                onClick={closeRoleModal}
                aria-label="Close"
                disabled={roleModal.submitting}
              >
                ✕
              </button>
            </header>

            <form className="form" onSubmit={submitRoleChange}>
              <p className="muted" style={{ marginTop: -6 }}>
                Change <strong>{roleModal?.target?.userName}</strong> to{" "}
                <strong>{roleModal.nextRole}</strong>.
              </p>

              <label className="field">
                Your username or email
                <input
                  value={roleModal.confirmerId}
                  onChange={(e) =>
                    setRoleModal((m) => ({
                      ...m,
                      confirmerId: e.target.value,
                    }))
                  }
                  placeholder="e.g. bashar or me@example.com"
                  autoComplete="username"
                  required
                  disabled={roleModal.submitting}
                />
              </label>

              <label className="field">
                Your password
                <input
                  type="password"
                  value={roleModal.password}
                  onChange={(e) =>
                    setRoleModal((m) => ({ ...m, password: e.target.value }))
                  }
                  autoComplete="current-password"
                  required
                  disabled={roleModal.submitting}
                />
              </label>

              {roleModal.error && (
                <p className="formMsg">Error: {roleModal.error}</p>
              )}

              <div className="modalActions">
                <button
                  type="button"
                  className="ghostBtn"
                  onClick={closeRoleModal}
                  disabled={roleModal.submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="accentBtn"
                  disabled={
                    roleModal.submitting ||
                    !roleModal.password.trim() ||
                    !roleModal.confirmerId.trim()
                  }
                >
                  {roleModal.submitting ? "Saving…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

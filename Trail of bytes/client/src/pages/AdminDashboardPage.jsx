import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminControls from "../components/AdminControls.jsx";
import http from "../api/http.js";

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [level1Status, setLevel1Status] = useState(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const fetchData = async () => {
    const { data: res } = await http.get("/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setData(res);

    // Fetch Level 1 status
    try {
      const { data: statusRes } = await http.get("/admin/session/level1-status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLevel1Status(statusRes);
    } catch (err) {
      console.error("Failed to fetch Level 1 status:", err);
    }
  };

  useEffect(() => {
    if (!token) navigate("/admin/login");
    fetchData();
  }, [token]);

  const handleAction = async (path) => {
    await http.post(`/admin/${path}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  if (!data) return null;

  return (
    <main className="max-w-6xl mx-auto py-6 space-y-6 bg-background min-h-screen">
      <section className="bg-card p-4 rounded flex items-center justify-between shadow-neon border border-primary/50">
        <div>
          <p className="text-sm text-muted-foreground">Session status:</p>
          <p className="text-xl font-semibold text-foreground">{data.session?.status ?? "waiting"}</p>
          {level1Status?.level1Locked && (
            <p className="text-sm text-yellow-400 mt-2">
              🏆 Level 1 completed by {level1Status.winningTeamName} at{" "}
              {new Date(level1Status.completedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <AdminControls
          status={data.session?.status}
          onStart={() => handleAction("session/start")}
          onStop={() => handleAction("session/stop")}
          onReset={() => handleAction("session/reset")}
        />
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded shadow-neon border border-primary/50">
          <h2 className="font-semibold mb-2 text-foreground">Lobby</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {data.teams.map((team) => (
              <li key={team._id} className="flex justify-between bg-background rounded px-3 py-2 border border-primary/30">
                <span className="text-foreground">{team.name}</span>
                <div className="text-right">
                  <span className="text-foreground font-semibold">{team.totalScore ?? team.points ?? team.score ?? 0}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    (L1: {team.points ?? 0} | L2: {team.level2Points ?? 0})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card p-4 rounded shadow-neon border border-primary/50">
          <h2 className="font-semibold mb-2 text-foreground">Action Logs</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {data.logs.map((log) => (
              <li key={log._id} className="bg-background rounded px-3 py-2 border border-primary/30">
                <p className="text-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;


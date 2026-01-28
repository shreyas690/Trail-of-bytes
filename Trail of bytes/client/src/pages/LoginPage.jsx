import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginTeam } from "../api/http.js";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await loginTeam(form);
      login(data);
      navigate("/lobby");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(180 100% 50% / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(180 100% 50% / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-primary rounded-full opacity-60 animate-float" style={{ top: '10%', left: '10%', animationDelay: '0s' }}></div>
        <div className="absolute w-1 h-1 bg-primary rounded-full opacity-40 animate-float" style={{ top: '20%', left: '80%', animationDelay: '2s' }}></div>
        <div className="absolute w-3 h-3 bg-primary rounded-full opacity-50 animate-float" style={{ top: '60%', left: '15%', animationDelay: '4s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-primary rounded-full opacity-60 animate-float" style={{ top: '80%', left: '70%', animationDelay: '1s' }}></div>
        <div className="absolute w-2 h-2 bg-primary rounded-full opacity-40 animate-float" style={{ top: '40%', left: '85%', animationDelay: '3s' }}></div>
        <div className="absolute w-1 h-1 bg-primary rounded-full opacity-50 animate-float" style={{ top: '70%', left: '30%', animationDelay: '5s' }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 w-full max-w-md space-y-5 shadow-neon-soft border border-primary/40 relative z-10 animate-fade-in backdrop-blur-sm">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trail of Bytes</h1>
          <div className="h-1 w-20 bg-gradient-neon mx-auto rounded-full"></div>
        </div>

        <label className="block text-sm text-foreground">
          Team Name
          <input
            type="text"
            className="mt-2 w-full bg-background/80 border border-primary/40 rounded-lg p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Enter your team name"
          />
        </label>

        <label className="block text-sm text-foreground">
          Team Code
          <input
            type="text"
            className="mt-2 w-full bg-background/80 border border-primary/40 rounded-lg p-3 text-foreground uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth outline-none"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
            placeholder="Enter your team code"
          />
        </label>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-3 animate-fade-in">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary/90 hover:bg-primary text-background font-semibold rounded-lg py-3 transition-smooth shadow-neon-soft hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-20 transition-smooth"></span>
          <span className="relative">{loading ? "Joining..." : "Enter Lobby"}</span>
        </button>
      </form>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </main>
  );
};

export default LoginPage;

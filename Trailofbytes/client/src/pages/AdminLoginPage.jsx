import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http.js";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await http.post("/auth/admin/login", form);
      sessionStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
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
        <div className="absolute w-2 h-2 bg-primary rounded-full opacity-60 animate-float" style={{ top: '15%', left: '20%', animationDelay: '0s' }}></div>
        <div className="absolute w-1 h-1 bg-primary rounded-full opacity-40 animate-float" style={{ top: '25%', left: '75%', animationDelay: '2s' }}></div>
        <div className="absolute w-3 h-3 bg-primary rounded-full opacity-50 animate-float" style={{ top: '65%', left: '10%', animationDelay: '4s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-primary rounded-full opacity-60 animate-float" style={{ top: '75%', left: '80%', animationDelay: '1s' }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 w-full max-w-md space-y-5 shadow-neon-soft border border-primary/40 relative z-10 animate-fade-in backdrop-blur-sm">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-foreground mb-2">🔐 Admin Login</h1>
          <div className="h-1 w-20 bg-gradient-neon mx-auto rounded-full"></div>
        </div>

        <input
          type="text"
          placeholder="Username"
          className="w-full bg-background/80 border border-primary/40 rounded-lg p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth outline-none"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-background/80 border border-primary/40 rounded-lg p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-3 animate-fade-in">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary/90 hover:bg-primary text-background font-semibold rounded-lg py-3 transition-smooth shadow-neon-soft hover:shadow-neon relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-20 transition-smooth"></span>
          <span className="relative">Sign In</span>
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

export default AdminLoginPage;

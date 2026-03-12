import PropTypes from "prop-types";

const Navbar = ({ attemptsLeft, solvedCount, points, onOpenLeaderboard, onOpenInstructions, timeLeft }) => (
  <header className="flex flex-wrap items-center justify-between bg-background/80 backdrop-blur-md px-6 py-4 rounded-xl shadow-neon border border-primary/50 gap-4">
    <div className="space-y-2 text-sm text-foreground">
      <p className="font-semibold">
        Points: <span className="text-emerald-400">{points ?? 0}</span>
        <span className="mx-3 text-foreground/50">|</span>
        Attempts Left: <span className="text-amber-400">{attemptsLeft ?? 0}</span>
      </p>
      <p className="text-xs text-foreground/70">Solved: {solvedCount ?? 0} / 10</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="px-4 py-2 rounded-lg bg-card border border-primary">
        <p className="text-xs uppercase text-foreground/70">Timer</p>
        <p className="text-2xl font-mono font-bold text-emerald-400">
          {typeof timeLeft === "string" ? timeLeft : timeLeft || "00:00"}
        </p>
      </div>
      <button
        onClick={onOpenInstructions}
        className="px-4 py-2.5 rounded-lg bg-card hover:bg-card/90 text-foreground font-semibold transition-smooth transform hover:scale-105 active:scale-95"
      >
        📖 Instructions
      </button>
      <button
        onClick={onOpenLeaderboard}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold shadow-neon hover:shadow-amber-500/50 transition-smooth transform hover:scale-105 active:scale-95"
      >
        🏆 Leaderboard
      </button>
    </div>
  </header>
);

Navbar.propTypes = {
  attemptsLeft: PropTypes.number,
  solvedCount: PropTypes.number,
  points: PropTypes.number,
  onOpenLeaderboard: PropTypes.func.isRequired,
  onOpenInstructions: PropTypes.func.isRequired,
  timeLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

export default Navbar;

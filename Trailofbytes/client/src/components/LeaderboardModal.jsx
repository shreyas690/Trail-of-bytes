import PropTypes from "prop-types";

const LeaderboardModal = ({ open, onClose, leaderboard }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-card rounded shadow-neon border border-primary max-w-lg w-full animate-slide-in">
        <header className="flex items-center justify-between border-b border-primary/50 px-4 py-3">
          <h2 className="font-semibold text-foreground text-lg">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            aria-label="Close leaderboard"
            className="text-foreground hover:text-primary transition-smooth text-xl"
          >
            ✕
          </button>
        </header>
        <ul className="divide-y divide-primary/20 max-h-80 overflow-y-auto">
          {leaderboard.map((team, idx) => (
            <li key={team._id || idx} className="px-4 py-3 flex justify-between hover:bg-primary/10 transition-smooth">
              <span className="text-foreground">
                {idx + 1}. {team.name}
              </span>
              <span className="font-mono text-primary font-bold">{team.points ?? team.score ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

LeaderboardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  leaderboard: PropTypes.array.isRequired
};

export default LeaderboardModal;

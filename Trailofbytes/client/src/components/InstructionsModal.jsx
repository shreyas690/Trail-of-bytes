import PropTypes from "prop-types";

const InstructionsModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-xl p-6 max-w-2xl w-full border border-primary shadow-neon animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">📖 Game Instructions</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl font-bold transition-smooth"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-foreground">
          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2">Treasure Values</h3>
            <ul className="space-y-1 ml-4">
              <li>💎 Common: <span className="text-blue-400 font-semibold">+100 points</span></li>
              <li>💠 Rare: <span className="text-purple-400 font-semibold">+300 points</span></li>
              <li>👑 Legendary: <span className="text-yellow-400 font-semibold">+200 points</span></li>
              <li>💣 Mine: <span className="text-rose-400 font-semibold">-50 points</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2">Gameplay Rules</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>You have <span className="font-semibold text-amber-400">15 attempts only</span></li>
              <li>Each correct answer reveals the treasure location (cell number)</li>
              <li>Click the revealed treasure cell to collect points</li>
              <li>Click <span className="font-semibold">ONCE per cell</span> (duplicate clicks prevented)</li>
              <li>Mines deduct points immediately when clicked</li>
              <li>Game ends when:
                <ul className="ml-6 mt-1 space-y-1 list-disc">
                  <li>Attempts reach 0</li>
                  <li>Timer runs out</li>
                  <li>All questions are answered</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-primary/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Tip:</strong> Solve questions correctly to reveal treasure locations, then click the cells to collect points!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-lg transition-smooth animate-glow-pulse"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

InstructionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default InstructionsModal;

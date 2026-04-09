import PropTypes from "prop-types";

const AdminControls = ({ status, onStart, onStop, onReset }) => (
  <div className="flex gap-2">
    <button
      className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-600 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onStart}
      disabled={status === "running"}
    >
      ▶ Start
    </button>
    <button
      className="px-4 py-2 rounded bg-amber-400 text-slate-900 font-semibold hover:bg-amber-500 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onStop}
      disabled={status !== "running"}
    >
      ⏸ Stop
    </button>
    <button
      className="px-4 py-2 rounded bg-rose-500 text-slate-50 font-semibold hover:bg-rose-600 transition-smooth"
      onClick={onReset}
    >
      🔄 Reset
    </button>
  </div>
);

AdminControls.propTypes = {
  status: PropTypes.string,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default AdminControls;

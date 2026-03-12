import PropTypes from "prop-types";

const Cell = ({ index, state, label, disabled, onClick }) => {
  const base = "aspect-square rounded-lg border-2 text-sm font-bold transition-all duration-200 transform flex items-center justify-center relative";

  let colors = "bg-card border-primary/30 text-foreground";
  let animation = "";
  let cursorClass = "cursor-pointer";
  const isClickable = state === "hidden" && !disabled;

  if (state === "treasure") {
    colors = "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 text-slate-900 shadow-glow";
    animation = "animate-glow-pulse";
    cursorClass = "cursor-default";
  } else if (state === "mine") {
    colors = "bg-gradient-to-br from-rose-500 to-rose-700 border-rose-600 text-white shadow-neon";
    animation = "animate-neon-flicker";
    cursorClass = "cursor-default";
  } else if (!isClickable) {
    colors = "bg-background border-primary/20 text-muted-foreground opacity-50";
    cursorClass = "cursor-not-allowed";
  } else {
    // Hidden and clickable - add hover effects
    colors += " hover:bg-primary/20 hover:border-primary hover:scale-105 active:scale-95 hover:shadow-neon";
  }

  return (
    <button
      type="button"
      aria-label={`Grid cell ${index}${state === "hidden" ? " - Click to reveal" : ""}`}
      disabled={!isClickable}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isClickable && onClick) {
          onClick(index);
        }
      }}
      className={`${base} ${colors} ${animation} ${cursorClass}`}
      title={state === "hidden" ? `Cell ${index} - Click to reveal` : `${state === "treasure" ? "Treasure" : "Mine"} at cell ${index}`}
    >
      <span className="text-xs absolute top-1 left-1 text-muted-foreground font-normal">{index}</span>
      <span className="text-lg font-bold">{state === "hidden" ? "" : (label || "")}</span>
    </button>
  );
};

Cell.propTypes = {
  index: PropTypes.number.isRequired,
  state: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

export default Cell;

import PropTypes from "prop-types";
import Cell from "./Cell.jsx";

const Grid = ({ cells, onClick, disabled }) => (
  <div className="grid grid-cols-6 gap-3 w-full">
    {cells.map((cell) => (
      <Cell
        key={cell.index}
        index={cell.index}
        state={cell.state}
        label={cell.label}
        disabled={disabled || cell.disabled}
        onClick={onClick}
      />
    ))}
  </div>
);

Grid.propTypes = {
  cells: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default Grid;


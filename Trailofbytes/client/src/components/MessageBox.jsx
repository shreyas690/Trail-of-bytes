import PropTypes from "prop-types";

const MessageBox = ({ message, type = "info" }) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-emerald-500/20 border-emerald-500 text-emerald-300",
    error: "bg-rose-500/20 border-rose-500 text-rose-300",
    warning: "bg-amber-500/20 border-amber-500 text-amber-300",
    info: "bg-blue-500/20 border-blue-500 text-blue-300"
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${typeStyles[type]} transition-smooth animate-fade-in`}>
      <p className="font-semibold text-sm">{message}</p>
    </div>
  );
};

MessageBox.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(["success", "error", "warning", "info"])
};

export default MessageBox;


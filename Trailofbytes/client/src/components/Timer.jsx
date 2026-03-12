import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const formatTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const Timer = ({ end }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!end || isNaN(end)) return "00:00";
    return formatTime(end - Date.now());
  });

  useEffect(() => {
    if (!end || isNaN(end)) {
      setTimeLeft("00:00");
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = end - Date.now();
      if (remaining <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
      } else {
        setTimeLeft(formatTime(remaining));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [end]);

  return <span className="font-mono text-lg">{timeLeft}</span>;
};

Timer.propTypes = {
  end: PropTypes.number
};

export default Timer;


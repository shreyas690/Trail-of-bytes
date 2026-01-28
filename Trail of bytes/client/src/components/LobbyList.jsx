import PropTypes from "prop-types";

const LobbyList = ({ teams }) => (
  <div className="bg-card rounded p-4 h-full overflow-y-auto border border-primary/30">
    <h2 className="font-semibold mb-3 text-foreground">Lobby</h2>
    <ul className="space-y-2">
      {teams.map((team) => (
        <li
          key={team._id}
          className="flex justify-between bg-background rounded px-3 py-2 text-sm border border-primary/20"
        >
          <span className="text-foreground">{team.name}</span>
          <span className="text-emerald-400">{team.points ?? team.score ?? 0} pts</span>
        </li>
      ))}
    </ul>
  </div>
);

LobbyList.propTypes = {
  teams: PropTypes.array.isRequired
};

export default LobbyList;


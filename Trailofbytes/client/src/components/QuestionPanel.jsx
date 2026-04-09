import PropTypes from "prop-types";

const QuestionPanel = ({ questions, answers, onChange, onSubmit, solvedQuestions = [] }) => {
  const isSolved = (questionId) => {
    return solvedQuestions.some(id => id.toString() === questionId.toString());
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No questions available yet.</p>
        <p className="text-sm mt-2">Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {questions.map((question, idx) => {
        const solved = isSolved(question._id);
        const difficultyColors = {
          common: "border-blue-500 bg-blue-500/10",
          rare: "border-purple-500 bg-purple-500/10",
          legendary: "border-yellow-500 bg-yellow-500/10"
        };

        return (
          <div
            key={question._id}
            className={`p-4 rounded-lg border-2 transition-smooth ${solved
                ? "bg-emerald-500/20 border-emerald-500 opacity-75"
                : difficultyColors[question.difficulty] || "bg-card border-primary/30"
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Question {idx + 1}
              </span>
              {solved && (
                <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                  ✓ Solved
                </span>
              )}
            </div>
            <p className="font-semibold mb-3 text-foreground">{question.text}</p>
            {!solved ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const answer = answers[question._id]?.trim();
                  if (answer) {
                    onSubmit(question._id, answer);
                  }
                }}
                className="space-y-2"
              >
                <input
                  aria-label={`Answer for question ${idx + 1}`}
                  type="text"
                  className="w-full rounded-lg bg-background border border-primary p-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Enter your answer..."
                  value={answers[question._id] || ""}
                  onChange={(e) => onChange(question._id, e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-foreground text-sm font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed animate-glow-pulse"
                  disabled={!answers[question._id]?.trim()}
                >
                  Submit Answer
                </button>
              </form>
            ) : (
              <div className="text-sm text-emerald-400 font-medium">
                ✓ Correct answer submitted
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

QuestionPanel.propTypes = {
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  solvedQuestions: PropTypes.array
};

export default QuestionPanel;

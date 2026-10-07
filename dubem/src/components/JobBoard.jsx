import JobCard from "./JobCard.jsx";

const TYPES = [["job", "Jobs"], ["internship", "Internships"], ["fellowship", "Fellowships"], ["volunteer", "Volunteer"]];
const MODES = [["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "Onsite"]];

export default function JobBoard({ filters }) {
  const { types, modes, shown, toggleInList, lockedType } = filters;

  return (
    <div className="board">
      <aside className="filters" aria-label="Filters">
        <fieldset>
          <legend>Type</legend>
          {TYPES.map(([v, label]) => (
            <label key={v}>
              <input type="checkbox" checked={types.includes(v)} disabled={lockedType}
                     onChange={() => toggleInList("type", v)} /> {label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Work mode</legend>
          {MODES.map(([v, label]) => (
            <label key={v}>
              <input type="checkbox" checked={modes.includes(v)}
                     onChange={() => toggleInList("mode", v)} /> {label}
            </label>
          ))}
        </fieldset>
      </aside>

      <div>
        <div className="board-head">
          <h3>{shown.length} {shown.length === 1 ? "opportunity" : "opportunities"}</h3>
        </div>
        <div className="jobs">
          {shown.length === 0 && (
            <div className="empty">
              <h4>Nothing matches these filters</h4>
              <p>Try removing a filter or searching for something broader.</p>
            </div>
          )}
          {shown.map((j) => <JobCard key={j.slug} job={j} />)}
        </div>
      </div>
    </div>
  );
}
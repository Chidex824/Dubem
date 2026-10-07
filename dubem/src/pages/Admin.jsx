import LineChart from "../components/LineChart.jsx";

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const labels = Array.from({ length: 14 }, (_, d) => {
  const dt = new Date(2026, 8, 22 + d);
  return `${dt.getDate()} ${MON[dt.getMonth()]}`;
});

const views  = [310,340,295,420,480,455,390,520,560,610,575,640,690,720];
const clicks = [22,25,19,31,38,35,29,40,44,52,47,55,58,63];

const tiles = [
  { label: "Page views",    value: "7,005", note: "Across all listings" },
  { label: "Apply clicks",  value: "558",   note: "8.0% of views" },
  { label: "Live listings", value: "142",   note: "5 expire this week" },
  { label: "Active alerts", value: "391",   note: "From 187 seekers" },
];

const sources = [["WhatsApp", 46], ["Direct", 21], ["Telegram", 18], ["Search", 15]];

const queue = [
  { title: "Data Entry Clerk",  meta: "Job, Lagos, Nigeria",        org: "Brightpath Staffing",   orgNote: "Email confirmed", when: "10 minutes ago", check: ["bad",  "Asks for a fee"],      actions: ["Edit", "Reject"],            primary: "Reject" },
  { title: "Marketing Intern",  meta: "Internship, Remote",         org: "Greenleaf Studio",      orgNote: "Email confirmed", when: "42 minutes ago", check: ["warn", "Personal email only"], actions: ["Edit", "Reject", "Approve"], primary: "Approve" },
  { title: "Field Researcher",  meta: "Fellowship, Nairobi, Kenya", org: "Open Roots Foundation", orgNote: "Verified",        when: "2 hours ago",    check: ["ok",   "All clear"],           actions: ["Edit", "Reject", "Approve"], primary: "Approve" },
  { title: "Accountant",        meta: "Job, Accra, Ghana",          org: "Tidewater Logistics",   orgNote: "Verified",        when: "3 hours ago",    check: ["ok",   "All clear"],           actions: ["Edit", "Reject", "Approve"], primary: "Approve" },
];

export default function Admin() {
  return (
    <section className="panel pad">
      <h2 style={{ fontSize: "1.7rem" }}>Overview</h2>
      <p className="note">Last 14 days, 22 September to 5 October. Sample figures.</p>

      <div className="tiles" style={{ marginTop: 14 }}>
        {tiles.map((t) => (
          <div className="tile" key={t.label}>
            <span>{t.label}</span><b>{t.value}</b><small>{t.note}</small>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="card chart">
          <h3>Page views per day</h3>
          <LineChart name="Page views per day" data={views} yMax={800} ticks={[0, 200, 400, 600, 800]} labels={labels} />
        </div>
        <div className="card chart">
          <h3>Where visits come from</h3>
          <div className="bars">
            {sources.map(([name, pct]) => (
              <div className="bar-row" key={name}>
                <span>{name}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                <b>{pct}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card chart" style={{ marginTop: 14 }}>
        <h3>Apply clicks per day</h3>
        <LineChart name="Apply clicks per day" data={clicks} yMax={80} ticks={[0, 20, 40, 60, 80]} labels={labels} />
      </div>

      <div className="sec-head" style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: "1.25rem" }}>Moderation queue</h3>
        <span className="note">{queue.length} waiting for review</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Listing</th><th>Organization</th><th>Submitted</th><th>Checks</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {queue.map((r) => (
              <tr key={r.title}>
                <td><div className="t">{r.title}</div><div className="s">{r.meta}</div></td>
                <td>{r.org}<div className="s">{r.orgNote}</div></td>
                <td>{r.when}</td>
                <td><span className={`pill pill-${r.check[0]}`}>{r.check[1]}</span></td>
                <td>
                  <div className="acts-cell">
                    {r.actions.map((a) => (
                      <button key={a} className={`btn btn-sm ${a === r.primary ? "btn-primary" : "btn-ghost"}`}>{a}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="note" style={{ marginTop: 8 }}>
        Approving a listing publishes it and sends it to the selected channels. A failed channel post never blocks the listing.
      </p>
    </section>
  );
}
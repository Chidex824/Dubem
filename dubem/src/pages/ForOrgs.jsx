import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const BENEFITS = [
  ["One listing, more places", "Posted on the Dubem board and sent to the channels you pick, starting with WhatsApp."],
  ["A Verified badge", "Confirm your email and website and every listing carries the Verified badge."],
  ["Numbers on every listing", "See views and apply clicks for each listing from your account."],
];

const STEPS = [
  ["Create an account", 'Choose "I am hiring" and confirm your email.'],
  ["Post your opportunity", "Fill in the form. It takes a few minutes."],
  ["We review it", "Every listing is checked against our posting rules before it goes live."],
  ["Live and shared", "It appears on the board and in the channels you selected."],
];

const REJECTS = [
  "Listings that ask applicants to pay a fee",
  "Requests for ID numbers, bank details or passwords",
  "Listings with no way to apply",
  "The same listing posted more than once",
  "Offers that do not describe a real role",
];

export default function ForOrgs() {
  const { role } = useAuth();
  const canPost = role === "org" || role === "admin";

  // one button that changes with who is looking
  const action = (white = false) =>
    canPost ? (
      <Link className={white ? "btn btn-white" : "btn btn-primary"} to="/post">
        {!white && <Icon name="plus" />}Post an opportunity
      </Link>
    ) : (
      <Link className={white ? "btn btn-white" : "btn btn-primary"} to="/signup?role=hire">
        {!white && <Icon name="plus" />}Create organization account
      </Link>
    );

  return (
    <section className="panel">
      <div className="org-hero">
        <h2>Reach people looking for work, on the web and on WhatsApp</h2>
        <p>Post a job, internship or fellowship once. It appears on the Dubem board and is shared to the channels you choose. Free for all organizations at launch.</p>

        <div className="acts">{action()}</div>

        {role === "seeker" && (
          <div className="banner banner-info" style={{ marginTop: 16, maxWidth: 560 }}>
            <Icon name="user" />
            <div>You are signed in as a seeker. To post, create a separate organization account.</div>
          </div>
        )}
      </div>

      <div className="pad org-body">
        <div className="org-grid">
          {BENEFITS.map(([title, text]) => (
            <div className="card" key={title}><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>

        <div className="org-two">
          <div className="card">
            <h3>How it works</h3>
            <ol className="steps">
              {STEPS.map(([title, text], i) => (
                <li data-n={i + 1} key={title}><b>{title}</b><span>{text}</span></li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h3>What we reject</h3>
            <ul className="rules">
              {REJECTS.map((r) => (
                <li key={r}><Icon name="x" />{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cta-band">
          <div>
            <h3>Ready to post your first listing?</h3>
            <p>We review every listing before it goes live.</p>
          </div>
          {action(true)}
        </div>
      </div>
    </section>
  );
}
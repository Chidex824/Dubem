import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const status = params.get("status");               // ?status=verified or ?status=expired

  return (
    <section className="panel pad">
      <div className="two">
        <div className="card">
          <div className="mailmark"><Icon name="mail" /></div>
          <h2 style={{ marginTop: 14 }}>Check your email</h2>
          <p style={{ marginTop: 6 }}>
            {status === "verified" && <>Your email has been verified. You can now save jobs and create alerts.</>}
            {status === "expired" && <>This link has expired. Request a new verification email to continue.</>}
            {!status && <>We sent a verification link to your email. It expires in 24 hours.</>}
          </p>

          <div className="states">
            {status === "verified" && (
              <div className="banner banner-ok"><Icon name="check" />
                <div><b>Email verified.</b> You can now save jobs and create alerts.</div></div>
            )}
            {status === "expired" && (
              <div className="banner banner-bad"><Icon name="clock" />
                <div><b>This link has expired.</b> Request a new verification email to continue.</div></div>
            )}
          </div>

          <p className="note" style={{ marginTop: 12 }}>
            Until your email is verified you can browse and apply, but you cannot save jobs, create alerts or post.
          </p>
        </div>
      </div>
    </section>
  );
}


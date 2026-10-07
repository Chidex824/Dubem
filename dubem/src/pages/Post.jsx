<!-- POST -->
    <section class="panel pad" id="p-post" role="tabpanel" aria-labelledby="t-post" hidden>
      <div class="post">
        <div>
          <h2>Post an opportunity</h2>
          <p class="note">Posting as <b>Kora Health</b> <span class="verified"><svg class="ic ic-sm"><use href="#i-shield"/></svg>Verified</span></p>
          <form class="form" onsubmit="return false">
            <div class="grid-2">
              <div class="field"><label for="po-type">Type</label><select class="select" id="po-type"><option>Job</option><option>Internship</option><option>Fellowship</option><option>Volunteer</option></select></div>
              <div class="field"><label for="po-mode">Work mode</label><select class="select" id="po-mode"><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></div>
            </div>
            <div class="field"><label for="po-title">Title</label><input class="input" id="po-title" value="Backend Developer (Python and Django)"></div>
            <div class="grid-2">
              <div class="field"><label for="po-country">Country</label><select class="select" id="po-country"><option>Remote-Global</option><option>Nigeria</option><option>Ghana</option><option>Kenya</option><option>United Kingdom</option></select></div>
              <div class="field"><label for="po-city">City or region</label><input class="input" id="po-city" placeholder="Optional"></div>
            </div>
            <div class="grid-2">
              <div class="field"><label for="po-pay">Salary or stipend</label><input class="input" id="po-pay" value="$2,500 to $3,500 a month"><span class="hint">Listings with pay get more applications.</span></div>
              <div class="field"><label for="po-close">Closing date</label><input class="input" id="po-close" type="date" value="2026-11-15"></div>
            </div>
            <div class="field"><label for="po-desc">Description</label><textarea class="textarea" id="po-desc">Own the API that clinics use every day. Design Django REST endpoints, keep response times low on mobile networks, and review pull requests.</textarea></div>
            <div class="field"><label for="po-link">How to apply</label><input class="input" id="po-link" value="https://kora.example/careers/backend" inputmode="url"><span class="hint">A link or an email address. Applicants never pay a fee.</span></div>
            <div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-primary" type="submit">Submit for review</button><button class="btn btn-ghost" type="button">Save draft</button></div>
          </form>
        </div>
        <aside class="aside">
          <div class="card">
            <h3>What happens next</h3>
            <ol class="steps">
              <li data-n="1"><b>Submitted</b><span>You get a confirmation email.</span></li>
              <li data-n="2"><b>In review</b><span>We check the listing against our posting rules.</span></li>
              <li data-n="3"><b>Live on Dubem</b><span>The listing appears on the board and in search.</span></li>
              <li data-n="4"><b>Shared to channels</b><span>Posted to the channels you select below.</span></li>
            </ol>
          </div>
          <div class="card">
            <h3>Share to</h3>
            <div class="opts">
              <label><input type="checkbox" checked><span>WhatsApp channel<small>Posted when the listing is approved.</small></span></label>
              <label><input type="checkbox" disabled><span>Telegram<small>Coming soon.</small></span></label>
            </div>
          </div>
          <div class="banner banner-warn"><svg class="ic"><use href="#i-flag"/></svg><div>Listings that ask applicants to pay, or request IDs or bank details, are rejected.</div></div>
        </aside>
      </div>
    </section>
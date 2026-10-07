
    <!-- ACCOUNT -->
    <section class="panel pad" id="p-account" role="tabpanel" aria-labelledby="t-account" hidden>
      <div class="acct">
        <nav class="side-nav" aria-label="Account">
          <a href="#account" aria-current="page"><svg class="ic"><use href="#i-bell"/></svg>Alerts</a>
          <a href="#account"><svg class="ic"><use href="#i-bookmark"/></svg>Saved jobs</a>
          <a href="#account"><svg class="ic"><use href="#i-upload"/></svg>CV</a>
          <a href="#account"><svg class="ic"><use href="#i-user"/></svg>Profile</a>
        </nav>
        <div class="acct-main">
          <div>
            <h2>Hello, Ada</h2>
            <div class="banner banner-ok" style="margin-top:10px;display:inline-flex"><svg class="ic"><use href="#i-shield"/></svg>Email verified</div>
          </div>

          <section aria-labelledby="al-h">
            <div class="sec-head"><h3 id="al-h">Saved searches and alerts</h3><span class="note" id="al-count">3 searches</span></div>
            <div class="rows" id="alerts">
              <div class="row">
                <div class="grow"><b>Remote Django jobs</b><div class="meta"><span class="chip">Job</span><span class="chip">Remote-Global</span></div></div>
                <div class="row-tools"><div class="seg freq" role="group" aria-label="Frequency"><button aria-pressed="true">Instant</button><button aria-pressed="false">Daily</button></div><label class="switch"><input type="checkbox" checked aria-label="Alert on"><span></span></label><button class="icon-btn del" aria-label="Delete alert"><svg class="ic"><use href="#i-trash"/></svg></button></div>
              </div>
              <div class="row">
                <div class="grow"><b>Internships in Nigeria</b><div class="meta"><span class="chip">Internship</span><span class="chip">Nigeria</span></div></div>
                <div class="row-tools"><div class="seg freq" role="group" aria-label="Frequency"><button aria-pressed="false">Instant</button><button aria-pressed="true">Daily</button></div><label class="switch"><input type="checkbox" checked aria-label="Alert on"><span></span></label><button class="icon-btn del" aria-label="Delete alert"><svg class="ic"><use href="#i-trash"/></svg></button></div>
              </div>
              <div class="row">
                <div class="grow"><b>Fellowships in Africa</b><div class="meta"><span class="chip">Fellowship</span><span class="chip">Africa</span></div></div>
                <div class="row-tools"><div class="seg freq" role="group" aria-label="Frequency"><button aria-pressed="false">Instant</button><button aria-pressed="true">Daily</button></div><label class="switch"><input type="checkbox" aria-label="Alert on"><span></span></label><button class="icon-btn del" aria-label="Delete alert"><svg class="ic"><use href="#i-trash"/></svg></button></div>
              </div>
            </div>
            <form class="new-alert" id="new-alert" onsubmit="return false">
              <div class="field"><label for="na-q">Keyword</label><input class="input" id="na-q" placeholder="For example, data analyst"></div>
              <div class="field"><label for="na-t">Type</label><select class="select" id="na-t"><option>Job</option><option>Internship</option><option>Fellowship</option><option>Volunteer</option></select></div>
              <div class="field"><label for="na-r">Region</label><select class="select" id="na-r"><option>Africa</option><option>Remote-Global</option><option>Europe</option><option>North America</option><option>Asia</option></select></div>
              <button class="btn btn-primary" type="submit"><svg class="ic"><use href="#i-plus"/></svg>Add alert</button>
            </form>
            <p class="note" style="margin-top:8px">Alerts are sent by email. You can unsubscribe from any alert with one click.</p>
          </section>

          <section aria-labelledby="sj-h">
            <div class="sec-head"><h3 id="sj-h">Saved jobs</h3><a href="#account">See all 7</a></div>
            <div class="rows">
              <div class="row"><div class="grow"><b>Programme Intern, Climate Policy</b><span class="note">Sahel Climate Lab, Abuja</span></div><div class="row-tools"><span class="pill pill-warn">Closes in 6 days</span><button class="icon-btn del" aria-label="Remove saved job"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>
              <div class="row"><div class="grow"><b>Frontend Developer (React)</b><span class="note">Lumen Payments, Lagos</span></div><div class="row-tools"><span class="pill pill-info">Closes in 3 weeks</span><button class="icon-btn del" aria-label="Remove saved job"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>
            </div>
          </section>

          <section class="dashed" aria-labelledby="cv-h">
            <div><h3 id="cv-h" style="font-size:1.05rem">Upload your CV once</h3><p>Reuse it on every application. This arrives in a later release.</p></div>
            <button class="btn btn-ghost" disabled type="button"><svg class="ic"><use href="#i-upload"/></svg>Upload CV</button>
          </section>
        </div>
      </div>
    </section>
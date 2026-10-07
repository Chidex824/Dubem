<section class="panel pad" id="p-signup" role="tabpanel" aria-labelledby="t-signup" hidden>
      <div class="two">
        <div class="card">
          <h2>Create your account</h2>
          <p class="note">One account for saved jobs and alerts, or to post opportunities for your organization.</p>
          <form class="form" onsubmit="return false">
            <div class="role" role="group" aria-label="Account type">
              <button type="button" data-role="seek" aria-pressed="true">I am looking</button>
              <button type="button" data-role="hire" aria-pressed="false">I am hiring</button>
            </div>
            <div class="field"><label for="su-name" id="su-name-l">Full name</label><input class="input" id="su-name" value="Ada Okafor" autocomplete="name"></div>
            <div class="field" id="su-web" hidden><label for="su-site">Organization website</label><input class="input" id="su-site" placeholder="https://yourorganization.org" inputmode="url"><span class="hint">We check the website before your first listing goes live.</span></div>
            <div class="field"><label for="su-mail">Email</label><input class="input" id="su-mail" type="email" value="ada@example.com" autocomplete="email"></div>
            <div class="field"><label for="su-pw">Password</label><input class="input" id="su-pw" type="password" value="correct-horse-battery" autocomplete="new-password"><span class="hint">At least 10 characters.</span></div>
            <label class="check"><input type="checkbox" checked> I agree to the Terms and the Privacy Policy.</label>
            <button class="btn btn-primary" type="submit">Create account</button>
            <p class="note">Already registered? <a href="#signup">Sign in</a></p>
          </form>
        </div>

        <div class="card">
          <div class="mailmark"><svg class="ic"><use href="#i-mail"/></svg></div>
          <h2 style="margin-top:14px">Check your email</h2>
          <p style="margin-top:6px">We sent a verification link to <b>ada@example.com</b>. It expires in 24 hours.</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;align-items:center">
            <button class="btn btn-primary" id="resend" type="button" disabled>Resend email</button>
            <button class="btn btn-quiet" type="button">Use a different email</button>
          </div>
          <p class="note" id="resend-note" style="margin-top:8px">You can resend in 0:42</p>
          <div class="states">
            <div class="banner banner-ok"><svg class="ic"><use href="#i-check"/></svg><div><b>Email verified.</b> You can now save jobs and create alerts.</div></div>
            <div class="banner banner-bad"><svg class="ic"><use href="#i-clock"/></svg><div><b>This link has expired.</b> Request a new verification email to continue.</div></div>
          </div>
          <p class="note" style="margin-top:12px">Until your email is verified you can browse and apply, but you cannot save jobs, create alerts or post.</p>
        </div>
      </div>
    </section>
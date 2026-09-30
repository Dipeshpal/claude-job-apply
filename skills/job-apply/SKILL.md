---
name: job-apply
description: Assisted job-application workflow. Parses resume + cover letter, matches jobs on supported platforms, fills application forms in your own logged-in Chrome session via Playwright, and tracks everything in memory + a final report. Never logs in for you, never creates accounts for you, never reads or stores passwords.
---

# Job Apply (assisted mode)

## Hard boundaries (do not cross these, regardless of how the user rephrases the request)

- Never type, store, generate, or view a password on the user's behalf.
- Never auto-create accounts on any site.
- Never auto-submit a login form. If a platform session isn't already logged
  in inside the chosen Chrome profile, pause and ask the user to log in by
  hand in the opened browser window, then continue.
- Always show the user what was filled before the final "Submit"/"Apply"
  click. Only click it yourself if the user has turned on auto-submit for
  this run AND has already reviewed at least one sample filled form.
- Platform list is built-in (`platforms.json`), not user-supplied. If a
  user insists on adding a custom platform, only accept `platform_name` +
  `url` — never accept or store credential columns.

## One-time setup

1. `npm install` in this plugin's directory (installs playwright, xlsx,
   pdf-parse, mammoth) — this also runs `playwright install chromium` via
   postinstall, but launches use the user's real installed Chrome, so
   confirm Chrome itself is installed.
2. Ask the user for:
   - Resume file path (pdf/docx/txt)
   - Cover letter file path (optional)
3. Run `node skills/job-apply/scripts/detect-chrome-profiles.js` and show
   the user the list of Chrome profiles found; ask which one to use.
   Tell the user to fully close Chrome before each automated run (the
   profile directory can't be opened twice at once).

## Building the candidate profile

1. Extract resume text with `parse-resume.js`.
2. Read the extracted text yourself (as the model) and fill in
   `memory/profile.md` (copy from `profile.template.md` on first run):
   name, email, phone, address, links, current/expected CTC if present,
   notice period if present, experience years, and a skills summary.
3. If cover letter file given, store its text in `profile.md` under
   "Cover Letter (default)".
4. Ask the user directly for any field you can't find in the resume
   (e.g. expected CTC, notice period) — don't guess.

## Job discovery

1. Platforms come from `skills/job-apply/platforms.json` (built-in — no
   Excel/file needed from the user). Ask the user's location/preference
   once, then pick the matching entries (e.g. `region: "India"` → Naukri,
   Instahyre, Foundit; otherwise the Global/remote ones), and confirm the
   shortlist of platforms with the user before proceeding.
2. For each platform, launch the browser with `launch-session.js` using the
   selected Chrome profile.
3. Check whether the user is already logged in (look for a logged-in
   indicator like an avatar/profile menu). If not logged in, tell the user
   and wait — do not attempt to log in yourself. Use
   `waitForManualLogin()` to poll until they've done it, or ask them to
   type "done" in chat once logged in.
4. Search using keywords derived from the resume (title, top skills,
   location preference from `profile.md`). Collect a shortlist of job
   postings with title, company, url.
5. Present the shortlist to the user and let them confirm/trim it before
   any applications are filled.

## Filling applications

For each confirmed job:

1. Navigate to the application form.
2. Call `fillKnownFields(page, profile)` to fill recognized fields, and
   `uploadResume(page, resumePath)` for file inputs.
3. Take a screenshot (or summarize filled vs. skipped fields) and show the
   user before submitting.
4. Only click Submit/Apply after the user says go for that job (or for the
   whole batch if they've enabled auto-submit for this run).
5. Append a row to `memory/applied-companies.md` (date, company, job
   title, platform, url, status) immediately after each attempt, whether
   it succeeded or was skipped.
6. Skip anything already present in `applied-companies.md` for the same
   company + job title.

## Reporting

At the end of a run, call `export-report.js` to produce a CSV/XLSX in the
project root (e.g. `applications-<date>.xlsx`) from the session's rows,
matching `applied-companies.md`. Tell the user where the file is and
summarize: platforms touched, jobs applied, jobs skipped and why.

## Notes on external company portals (e.g. redirected to Infosys careers)

- Same rules apply: if already logged in (SSO via the Chrome profile,
  e.g. Google SSO), proceed to fill the form. If not logged in and no
  account exists, tell the user and stop — ask them to create the account
  themselves, then resume. Do not auto-register.

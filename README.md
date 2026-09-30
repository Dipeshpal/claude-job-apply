# claude-job-apply

Assisted job-application plugin for Claude Code. Parses your resume, matches
jobs, fills application forms in your own logged-in Chrome session via
Playwright, tracks progress in markdown memory, and exports a final report.

**What it deliberately does NOT do:** log in for you, create accounts for
you, generate or read your passwords, or auto-submit without showing you the
filled form first. See `skills/job-apply/SKILL.md` for the hard boundaries.

## Install

### Folder-level (this project only)

```
git clone <this-repo-url> claude-job-apply
cd claude-job-apply
npm install
```

Claude Code picks up `.claude-plugin/plugin.json` and the skill under
`skills/job-apply/` automatically when this folder is open.

### System-level (all projects)

```
git clone <this-repo-url> ~/.claude/plugins/job-apply
cd ~/.claude/plugins/job-apply
npm install
```

## Use

Say "apply to jobs" or invoke the `job-apply` skill. It will ask for your
resume, optional cover letter, and which Chrome profile to use. Platforms
are built-in (`skills/job-apply/platforms.json` — Naukri, LinkedIn Jobs,
Indeed, Instahyre, Foundit, Wellfound, Remotive, WeWorkRemotely, etc.); no
Excel file needed. Close Chrome fully before each run (Playwright needs
the profile directory free).

## Data

Your resume, cover letter, and generated profile/log files live under
`memory/` and `inputs/` — gitignored, never leave your machine.

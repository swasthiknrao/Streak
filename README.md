# 🔥 GitHub Streak Helper

A simple tool to help you build and maintain your GitHub contribution streak.

## What it does

- **Activity tracker** – Enter your GitHub username to see your recent contributions
- **Daily reminder** – Gentle nudge to make at least one contribution today
- **Streak log** – Update `streak-log.md` daily with small edits (counts as a contribution!)

## How to use

1. Open `index.html` in your browser
2. Enter your GitHub username and click "Check Activity"
3. Try to make at least one contribution per day:
   - Edit `streak-log.md` and add an entry
   - Commit and push any changes
   - Fix typos, add docs, create issues, etc.

## Quick tips for streaks

- Update `streak-log.md` every day – even a one-line edit counts!
- Push changes before midnight (in your timezone)
- Commits, PRs, issues, and reviews all count as contributions

## Run locally

You can open `index.html` directly in a browser, or serve it with a simple server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

---

## Contribution Graph Filler (Backdate Commits)

Creates commits at specific dates to fill the GitHub contribution graph. Based on the technique from the video.

**Important:** Turn on "Include private contributions" in [GitHub Settings → Profile](https://github.com/settings/profile). Use a **private** repo for these commits.

### Setup

```bash
cd "my plan/GITBOT"   # or wherever this project lives
npm install
```

### Usage

**1. Fill from `contributions.json`** – Add dates in `YYYY-MM-DD` format, then:

```bash
npm run fill
```

**2. Random fill** – Scatter commits across the past 54 weeks (default) for a dense graph:

```bash
npm run fill:random
```

Or specify weeks: `node backdate.js fill --random 26`

### How it works

- Reads dates from `contributions.json` or generates random dates
- Appends a line to `commit-log.txt` for each commit
- Commits with `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` set to the target date
- Pushes to the remote

### Graph layout (X = weeks, Y = days)

- Add **weeks** for horizontal movement
- Add **days** for vertical (Sun–Sat)
- Edit `contributions.json` to draw patterns or names

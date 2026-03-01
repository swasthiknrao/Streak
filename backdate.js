/**
 * GitHub Contribution Graph Filler
 * Creates commits at specific dates to populate the contribution graph.
 * Requires: "Include private contributions" ON in GitHub Settings > Profile.
 */

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');

const CONTRIBUTIONS_FILE = path.join(__dirname, 'contributions.json');
const LOG_FILE = path.join(__dirname, 'commit-log.txt');

const git = simpleGit(__dirname);

function getDateString(date) {
  // Git expects: "Wed Feb 28 2024 12:00:00 GMT+0530"
  return moment(date).format('ddd MMM D HH:mm:ss YYYY ZZ');
}

function addCommitToLog(date, count) {
  let content = '';
  if (fs.existsSync(LOG_FILE)) {
    content = fs.readFileSync(LOG_FILE, 'utf8');
  }
  content += `${moment(date).format('YYYY-MM-DD')}: commit ${count}\n`;
  fs.writeFileSync(LOG_FILE, content);
}

async function createCommit(date) {
  const dateStr = getDateString(date);
  const message = moment(date).format('YYYY-MM-DD');
  addCommitToLog(date, 1);

  process.env.GIT_AUTHOR_DATE = dateStr;
  process.env.GIT_COMMITTER_DATE = dateStr;

  await git.add(LOG_FILE);
  await git.commit(message);
}

async function runFill(dates) {
  console.log(`Creating ${dates.length} commits...`);

  for (let i = 0; i < dates.length; i++) {
    const date = moment(dates[i]).toDate();
    await createCommit(date);
    console.log(`  [${i + 1}/${dates.length}] ${moment(date).format('YYYY-MM-DD')}`);
  }

  console.log('\nPushing to remote...');
  await git.push();
  console.log('Done!');
}

async function runRandomFill(weeks = 54) {
  const dates = [];
  const endDate = moment().startOf('day');
  const startDate = moment().subtract(weeks, 'weeks').startOf('day');

  // At least 1 commit per day (fills every square on the graph)
  for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, 'day')) {
    const day = moment(d);
    // 3-6 commits per day for dense green (darker = more contributions)
    const commitsPerDay = 1 + Math.floor(Math.random() * 2); // 1–2 per day = filled graph
    for (let c = 0; c < commitsPerDay; c++) {
      const randomHour = Math.floor(Math.random() * 24);
      const randomMin = Math.floor(Math.random() * 60);
      dates.push(day.clone().hour(randomHour).minute(randomMin).second(0).format('YYYY-MM-DD HH:mm'));
    }
  }

  dates.sort((a, b) => new Date(a) - new Date(b));
  console.log(`Generated ${dates.length} random commit dates over ${weeks} weeks.`);

  for (let i = 0; i < dates.length; i++) {
    const date = moment(dates[i]).toDate();
    await createCommit(date);
    if ((i + 1) % 20 === 0 || i === dates.length - 1) {
      console.log(`  [${i + 1}/${dates.length}] ${moment(date).format('YYYY-MM-DD')}`);
    }
  }

  console.log('\nPushing to remote...');
  await git.push();
  console.log('Done!');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'fill';
  const useRandom = args.includes('--random');

  try {
    if (mode === 'fill' && useRandom) {
      const weeks = parseInt(args[args.indexOf('--random') + 1]) || 54;
      await runRandomFill(weeks);
    } else if (mode === 'fill' || mode === 'custom') {
      const data = jsonfile.readFileSync(CONTRIBUTIONS_FILE);
      const dates = data.dates || [];
      if (dates.length === 0) {
        console.log('No dates in contributions.json. Add dates in YYYY-MM-DD format.');
        return;
      }
      await runFill(dates);
    } else {
      console.log(`
Usage:
  node backdate.js fill              - Commit for each date in contributions.json
  node backdate.js fill --random [weeks] - Random commits over past N weeks (default 54)
  node backdate.js custom            - Same as fill (uses contributions.json)

Ensure "Include private contributions" is ON in GitHub Settings > Profile.
      `);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();

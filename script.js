const GITHUB_API = 'https://api.github.com';
const STORAGE_KEYS = {
  USERNAME: 'gh-streak-username',
  DISMISSED: 'gh-streak-dismissed',
};

// Load saved username and show reminder on page load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(STORAGE_KEYS.USERNAME);
  if (saved) {
    document.getElementById('username').value = saved;
    fetchActivity(saved);
  }
  updateReminder();
});

document.getElementById('fetchBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  if (!username) return;
  localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  fetchActivity(username);
});

document.getElementById('dismissBtn').addEventListener('click', () => {
  const today = new Date().toDateString();
  localStorage.setItem(STORAGE_KEYS.DISMISSED, today);
  updateReminder();
});

async function fetchActivity(username) {
  const statsSection = document.getElementById('statsSection');
  document.getElementById('eventCount').textContent = '...';
  document.getElementById('todayContrib').textContent = '...';
  document.getElementById('streakStatus').textContent = '...';

  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/events/public?per_page=100`);
    if (!res.ok) throw new Error('User not found');

    const events = await res.json();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekEvents = events.filter((e) => new Date(e.created_at) >= weekAgo);
    const todayEvents = events.filter((e) => e.created_at.startsWith(todayStr));

    // Count contribution types (PushEvent, IssuesEvent, PullRequestEvent, etc.)
    const contribTypes = ['PushEvent', 'IssuesEvent', 'PullRequestEvent', 'CreateEvent', 'DeleteEvent'];
    const todayContrib = todayEvents.filter((e) => contribTypes.includes(e.type)).length;

    document.getElementById('eventCount').textContent = weekEvents.length;
    document.getElementById('todayContrib').textContent = todayContrib;

    if (todayContrib > 0) {
      document.getElementById('streakStatus').textContent = '✅ On track!';
    } else {
      document.getElementById('streakStatus').textContent = '⚠️ Commit today!';
    }
  } catch (err) {
    document.getElementById('eventCount').textContent = '—';
    document.getElementById('todayContrib').textContent = '—';
    document.getElementById('streakStatus').textContent = 'Error';
  }
}

function updateReminder() {
  const today = new Date().toDateString();
  const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED);

  const textEl = document.getElementById('reminderText');

  if (dismissed === today) {
    textEl.textContent = "You dismissed the reminder. Come back tomorrow!";
  } else {
    textEl.textContent = "Don't forget to make at least one contribution today to keep your streak! Update streak-log.md or push a commit.";
  }
}

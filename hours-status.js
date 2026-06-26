/**
 * THE LOFT TAVERN — Auto Open/Closed Status
 *
 * EDIT THIS SECTION to match your actual hours.
 * Times are in 24-hour format. 0 = Sunday, 1 = Monday, ... 6 = Saturday.
 *
 * Each day: [openHour, openMinute, closeHour, closeMinute]
 * Use null for closed all day.
 */
const LOFT_HOURS = {
  0: [11, 30, 21, 0],   // Sunday:    11:30 AM – 9 PM
  1: null,               // Monday:    Closed
  2: null,               // Tuesday:   Closed
  3: null,               // Wednesday: Closed
  4: [15, 0, 21, 0],    // Thursday:  3 PM – 9 PM
  5: [11, 30, 22, 0],   // Friday:    11:30 AM – 10 PM
  6: [11, 30, 22, 0],   // Saturday:  11:30 AM – 10 PM
};

// Day names for display
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getLoftStatus() {
  // Uses browser local time — visitors in Vermont will see correct status.
  // If you want to force Vermont time regardless of visitor location,
  // use: new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = now.getDay();
  const hour = now.getHours();
  const min = now.getMinutes();
  const nowMins = hour * 60 + min;   // minutes since midnight

  const todayHours = LOFT_HOURS[day];

  if (!todayHours) {
    // Find next open day
    return { open: false, label: 'Closed Today', sub: nextOpenText(day) };
  }

  const [oh, om, ch, cm] = todayHours;
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;

  if (nowMins < openMins) {
    const opensIn = openMins - nowMins;
    const hrStr = opensIn >= 60 ? `${Math.floor(opensIn / 60)}h ` : '';
    const minStr = `${opensIn % 60}m`;
    return {
      open: false,
      label: 'Closed',
      sub: `Opens today at ${fmtTime(oh, om)} · in ${hrStr}${minStr}`
    };
  }

  if (nowMins >= closeMins) {
    return { open: false, label: 'Closed', sub: nextOpenText(day) };
  }

  const minsLeft = closeMins - nowMins;
  const sub = minsLeft <= 30
    ? `Closing in ${minsLeft} min`
    : `Open until ${fmtTime(ch, cm)}`;

  return { open: true, label: 'Open Now', sub };
}

function nextOpenText(currentDay) {
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const h = LOFT_HOURS[nextDay];
    if (h) {
      const dayLabel = i === 1 ? 'Tomorrow' : DAY_NAMES[nextDay];
      return `Opens ${dayLabel} at ${fmtTime(h[0], h[1])}`;
    }
  }
  return '';
}

function fmtTime(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function renderStatus() {
  const el = document.getElementById('loft-status-bar');
  if (!el) return;

  const { open, label, sub } = getLoftStatus();

  el.innerHTML = `
    <div class="status-bar-inner">
      <span class="status-pill ${open ? 'open' : 'closed'}">
        <span class="dot ${open ? 'pulse' : ''}"></span>
        ${label}
      </span>
      <span class="status-sub">${sub}</span>
    </div>
  `;
}

// Run on load, then refresh every 60 seconds
document.addEventListener('DOMContentLoaded', renderStatus);
setInterval(renderStatus, 60 * 1000);

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
    toggle.classList.toggle('open');
  });
  // Close menu when a link is tapped
  links.addEventListener('click', function () {
    links.classList.remove('open');
    toggle.classList.remove('open');
  });
});

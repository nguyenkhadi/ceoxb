const DEFAULT_STATE = {
  currentUser: null,
  users: [
    { id: 1, name: "Kha-Di Nguyen", email: "ceo@ceoxb.com", password: "demo", role: "ceo", company: "Northstar Labs", title: "Founder & CEO", timezone: "California / PST", group: "Alpha Circle" },
    { id: 2, name: "Ava Chen", email: "admin@ceoxb.com", password: "demo", role: "admin", company: "CEO XB", title: "Community Admin", timezone: "California / PST", group: "Admin" },
    { id: 3, name: "Maya Patel", email: "maya@demo.com", password: "demo", role: "ceo", company: "CareLoop", title: "CEO", timezone: "London / GMT", group: "Alpha Circle" },
    { id: 4, name: "Daniel Kim", email: "daniel@demo.com", password: "demo", role: "ceo", company: "Atlas Robotics", title: "CEO", timezone: "Seoul / KST", group: "Alpha Circle" }
  ],
  applications: [
    { id: 1, name: "Nina Rodriguez", email: "nina@founder.com", company: "MedBridge AI", role: "CEO", timezone: "Mexico City", goals: "International expansion and fundraising", status: "pending" }
  ],
  checkins: [
    { id: 1, userId: 1, month: "October", kpi: "Increase enterprise trials by 20%", progress: "Closed 4 pilots and need help with pricing strategy.", status: "submitted" },
    { id: 2, userId: 3, month: "October", kpi: "Hire two senior engineers", progress: "Interview pipeline is strong but compensation is hard.", status: "submitted" }
  ],
  messages: [
    { from: 3, to: 1, text: "Do you have time for a coffee chat this week about onboarding?" },
    { from: 1, to: 3, text: "Yes, Thursday afternoon works for me." }
  ],
  coffeeChats: [
    { id: 1, requester: "Maya Patel", recipient: "Kha-Di Nguyen", topic: "Onboarding strategy", status: "Pending", time: "Thu 2:00 PM" }
  ],
  events: [
    { id: 1, title: "HLTH Conference", location: "Las Vegas", date: "Nov 18", note: "3 CEOs attending" },
    { id: 2, title: "SaaS Founder Dinner", location: "San Francisco", date: "Dec 4", note: "Invite-only dinner" }
  ],
  resources: [
    { id: 1, title: "FDA Readiness Guide", type: "Video", minutes: 18 },
    { id: 2, title: "Monthly KPI Template", type: "Worksheet", minutes: 5 },
    { id: 3, title: "Fundraising Storytelling", type: "Article", minutes: 9 }
  ]
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem("ceoxb_state");
  return saved ? JSON.parse(saved) : structuredClone(DEFAULT_STATE);
}
function saveState() { localStorage.setItem("ceoxb_state", JSON.stringify(state)); }
function $(id) { return document.getElementById(id); }
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2600);
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = $(id);
  if (id === "dashboard") {
    if (!state.currentUser) {
      toast("Please login or use a demo account first.");
      id = "login";
    } else {
      page.classList.add("active");
      renderDashboard();
    }
  }
  if (id !== "dashboard") $(id).classList.add("active");
  $("mobileNav").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function toggleMobileMenu() { $("mobileNav").classList.toggle("hidden"); }

function demoLogin(type) {
  const email = type === "admin" ? "admin@ceoxb.com" : "ceo@ceoxb.com";
  const user = state.users.find(u => u.email === email);
  state.currentUser = user;
  saveState();
  toast(`Logged in as ${user.name}`);
  showPage("dashboard");
}
function logout() {
  state.currentUser = null;
  saveState();
  toast("Logged out.");
  showPage("landing");
}

$("applicationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const app = {
    id: Date.now(),
    name: $("appName").value.trim(),
    email: $("appEmail").value.trim(),
    company: $("appCompany").value.trim(),
    role: $("appRole").value.trim(),
    timezone: $("appTimezone").value.trim(),
    goals: $("appGoals").value.trim(),
    status: "pending"
  };
  state.applications.push(app);
  saveState();
  e.target.reset();
  toast("Application submitted for admin review.");
  showPage("login");
});

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value.trim();
  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) return toast("Login failed. Try demo account: password is demo.");
  state.currentUser = user;
  saveState();
  showPage("dashboard");
});

function fakePay() { toast("Demo payment started. Connect Stripe for real subscriptions."); }

function renderDashboard() {
  const user = state.currentUser;
  $("sideName").textContent = user.name;
  $("sideRole").textContent = `${user.title} • ${user.role}`;
  $("sideAvatar").textContent = user.name[0];
  $("adminOnlyBtn").style.display = user.role === "admin" ? "block" : "none";
  setPanel("home");
  renderHome(); renderMessages(); renderCheckins(); renderCoffee(); renderEvents(); renderResources(); renderAdmin();
}

function setPanel(panel) {
  if (panel === "admin" && state.currentUser?.role !== "admin") return toast("Admin only.");
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active-panel"));
  $(`panel-${panel}`).classList.add("active-panel");
}

function renderHome() {
  const user = state.currentUser;
  const submitted = state.checkins.filter(c => c.month === "October").length;
  $("panel-home").innerHTML = `
    <h2>Welcome, ${user.name}</h2>
    <p class="muted">Your private CEO workspace for accountability, peer support, and monthly progress.</p>
    <div class="dashboard-grid">
      <div class="stat-card"><span>Accountability Group</span><strong>${user.group}</strong></div>
      <div class="stat-card"><span>October Check-ins</span><strong>${submitted}/4</strong></div>
      <div class="stat-card"><span>Trial Status</span><strong>Active</strong></div>
    </div>
    <div class="two-col">
      <div class="card form-card">
        <h3>Upcoming actions</h3>
        <div class="list">
          <div class="list-item"><strong>Submit KPI check-in</strong><p>Reminder: share your wins, blockers, and next-month focus.</p></div>
          <div class="list-item"><strong>Monthly meeting</strong><p>Alpha Circle meets Wednesday at 10 AM.</p></div>
          <div class="list-item"><strong>Coffee chat</strong><p>Maya requested a chat about onboarding strategy.</p></div>
        </div>
      </div>
      <div class="card form-card">
        <h3>Group members</h3>
        ${state.users.filter(u => u.role === "ceo").map(u => `<div class="list-item"><strong>${u.name}</strong><p>${u.title}, ${u.company} • ${u.timezone}</p></div>`).join("")}
      </div>
    </div>
  `;
}

function renderMessages() {
  const user = state.currentUser;
  const msgs = state.messages.filter(m => m.from === user.id || m.to === user.id || user.role === "admin");
  $("panel-messages").innerHTML = `
    <h2>Messages</h2>
    <p class="muted">Prototype direct messaging between accepted CEOs.</p>
    <div class="chat-window" id="chatWindow">
      ${msgs.map(m => `<div class="msg ${m.from === user.id ? "me" : ""}">${getName(m.from)}: ${m.text}</div>`).join("") || "<p>No messages yet.</p>"}
    </div>
    <div class="chat-input">
      <input id="newMessage" placeholder="Write a message to Maya..." />
      <button class="primary" onclick="sendMessage()">Send</button>
    </div>
  `;
}
function getName(id) { return state.users.find(u => u.id === id)?.name || "Unknown"; }
function sendMessage() {
  const text = $("newMessage").value.trim();
  if (!text) return;
  state.messages.push({ from: state.currentUser.id, to: 3, text });
  saveState(); renderMessages(); toast("Message sent.");
}

function renderCheckins() {
  $("panel-checkins").innerHTML = `
    <h2>Monthly KPI Check-ins</h2>
    <p class="muted">Record how the month went, what KPIs changed, and what support you need.</p>
    <div class="two-col">
      <form class="card form-card" onsubmit="submitCheckin(event)">
        <label>Month<input id="checkMonth" value="October" /></label>
        <label>KPI / Goal<input id="checkKpi" placeholder="Increase paid customers by 10%" /></label>
        <label>Progress update<textarea id="checkProgress" placeholder="Wins, blockers, questions..."></textarea></label>
        <button class="primary full">Submit Check-in</button>
      </form>
      <div class="card form-card">
        <h3>Recent check-ins</h3>
        <div class="list">
          ${state.checkins.map(c => `<div class="list-item"><strong>${getName(c.userId)} • ${c.month}</strong><p><b>KPI:</b> ${c.kpi}</p><p>${c.progress}</p></div>`).join("")}
        </div>
      </div>
    </div>
  `;
}
function submitCheckin(e) {
  e.preventDefault();
  state.checkins.push({ id: Date.now(), userId: state.currentUser.id, month: $("checkMonth").value, kpi: $("checkKpi").value, progress: $("checkProgress").value, status: "submitted" });
  saveState(); renderCheckins(); renderHome(); toast("Check-in submitted.");
}

function renderCoffee() {
  $("panel-coffee").innerHTML = `
    <h2>Coffee Chats</h2>
    <p class="muted">Request casual one-on-one chats with other CEOs.</p>
    <div class="two-col">
      <form class="card form-card" onsubmit="requestCoffee(event)">
        <label>Recipient<select id="coffeeRecipient">${state.users.filter(u => u.role === "ceo" && u.id !== state.currentUser.id).map(u => `<option>${u.name}</option>`).join("")}</select></label>
        <label>Topic<input id="coffeeTopic" placeholder="Fundraising, hiring, product strategy..." /></label>
        <label>Suggested time<input id="coffeeTime" placeholder="Friday 1 PM PST" /></label>
        <button class="primary full">Request Coffee Chat</button>
      </form>
      <div class="card form-card">
        <h3>Requests</h3>
        ${state.coffeeChats.map(c => `<div class="list-item"><strong>${c.requester} → ${c.recipient}</strong><p>${c.topic} • ${c.time}</p><span class="badge">${c.status}</span></div>`).join("")}
      </div>
    </div>
  `;
}
function requestCoffee(e) {
  e.preventDefault();
  state.coffeeChats.push({ id: Date.now(), requester: state.currentUser.name, recipient: $("coffeeRecipient").value, topic: $("coffeeTopic").value, time: $("coffeeTime").value, status: "Pending" });
  saveState(); renderCoffee(); toast("Coffee chat requested.");
}

function renderEvents() {
  $("panel-events").innerHTML = `
    <h2>Events & Conferences</h2>
    <p class="muted">Share events CEOs are attending so members can connect in person.</p>
    <div class="two-col">
      <form class="card form-card" onsubmit="addEvent(event)">
        <label>Event title<input id="eventTitle" placeholder="BIO International Convention" /></label>
        <label>Location<input id="eventLocation" placeholder="San Diego" /></label>
        <label>Date<input id="eventDate" placeholder="June 3" /></label>
        <label>Note<input id="eventNote" placeholder="Looking for other CEOs attending" /></label>
        <button class="primary full">Add Event</button>
      </form>
      <div class="card form-card">
        <h3>Shared Events</h3>
        ${state.events.map(ev => `<div class="list-item"><strong>${ev.title}</strong><p>${ev.location} • ${ev.date}</p><p>${ev.note}</p></div>`).join("")}
      </div>
    </div>
  `;
}
function addEvent(e) {
  e.preventDefault();
  state.events.push({ id: Date.now(), title: $("eventTitle").value, location: $("eventLocation").value, date: $("eventDate").value, note: $("eventNote").value });
  saveState(); renderEvents(); toast("Event added.");
}

function renderResources() {
  $("panel-resources").innerHTML = `
    <h2>Educational Resources</h2>
    <p class="muted">Curated educational content for CEOs. Admins can add more in the admin panel.</p>
    <div class="feature-grid">
      ${state.resources.map(r => `<article class="feature-card"><div class="icon">🎓</div><h3>${r.title}</h3><p>${r.type} • ${r.minutes} min</p><button class="secondary">Open</button></article>`).join("")}
    </div>
  `;
}

function renderAdmin() {
  $("panel-admin").innerHTML = `
    <h2>Admin Dashboard</h2>
    <p class="muted">Accept/decline CEO applications and manage pilot users.</p>
    <h3>Pending Applications</h3>
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Company</th><th>Goals</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${state.applications.map(a => `<tr><td>${a.name}<br><small>${a.email}</small></td><td>${a.company}<br><small>${a.role}</small></td><td>${a.goals}</td><td><span class="badge">${a.status}</span></td><td>${a.status === "pending" ? `<button class="primary" onclick="approveApp(${a.id})">Accept</button> <button class="danger" onclick="declineApp(${a.id})">Decline</button>` : "Done"}</td></tr>`).join("")}
      </tbody>
    </table>
    <h3 style="margin-top:24px">Pilot Users</h3>
    <div class="list">${state.users.map(u => `<div class="list-item"><strong>${u.name}</strong><p>${u.email} • ${u.role} • ${u.company}</p></div>`).join("")}</div>
  `;
}
function approveApp(id) {
  const app = state.applications.find(a => a.id === id);
  if (!app) return;
  app.status = "accepted";
  state.users.push({ id: Date.now(), name: app.name, email: app.email, password: "demo", role: "ceo", company: app.company, title: app.role, timezone: app.timezone, group: "Beta Circle" });
  saveState(); renderAdmin(); toast("Application accepted. Demo password: demo");
}
function declineApp(id) {
  const app = state.applications.find(a => a.id === id);
  if (!app) return;
  app.status = "declined";
  saveState(); renderAdmin(); toast("Application declined.");
}

// Initialize nav state
if (state.currentUser) {
  $("loginNav").textContent = "Logout";
}

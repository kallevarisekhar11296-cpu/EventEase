import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Users, Search, Sparkles, Ticket, ShieldCheck, ArrowUpRight, X, Plus, LayoutDashboard, LogOut } from "lucide-react";
import { request } from "./api";

const fmt = value => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const categories = ["All", "Workshop", "Meetup", "Competition", "Seminar", "Cultural"];

function EventCard({ event, onRegister }) {
  return <article className="event-card">
    <div className={`event-art art-${(event.category || "event").toLowerCase()}`}><span>{event.category}</span><Ticket size={34}/></div>
    <div className="event-body">
      <div className="event-date"><CalendarDays size={15}/>{fmt(event.date)}</div>
      <h3>{event.title}</h3><p className="muted clamp">{event.description}</p>
      <div className="event-meta"><span><MapPin size={15}/>{event.venue}</span><span><Users size={15}/>{event.availableSeats} seats left</span></div>
      <button className="btn btn-primary full" disabled={event.availableSeats <= 0} onClick={() => onRegister(event)}>{event.availableSeats <= 0 ? "Fully booked" : "Register now"} <ArrowUpRight size={16}/></button>
    </div>
  </article>;
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [registerEvent, setRegisterEvent] = useState(null);
  const [form, setForm] = useState({ studentName: "", email: "" });
  const [adminOpen, setAdminOpen] = useState(false);
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [stats, setStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [eventForm, setEventForm] = useState({ title:"", description:"", category:"Workshop", date:"", venue:"", capacity:50 });
  const [busy, setBusy] = useState(false);

  async function loadEvents() {
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (category !== "All") query.set("category", category);
      setEvents(await request(`/events?${query.toString()}`));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadEvents(); }, [search, category]);
  async function submitRegistration(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      await request(`/events/${registerEvent._id}/register`, { method:"POST", body:JSON.stringify(form) });
      setNotice(`You're registered for ${registerEvent.title}.`);
      setRegisterEvent(null); setForm({ studentName:"", email:"" }); await loadEvents();
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }
  async function loginAdmin(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const data = await request("/auth/login", { method:"POST", body:JSON.stringify(login) });
      setToken(data.token); setAdminEmail(data.email); setNotice("Admin login successful.");
      setStats(await request("/admin/stats", { token:data.token }));
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }
  async function refreshStats() { if (token) setStats(await request("/admin/stats", { token })); }
  async function createEvent(e) {
    e.preventDefault(); setBusy(true);
    try {
      await request("/events", { method:"POST", token, body:JSON.stringify({ ...eventForm, capacity:Number(eventForm.capacity), date:new Date(eventForm.date).toISOString() }) });
      setShowCreate(false); setEventForm({ title:"", description:"", category:"Workshop", date:"", venue:"", capacity:50 });
      setNotice("Event created successfully."); await loadEvents(); await refreshStats();
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }
  async function deleteEvent(event) {
    if (!window.confirm(`Delete "${event.title}" and its registrations?`)) return;
    try { await request(`/events/${event._id}`, { method:"DELETE", token }); setNotice("Event deleted."); await loadEvents(); await refreshStats(); }
    catch (e) { setNotice(e.message); }
  }

  const upcomingCount = useMemo(() => events.filter(e => new Date(e.date) >= new Date()).length, [events]);
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><CalendarDays size={21}/></span><span>Event<span className="brand-accent">Ease</span><small>CAMPUS EVENTS, SIMPLIFIED</small></span></a>
      <nav><a href="#events">Explore events</a><a href="#about">About</a><button className="btn btn-outline" onClick={() => setAdminOpen(true)}><ShieldCheck size={16}/> Admin portal</button></nav>
    </header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> YOUR CAMPUS. YOUR COMMUNITY.</div><h1>Make room for<br/><span>what moves you.</span></h1><p>Discover workshops, competitions, and campus experiences. Find your people, book your spot, and show up.</p><div className="hero-actions"><a className="btn btn-primary" href="#events">Explore events <ArrowUpRight size={17}/></a><span className="hero-note"><span className="live-dot"></span> Discover what's happening</span></div></div>
        <div className="hero-panel"><div className="panel-top"><span>THIS MONTH</span><span className="panel-dot">● LIVE LISTINGS</span></div><div className="big-number">{events.length.toString().padStart(2,"0")}<span>+</span></div><div className="panel-caption">events to explore</div><div className="mini-calendar"><div><b>MON</b><strong>12</strong></div><div className="selected"><b>WED</b><strong>14</strong></div><div><b>THU</b><strong>15</strong></div><div><b>FRI</b><strong>16</strong></div><div><b>SAT</b><strong>17</strong></div></div><div className="panel-bottom"><span><Users size={16}/> Open to all students</span><span>→</span></div></div>
        <div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div></section>
      <section className="stats-strip"><div><span className="stat-icon"><CalendarDays size={18}/></span><span><b>{events.length}</b><small>Listed events</small></span></div><div><span className="stat-icon"><Ticket size={18}/></span><span><b>{upcomingCount}</b><small>Upcoming events</small></span></div><div><span className="stat-icon"><Users size={18}/></span><span><b>Open</b><small>Student community</small></span></div><div><span className="stat-icon"><ShieldCheck size={18}/></span><span><b>Simple</b><small>Easy registration</small></span></div></section>
      <section className="events-section" id="events"><div className="section-heading"><div><div className="eyebrow dark-eyebrow">FIND YOUR NEXT EXPERIENCE</div><h2>Explore campus events<span>.</span></h2><p className="muted">The right room can change everything. Find yours.</p></div><div className="result-count">{events.length} results <span>↗</span></div></div>
        <div className="filters"><label className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events or venues..."/></label><div className="category-filters">{categories.map(c=><button key={c} className={category===c?"filter active":"filter"} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
        {error && <div className="error-box">{error}<p>Make sure the backend and MongoDB are running, then refresh.</p></div>}
        {loading ? <div className="empty">Loading events…</div> : events.length ? <div className="event-grid">{events.map(event=><EventCard key={event._id} event={event} onRegister={setRegisterEvent}/>)}</div> : <div className="empty">No events match your search. Try another category.</div>}
      </section>
      <section className="about-band" id="about"><div><div className="eyebrow">WHY EVENTEASE?</div><h2>Less searching.<br/>More experiencing.</h2></div><p>One place for campus events, clear details, and simple registration. EventEase helps students spend less time finding events and more time being part of them.</p><div className="about-badge"><Sparkles size={22}/><span>Built for campus life</span></div></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><CalendarDays size={18}/></span><span>Event<span className="brand-accent">Ease</span></span></a><span>Discover. Register. Participate.</span><span>© {new Date().getFullYear()} EventEase · Academic project</span></footer>

    {registerEvent && <div className="modal-backdrop" onClick={()=>setRegisterEvent(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setRegisterEvent(null)}><X size={20}/></button><div className="eyebrow dark-eyebrow">SAVE YOUR SPOT</div><h2>Register for {registerEvent.title}</h2><p className="muted">{fmt(registerEvent.date)} · {registerEvent.venue}</p><form onSubmit={submitRegistration} className="form-stack"><label>Full name<input required minLength="2" value={form.studentName} onChange={e=>setForm({...form,studentName:e.target.value})} placeholder="Your name"/></label><label>Student email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><button className="btn btn-primary full" disabled={busy}>{busy?"Submitting…":"Confirm registration"}</button></form></div></div>}

    {adminOpen && <div className="modal-backdrop" onClick={()=>setAdminOpen(false)}><div className="modal admin-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAdminOpen(false)}><X size={20}/></button><div className="eyebrow dark-eyebrow"><ShieldCheck size={15}/> EVENTEASE CONTROL ROOM</div><h2>Admin portal</h2>
      {!token ? <form onSubmit={loginAdmin} className="form-stack"><label>Admin email<input type="email" required value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="admin@example.com"/></label><label>Password<input type="password" required value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Your admin password"/></label><button className="btn btn-primary full" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><p className="hint">Set the admin credentials in server/.env and run npm run seed-admin.</p></form> :
      <div className="admin-content"><div className="admin-welcome"><span>Signed in as {adminEmail}</span><button className="text-button" onClick={()=>{setToken("");setStats(null)}}><LogOut size={15}/> Sign out</button></div><div className="admin-stats"><div><small>Total events</small><b>{stats?.eventCount ?? "—"}</b></div><div><small>Registrations</small><b>{stats?.registrationCount ?? "—"}</b></div></div><button className="btn btn-primary full" onClick={()=>setShowCreate(!showCreate)}><Plus size={17}/> Create new event</button>
        {showCreate && <form onSubmit={createEvent} className="form-stack create-form"><label>Event title<input required value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})}/></label><label>Description<textarea required value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})}/></label><label>Category<select value={eventForm.category} onChange={e=>setEventForm({...eventForm,category:e.target.value})}>{categories.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></label><label>Date and time<input required type="datetime-local" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})}/></label><label>Venue<input required value={eventForm.venue} onChange={e=>setEventForm({...eventForm,venue:e.target.value})}/></label><label>Capacity<input required type="number" min="1" value={eventForm.capacity} onChange={e=>setEventForm({...eventForm,capacity:e.target.value})}/></label><button className="btn btn-primary full" disabled={busy}>Save event</button></form>}
        <h3 className="manage-title">Manage events</h3>{events.map(ev=><div className="manage-row" key={ev._id}><span><b>{ev.title}</b><small>{ev.registered}/{ev.capacity} registered</small></span><button className="delete-button" onClick={()=>deleteEvent(ev)}>Delete</button></div>)}
      </div>}
    </div></div>}
  </div>;
}

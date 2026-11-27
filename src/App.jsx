import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* Free-to-use photos from Pexels (hotlinked). Every <Photo> falls back to an emoji/illustration if a URL fails. */
const px = (id, w = 800) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const HERO_PHOTO = 12331456; // restaurant exterior / patio
const DISH_IMG = { 1: 32116111, 5: 299348, 6: 6223226, 9: 6223196, 10: 32084629, 11: 32084630, 15: 32245556 };

/* ---------- DATA ---------- */
const MENU = [
  { id: 1, cat: "Starters", name: "Burrata & Heirloom Tomato", desc: "Basil oil, aged balsamic, sea salt", price: 520, veg: true, icon: "🥗" },
  { id: 2, cat: "Starters", name: "Chilli Garlic Prawns", desc: "Charred lime, smoked paprika butter", price: 640, veg: false, icon: "🍤" },
  { id: 3, cat: "Starters", name: "Truffle Mushroom Crostini", desc: "Wild mushrooms, parmesan, thyme", price: 480, veg: true, icon: "🍄" },
  { id: 4, cat: "Starters", name: "Crispy Calamari", desc: "Lemon aioli, pickled chilli", price: 560, veg: false, icon: "🦑" },
  { id: 5, cat: "Mains", name: "Oak-Fired Ribeye", desc: "300g, bone marrow butter, roast garlic", price: 1450, veg: false, icon: "🥩", tag: "Chef’s pick" },
  { id: 6, cat: "Mains", name: "Pappardelle Lamb Ragu", desc: "Slow-braised lamb, pecorino", price: 890, veg: false, icon: "🍝" },
  { id: 7, cat: "Mains", name: "Pan-Seared Sea Bass", desc: "Saffron risotto, lemon beurre blanc", price: 1150, veg: false, icon: "🐟" },
  { id: 8, cat: "Mains", name: "Wild Mushroom Risotto", desc: "Porcini, truffle oil, parmesan crisp", price: 780, veg: true, icon: "🍚" },
  { id: 9, cat: "Mains", name: "Wood-Fired Margherita", desc: "San Marzano, buffalo mozzarella, basil", price: 640, veg: true, icon: "🍕", tag: "Popular" },
  { id: 10, cat: "Desserts", name: "Molten Ember Cake", desc: "Dark chocolate, vanilla gelato", price: 420, veg: true, icon: "🍫", tag: "Popular" },
  { id: 11, cat: "Desserts", name: "Burnt Honey Panna Cotta", desc: "Pistachio crumble, berries", price: 380, veg: true, icon: "🍮" },
  { id: 12, cat: "Desserts", name: "Lemon Tart", desc: "Torched meringue, candied zest", price: 360, veg: true, icon: "🍋" },
  { id: 13, cat: "Drinks", name: "Smoked Old Fashioned", desc: "Bourbon, oak smoke, orange peel", price: 620, veg: true, icon: "🥃" },
  { id: 14, cat: "Drinks", name: "Mango Basil Cooler", desc: "Fresh mango, basil, soda", price: 280, veg: true, icon: "🥭" },
  { id: 15, cat: "Drinks", name: "Cold Brew Tonic", desc: "Single-origin cold brew, tonic", price: 260, veg: true, icon: "☕" },
];
const CATS = ["All", "Starters", "Mains", "Desserts", "Drinks"];

const GALLERY = [
  { t: "The dining room", icon: "🕯️", g: "linear-gradient(135deg,#6b2f2a,#e8743b)", src: px(12530522, 900) },
  { t: "Cosy corner", icon: "☕", g: "linear-gradient(135deg,#7a2e12,#f5b04c)", src: px(1581554, 900) },
  { t: "Vintage lounge", icon: "🍸", g: "linear-gradient(135deg,#2b1a3a,#8a4b7a)", src: px(1675666, 900) },
  { t: "Garden patio", icon: "🌿", g: "linear-gradient(135deg,#25402a,#b5c96a)", src: px(10127268, 900) },
  { t: "Rooftop at sunset", icon: "🌇", g: "linear-gradient(135deg,#8a3a1f,#f2a65a)", src: px(31767815, 900) },
  { t: "Wood & greenery", icon: "🪴", g: "linear-gradient(135deg,#1f3b2d,#6aa380)", src: px(32991187, 900) },
];

const TEAM = [
  { n: "Arjun Mehta", r: "Head Chef", i: "👨‍🍳", b: "15 years on open flame. Trained in Milan, obsessed with smoke." },
  { n: "Sara D’Souza", r: "Pastry Chef", i: "🧁", b: "Turns seasonal fruit and dark chocolate into small miracles." },
  { n: "Kabir Rao", r: "Head Mixologist", i: "🍸", b: "Smoked cocktails and house-made bitters, shaken with a grin." },
];

const REVIEWS = [
  { n: "Aanya S.", t: "The ribeye alone is worth the trip. Warm, cosy and effortlessly stylish." },
  { n: "Rohan M.", t: "Best date-night spot in the city. The molten cake is unreal." },
  { n: "Priya K.", t: "Attentive staff, beautiful lighting, and food that lives up to the hype." },
];

const FAQ = [
  ["Do you take walk-ins?", "Yes, subject to availability. Weekends fill fast, so we recommend booking."],
  ["Do you have vegetarian and vegan options?", "Absolutely. Use the Veg only filter on the menu. Vegan dishes can be requested."],
  ["Is there parking?", "Complimentary valet parking is available from 6pm."],
  ["Can I host a private event?", "Yes, our patio seats up to 40. Call us or send a booking note."],
];

const SLOTS = ["12:30 PM", "1:30 PM", "2:30 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"];
const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

function isOpenNow() {
  const d = new Date(), h = d.getHours(), day = d.getDay();
  return [5, 6, 0].includes(day) ? h >= 12 || h < 1 : h >= 12 && h < 23;
}

/* ---------- SMALL COMPONENTS ---------- */
function Photo({ src, alt, fallback = null }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return fallback;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${show ? "show" : ""}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Magnetic({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  return <span className="mag" ref={ref} onMouseMove={move} onMouseLeave={() => (ref.current.style.transform = "")}>{children}</span>;
}

function Storefront() {
  const stripe = (i) => (i % 2 ? "#f4ece4" : "#c4452d");
  return (
    <svg viewBox="0 0 400 300" className="store" role="img" aria-label="Illustration of the restaurant front">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b1a3a" /><stop offset="1" stopColor="#6b2f2a" /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffe2a8" /><stop offset="1" stopColor="#e8743b" /></radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      <circle cx="350" cy="42" r="16" fill="#ffe9b8" />
      <rect x="40" y="62" width="320" height="200" rx="6" fill="#2a1d16" />
      <rect x="40" y="62" width="320" height="28" fill="#1b140f" />
      <text x="200" y="82" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="16" fill="#f5b04c">EMBER &amp; OAK</text>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={40 + i * 32} y="92" width="32" height="26" fill={stripe(i)} />
          <circle cx={56 + i * 32} cy="118" r="16" fill={stripe(i)} />
        </g>
      ))}
      <rect x="62" y="150" width="86" height="72" rx="4" fill="url(#glow)" className="flicker" />
      <rect x="252" y="150" width="86" height="72" rx="4" fill="url(#glow)" className="flicker" />
      <path d="M62 186h86M105 150v72M252 186h86M295 150v72" stroke="#2a1d16" strokeWidth="3" />
      <circle cx="84" cy="208" r="6" fill="#2a1d16" opacity=".55" /><circle cx="128" cy="204" r="6" fill="#2a1d16" opacity=".55" />
      <circle cx="274" cy="208" r="6" fill="#2a1d16" opacity=".55" /><circle cx="318" cy="204" r="6" fill="#2a1d16" opacity=".55" />
      <rect x="168" y="146" width="64" height="116" rx="4" fill="#3b2418" />
      <path d="M176 152h48v50h-48z" fill="url(#glow)" opacity=".85" className="flicker" />
      <circle cx="222" cy="214" r="3" fill="#f5b04c" />
      <path d="M40 60Q120 90 200 60T360 60" stroke="#f5b04c" strokeWidth="1.5" fill="none" />
      {[70, 120, 170, 230, 280, 330].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 76 : 80} r="4" fill="#ffe2a8" className="bulb" style={{ animationDelay: `${i * 0.3}s` }} />)}
      <rect x="0" y="262" width="400" height="38" fill="#140e0a" />
      <g><rect x="46" y="238" width="22" height="24" rx="3" fill="#8a4b2a" /><circle cx="57" cy="230" r="14" fill="#3f7a4a" /></g>
      <g><rect x="332" y="238" width="22" height="24" rx="3" fill="#8a4b2a" /><circle cx="343" cy="230" r="14" fill="#3f7a4a" /></g>
    </svg>
  );
}

function MenuCard({ item, onAdd, onDec, qty }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const leave = () => { ref.current.style.setProperty("--rx", "0deg"); ref.current.style.setProperty("--ry", "0deg"); };
  return (
    <div className="card" ref={ref} onMouseMove={move} onMouseLeave={leave}>
      <div className="card-glow" />
      <div className={`card-icon ${DISH_IMG[item.id] ? "has-img" : ""}`}><Photo src={DISH_IMG[item.id] ? px(DISH_IMG[item.id], 500) : ""} alt={item.name} fallback={item.icon} /></div>
      <div className="card-body">
        <h3>
          <span className={`dot ${item.veg ? "veg" : "nonveg"}`} title={item.veg ? "Veg" : "Non-veg"} />
          {item.name}
          {item.tag && <em className="badge">{item.tag}</em>}
        </h3>
        <p>{item.desc}</p>
        <div className="card-foot">
          <b>{inr(item.price)}</b>
          {qty ? (
            <div className="stepper">
              <button onClick={() => onDec(item.id)} aria-label="Remove one">−</button>{qty}<button onClick={() => onAdd(item)} aria-label="Add one">+</button>
            </div>
          ) : (
            <button className="add" onClick={() => onAdd(item)}>Add +</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [cat, setCat] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eo-cart")) || {}; } catch { return {}; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [time, setTime] = useState("8:00 PM");
  const [order, setOrder] = useState(null);
  const [booking, setBooking] = useState(null);
  const [resErr, setResErr] = useState("");
  const [lb, setLb] = useState(null);
  const [faq, setFaq] = useState(null);
  const [toast, setToast] = useState("");
  const [subbed, setSubbed] = useState(false);
  const open = isOpenNow();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("eo-cart", JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || moreOpen || lb !== null ? "hidden" : "";
  }, [cartOpen, moreOpen, lb]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () => MENU.filter((m) =>
      (cat === "All" || m.cat === cat) &&
      (!vegOnly || m.veg) &&
      m.name.toLowerCase().includes(query.trim().toLowerCase())),
    [cat, vegOnly, query]
  );

  const cartItems = MENU.filter((m) => cart[m.id]);
  const count = cartItems.reduce((s, m) => s + cart[m.id], 0);
  const subtotal = cartItems.reduce((s, m) => s + cart[m.id] * m.price, 0);
  const gst = Math.round(subtotal * 0.05);

  const add = (item) => { setCart((c) => ({ ...c, [item.id]: (c[item.id] || 0) + 1 })); setToast(`${item.name} added`); };
  const dec = (id) => setCart((c) => {
    const n = { ...c, [id]: c[id] - 1 };
    if (n[id] <= 0) delete n[id];
    return n;
  });

  const placeOrder = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!/^[6-9]\d{9}$/.test(f.phone)) { setToast("Enter a valid 10-digit mobile number"); return; }
    setOrder({ ref: "ORD" + Math.floor(1000 + Math.random() * 9000), total: subtotal + gst, type: f.type, name: f.name });
    setCart({});
  };

  const reserve = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!/^[6-9]\d{9}$/.test(f.phone)) { setResErr("Enter a valid 10-digit mobile number."); return; }
    setResErr("");
    setBooking({ ...f, ref: "EO" + Math.floor(1000 + Math.random() * 9000) });
  };

  const go = () => setNavOpen(false);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />

      {/* NAV */}
      <nav className={`nav ${scrollY > 40 ? "scrolled" : ""}`}>
        <a href="#top" className="logo">Ember<span>&</span>Oak</a>
        <ul className={navOpen ? "open" : ""}>
          {[["about", "Story"], ["menu", "Menu"], ["gallery", "Gallery"], ["team", "Team"], ["reviews", "Reviews"], ["contact", "Contact"]].map(([id, l]) => (
            <li key={id}><a href={`#${id}`} onClick={go}>{l}</a></li>
          ))}
          <li className="show-mobile"><a href="#reserve" onClick={go} className="btn btn-sm">Reserve a table</a></li>
        </ul>
        <div className="nav-actions">
          <span className={`pill ${open ? "on" : "off"}`}>{open ? "Open now" : "Closed"}</span>
          <a href="#reserve" className="btn btn-sm hide-mobile">Reserve</a>
          <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
            🛒{count > 0 && <i className="count">{count}</i>}
          </button>
          <button className={`burger ${navOpen ? "x" : ""}`} onClick={() => setNavOpen(!navOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="hero">
        <div className="hero-text">
          <p className="eyebrow">Wood-fired kitchen · Est. 2018</p>
          <h1>Where fire meets <em>flavour.</em></h1>
          <p className="lead">Seasonal ingredients, open-flame cooking and an evening you will want to repeat.</p>
          <div className="hero-actions">
            <Magnetic><a href="#reserve" className="btn">Book a table</a></Magnetic>
            <Magnetic><a href="#menu" className="btn btn-ghost">Order online</a></Magnetic>
          </div>
          <span className={`status ${open ? "on" : "off"}`}>{open ? "● Open now · until late" : "● Closed · opens 12pm"}</span>
        </div>
        <div className="hero-art"><Photo src={px(HERO_PHOTO, 1400)} alt="Ember & Oak restaurant exterior" fallback={<Storefront />} /></div>
      </header>

      <div className="quick">
        <a href="tel:+919876543210"><span>📞</span>Call</a>
        <a href="https://www.google.com/maps/search/?api=1&query=Marine+Drive+Mumbai" target="_blank" rel="noreferrer"><span>📍</span>Directions</a>
        <a href="#menu"><span>🛍️</span>Order</a>
        <a href="#reserve"><span>📅</span>Book</a>
      </div>

      <div className="marquee"><div className="track">
        {[0, 1].map((i) => <span key={i}>WOOD-FIRED ✦ LOCALLY SOURCED ✦ HANDMADE PASTA ✦ CRAFT COCKTAILS ✦ LIVE MUSIC FRIDAYS ✦ </span>)}
      </div></div>

      {/* SPECIALS */}
      <section className="section specials">
        {[["🍹", "Happy Hour", "Daily 5–7pm · 1+1 on cocktails"], ["🥂", "Sunday Brunch", "11am–3pm · unlimited mimosas"], ["🎸", "Live Music", "Fridays 9pm · no cover charge"]].map(([i, t, d], k) => (
          <Reveal key={t} delay={k * 100}><div className="special"><span>{i}</span><div><h3>{t}</h3><p>{d}</p></div></div></Reveal>
        ))}
      </section>

      {/* ABOUT */}
      <section id="about" className="section about">
        <Reveal>
          <div className="about-grid">
            <div>
              <p className="eyebrow">Our story</p>
              <h2>Cooked slowly, served warmly.</h2>
              <p className="muted">Ember &amp; Oak started with one oak-fired oven and a simple belief: great food needs patience. Every dish is built around seasonal produce from nearby farms, finished over live flame, and served in a room designed for long conversations.</p>
              <div className="stats">
                <div><b>40+</b><small>Local farms</small></div>
                <div><b>8 yrs</b><small>Of fire</small></div>
                <div><b>4.9★</b><small>Guest rating</small></div>
              </div>
            </div>
            <div className="about-art"><div className="ring r1" /><div className="ring r2" /><span>🍽️</span></div>
          </div>
        </Reveal>
      </section>

      {/* MENU */}
      <section id="menu" className="section">
        <Reveal>
          <p className="eyebrow center">Order online or dine in</p>
          <h2 className="center">Our menu</h2>
          <div className="tabs">{CATS.map((c) => <button key={c} className={cat === c ? "active" : ""} onClick={() => setCat(c)}>{c}</button>)}</div>
          <div className="filters">
            <input type="search" placeholder="Search dishes…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className="switch"><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /><span /> Veg only</label>
          </div>
        </Reveal>
        <div className="cards" key={cat + vegOnly}>
          {filtered.map((m) => <MenuCard key={m.id} item={m} onAdd={add} onDec={dec} qty={cart[m.id]} />)}
          {filtered.length === 0 && <p className="muted center empty">No dishes match your search.</p>}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section dark">
        <Reveal><p className="eyebrow center">Take a look</p><h2 className="center">Inside Ember &amp; Oak</h2></Reveal>
        <div className="gallery">
          {GALLERY.map((g, i) => (
            <button key={g.t} className="tile" onClick={() => setLb(i)} style={{ background: g.g }}>
              <Photo src={g.src} alt={g.t} fallback={<span className="tile-icon">{g.icon}</span>} />
              <span className="tile-cap">{g.t}</span>
            </button>
          ))}
        </div>
        <p className="muted center hint">Photos from Pexels (free to use). Swap any <code>src</code> for your own.</p>
      </section>

      {/* TEAM */}
      <section id="team" className="section">
        <Reveal><p className="eyebrow center">The people</p><h2 className="center">Meet the team</h2></Reveal>
        <div className="team">
          {TEAM.map((t) => (
            <div className="flip" key={t.n} tabIndex={0}>
              <div className="flip-in">
                <div className="face front"><span>{t.i}</span><h3>{t.n}</h3><p className="muted">{t.r}</p></div>
                <div className="face back"><p>{t.b}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section dark">
        <Reveal><p className="eyebrow center">Kind words</p><h2 className="center">Loved by our guests</h2></Reveal>
        <div className="reviews">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.n} delay={i * 100}><div className="review"><div className="stars">★★★★★</div><p>“{r.t}”</p><b>{r.n}</b></div></Reveal>
          ))}
        </div>
      </section>

      {/* RESERVE */}
      <section id="reserve" className="section">
        <Reveal>
          <p className="eyebrow center">Reservations</p>
          <h2 className="center">Save your table</h2>
          {booking ? (
            <div className="success">
              <span>🎉</span>
              <h3>Booking confirmed, {booking.name}!</h3>
              <p>{booking.guests} guest(s) · {booking.date} · {booking.time}</p>
              <p className="muted">Reference <b>{booking.ref}</b>. A confirmation SMS will be sent to {booking.phone}.</p>
              <button className="btn btn-sm" onClick={() => setBooking(null)}>Make another booking</button>
            </div>
          ) : (
            <form className="form" onSubmit={reserve}>
              <input name="name" required placeholder="Full name" />
              <input name="phone" required inputMode="numeric" maxLength={10} placeholder="Mobile (10 digits)" />
              <input name="date" type="date" required min={today} />
              <select name="time" value={time} onChange={(e) => setTime(e.target.value)}>{SLOTS.map((s) => <option key={s}>{s}</option>)}</select>
              <div className="chips">{SLOTS.map((s) => <button type="button" key={s} className={time === s ? "on" : ""} onClick={() => setTime(s)}>{s}</button>)}</div>
              <select name="guests" defaultValue="2">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}</select>
              <select name="occasion" defaultValue="None"><option>None</option><option>Birthday</option><option>Anniversary</option><option>Business</option></select>
              <textarea name="notes" placeholder="Special requests (optional)" rows={2} />
              {resErr && <p className="err">{resErr}</p>}
              <button className="btn" type="submit">Confirm booking</button>
            </form>
          )}
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="section dark">
        <Reveal><h2 className="center">Good to know</h2></Reveal>
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`faq-item ${faq === i ? "open" : ""}`}>
              <button onClick={() => setFaq(faq === i ? null : i)}>{q}<span>+</span></button>
              <div className="faq-a"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section news">
        <Reveal>
          <h2 className="center">Get 10% off your first visit</h2>
          {subbed ? <p className="center accent">Thanks for subscribing! Check your inbox. 💌</p> : (
            <form className="news-form" onSubmit={(e) => { e.preventDefault(); setSubbed(true); }}>
              <input type="email" required placeholder="you@example.com" /><button className="btn">Subscribe</button>
            </form>
          )}
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div>
          <div className="logo">Ember<span>&</span>Oak</div>
          <p>12 Marine Drive, Mumbai 400020</p>
          <p><a href="tel:+919876543210">+91 98765 43210</a></p>
          <p><a href="mailto:hello@emberandoak.com">hello@emberandoak.com</a></p>
          <p className="socials"><a href="#top">Instagram</a><a href="#top">Facebook</a><a href="#top">X</a></p>
        </div>
        <div>
          <h4>Opening hours</h4>
          <p>Mon–Thu · 12pm – 11pm</p>
          <p>Fri–Sun · 12pm – 1am</p>
          <a className="btn btn-sm dir" href="https://www.google.com/maps/search/?api=1&query=Marine+Drive+Mumbai" target="_blank" rel="noreferrer">Get directions</a>
        </div>
        <iframe title="Map" loading="lazy" src="https://www.google.com/maps?q=Marine+Drive+Mumbai&output=embed" />
        <small>© {new Date().getFullYear()} Ember &amp; Oak. All rights reserved.</small>
      </footer>

      {/* CART DRAWER */}
      <div className={`overlay ${cartOpen || moreOpen ? "show" : ""}`} onClick={() => { setCartOpen(false); setMoreOpen(false); }} />
      <aside className={`drawer ${cartOpen ? "open" : ""}`}>
        <div className="drawer-head"><h3>Your order</h3><button className="icon-btn" onClick={() => setCartOpen(false)}>✕</button></div>
        {order ? (
          <div className="success">
            <span>✅</span><h3>Order placed!</h3>
            <p>Thanks {order.name}. {order.type} order <b>{order.ref}</b></p>
            <p className="muted">Total paid {inr(order.total)}. We will call you shortly.</p>
            <button className="btn btn-sm" onClick={() => { setOrder(null); setCartOpen(false); }}>Done</button>
          </div>
        ) : cartItems.length === 0 ? (
          <p className="muted center empty">Your cart is empty. Add something tasty 🍕</p>
        ) : (
          <>
            <div className="lines">
              {cartItems.map((m) => (
                <div className="line" key={m.id}>
                  <span>{m.icon}</span>
                  <div><b>{m.name}</b><small>{inr(m.price)}</small></div>
                  <div className="qty"><button onClick={() => dec(m.id)}>−</button>{cart[m.id]}<button onClick={() => add(m)}>+</button></div>
                </div>
              ))}
            </div>
            <div className="sum">
              <p><span>Subtotal</span><span>{inr(subtotal)}</span></p>
              <p><span>GST (5%)</span><span>{inr(gst)}</span></p>
              <p className="total"><span>Total</span><span>{inr(subtotal + gst)}</span></p>
            </div>
            <form className="checkout" onSubmit={placeOrder}>
              <input name="name" required placeholder="Your name" />
              <input name="phone" required inputMode="numeric" maxLength={10} placeholder="Mobile (10 digits)" />
              <select name="type" defaultValue="Dine-in"><option>Dine-in</option><option>Takeaway</option><option>Delivery</option></select>
              <button className="btn" type="submit">Place order · {inr(subtotal + gst)}</button>
            </form>
          </>
        )}
      </aside>

      {/* LIGHTBOX */}
      {lb !== null && (
        <div className="lightbox" onClick={() => setLb(null)}>
          <div className="lb-in" style={{ background: GALLERY[lb].g }} onClick={(e) => e.stopPropagation()}>
            <Photo src={GALLERY[lb].src} alt={GALLERY[lb].t} fallback={<span>{GALLERY[lb].icon}</span>} />
            <p>{GALLERY[lb].t}</p>
            <button className="lb-nav l" onClick={() => setLb((lb + GALLERY.length - 1) % GALLERY.length)}>‹</button>
            <button className="lb-nav r" onClick={() => setLb((lb + 1) % GALLERY.length)}>›</button>
            <button className="lb-x" onClick={() => setLb(null)}>✕</button>
          </div>
        </div>
      )}

      {count > 0 && !cartOpen && (
        <button className="cartbar" onClick={() => setCartOpen(true)}>
          <span>{count} item{count > 1 ? "s" : ""}</span><b>View cart · {inr(subtotal + gst)} →</b>
        </button>
      )}

      <div className="tabbar">
        <a href="#top"><span>🏠</span>Home</a>
        <a href="#menu"><span>🍽️</span>Menu</a>
        <a href="#reserve" className="tab-main"><span>📅</span>Book</a>
        <button onClick={() => setCartOpen(true)}><span>🛒{count > 0 && <i className="count">{count}</i>}</span>Cart</button>
        <button onClick={() => setMoreOpen(true)}><span>☰</span>More</button>
      </div>

      <div className={`sheet ${moreOpen ? "open" : ""}`}>
        <div className="sheet-grid">
          {[["about", "📖", "Our story"], ["gallery", "📸", "Gallery"], ["team", "👨‍🍳", "Team"], ["reviews", "⭐", "Reviews"], ["faq", "❓", "FAQ"], ["contact", "📍", "Contact"]].map(([id, ic, l]) => (
            <a key={id} href={`#${id}`} onClick={() => setMoreOpen(false)}><span>{ic}</span>{l}</a>
          ))}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {scrollY > 600 && <button className="top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>}
    </>
  );
}
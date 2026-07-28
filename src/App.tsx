import { useEffect, useRef, useState, type ReactNode } from 'react';
import weddingBg from './assets/wedding-bg.jpg';
import logo from './assets/LOGO.png';
import bow from './assets/bow.png';
import pattern from './assets/pattern.jpg';
import venuePhoto from './assets/venue.png';
import valance from './assets/valance.png';
import guestArrivalImg from './assets/Guest arrival.png';
import grandEntryImg from './assets/Wedding.png';
import photographyImg from './assets/Photos.png';
import dinnerImg from './assets/Dinner.png';
import sendOffImg from './assets/Send Off.png';

const WEDDING_DATE = new Date('2026-09-19T19:30:00').getTime();
const MAP_LINK = 'https://share.google/UfhC355pFwwVhutx4';

type TimelineEntry = { time: string; label: string; image: string };

const timeline: TimelineEntry[] = [
  { time: '7:30 PM', label: 'Guest Arrival', image: guestArrivalImg },
  { time: '8:00 PM', label: 'Grand Entry', image: grandEntryImg },
  { time: '8:15 PM', label: 'Photography', image: photographyImg },
  { time: '8:30 PM', label: 'Dinner', image: dinnerImg },
  { time: '11:00 PM', label: 'Send-Off', image: sendOffImg }
];

const family = [
  { role: 'Groom', name: 'Ayman Sharieff' },
  { role: 'Bride', name: 'Syeda Sahar Farooq' }
];

const pad = (value: number) => value.toString().padStart(2, '0');
const mix = (token: string, percent: number) => `color-mix(in oklch, var(--${token}) ${percent}%, transparent)`;

const patternStyle = { backgroundImage: `url(${pattern})`, backgroundSize: '420px', backgroundRepeat: 'repeat' } as const;

// Hero reveal choreography, in ms from the moment "Open Invitation" is pressed.
const BOW_UNTIE_DURATION = 1900;
const ZOOM_DELAY = 1700; // starts a little before the bow finishes, for a smooth handoff
const ZOOM_DURATION = 3000;
const TEXT_BASE_DELAY = ZOOM_DELAY + ZOOM_DURATION - 100;
const TEXT_STAGGER = 400;
const TEXT_DURATION = 600;
const HINT_DELAY = TEXT_BASE_DELAY + 9 * TEXT_STAGGER + TEXT_DURATION + 300;

const HERO_MOTES = [
  { left: '10%', size: 4, duration: 15, delay: -2 },
  { left: '21%', size: 3, duration: 11, delay: -7 },
  { left: '33%', size: 5, duration: 17, delay: -1 },
  { left: '46%', size: 3, duration: 12, delay: -9 },
  { left: '57%', size: 4, duration: 16, delay: -4 },
  { left: '67%', size: 3, duration: 10, delay: -10 },
  { left: '77%', size: 5, duration: 18, delay: -3 },
  { left: '89%', size: 3, duration: 13, delay: -8 }
];

/**
 * Tracks whether the element is in view. With `once` (the default), it
 * flips true and stays there — good for a one-time section reveal. With
 * `once: false`, it tracks live, so the caller can animate back out on
 * scroll-up too, not just in on scroll-down.
 */
function useInView<T extends HTMLElement>(threshold = 0.25, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

/**
 * Drives the hero's open gesture: the invitation sits closed (bow tied over
 * the already-visible arch) until the guest presses "Open Invitation" — then
 * the bow unties away (Phase 1), the camera pulls back from a tight crop to
 * the full scene (Phase 2), and the ceremony text rises in line by line
 * (Phase 3). Scrolling is locked until opened so the reveal reads as a
 * deliberate moment rather than something to skim past.
 */
function useHeroOpen() {
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  return { mounted, opened, open: () => setOpened(true) };
}

/**
 * Fades a line up into place on its own staggered delay, once `opened` is
 * true. `dim` (0–1) sets that line's resting opacity once revealed — for
 * secondary lines that should read a touch quieter than the primary ones —
 * without fighting the 0/1 opacity the reveal itself animates.
 */
function Reveal({
  opened,
  index,
  dim = 1,
  className,
  children
}: {
  opened: boolean;
  index: number;
  dim?: number;
  className?: string;
  children: ReactNode;
}) {
  const delay = TEXT_BASE_DELAY + index * TEXT_STAGGER;
  return (
    <div
      className={className}
      style={{
        opacity: opened ? dim : 0,
        transform: `translateY(${opened ? 0 : 12}px)`,
        transition: `opacity ${TEXT_DURATION}ms ease ${opened ? `${delay}ms` : '0ms'}, transform ${TEXT_DURATION}ms ease ${opened ? `${delay}ms` : '0ms'}`
      }}
    >
      {children}
    </div>
  );
}

// Deep rose ink on the pink scrim panel below it — the panel is what carries
// the contrast, not the shadow, so this stays legible against sky, columns
// or foliage alike. The halo shadow just softens the few edges that sit
// outside the panel's blurred border.
const HERO_TEXT_COLOR = '#2c141c';
const HERO_TEXT_SHADOW = '0 1px 14px rgba(255,240,244,0.9), 0 1px 2px rgba(255,240,244,0.7)';

function HeroCopy({ opened }: { opened: boolean }) {
  return (
    <div className="pointer-events-auto max-w-md text-center px-6" style={{ color: HERO_TEXT_COLOR, textShadow: HERO_TEXT_SHADOW }}>
      <Reveal opened={opened} index={0} dim={0.9} className="flex justify-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ border: '1px solid currentColor', opacity: 0.9 }}
        >
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'currentColor',
              WebkitMaskImage: `url(${logo})`,
              maskImage: `url(${logo})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center'
            }}
          />
        </span>
      </Reveal>
      <Reveal opened={opened} index={1} className="script-title mt-5 text-4xl md:text-6xl leading-[1.15]">
        Ayman &amp; Sahar
      </Reveal>
      <Reveal opened={opened} index={2} dim={0.88} className="mt-6 font-serif-sc font-semibold text-xs tracking-[0.2em] uppercase leading-relaxed">
        We request the pleasure of your company
      </Reveal>
      <Reveal opened={opened} index={3} dim={0.88} className="font-serif-sc font-semibold text-xs tracking-[0.2em] uppercase leading-relaxed">
        to celebrate our Nikah on
      </Reveal>
      <Reveal opened={opened} index={4} className="mt-6">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <span className="h-px w-5 md:w-6 opacity-60" style={{ backgroundColor: 'currentColor' }} />
          <p className="font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs">September</p>
          <p className="font-serif font-medium text-3xl md:text-4xl leading-none">19</p>
          <p className="font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs">2026</p>
          <span className="h-px w-5 md:w-6 opacity-60" style={{ backgroundColor: 'currentColor' }} />
        </div>
        <p className="mt-1 font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs" style={{ opacity: 0.85 }}>
          Saturday
        </p>
      </Reveal>
      <Reveal opened={opened} index={5} dim={0.9} className="mt-4 font-serif-sc font-semibold tracking-[0.3em] uppercase text-xs md:text-sm">
        At Seven Thirty in the Evening
      </Reveal>
      <Reveal opened={opened} index={6} dim={0.9} className="mt-8 font-serif-sc font-semibold tracking-[0.35em] uppercase text-xs">
        To be held at
      </Reveal>
      <Reveal opened={opened} index={7} className="script-title mt-2 text-3xl md:text-4xl">
        North Avenue
      </Reveal>
      <Reveal opened={opened} index={8} dim={0.92} className="font-serif font-medium italic">
        Event Space &amp; Banquet Hall
      </Reveal>
    </div>
  );
}

function FamilyMember({ role, name }: { role: string; name: string }) {
  return (
    <div>
      <p className="font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">{role}</p>
      <p className="script-title mt-3 text-4xl md:text-5xl text-primary">{name}</p>
    </div>
  );
}

/**
 * One stop on the evening timeline. Desktop alternates left/right of a
 * central line, like a proper wedding-day journey; mobile collapses to a
 * single line on the left with every item reading the same way, keeping the
 * same visual hierarchy. Each item watches its own visibility, so they
 * reveal one at a time as the guest scrolls past, not all at once.
 */
function TimelineItem({ item, index }: { item: TimelineEntry; index: number }) {
  // `once: false` — this one tracks live, so it fades back out on scroll-up
  // too, not just in on the way down.
  const { ref, inView } = useInView<HTMLDivElement>(0.35, false);
  const isRight = index % 2 === 1;

  const motionClass = inView
    ? 'opacity-100 translate-y-0 scale-100 md:translate-x-0'
    : `opacity-0 translate-y-10 scale-95 md:translate-y-0 ${isRight ? 'md:translate-x-16' : 'md:-translate-x-16'}`;

  return (
    <div ref={ref} className="relative grid grid-cols-[2.5rem_1fr] items-center gap-x-4 md:grid-cols-[1fr_2.5rem_1fr] md:gap-x-6">
      <div className="relative flex justify-center md:col-start-2 md:row-start-1">
        <span
          className="h-3 w-3 rounded-full border-2 transition-transform duration-500 ease-out"
          style={{
            borderColor: '#8c5a62',
            backgroundColor: '#fdeef1',
            transform: inView ? 'scale(1)' : 'scale(0)',
            transitionDelay: inView ? '150ms' : '0ms'
          }}
        />
      </div>

      <div
        className={`md:row-start-1 text-left transition-all duration-[900ms] ease-out ${motionClass} ${
          isRight ? 'md:col-start-3 md:text-left' : 'md:col-start-1 md:text-right'
        }`}
      >
        <div className={`flex flex-col items-start gap-3 ${isRight ? 'md:items-start' : 'md:items-end'}`}>
          <img
            src={item.image}
            alt=""
            aria-hidden
            loading="lazy"
            className="max-h-32 max-w-32 md:max-h-56 md:max-w-56 lg:max-h-72 lg:max-w-72"
          />
          <p className="font-serif text-2xl font-semibold text-[#8c5a62] md:text-3xl">{item.time}</p>
          <p className="font-sans text-sm tracking-wide text-[#a4767c] md:text-base">{item.label}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const hero = useHeroOpen();
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);
  const timelineView = useInView<HTMLDivElement>();

  return (
    <main className="wedding-root relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]" style={patternStyle} />

      <section className="relative h-screen w-full overflow-hidden" aria-label="Wedding invitation opening">
        {/* one-time mount fade, then the deliberate Phase 2 zoom-out lives just inside it */}
        <div
          className="absolute inset-0 transition-all duration-[1600ms] ease-out"
          style={{ opacity: hero.mounted ? 1 : 0, transform: hero.mounted ? 'scale(1)' : 'scale(1.05)' }}
        >
          {/* PHASE 2 — camera pulls back from a tight crop on the arch crown to the full scene */}
          <div
            className="absolute inset-0"
            style={{
              transform: hero.opened ? 'scale(1)' : 'scale(1.32)',
              transformOrigin: '50% 20%',
              transition: `transform ${ZOOM_DURATION}ms cubic-bezier(.22,.61,.36,1) ${hero.opened ? `${ZOOM_DELAY}ms` : '0ms'}`
            }}
          >
            {/* continuous ambient drift, independent of the deliberate zoom above */}
            <div className="animate-hero-pan absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${weddingBg})` }} />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: `linear-gradient(to bottom, ${mix('background', 10)}, transparent, ${mix('background', 50)})` }}
          />
          {/* a soft pink/lavender wash tying the photo's blue sky and greenery into
              the baby-pink theme, rather than leaving them their natural colors */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(165deg, rgba(255,205,222,0.4) 0%, rgba(255,231,238,0.18) 45%, rgba(214,176,196,0.32) 100%)',
              mixBlendMode: 'soft-light'
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(40,16,26,0.16) 100%)' }}
          />

          {HERO_MOTES.map((mote, index) => (
            <span
              key={index}
              className="animate-hero-mote pointer-events-none absolute bottom-0 rounded-full bg-white/70"
              style={{
                left: mote.left,
                width: mote.size,
                height: mote.size,
                filter: 'blur(0.5px)',
                animationDuration: `${mote.duration}s`,
                animationDelay: `${mote.delay}s`
              }}
            />
          ))}

          {/* a solid, near-uniform blush-pink panel behind the text block, so the
              deep-rose text reads like ink on cardstock regardless of what's
              directly behind it in the photo — pale sky at the top, shaded
              columns/foliage lower down. A flat plateau with only the outer
              margin softened, then blurred for a soft edge, holds contrast
              evenly across the whole stack instead of a radial vignette that
              fades before reaching the top lines. */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[900ms]"
            style={{
              opacity: hero.opened ? 1 : 0,
              width: 'min(92vw, 30rem)',
              height: 'min(92vh, 820px)',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,238,242,0.82) 10%, rgba(255,238,242,0.82) 90%, transparent 100%)',
              filter: 'blur(28px)'
            }}
          />

          {/* PHASE 3 — the ceremony text rises in, one line at a time */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
            <HeroCopy opened={hero.opened} />
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-[46%] h-[58vw] max-h-[420px] w-[58vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,252,240,0.55) 0%, rgba(255,252,240,0) 70%)' }}
          />

          {/* PHASE 1 — the bow: knot droops, then both tails sweep apart off-frame.
              Rendered as two clipped halves of the same artwork so each tail can
              exit independently, standing in for true fabric-tail physics. */}
          <div
            className="pointer-events-none absolute left-1/2 top-[46%] w-[52vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
            style={{ aspectRatio: '1 / 1', filter: 'drop-shadow(0 12px 24px rgba(60,60,40,0.15))' }}
          >
            <div
              className={`absolute inset-0 ${!hero.opened ? 'animate-bow-idle-half' : ''}`}
              style={{
                clipPath: 'inset(0 50% 0 0)',
                transformOrigin: hero.opened ? '100% 32%' : undefined,
                animation: hero.opened ? `bow-untie-left ${BOW_UNTIE_DURATION}ms cubic-bezier(.55,0,1,.45) forwards` : undefined
              }}
            >
              <img src={bow} alt="" aria-hidden className="h-full w-full select-none" />
            </div>
            <div
              className={`absolute inset-0 ${!hero.opened ? 'animate-bow-idle-half' : ''}`}
              style={{
                clipPath: 'inset(0 0 0 50%)',
                transformOrigin: hero.opened ? '0% 32%' : undefined,
                animation: hero.opened ? `bow-untie-right ${BOW_UNTIE_DURATION}ms cubic-bezier(.55,0,1,.45) forwards` : undefined
              }}
            >
              <img src={bow} alt="" aria-hidden className="h-full w-full select-none" />
            </div>
          </div>

          {/* open button — the only way in; fades out the instant it's pressed */}
          <button
            type="button"
            onClick={hero.open}
            disabled={hero.opened}
            aria-label="Open the wedding invitation"
            className="absolute left-1/2 top-[73%]"
            style={{
              opacity: hero.opened ? 0 : hero.mounted ? 1 : 0,
              transform: `translateX(-50%) translateY(${hero.opened ? 12 : 0}px)`,
              pointerEvents: hero.opened ? 'none' : 'auto',
              transition: 'opacity 500ms ease, transform 500ms ease'
            }}
          >
            <span className="group relative inline-flex">
              <span
                className="absolute inset-0 animate-ping rounded-full"
                style={{ backgroundColor: mix('primary', 14), animationDuration: '2.8s' }}
                aria-hidden
              />
              <span
                className="relative inline-flex items-center gap-3 rounded-full px-8 py-4 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
                style={{ backgroundColor: 'rgba(255,252,246,0.6)', border: `1px solid ${mix('primary', 35)}`, boxShadow: '0 18px 40px -18px rgba(60,50,30,0.35)' }}
              >
                <span aria-hidden style={{ color: 'var(--primary)' }}>✦</span>
                <span className="font-serif-sc text-xs md:text-sm tracking-[0.35em] uppercase" style={{ color: 'var(--primary)' }}>
                  Open Invitation
                </span>
                <span aria-hidden style={{ color: 'var(--primary)' }}>✦</span>
              </span>
            </span>
          </button>

          {/* scroll hint — only appears once the invitation has been opened */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            style={{
              opacity: hero.opened ? 0.9 : 0,
              color: HERO_TEXT_COLOR,
              textShadow: HERO_TEXT_SHADOW,
              transition: `opacity 800ms ease ${hero.opened ? `${HINT_DELAY}ms` : '0ms'}`
            }}
          >
            <p className="font-serif-sc font-semibold text-xs tracking-[0.35em] uppercase">Keep scrolling</p>
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" style={{ backgroundColor: HERO_TEXT_COLOR }} />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ backgroundColor: HERO_TEXT_COLOR }} />
            </span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #fdeef1 0%, #f9dfe6 55%, #f6d8e0 100%)' }} />
        <div className="absolute -top-12 left-[12%] h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute top-16 right-[8%] h-56 w-56 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-[20%] h-64 w-64 rounded-full bg-[#f3c9d4]/50 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="font-sans text-base md:text-lg text-[#a4767c]">Counting the moments until</p>
          <p className="script-title mt-4 text-6xl md:text-8xl text-[#8c5a62]">Our Big Day</p>
          <p className="mt-4 font-serif text-xl md:text-2xl text-[#8c5a62]">19 · September · 2026</p>
          <div className="mt-12 md:mt-16 grid grid-cols-4 gap-3 md:gap-6 max-w-md md:max-w-xl mx-auto">
            {[
              { value: days, label: 'Days' },
              { value: hours, label: 'Hours' },
              { value: minutes, label: 'Minutes' },
              { value: seconds, label: 'Seconds' }
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="flex h-20 w-full items-center justify-center rounded-2xl md:h-24" style={{ backgroundColor: '#b3838c' }}>
                  <span className="font-sans font-bold text-3xl md:text-4xl text-white tabular-nums">{pad(stat.value)}</span>
                </div>
                <span className="mt-3 font-sans text-sm md:text-base text-[#a4767c]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={patternStyle} />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="script-title text-5xl md:text-6xl text-primary">The Celebration</p>
          <img src={venuePhoto} alt="North Avenue Banquet Hall" loading="lazy" className="mx-auto mt-10 w-[70%] max-w-md opacity-95" />
          <div className="mt-2 rounded-lg backdrop-blur-sm px-6 py-10 shadow-sm" style={{ border: `1px solid ${mix('border', 60)}`, backgroundColor: mix('card', 70) }}>
            <p className="font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">Wedding Celebration</p>
            <p className="script-title mt-6 text-4xl md:text-5xl leading-tight text-primary">North Avenue</p>
            <p className="script-title text-2xl md:text-3xl leading-tight text-primary">Event Space &amp; Banquet Hall</p>
            <div className="mx-auto my-6 h-px w-16 bg-border" />
            <p className="font-serif text-lg text-foreground">Saturday, 19 September 2026</p>
            <p className="font-serif italic text-lg text-foreground">7:30 P.M. onwards</p>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-serif-sc tracking-[0.3em] uppercase text-primary-foreground shadow-sm transition hover:opacity-90"
              style={{ border: `1px solid ${mix('primary', 40)}` }}
            >
              <span aria-hidden>◈</span> View Location on Map
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 overflow-hidden">
        <img src={valance} alt="" aria-hidden loading="lazy" className="pointer-events-none absolute -top-6 left-1/2 w-[130%] max-w-none -translate-x-1/2 opacity-90" />
        <div className="relative mx-auto mt-40 max-w-xl text-center">
          <p className="script-title text-5xl md:text-6xl text-primary">Wedding Celebration</p>
          <p className="mt-3 font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">Together with their families</p>
          <div className="mt-14 space-y-10">
            <FamilyMember role={family[0].role} name={family[0].name} />
            <div className="script-title text-3xl text-muted-foreground">&amp;</div>
            <FamilyMember role={family[1].role} name={family[1].name} />
          </div>
          <div className="mx-auto my-14 h-px w-16 bg-border" />
          <p className="font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">With the Blessings of</p>
          <div className="mt-6 space-y-4 font-serif text-lg text-foreground">
            <p>
              <span className="italic text-muted-foreground">Mother · </span>Asiya Sultana
            </p>
            <p>
              <span className="italic text-muted-foreground">Father · </span>Late Syed Farooq Hussain
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #fdeef1 0%, #fbe7ec 45%, #f8f3ef 100%)' }} />
        <div ref={timelineView.ref} className="relative mx-auto max-w-2xl text-center lg:max-w-4xl">
          <p
            className="script-title text-4xl md:text-5xl lg:text-6xl text-[#8c5a62] transition-all duration-700 ease-out"
            style={{ opacity: timelineView.inView ? 1 : 0, transform: `translateY(${timelineView.inView ? 0 : 16}px)` }}
          >
            Evening Timeline
          </p>
          <p
            className="mt-2 font-serif text-base md:text-lg lg:text-xl text-[#a4767c] transition-all duration-700 ease-out"
            style={{
              opacity: timelineView.inView ? 1 : 0,
              transform: `translateY(${timelineView.inView ? 0 : 16}px)`,
              transitionDelay: timelineView.inView ? '100ms' : '0ms'
            }}
          >
            19 · September · 2026
          </p>

          {/* a beautiful wedding-day journey the guest scrolls through — the
              central line runs continuously top to bottom; on desktop each
              stop alternates left/right of it, on mobile it collapses to a
              single line on the left with every stop reading the same way */}
          <div className="relative mt-10">
            <div
              aria-hidden
              className="pointer-events-none absolute left-5 top-2 bottom-2 w-px md:left-1/2 md:-translate-x-1/2"
              style={{ backgroundImage: 'linear-gradient(to bottom, #cf9aa6 50%, transparent 50%)', backgroundSize: '2px 10px', backgroundRepeat: 'repeat-y' }}
            />
            <div className="flex flex-col gap-8 md:gap-10">
              {timeline.map((item, index) => (
                <TimelineItem key={item.time} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6 overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-[0.1]" style={patternStyle} />
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${mix('card', 70)}, transparent)` }} />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-serif-sc text-xs tracking-[0.5em] uppercase text-muted-foreground">A Nikah Blessing</p>
          <p className="script-title mt-8 text-4xl md:text-5xl leading-[1.3] text-primary" dir="rtl" lang="ar">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p className="mt-8 font-serif italic text-lg md:text-xl text-foreground leading-relaxed">
            &ldquo;And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them,
            and He put love and mercy between your hearts.&rdquo;
          </p>
          <p className="mt-4 font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">— Surah Ar-Rum 30:21</p>
          <div className="mx-auto mt-14 h-px w-16 bg-border" />
          <p className="mt-10 script-title text-4xl md:text-5xl text-primary">We can&apos;t wait to celebrate with you</p>
          <p className="mt-4 font-serif-sc text-xs tracking-[0.4em] uppercase text-muted-foreground">Ayman &amp; Sahar</p>
        </div>
      </section>
    </main>
  );
}

export default App;

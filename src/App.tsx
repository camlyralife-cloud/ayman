import { useEffect, useState, type ReactNode } from 'react';
import { Users, Flower2, Camera, UtensilsCrossed, Gem } from 'lucide-react';

import weddingBg from './assets/wedding-bg.jpg';
import bow from './assets/bow.png';
import pattern from './assets/pattern.jpg';
import venuePhoto from './assets/venue.png';
import valance from './assets/valance.png';
import urn from './assets/urn.png';

const WEDDING_DATE = new Date('2026-09-19T19:30:00').getTime();
const MAP_LINK = 'https://share.google/UfhC355pFwwVhutx4';

const timeline = [
  { time: '7:30 PM', label: 'Guest Arrival', icon: Users },
  { time: '8:00 PM', label: 'Grand Entry', icon: Flower2 },
  { time: '8:15 PM', label: 'Photography', icon: Camera },
  { time: '8:30 PM', label: 'Dinner', icon: UtensilsCrossed },
  { time: '10:00 PM', label: 'Sweet Moments', icon: Camera },
  { time: '11:00 PM', label: 'Send-Off', icon: Gem }
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
      <Reveal opened={opened} index={0} dim={0.92} className="font-serif-sc font-semibold text-sm tracking-[0.4em]">
        ✦ A &amp; S ✦
      </Reveal>
      <Reveal opened={opened} index={1}>
        <p className="script-title mt-4 text-5xl md:text-7xl leading-[1]">Ayman</p>
        <p className="script-title text-3xl md:text-4xl leading-[1.2] my-2" style={{ opacity: 0.85 }}>&</p>
        <p className="script-title text-5xl md:text-7xl leading-[1]">Sahar</p>
      </Reveal>
      <Reveal opened={opened} index={2} dim={0.88} className="mt-6 font-serif-sc font-semibold text-xs tracking-[0.2em] uppercase leading-relaxed">
        We request the pleasure of your company
      </Reveal>
      <Reveal opened={opened} index={3} dim={0.88} className="font-serif-sc font-semibold text-xs tracking-[0.2em] uppercase leading-relaxed">
        as they exchange vows
      </Reveal>
      <Reveal opened={opened} index={4} className="mt-6 flex items-center justify-center gap-2 md:gap-3">
        <span className="h-px w-5 md:w-6 opacity-60" style={{ backgroundColor: 'currentColor' }} />
        <p className="font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs">September</p>
        <p className="font-serif font-medium text-3xl md:text-4xl leading-none">19</p>
        <p className="font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs">Saturday</p>
        <p className="font-serif-sc font-semibold tracking-[0.25em] uppercase text-[0.65rem] md:text-xs">2026</p>
        <span className="h-px w-5 md:w-6 opacity-60" style={{ backgroundColor: 'currentColor' }} />
      </Reveal>
      <Reveal opened={opened} index={5} dim={0.9} className="mt-4 font-serif-sc font-semibold tracking-[0.3em] uppercase text-xs md:text-sm">
        Seven Thirty in the Evening
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

function App() {
  const hero = useHeroOpen();
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);

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

      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #fdeef1 0%, #fbe7ec 45%, #f8f3ef 100%)' }} />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 md:h-96 md:w-96 opacity-90"
          style={{
            backgroundImage: `url(${urn})`,
            backgroundSize: '160%',
            backgroundPosition: '38% 20%',
            backgroundRepeat: 'no-repeat',
            maskImage: 'radial-gradient(circle at 75% 75%, black 55%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(circle at 75% 75%, black 55%, transparent 78%)'
          }}
        />
        <div className="relative mx-auto max-w-md text-center">
          <p className="script-title text-4xl md:text-5xl text-[#8c5a62]">Evening Timeline</p>
          <p className="mt-2 font-serif text-base text-[#a4767c]">19 · September · 2026</p>
          <div className="mt-10 flex flex-col gap-4 text-left">
            {timeline.map((item) => (
              <div key={item.time} className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
                <item.icon className="h-5 w-5" style={{ color: '#b3838c' }} />
                <p className="mt-3 font-sans text-sm text-[#a4767c]">{item.label}</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-[#8c5a62]">{item.time}</p>
              </div>
            ))}
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

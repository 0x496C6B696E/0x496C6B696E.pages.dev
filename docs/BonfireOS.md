
BonfireOS'u sıfır hosting maliyetiyle, kendi sunucuna ihtiyaç duymadan yayınlayabiliriz. Üstelik sıradan bir portfolio değil, ziyaretçinin keşfedebileceği, Soulsborne atmosferine sahip interaktif bir dünya tasarlayacağız.

Bunun için Claude Code'a verilecek kapsamlı bir İngilizce prompt hazırladım. Tasarımı, animasyonları, 3D deneyimi, mobil uyumluluğu, testleri, güvenliği ve deployment hazırlığını kapsıyor.

## 1. BonfireOS'u nerede yayınlayalım?

Benim önerim Cloudflare Pages Free.

| Platform          | Maliyet                | Değerlendirmem                          |
| ----------------- | ---------------------- | ---------------------------------------- |
| Cloudflare Pages  | $0                     | En uygun seçenek                        |
| GitHub Pages      | $0                     | İyi alternatif                          |
| Vercel Hobby      | $0                     | Kişisel, ticari olmayan kullanım için |
| Kendi VPS sunucun | Mevcut sunucu maliyeti | Şimdilik gereksiz                       |

Cloudflare Pages'in ücretsiz planında 500 build/ay, ücretsiz ve limitsiz statik dosya istekleri, CDN ve `pages.dev` alt alan adı bulunuyor. Platformun kullanım ve dosya limitleri yine geçerli.

![](https://www.google.com/s2/favicons?domain=https://developers.cloudflare.com&sz=32)

Cloudflare Pages docs

+2

ÖNERİLEN ALTYAPI

GitHub Repository

BonfireOS kaynak kodu

Cloudflare Pages

Otomatik build · CDN · HTTPS

bonfireos.pages.dev

Örnek adres — müsaitliğine bağlı

Neden kendi VPS'ine kurmanı önermiyorum? BonfireOS için veritabanına, sürekli çalışan Node.js sunucusuna veya Docker/Kubernetes cluster'ına ihtiyacımız yok. Next.js'in static export özelliğiyle etkileşimli React sitesini statik dosyalar olarak yayınlayabiliriz. Sunucu gerektiren Next.js özelliklerini kullanmamamız yeterli.

![](https://www.google.com/s2/favicons?domain=https://nextjs.org&sz=32)

Next.js

+1

3D efektler de ziyaretçinin tarayıcısında çalışacak. Bu nedenle 3D kullanmak tek başına ücretli sunucu gerektirmiyor.

## 2. Claude Code için tam BonfireOS prompt'u

## Project BONFIREOS

Immersive Dark Fantasy Developer Portfolio

Bu prompt Claude'a yalnızca site tasarlatmaz; projeyi sıfırdan kodlatır, test ettirir, görsel hataları düzeltir ve ücretsiz deployment'a hazır hale getirir.

# MASTER PROMPT — BONFIREOS

## Build a Complete, Production-Ready Immersive Developer Portfolio

You are acting as a senior creative developer, technical director, frontend architect, 3D interaction designer, UI/UX engineer, and production-readiness engineer.

Your mission is to **design, implement, test, optimize, and prepare for deployment** a complete portfolio experience called **BONFIREOS**.

This is an actual development task, not a request for a design proposal, pseudocode, or prototype.

Build the application from beginning to end.

Do not stop after generating a landing page.

Do not ask for approval between normal development stages. Make reasonable technical and visual decisions autonomously.

Only stop when you require missing credentials, explicit permission for a remote action, or an important decision that cannot safely be made independently.

---

# 1. PROJECT IDENTITY

**Project Name:** BONFIREOS

**Concept:** An immersive dark-fantasy operating system and interactive world for a backend and systems engineer.

**Developer Identity:**

- GitHub username: `0x496C6B696E`
- GitHub profile: [https://github.com/0x496C6B696E](https://github.com/0x496C6B696E)
- Main focus: Backend Engineering, Systems, Automation, Infrastructure, Security
- Creative inspiration: Dark Souls, Elden Ring, The Witcher, medieval fantasy, forgotten kingdoms, ancient technology, and atmospheric exploration.

Inspect the existing public GitHub profile and profile README to understand the developer's visual identity, technical interests, and published work.

Reuse accurate personal information and meaningful content, but create a completely new website experience.

Do not invent professional experience, credentials, projects, GitHub statistics, or achievements.

Keep all personal content editable in a central typed configuration file.

**Brand line:**
"Rest at the Bonfire. Build. Deploy. Repeat."

**Supporting identity:**
"Backend · Systems · Automation"

The result should feel like a digital world built around the developer's identity rather than a conventional portfolio with a fantasy background.

---

# 2. CREATIVE DIRECTION

The target is an exceptionally polished, immersive, cinematic portfolio.

Reference for interaction ambition:
[https://lizuju.github.io/](https://lizuju.github.io/)

Study the reference's approach to immersive navigation and interactive portfolio exploration.

Do not clone its layout, animations, operating system, interaction hierarchy, source code, assets, or visual identity.

Create an original interpretation.

BONFIREOS should combine:

- Atmospheric dark fantasy
- A premium interface with highly polished details
- Original cinematic visual effects
- An interactive 3D environment where appropriate
- Responsive fantasy-themed panels
- Meaningful microinteractions
- Smooth transitions between experiences
- Strong information architecture
- Excellent accessibility
- Fast and reliable performance

Avoid generic dashboard templates, conventional SaaS landing pages, random decorative particles, excessive glow, unreadable fantasy typography, and overcomplicated navigation.

The result should feel intentional, original, and carefully art-directed.

**Visual palette:**

Background: `#080A0D`
Surface: `#11151B`
Elevated surface: `#1A2028`
Primary gold: `#D4AF61`
Ember: `#E56C35`
Warm highlight: `#F3D99B`
Primary text: `#E9E4D8`
Muted text: `#989A9F`

These are starting values. Refine them into a complete design-token system.

Use atmospheric gradients, subtle material textures, fine borders, deliberate shadows, premium typography, and restrained lighting.

Use serif display typography for fantasy titles, combined with a highly readable interface font for technical content.

Ensure that every interface element is readable and useful.

---

# 3. IMMERSIVE ENTRY EXPERIENCE

Design an original introductory experience.

When the user first opens the website:

A mysterious, abandoned camp appears in darkness.

A bonfire glows in the center.

Subtle embers float upward.

Atmospheric lighting reveals distant ruins, stone, fog, and silhouettes.

The overall mood should be cinematic, quiet, and mysterious.

Show:

BONFIREOS

Backend · Systems · Automation

"Rest at the Bonfire"

Provide a prominent button:

**ENTER THE BONFIRE**

The button should have an elegant hover, focus, and activation state.

When activated:

- The camera approaches the bonfire or transitions into the main experience.
- The environment responds naturally.
- The main navigation becomes available.
- The transition remains smooth and controlled.
- The user must be able to skip the animation.
- A reduced-motion mode must be respected.

Do not use a long mandatory loading sequence.

Provide an immediate lightweight alternative if WebGL is unavailable.

The experience should work without requiring external paid 3D services.

---

# 4. MAIN EXPERIENCE — THE BONFIRE HUB

Instead of ordinary scrolling sections, create an interactive navigation hub.

The main scene should contain a memorable central bonfire and several recognizable destinations.

Navigation can use clickable scene hotspots, a contextual menu, or an elegant combination of both.

Main destinations:

1. THE TARNISHED — About
2. CHARACTER SHEET — Skills
3. QUEST ARCHIVE — Projects
4. ARMAMENT — Technology Stack
5. SOUL MEMORY — Developer Statistics
6. SUMMON SIGNS — Contact

Each destination should open a distinctive interface.

Examples:

- An ancient parchment-inspired information panel
- A character-status interface
- A quest journal
- An equipment inventory
- An illuminated statistics chamber
- A summoning interface

The visual language must remain consistent across the entire website.

Navigation should not be confusing.

Users must always know where they are and how to return to the main hub.

Create a persistent navigation mechanism, breadcrumb, or mini-map if appropriate.

Keyboard navigation must be supported.

---

# 5. THE TARNISHED — ABOUT

Create an atmospheric introduction to the developer.

Display:

`0x496C6B696E`

Backend & Systems Engineer

Introduce the developer's interest in:

- Backend systems
- APIs and services
- Automation
- Linux and infrastructure
- Reliability and performance
- Security-minded engineering
- Clean architecture

Avoid unverified employment claims.

Include links to GitHub and other verified contact methods.

Make this section feel like discovering a character's history.

Use purposeful animation, not distracting motion.

---

# 6. CHARACTER SHEET — SKILLS

Create an RPG-inspired character sheet.

Represent engineering abilities as fantasy attributes.

Examples:

Vigor — Reliability
Mind — Backend Engineering
Endurance — Infrastructure
Strength — Systems Programming
Dexterity — Automation
Intelligence — Architecture
Arcane — Security

Add meaningful descriptions showing which technologies correspond to these skills.

Avoid presenting arbitrary numeric skill scores as objectively verified abilities.

If skill bars or numbers are used, clearly treat them as a thematic visualization rather than professional certifications.

The interface should support tasteful hover interactions, tooltips, category switching, and animation.

Make it visually striking while remaining genuinely useful.

---

# 7. QUEST ARCHIVE — PROJECTS

This should be one of the most important and useful parts of the website.

Create an interactive quest journal containing the developer's actual projects.

Inspect the public GitHub repositories to identify suitable projects.

Use real titles, descriptions, technologies, and repository URLs.

Do not invent projects.

Each project should contain:

- Project name
- Short description
- Technologies
- Project type
- Development status if verifiable
- GitHub link
- Demo link if available
- Screenshots where available
- A project-detail experience

Use a consistent visual system.

A selected project should open like an ancient record, mission dossier, or artifact inspection panel.

Allow visitors to explore projects without struggling through unnecessary visual effects.

Store project metadata locally in typed data files so it remains available without a backend.

Where information is missing, omit it gracefully.

---

# 8. ARMAMENT — TECH STACK

Create an equipment inventory inspired by RPG equipment interfaces.

Possible categories:

WEAPONS — Programming Languages

SPELLS — Frameworks and Libraries

ARMOR — Infrastructure and DevOps

RUNES — Databases and Developer Tools

Use only technologies genuinely reflected in the developer's published material or confirmed profile.

Include appropriate icons with proper attribution.

Each category should have a distinct presentation.

Clicking an item should reveal a short explanation of its purpose or practical use.

Use small, polished microinteractions.

No unnecessary full-screen transitions for simple actions.

---

# 9. SOUL MEMORY — GITHUB ACTIVITY

Create an impressive but accurate developer statistics interface.

Display verifiable GitHub information such as:

- Public repository count
- Public project activity
- Repository stars
- Selected GitHub achievements
- Contribution activity when reliable data is available

The interface can use fantasy-themed visualization, charts, and statistics cards.

Do not fabricate numbers.

Do not display mock statistics as real data.

Where practical, generate public statistics during the build.

If live data requires authentication, significant API quota, or server-side infrastructure, use a static build-time solution or omit the feature.

Handle GitHub API failures gracefully.

Do not expose private credentials in browser bundles.

Prioritize accurate information over visual complexity.

---

# 10. SUMMON SIGNS — CONTACT

Design an original contact interface.

It should resemble placing a summoning sign or contacting another traveler across a fantasy world.

Include verified contact links.

Provide accessible interactions.

For the zero-cost static version, do not introduce a required backend.

Use `mailto:` or another genuinely free, optional contact method.

Do not pretend to send emails from a nonfunctional form.

If a third-party service is considered, document its limitations and make it optional.

Never embed private API keys into client-side code.

---

# 11. OPTIONAL MINI EXPERIENCES

If the core website is finished and well tested, consider adding one or two meaningful interactive extras.

Possible ideas:

**Bonfire Terminal**
An interactive command console where visitors can inspect selected technologies or navigate projects.

**Deployment Chronicle**
A visual explanation of a project's architecture, deployment flow, or service topology using real project information.

**Hidden Runes**
Subtle discoverable easter eggs that reward exploration without interfering with navigation.

These features should not take priority over the core portfolio.

Do not add games, effects, or gimmicks purely to increase feature count.

---

# 12. TECHNOLOGY STACK

Use a modern, maintainable and production-ready stack.

Preferred:

- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- Motion / Framer Motion for lightweight animations
- Three.js with React Three Fiber and Drei only where it meaningfully improves the experience
- Lucide icons and original SVG assets
- Playwright for browser testing
- Vitest for focused unit tests
- ESLint and TypeScript checks
- GitHub Actions for CI

Use currently compatible stable versions.

Avoid unnecessary dependencies.

Build the application specifically for **static export**.

Configure:

```
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

Adjust the configuration as necessary for the selected Next.js version.

The production output must be deployable to Cloudflare Pages without a persistent Node.js server.

Do not rely on:

- Server Actions
- Runtime database connections
- Request-dependent server rendering
- Runtime Next.js API Routes
- Server-only authentication
- Unsupported static-export middleware/proxy features
- Paid APIs

All required interactions must work in a static deployment.

Use client-side state for navigation, panels, and scene interactions.

Preserve normal browser behavior, including working links and history navigation.

---

# 13. 3D EXPERIENCE AND PERFORMANCE

The website should feel immersive, but performance is non-negotiable.

If Three.js is used:

- Lazy-load the 3D environment.
- Avoid loading WebGL for users choosing the lightweight experience.
- Use reasonable geometry complexity.
- Use optimized textures.
- Cap pixel ratio intelligently.
- Pause rendering when appropriate.
- Avoid unnecessary continuous renders.
- Dispose of unused WebGL resources.
- Support WebGL failure and context loss.
- Provide a performant fallback.

The 3D scene should enhance the portfolio, not make the content difficult to access.

Provide graceful degradation for:

- Slow devices
- Integrated GPUs
- Mobile browsers
- Reduced-motion preferences
- No WebGL
- Slow connections

Avoid copyrighted game models, artwork, audio, and UI assets.

Create original or appropriately licensed fantasy-inspired visuals.

Document external asset licenses and sources.

No hotlinking to unapproved assets.

---

# 14. DESKTOP AND MOBILE EXPERIENCE

Design desktop and mobile experiences intentionally.

Do not simply shrink the desktop interface.

Desktop:

- Cinematic immersive environment
- Detailed interactions
- Optional 3D exploration
- Rich information panels
- Keyboard navigation

Mobile:

- Touch-friendly interface
- Lightweight scene or animated background
- Simplified navigation
- Responsive content panels
- No tiny controls
- No horizontal overflow
- No hover-only actions

Test at minimum:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1440px
- 1920px

Also test unusual viewport heights and landscape orientation.

Respect safe areas on mobile devices.

Ensure touch targets meet accessibility expectations.

---

# 15. UI/UX QUALITY STANDARD

The design must feel handcrafted and premium.

Implement:

- A consistent design system
- Thoughtful spacing and alignment
- Clear visual hierarchy
- Beautiful hover and focus states
- Smooth but restrained transitions
- Cohesive iconography
- Responsive typography
- Accessible contrast
- Proper loading states
- Useful empty/error states
- Intuitive navigation

No dead buttons.

No decorative elements pretending to be functional controls.

No broken links.

No placeholder content in the final site.

No lorem ipsum.

No unfinished sections.

No misleading simulated functionality.

Respect `prefers-reduced-motion`.

Ensure the site can be used by keyboard and screen readers.

Keep the content accessible even if the cinematic environment fails.

---

# 16. SEARCH ENGINE OPTIMIZATION

Implement:

- Meaningful page titles
- Descriptions
- Open Graph metadata
- Social sharing preview image
- Canonical URL configuration
- Sitemap
- robots.txt
- Semantic HTML
- Appropriate structured data when useful

All metadata must work with static export.

Keep the production hostname configurable.

Do not assume a custom domain already exists.

---

# 17. SECURITY AND PRIVACY

Treat this as a real public production website.

Check:

- Dependency security
- Unsafe external scripts
- Exposed credentials
- Malicious or untrusted third-party assets
- Unsafe links
- External-link security attributes
- Unexpected network requests
- Broken asset paths
- Client-side storage safety
- Third-party tracking

Keep the implementation privacy-friendly.

Avoid invasive analytics and unnecessary cookies.

Ensure no secrets are bundled into static JavaScript.

Document any security limitations of the static hosting model.

---

# 18. TESTING REQUIREMENTS

Build an appropriate automated test suite.

At minimum:

- TypeScript validation
- ESLint checks
- Production build test
- Unit tests for important utilities
- Navigation tests
- Component interaction tests
- Keyboard accessibility checks
- Responsive layout tests
- Browser console checks
- Broken link detection where practical
- Static export validation
- Mobile interaction checks

Use Playwright to test the actual running application.

Check Chromium, Firefox, and WebKit where available.

Make sure the static exported version behaves correctly, not just the development server.

---

# 19. VISUAL QA LOOP — MANDATORY

This is especially important.

After implementing each major section:

1. Run the website.
2. Capture a desktop screenshot using Playwright.
3. Capture a mobile screenshot.
4. Inspect the screenshots.
5. Identify visual defects.
6. Fix the actual code.
7. Capture new screenshots.
8. Compare the results.
9. Repeat until the design is coherent and usable.

Look for:

- Misalignment
- Overflow
- Bad spacing
- Unreadable text
- Broken layering
- Incorrect z-index
- Clipped content
- Blurry assets
- Poor transitions
- Inconsistent component styling
- Broken responsive layouts

Do not claim visual verification without actually inspecting screenshots.

If browser tools are unavailable, explicitly report which checks could not be completed.

Screenshots should be placed in a clearly named local QA directory, excluded from production bundles.

---

# 20. PERFORMANCE TARGETS

Aim for strong Core Web Vitals and Lighthouse results.

Targets under an appropriate mobile test configuration:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

These are goals, not reasons to falsify results.

Measure actual results and document remaining problems.

Optimize:

- JavaScript bundle size
- 3D loading
- Fonts
- Images
- Initial loading
- Layout stability
- Interaction latency
- Animation smoothness

Prioritize a fast usable experience even before optional cinematic assets load.

---

# 21. FREE DEPLOYMENT

The primary deployment target is:

**Cloudflare Pages Free**

Requirements:

- Fully static Next.js output
- Production build creates `out/`
- No required server
- No paid services
- No required paid domain
- Works with a `*.pages.dev` URL
- HTTPS through Cloudflare
- Automatic deployment through GitHub integration
- Preview deployment support

Provide complete deployment documentation.

Document:

- GitHub repository setup
- Cloudflare Pages connection
- Framework preset
- Build command
- Output directory
- Environment requirements
- How to deploy changes
- How to roll back
- How to configure a custom domain later

Do not purchase services.

Do not enable paid billing.

Do not create paid infrastructure.

Do not publish repositories, connect external accounts, or trigger production deployment without explicit authorization.

Prepare everything locally first.

---

# 22. CI/CD

Create a GitHub Actions workflow that runs on pull requests and pushes.

Include:

1. Dependency installation
2. Type checking
3. Linting
4. Unit tests
5. Production build
6. Static output verification

Keep CI efficient.

Do not duplicate Cloudflare's automatic deployment pipeline unnecessarily.

Ensure builds can be reproduced from a clean checkout.

---

# 23. PROJECT STRUCTURE AND DOCUMENTATION

Organize the codebase professionally.

Separate:

- Core design system
- Layout
- Components
- Scenes
- Animation utilities
- Data/configuration
- Content
- Public assets
- Test files
- CI configuration

Create:

`README.md` — project introduction and setup

`ARCHITECTURE.md` — application architecture

`DESIGN_SYSTEM.md` — typography, colors, components, interactions

`DEPLOYMENT.md` — free Cloudflare deployment instructions

`QA_REPORT.md` — tests, screenshots, performance findings

`TODO.md` — current implementation state and remaining work

Keep documentation synchronized with the actual implementation.

Avoid unnecessary architecture and abstraction.

---

# 24. IMPLEMENTATION WORKFLOW

Work through the following phases in order.

**Phase 1 — Discovery**
Inspect the repository, environment, public GitHub profile, and relevant reference material.

**Phase 2 — Architecture**
Choose the technical architecture, application structure, content model, and rendering strategy.

**Phase 3 — Design System**
Implement typography, tokens, reusable components, and the overall visual language.

**Phase 4 — Immersive Entry**
Build the cinematic entry experience and fallback.

**Phase 5 — Bonfire Hub**
Implement immersive navigation and transitions.

**Phase 6 — Portfolio Content**
Build all six main destinations using accurate content.

**Phase 7 — Polish**
Refine interaction design, original visual assets, atmosphere, and responsive behavior.

**Phase 8 — Quality Assurance**
Run automated tests and iterative screenshot-based visual QA.

**Phase 9 — Optimization**
Improve performance, accessibility, bundle size, and rendering.

**Phase 10 — Deployment Preparation**
Validate static export, CI/CD, documentation, and Cloudflare compatibility.

After each phase:

- Update `TODO.md`.
- Record significant design/architecture decisions.
- Verify that the project still builds.
- Fix blockers before moving forward.

Do not repeatedly ask whether to continue.

Continue autonomously through all phases unless permission is required.

If context or token limitations interrupt development, leave a precise, resumable checkpoint in `TODO.md`.

Never claim that unfinished work has been completed.

---

# 25. ACCEPTANCE CRITERIA

The project is complete only when:

- The website is fully implemented.
- Every main destination works.
- The visual identity is cohesive.
- The immersive experience is functional.
- A lightweight fallback exists.
- Desktop and mobile are usable.
- The site is accessible.
- Real project information is displayed.
- Navigation and links work.
- Type checking passes.
- Automated tests pass.
- Static production build passes.
- Screenshot-based QA has been performed.
- Critical issues are fixed.
- Deployment documentation is complete.
- Hosting requires no paid services.
- The application is ready for Cloudflare Pages.

If any criterion remains incomplete, report it clearly.

---

# FINAL EXPECTATION

I do not want an ordinary portfolio.

I want a distinct interactive experience that feels like entering a forgotten fantasy world containing the digital identity of a systems engineer.

The site must remain genuinely useful to recruiters, engineers, and potential collaborators.

Atmosphere should create curiosity.

Interaction should reward exploration.

Content should demonstrate real engineering ability.

Performance and accessibility must remain excellent.

**Build BONFIREOS as a complete production-quality project.**

Begin by inspecting the current working directory and available project resources, then proceed through implementation.

Do not stop at planning.

## 3. Şimdi nasıl başlayacaksın?

Claude Code'u Windows bilgisayarında kullanıyorsan:

1. Yeni bir `bonfireos` klasörü oluştur.
2. Klasörü VS Code ile aç.
3. Claude Code'u başlat.
4. Yukarıdaki prompt'un tamamını gönder.
5. Claude'un önce planı oluşturmasını, ardından projeyi aşama aşama geliştirmesini bekle.

Kodlar hazır olduğunda yeni bir GitHub repository oluşturacağız. Mevcut profil README repository'ni değiştirmene gerek yok.

## 4. Siteyi ücretsiz yayınlama

Proje hazır olduğunda:

1. Cloudflare Dashboard adresine git.
2. Workers & Pages → Create application → Pages seç.
3. GitHub hesabını bağla.
4. `bonfireos` repository'sini seç.
5. Framework olarak Next.js (Static HTML Export) seç.
6. Build command: `npx next build`
7. Output directory: `out`
8. Save and Deploy seçeneğine bas.

Cloudflare'ın resmi statik Next.js rehberi de bu yapılandırmayı öneriyor.

![](https://www.google.com/s2/favicons?domain=https://developers.cloudflare.com&sz=32)

Cloudflare Pages docs

Tahmini hosting maliyeti

# $0/ay

Cloudflare Pages Free

$0

GitHub repository

$0

Ücretsiz `pages.dev` adresi

$0

Bu yalnızca barındırma altyapısının maliyetidir. Claude kullanım ücreti varsa ayrıdır. Özel domain satın almak isteğe bağlıdır. Ücretsiz plan limitleri geçerlidir.

## 5. Önemli bir tasarım kararı

BonfireOS'un iki deneyimi olmasını istiyorum:

Immersive Mode

3D kamp ateşi, sinematik kamera, keşfedilebilir bölgeler ve etkileşimli sahneler.

Explorer Mode

Aynı içeriklere daha hızlı erişim sağlayan, mobil uyumlu, kaliteli bir arayüz.

Böylece ziyaretçi ister oyunun içindeymiş gibi keşfeder, ister projelerini ve yeteneklerini doğrudan inceler. Prompt bunu da kapsıyor.

Son tavsiyem: BonfireOS için şu aşamada mevcut VPS sunucuna dokunmayalım. Önce Claude Code ile projeyi tamamlayıp Cloudflare Pages üzerinde ücretsiz yayınlayalım. Daha sonra gerçekten backend gerektiren özellikler eklersek sunucu ihtiyacını yeniden değerlendiririz.

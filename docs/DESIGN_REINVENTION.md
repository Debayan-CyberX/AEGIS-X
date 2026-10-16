# AEGIS-X / The Art of Staying Ahead

Implementation branch: `design/aegis-x-reinvention`.

## Audit and boundaries

The baseline is Next.js 15 / React 19 / TypeScript, custom CSS, TanStack Query, Zustand, Recharts and React Flow. Public route `/` introduces the product. `/console` restores the existing cookie session, presents authentication if needed, and switches between 12 operations views. The frontend uses the existing `/api/*` Next.js proxy and authenticated backend WebSocket. Queries load analytics, incidents, events, assets, rules, playbooks, vulnerabilities, audit and health; incident detail retrieves linked events and responses. The original production build and 23 backend tests passed before editing.

This redesign changes frontend presentation, client interaction components, and browser tests. Backend application code, detection logic, schemas, authentication, API contracts, Docker files, and environment configuration remain unchanged. No fake metrics replace the stored-record queries.

## Design system

Near-black `#08090B`, secondary `#101114`, surfaces `#17191D`, warm white `#F5F5F3`, secondary text `#96999F`, borders `#282B30`. Acid lime `#C6FF00` identifies primary interactions, active controls and pipeline indicators. Red/amber/green denote actual severity or event outcomes. There are no decorative purple/blue gradients, stock imagery or large shield illustrations.

Geist Variable is bundled from npm and served locally; no runtime font service is required. Editorial headings use large sizes and deliberate line breaks. Surfaces have nearly square corners and thin dividers. Important product content stays readable; compact mono text distinguishes technical metadata. Shared controls, focus outlines, tables, modals and status badges live in `frontend/app/globals.css`.

## Landing experience

`page.tsx` composes an asymmetric editorial hero, Observe/Understand/Respond/Control scroll narrative, integrated product lab, explorable architecture and closing CTA. `aegis-core.tsx` is lazy-loaded and uses one persistent Three.js scene. Procedural interlocking titanium rings, machined segments, bolts, illuminated seams and a faceted nucleus form the security artifact. It uses a generated studio environment rather than external models or textures.

Pointer dragging rotates the assembly with damped inertia; idle rotation resumes afterward. Raycasting identifies telemetry/detection/investigation/response layers. Scroll progress separates and reunites layers and changes orientation. Rotation buttons provide an alternative to dragging. A CSS sticky stage carries the single canvas across the narrative. There is no scroll hijacking or paid asset dependency.

DPR is capped at 1.5 and at 1 on small screens. Visibility observers and document visibility suspend rendering offscreen/in inactive tabs. Reduced-motion disables the continuous render loop; deliberate inputs render a static update. Geometry, materials, environment maps, observers and event handlers are disposed on unmount. The SVG fallback remains available when WebGL2 cannot initialize; unavailable rotation controls are disabled. No physical-hardware FPS claim is made from headless tests.

## Functional product lab

`live-lab.tsx` uses the existing authenticated account and demo endpoints. Anonymous visitors see an honest sign-in prompt, not fabricated telemetry. Authorized administrators can generate the existing AgriShield scenario. The lab retrieves the resulting incident, displays stored events, offers replay, requests the existing evidence investigation, and requires explicit confirmation before recording simulated isolation. Existing PDF generation and the command center remain accessible. The Observe/Understand/Respond copy explains simulation boundaries and separates detection from AI explanations.

The public lab intentionally does not bypass authentication or make demo generation public. Analyst role restrictions remain enforced by the backend. The optional AI provider has the same local fallback as before.

## Operations interface

All 12 views retain their data queries and workflows. Navigation collapses on desktop and becomes a mobile drawer. The header, login, notifications, graphs, analytics and investigation workspace share the monochrome system. The primary dashboard uses actual event counts, incident severity distribution, asset risk, response counts and unmeasured timing states. Charts use neutral strokes and support reduced motion.

`data-table.tsx` adds local search, severity/outcome/status filters, sortable headers with `aria-sort`, ten-row pagination, sticky headers and keyboard-operable record controls. Events can expand to show stored payloads as text. Incidents open the original investigation workspace. Vulnerabilities retain sequential remediation actions while gaining the same table controls. Filtering/pagination applies to the existing bounded query results (100 events / 500 incidents), not an unlimited server-side dataset.

`incident-replay.tsx` replays actual linked event records. A range input scrubs the sequence; optional playback advances one record at a time. It does not invent historical responses or change the database. Evidence, investigation, notes, confirmed status changes, audited simulated responses, graphs and PDF download remain available. Modal focus is trapped and restored; underlying navigation/content is inert while a dialog is open.

## Verification

- Baseline and post-change Next.js production builds passed; type checking is included.
- Baseline and post-change backend suites: 23 passing tests on isolated SQLite.
- Production frontend dependency audit: zero reported vulnerabilities.
- The redesign Chromium test covers one WebGL canvas, drag and button rotation, scroll narrative, architecture tabs, authentication, AgriShield detection, stored-event replay, local investigation, approved simulated containment, PDF, sidebar collapse, command palette, all 12 views, table search/filter/sort/pagination/expansion, integrated landing simulation, mobile layouts, and a reduced-motion/no-WebGL fallback.
- Additional landing layout checks passed at 768, 1280 and 1920 pixels wide, alongside the 390-pixel mobile checks.
- Screenshots are generated in ignored `test-results/reinvention-*.png`. Desktop, layers, product lab, investigation and mobile images were inspected and refined.
- Real Windows startup, Safari/Firefox, physical mobile devices and hardware GPU frame rates have not been measured in this environment. Existing optional live integrations remain disconnected.

## Run and review

Follow the existing README for server setup. Rebuild the frontend after pulling these changes; an old Docker image continues to serve the old UI until rebuilt. From the repository root on Windows with Docker Desktop running:

```powershell
docker compose up -d --build frontend
```

Keep existing `.env` values and database volume. This redesign requires no database reset or credential changes.

Browser tests require local services and a disposable synthetic dataset. They read the private root `.env` for the local demonstration account and never print its password:

```bash
CHROMIUM_PATH=/usr/bin/chromium npm run test:redesign --prefix tests/browser
CHROMIUM_PATH=/usr/bin/chromium npm test --prefix tests/browser
```

Install a Playwright browser if no system Chromium is available. Tests reset synthetic events/incidents; retained audit history is expected. Main remains separate from this design branch; GitHub publication is a separate action.

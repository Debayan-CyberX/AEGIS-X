"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Brand from "@/components/brand";
import CoreFallback from "@/components/core-fallback";
import MagneticLink from "@/components/magnetic-link";
import LiveLab from "@/components/live-lab";
const AegisCore = dynamic(() => import("@/components/aegis-core"), {
  ssr: false,
  loading: () => (
    <div className="artifact">
      <CoreFallback />
    </div>
  ),
});
const system = [
  [
    "Telemetry",
    "Every observation has an origin.",
    "Validated security events enter a normalized pipeline with timestamps, hostnames, source addresses, and explicit synthetic markers.",
  ],
  [
    "Detection",
    "Rules, before interpretation.",
    "Eight deterministic rules inspect five-minute windows. Detection runs independently of any language model.",
  ],
  [
    "Correlation",
    "Context changes everything.",
    "Source, destination, identity, and time connect individual observations to evidence-linked incidents.",
  ],
  [
    "Investigation",
    "An explanation you can inspect.",
    "Constrained retrieval supplies actual event records. Local summaries or optional AI explain the evidence without executing commands.",
  ],
  [
    "Response",
    "Deliberate action. Full accountability.",
    "An analyst approves a local or simulated playbook. Every action is persisted in the security audit trail.",
  ],
];
export default function Home() {
  const [node, setNode] = useState(0);
  const [menu, setMenu] = useState(false);
  return (
    <main className="landing">
      <a className="skip-link" href="#product">
        Skip to product
      </a>
      <nav className="landing-nav">
        <Brand />
        <div className={`nav-links ${menu ? "visible" : ""}`}>
          <a href="#product" onClick={() => setMenu(false)}>
            Product
          </a>
          <a href="#simulation" onClick={() => setMenu(false)}>
            Platform
          </a>
          <a href="#architecture" onClick={() => setMenu(false)}>
            Architecture
          </a>
          <a href="https://github.com/Debayan-CyberX/AEGIS-X#readme">
            Documentation{" "}
            <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
          </a>
        </div>
        <Link className="button outline nav-enter" href="/console">
          ENTER PLATFORM{" "}
          <span>
            <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
          </span>
        </Link>
        <button
          className="landing-menu"
          aria-label="Toggle site navigation"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? "CLOSE" : "MENU"} <span>{menu ? "−" : "＋"}</span>
        </button>
      </nav>
      <div className="core-narrative" id="product">
        <div className="core-stage">
          <AegisCore />
        </div>
        <div className="narrative-content">
          <section className="hero">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="eyebrow"
            >
              <span className="live-dot" /> AUTONOMOUS SECURITY INFRASTRUCTURE
            </motion.div>
            <h1>
              <motion.span
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                THE ART OF
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
              >
                STAYING
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.34 }}
                className="outlined-type"
              >
                AHEAD<span className="acid">.</span>
              </motion.span>
            </h1>
            <motion.div
              className="hero-bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p>
                Security intelligence, engineered for
                <br />
                the threats you haven’t seen yet.
              </p>
              <div>
                <MagneticLink href="#simulation">
                  EXPLORE THE PLATFORM{" "}
                  <span>
                    <ArrowUpRight
                      className="diagonal-arrow"
                      aria-hidden="true"
                    />
                  </span>
                </MagneticLink>
                <Link href="/console" className="hero-secondary">
                  ENTER COMMAND CENTER{" "}
                  <span>
                    <ArrowUpRight
                      className="diagonal-arrow"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </div>
            </motion.div>
            <div className="hero-baseline">
              <span>INDEPENDENT DETECTION. INFORMED DECISIONS.</span>
              <a href="#observe">
                SCROLL TO DISCOVER <span>↓</span>
              </a>
            </div>
          </section>
          <section className="story-section" id="observe">
            <div className="story-overline">
              <span>01.1 / OBSERVE</span>
              <span className="story-cross">＋</span>
            </div>
            <motion.div
              initial={{ opacity: 0.25, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.7 }}
            >
              <h2>
                EVERY
                <br />
                SIGNAL
                <br />
                <span className="dim">MATTERS.</span>
              </h2>
              <p>
                A failed login is an observation.
                <br />A pattern is a reason to investigate.
                <br />
                Know the difference.
              </p>
              <span className="story-detail">
                NORMALIZED TELEMETRY / SLIDING-WINDOW DETECTION
              </span>
            </motion.div>
          </section>
          <section className="story-section">
            <div className="story-overline">
              <span>01.2 / UNDERSTAND</span>
              <span className="story-cross">＋</span>
            </div>
            <motion.div
              initial={{ opacity: 0.25, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.7 }}
            >
              <h2>
                INTELLIGENCE
                <br />
                IN EVERY
                <br />
                <span className="dim">LAYER.</span>
              </h2>
              <p>
                Telemetry. Detection. Correlation.
                <br />
                Every layer serves one purpose:
                <br />a clearer, defensible decision.
              </p>
              <span className="story-detail">
                EVIDENCE RETRIEVAL / NO UNRESTRICTED AI COMMANDS
              </span>
            </motion.div>
          </section>
          <section className="story-section">
            <div className="story-overline">
              <span>01.3 / RESPOND</span>
              <span className="story-cross">＋</span>
            </div>
            <motion.div
              initial={{ opacity: 0.25, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.7 }}
            >
              <h2>
                PRECISION
                <br />
                UNDER
                <br />
                <span className="dim">PRESSURE.</span>
              </h2>
              <p>
                From a suspicious sequence
                <br />
                to a considered response.
                <br />
                You remain in command.
              </p>
              <span className="story-detail">
                EXPLICIT APPROVAL / AUDITABLE SIMULATED RESPONSE
              </span>
            </motion.div>
          </section>
          <section className="story-section story-control">
            <div className="story-overline">
              <span>01.4 / CONTROL</span>
              <span className="story-cross">＋</span>
            </div>
            <h2>
              COMPLETE
              <br />
              VISIBILITY.
              <br />
              <span className="dim">TOTAL CONTROL.</span>
            </h2>
            <p>
              The story behind every signal.
              <br />
              The evidence behind every action.
            </p>
            <Link href="/console" className="text-link">
              OPEN YOUR COMMAND CENTER{" "}
              <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
            </Link>
            <div
              className="control-wireframe"
              aria-label="Command center structure preview"
            >
              <span>COMMAND CENTER / STRUCTURE PREVIEW</span>
              <div className="wireframe-columns">
                <div>
                  EVENTS
                  <br />
                  <em>Stored telemetry</em>
                </div>
                <div>
                  INCIDENTS
                  <br />
                  <em>Correlated evidence</em>
                </div>
                <div>
                  RESPONSE
                  <br />
                  <em>Analyst approved</em>
                </div>
              </div>
              <div className="wireframe-track">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="section-divider">
        <span>THE ADVANTAGE IS IN THE DETAILS.</span>
        <span>
          BUILT FOR THE PEOPLE WHO LOOK CLOSER.{" "}
          <ArrowDownRight className="diagonal-arrow" aria-hidden="true" />
        </span>
      </div>
      <LiveLab />
      <section className="system-section" id="architecture">
        <div className="system-heading">
          <span className="eyebrow">03 / THE SYSTEM BENEATH THE SURFACE</span>
          <h2>
            NOT A BLACK BOX.
            <br />
            <span className="dim">AN OPEN ARCHITECTURE.</span>
          </h2>
          <p>
            Detection is deterministic. Explanations are grounded.
            <br />
            Actions are approved. Explore the chain of trust.
          </p>
        </div>
        <div
          className="architecture"
          role="tablist"
          aria-label="System architecture"
        >
          {system.map(([name], i) => (
            <button
              id={`architecture-tab-${i}`}
              role="tab"
              aria-selected={node === i}
              aria-controls="architecture-detail"
              tabIndex={node === i ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : 4)) % 5;
                  setNode(next);
                  document.getElementById(`architecture-tab-${next}`)?.focus();
                }
              }}
              key={name}
              className={node === i ? "selected" : ""}
              onClick={() => setNode(i)}
            >
              <small>0{i + 1}</small>
              <span>{name}</span>
              <span className="architecture-point" />
              {i < 4 && (
                <i
                  className={
                    node === i
                      ? "architecture-wire active"
                      : "architecture-wire"
                  }
                />
              )}
            </button>
          ))}
        </div>
        <div
          className="architecture-detail"
          id="architecture-detail"
          role="tabpanel"
          aria-labelledby={`architecture-tab-${node}`}
          tabIndex={0}
        >
          <span className="architecture-number">0{node + 1}</span>
          <div>
            <h3>{system[node][1]}</h3>
            <p>{system[node][2]}</p>
          </div>
          <a
            href="https://github.com/Debayan-CyberX/AEGIS-X/blob/main/ARCHITECTURE.md"
            className="text-link"
          >
            READ THE TECHNICAL NOTES{" "}
            <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
          </a>
        </div>
      </section>
      <section className="closing">
        <span className="eyebrow">FOR THE ONES WHO STAY AHEAD.</span>
        <h2>
          YOUR NEXT MOVE.
          <br />
          <span className="dim">ALREADY INFORMED.</span>
        </h2>
        <MagneticLink href="/console">
          ENTER AEGIS-X{" "}
          <span>
            <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
          </span>
        </MagneticLink>
        <div className="closing-caption">
          <span>
            LESS NOISE.
            <br />
            MORE CERTAINTY.
          </span>
          <span>
            SECURITY, ENGINEERED.
            <br />
            INTELLIGENCE, EXPLAINED.
          </span>
        </div>
      </section>
      <footer className="landing-footer">
        <Brand />
        <span>AEGIS-X / THE ART OF STAYING AHEAD.</span>
        <a href="https://github.com/Debayan-CyberX/AEGIS-X">
          SOURCE & DOCUMENTATION{" "}
          <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
        </a>
        <a href="#product">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../..");
const out = path.join(root, "test-results");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto("http://localhost:3000");
    await page
      .getByRole("heading", { name: /THE ART OF STAYING AHEAD/ })
      .waitFor();
    await page.waitForTimeout(1700);
    assert.equal(
      await page.locator(".artifact-render canvas").count(),
      1,
      "One persistent WebGL canvas",
    );
    await page.screenshot({ path: path.join(out, "reinvention-hero.png") });
    await page.getByRole("button", { name: "Rotate core right" }).click();
    const render = page.locator(".artifact-render");
    const box = await render.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 70,
      box.y + box.height / 2 + 20,
      { steps: 8 },
    );
    await page.mouse.up();
    await page
      .getByRole("heading", { name: /INTELLIGENCE IN EVERY LAYER/ })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, "reinvention-layers.png") });
    await page.getByRole("tab", { name: "04 Investigation" }).click();
    await page
      .getByRole("heading", { name: "An explanation you can inspect." })
      .waitFor();
    await page.screenshot({
      path: path.join(out, "reinvention-architecture.png"),
    });
    await page.goto("http://localhost:3000/console");
    const env = fs.readFileSync(path.join(root, ".env"), "utf8");
    const password = env.match(/^DEMO_PASSWORD=(.*)$/m)[1];
    await page.getByLabel("Username", { exact: true }).fill("analyst");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Authenticate" }).click();
    await page.getByRole("heading", { name: "Command Center." }).waitFor();
    await page.request.post("http://localhost:3000/api/demo/reset", {
      data: { confirmed: true },
    });
    await page.getByRole("button", { name: "Run AgriShield demo" }).click();
    await page
      .getByRole("heading", {
        name: "Successful login after repeated failures",
      })
      .waitFor();
    const slider = page.getByLabel("Incident replay position");
    await slider.fill("5");
    await page
      .getByText("Successful authentication", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Investigate evidence" }).click();
    await page.getByText("deterministic fallback", { exact: true }).waitFor();
    page.on("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Simulate endpoint isolation", exact: true })
      .click();
    await page
      .getByText("SIMULATED / local action: Simulate endpoint isolation", {
        exact: false,
      })
      .waitFor();
    const dl = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PDF" }).click();
    await (await dl).saveAs(path.join(out, "redesign-incident.pdf"));
    await page.screenshot({
      path: path.join(out, "reinvention-investigation.png"),
    });
    await page.getByRole("button", { name: "Close investigation" }).click();
    await page.waitForTimeout(1600);
    await page.screenshot({
      path: path.join(out, "reinvention-dashboard.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    assert.equal(await page.locator(".app-shell.rail-collapsed").count(), 1);
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await page.keyboard.press("Control+k");
    await page
      .getByPlaceholder("Search pages, incidents, assets…")
      .fill("Network");
    await page
      .getByRole("dialog", { name: "Search workspace" })
      .getByRole("button", { name: "Network Map", exact: true })
      .click();
    await page.getByRole("heading", { name: "Network Map." }).waitFor();
    for (const name of [
      "Live Threats",
      "Incidents",
      "AI Analyst",
      "Network Map",
      "Vulnerabilities",
      "Asset Inventory",
      "Response Playbooks",
      "Analytics",
      "Reports",
      "Detection Rules",
      "Settings",
    ]) {
      await page
        .locator("aside nav")
        .getByRole("button", { name, exact: true })
        .click();
      await page
        .getByRole("heading", { name: name + ".", exact: true })
        .waitFor();
      await page.waitForTimeout(120);
    }
    await page
      .locator("aside nav")
      .getByRole("button", { name: "Live Threats", exact: true })
      .click();
    await page.getByLabel("Search Events", { exact: true }).fill("warehouse");
    await page.getByLabel("Filter Events by OUTCOME").selectOption("success");
    assert.equal(
      await page.locator(".data-table tbody tr:not(.expanded-row)").count(),
      1,
    );
    await page.getByRole("button", { name: /Expand record/ }).click();
    await page.locator(".event-details").waitFor();
    await page.getByLabel("Search Events", { exact: true }).fill("nonexistent");
    await page.getByText("No matching records.", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    // Grow the real stored feed beyond one page and exercise ordering/pagination.
    for (let run = 0; run < 2; run++)
      assert.equal(
        (
          await page.request.post("http://localhost:3000/api/demo/run")
        ).status(),
        201,
      );
    await page.getByRole("button", { name: "Next Events page" }).waitFor();
    await page.waitForFunction(() => {
      const button = document.querySelector(
        'button[aria-label="Next Events page"]',
      );
      return button && !button.disabled;
    });
    await page.getByRole("button", { name: "Next Events page" }).click();
    assert.equal(
      await page.locator(".data-table tbody tr:not(.expanded-row)").count(),
      8,
    );
    await page.getByRole("button", { name: "Previous Events page" }).click();
    await page.getByRole("button", { name: /TIME \/ UTC/ }).click();
    assert.equal(await page.locator('th[aria-sort="ascending"]').count(), 1);

    await page.goto("http://localhost:3000/#simulation");
    await page
      .getByRole("button", { name: "INITIATE SIMULATION", exact: false })
      .waitFor();
    const scenarioResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/demo/run") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "INITIATE SIMULATION", exact: false })
      .click();
    assert.equal((await scenarioResponse).status(), 201);
    await page
      .getByRole("button", { name: "INITIATE SIMULATION", exact: false })
      .waitFor();
    await page.getByText("CORRELATION COMPLETE", { exact: false }).waitFor();
    await page.getByRole("tab", { name: "02 INVESTIGATE" }).click();
    await page.getByLabel("Incident replay position").fill("5");
    await page.getByRole("tab", { name: "03 UNDERSTAND" }).click();
    await page.getByRole("button", { name: /ANALYZE STORED EVIDENCE/ }).click();
    await page.getByText("deterministic fallback", { exact: true }).waitFor();
    await page.getByRole("tab", { name: "04 RESPOND" }).click();
    await page.getByRole("button", { name: /REVIEW CONTAINMENT/ }).click();
    await page.getByRole("button", { name: "APPROVE SIMULATION" }).click();
    await page
      .getByText("SIMULATED / local action: Simulate endpoint isolation", {
        exact: true,
      })
      .waitFor();
    await page.getByRole("tab", { name: "01 DETECT" }).click();
    await page.screenshot({ path: path.join(out, "reinvention-live-lab.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(out, "reinvention-mobile-hero.png"),
      fullPage: false,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "Mobile landing overflow",
    );
    await page.getByRole("button", { name: "Toggle site navigation" }).click();
    await page.getByRole("link", { name: "Architecture", exact: true }).click();
    await page.getByRole("heading", { name: /NOT A BLACK BOX/ }).waitFor();
    await page.goto("http://localhost:3000/console");
    await page.getByRole("heading", { name: "Command Center." }).waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(out, "reinvention-mobile-dashboard.png"),
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "Mobile dashboard overflow",
    );
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .locator("aside nav")
      .getByRole("button", { name: "Settings", exact: true })
      .click();
    await page.getByRole("button", { name: "Reset demo", exact: true }).click();
    await page.getByText("Synthetic scenario reset", { exact: true }).waitFor();
    const fallback = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (String(type).includes("webgl")) return null;
        return original.call(this, type, ...args);
      };
    });
    const staticPage = await fallback.newPage();
    await staticPage.goto("http://localhost:3000");
    await staticPage
      .getByRole("img", {
        name: "AEGIS Core precision assembly, static rendering",
      })
      .waitFor();
    await staticPage.screenshot({
      path: path.join(out, "reinvention-fallback.png"),
    });
    await fallback.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS redesign: WebGL canvas + drag, scroll, architecture, auth, real simulation, replay, analysis, approval, report, sidebar, palette, 12 views, table filters/details, mobile and reduced-motion/WebGL fallback.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

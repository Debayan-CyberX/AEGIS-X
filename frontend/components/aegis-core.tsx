"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import CoreFallback from "./core-fallback";
const layers = ["TELEMETRY", "DETECTION", "INVESTIGATION", "RESPONSE"];
export default function AegisCore() {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<(direction: number) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [label, setLabel] = useState("PRECISION ASSEMBLY / AX—01");
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      if (!context) {
        setUnavailable(true);
        return;
      }
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setUnavailable(true);
      return;
    }
    let disposed = false,
      raf = 0,
      visible = true,
      drag = false,
      lastX = 0,
      lastY = 0,
      targetX = 0.35,
      targetY = -0.45,
      velocity = 0,
      hover = -1,
      scroll = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5),
    );
    renderer.setClearColor(0x08090b, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 0.4, 10.8);
    const envScene = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    const environment = generator.fromScene(envScene, 0.03);
    scene.environment = environment.texture;
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe4e7e8, 3);
    rim.position.set(3, -2, 2);
    scene.add(rim);
    const lime = new THREE.PointLight(0xc6ff00, 2, 5);
    lime.position.set(0, 0, 1);
    scene.add(lime);
    const assembly = new THREE.Group();
    scene.add(assembly);
    const titanium = new THREE.MeshStandardMaterial({
      color: 0x303237,
      metalness: 1,
      roughness: 0.26,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: 0x979b9f,
      metalness: 1,
      roughness: 0.18,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x0c0e10,
      metalness: 0.9,
      roughness: 0.36,
    });
    const signal = new THREE.MeshStandardMaterial({
      color: 0xc6ff00,
      emissive: 0xc6ff00,
      emissiveIntensity: 1.8,
      roughness: 0.4,
      metalness: 0.4,
    });
    const groups: THREE.Group[] = [];
    const pickables: THREE.Object3D[] = [];
    for (let layer = 0; layer < 4; layer++) {
      const group = new THREE.Group();
      group.userData.layer = layer;
      assembly.add(group);
      groups.push(group);
      const radius = 2.25 - layer * 0.39;
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(radius, layer === 3 ? 0.075 : 0.17, 12, 96),
        layer === 3 ? chrome : titanium,
      );
      group.add(torus);
      torus.userData.layer = layer;
      pickables.push(torus);
      const seam = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.013, 6, 96),
        layer === 1 ? signal : chrome,
      );
      seam.position.z = 0.153;
      group.add(seam);
      if (layer < 3) {
        for (let n = 0; n < 8; n++) {
          const angle = (n * Math.PI) / 4;
          const segment = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.255, 6, 14, 0.48),
            n % 2 ? dark : titanium,
          );
          segment.rotation.z = angle;
          group.add(segment);
          segment.userData.layer = layer;
          pickables.push(segment);
          const bolt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.046, 0.046, 0.07, 8),
            chrome,
          );
          bolt.position.set(
            Math.cos(angle + 0.24) * radius,
            Math.sin(angle + 0.24) * radius,
            0.255,
          );
          bolt.rotation.x = Math.PI / 2;
          group.add(bolt);
        }
      }
    }
    groups[1].rotation.x = 1.1;
    groups[1].rotation.y = 0.35;
    groups[2].rotation.y = 1.3;
    groups[2].rotation.z = 0.7;
    groups[3].rotation.x = 0.3;
    const nucleus = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.79, 0),
      titanium,
    );
    assembly.add(nucleus);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(nucleus.geometry),
      new THREE.LineBasicMaterial({
        color: 0xb0b4b8,
        transparent: true,
        opacity: 0.38,
      }),
    );
    nucleus.add(edges);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.37), signal);
    assembly.add(core);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onScroll = () => {
      const parent = el.closest(".core-narrative");
      if (parent) {
        const rect = parent.getBoundingClientRect();
        scroll = THREE.MathUtils.clamp(
          -rect.top / (rect.height - innerHeight),
          0,
          1,
        );
      }
      renderIfPaused();
    };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderIfPaused();
    };
    let lastTime = 0;
    function draw(t = 0) {
      if (disposed) return;
      const dt = Math.min((t - lastTime) / 1000 || 0.016, 0.04);
      lastTime = t;
      if (!reduced.matches && !drag) {
        targetY += dt * 0.075 + velocity;
        velocity *= 0.94;
      }
      assembly.rotation.x = THREE.MathUtils.lerp(
        assembly.rotation.x,
        targetX + scroll * 0.35,
        reduced.matches ? 1 : 0.07,
      );
      assembly.rotation.y = THREE.MathUtils.lerp(
        assembly.rotation.y,
        targetY + scroll * 0.9,
        reduced.matches ? 1 : 0.07,
      );
      assembly.rotation.z = -0.25;
      const explode = Math.sin(Math.min(scroll / 0.6, 1) * Math.PI) * 0.7;
      groups.forEach((g, i) => {
        g.position.y = THREE.MathUtils.lerp(
          g.position.y,
          (i - 1.5) * explode,
          0.08,
        );
        g.position.z = THREE.MathUtils.lerp(
          g.position.z,
          i === hover ? 0.13 : 0,
          0.1,
        );
      });
      nucleus.rotation.y = scroll * 2;
      core.rotation.x = scroll;
      renderer.render(scene, camera);
      if (visible && !document.hidden && !reduced.matches)
        raf = requestAnimationFrame(draw);
    }
    function renderIfPaused() {
      if (reduced.matches || !raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        draw();
      }
    }
    const start = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (visible && !document.hidden) draw();
    };
    const observer = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        start();
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    const resizer = new ResizeObserver(resize);
    resizer.observe(el);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("scroll", onScroll, { passive: true });
    reduced.addEventListener("change", start);
    const down = (e: PointerEvent) => {
      drag = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        velocity = (e.clientX - lastX) * 0.0003;
        targetY += (e.clientX - lastX) * 0.008;
        targetX += (e.clientY - lastY) * 0.005;
        lastX = e.clientX;
        lastY = e.clientY;
        renderIfPaused();
      } else {
        const bounds = el.getBoundingClientRect();
        pointer.set(
          ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
          (-(e.clientY - bounds.top) / bounds.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickables)[0];
        hover = hit ? hit.object.userData.layer : -1;
        setLabel(
          hover < 0
            ? "PRECISION ASSEMBLY / AX—01"
            : layers[hover] + " / EVIDENCE PIPELINE",
        );
        renderIfPaused();
      }
    };
    const up = () => {
      drag = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    controls.current = (direction) => {
      targetY += direction * 0.45;
      renderIfPaused();
    };
    resize();
    onScroll();
    start();
    setReady(true);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizer.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", start);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          materials.forEach((m) => m.dispose());
        }
      });
      environment.dispose();
      generator.dispose();
      envScene.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="artifact">
      <div
        className="artifact-render"
        ref={host}
        role="group"
        aria-label={
          ready
            ? "Interactive AEGIS Core. Drag to rotate or use the rotation buttons."
            : "AEGIS Core static rendering"
        }
      />
      {!ready && <CoreFallback />}
      <div className="artifact-index">
        <span>FIG. 01</span>
        <span>AEGIS CORE™</span>
      </div>
      <div className="artifact-caption">
        <span>
          {ready
            ? label
            : unavailable
              ? "STATIC RENDER / WEBGL UNAVAILABLE"
              : "PREPARING CORE / AX—01"}
        </span>
        <div>
          <button
            aria-label="Rotate core left"
            disabled={!ready}
            onClick={() => controls.current(-1)}
          >
            ←
          </button>
          <span>{ready ? "DRAG TO EXPLORE" : "STATIC PREVIEW"}</span>
          <button
            aria-label="Rotate core right"
            disabled={!ready}
            onClick={() => controls.current(1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

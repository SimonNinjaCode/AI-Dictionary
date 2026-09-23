import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { GraphNode, GraphEdge } from "./types";

// Force layout
const NODE_BASE_SIZE = 2;
const NODE_SIZE_SCALE = 0.7;
const NODE_MIN_SIZE = 2;
const REPULSION = 26000;
const ATTRACTION = 0.028;
const DAMPING = 0.8;
const LAYOUT_ITERATIONS = 300;

// Camera / orbit
const CAM_DIST_DEFAULT = 1200;
const CAM_DIST_MIN = 350;
const CAM_DIST_MAX = 2600;
const CAM_TARGET_DIST = 1050;
const AUTO_ROTATE_SPEED = 0.00022;
const AUTO_ROTATE_RESUME_MS = 3000;

const DRIFT_AMP = 1.4;
const MAX_VISIBLE_RELATIONSHIPS = 10;

// Palette — dark cubes on white background
const BG_COLOR = 0x040a13;
const BASE_COLOR = 0x183d36;
const ACTIVE_COLOR = 0x7cff9a;
const CONN_COLOR = 0x2bd46b;
const DIM_COLOR = 0x173027;
const EDGE_COLOR = 0x173027;
const AEDGE_COLOR = 0x7cff9a;

// ── Types ─────────────────────────────────────────────────────────────────────

interface LayoutNode extends GraphNode {
  z: number;
  vz: number;
}

interface FlowParticle {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  ox: number;
  oy: number;
  oz: number;
  tx: number;
  ty: number;
  tz: number;
  t: number; // 0-1 position along edge
  speed: number;
}

interface SceneNode {
  id: string;
  name: string;
  size: number;
  radius: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  // Shadow-glow: slightly larger companion cube for the active node
  glowMesh: THREE.Mesh;
  glowMat: THREE.MeshBasicMaterial;
  driftPhase: THREE.Vector3;
  driftRate: THREE.Vector3;
  rotVel: THREE.Vector3;
  currentScale: number;
  currentLabelOpacity: number;
  targetColor: THREE.Color;
  targetOpacity: number;
  targetScale: number;
  targetLabelOpacity: number;
  isDimmed: boolean;
}

// ── Class ─────────────────────────────────────────────────────────────────────

export class GraphScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private _projVec = new THREE.Vector3();

  private sceneNodes = new Map<string, SceneNode>();
  private edgeLines: THREE.Line[] = [];
  private activeEdgeLines: Line2[] = [];
  private activeLineMaterials: LineMaterial[] = [];
  private flowParticles: FlowParticle[] = [];
  private activeTermId: string | null = null;
  private animFrame = 0;
  private onTermSelect: (id: string) => void;
  private width: number;
  private height: number;

  private labelContainer: HTMLDivElement;
  private labelElements = new Map<string, HTMLSpanElement>();
  // Measured once on first frame so transform uses pure px (no calc/layout reads per frame)
  private labelHalfWidths = new Map<string, number>();
  private labelsMeasured = false;

  // Orbit — spherical coords
  private theta = 0.4;
  private phi = 1.1;
  private camDist = CAM_DIST_DEFAULT;
  private lookAtTarget = new THREE.Vector3();
  private lookAtTargetGoal = new THREE.Vector3();
  private isDragging = false;
  private hasDragged = false;
  private dragStart = { x: 0, y: 0, theta: 0, phi: 0 };
  private lastInteractMs = -AUTO_ROTATE_RESUME_MS;

  // Camera animation toward selected node
  private camTargetTheta = 0.4;
  private camTargetPhi = 1.1;
  private camTargetDist = CAM_DIST_DEFAULT;
  private isCamAnimating = false;

  // Edge animation
  private edgeAnimProgress = 0;
  private edgeAnimating = false;

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    onTermSelect: (id: string) => void
  ) {
    this.width = width;
    this.height = height;
    this.onTermSelect = onTermSelect;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(BG_COLOR);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, width / height, 1, 6000);
    this.syncCamera();

    // Label overlay — positioned via CSS transform (no layout thrash, no flicker)
    this.labelContainer = document.createElement("div");
    this.labelContainer.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden";
    canvas.parentElement?.appendChild(this.labelContainer);

    canvas.addEventListener("click", this.handleClick);
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
    canvas.addEventListener("wheel", this.handleWheel, { passive: true });
  }

  private syncCamera() {
    this.camera.position.set(
      this.lookAtTarget.x +
        this.camDist * Math.sin(this.phi) * Math.sin(this.theta),
      this.lookAtTarget.y + this.camDist * Math.cos(this.phi),
      this.lookAtTarget.z +
        this.camDist * Math.sin(this.phi) * Math.cos(this.theta)
    );
    this.camera.lookAt(this.lookAtTarget);
  }

  load(nodes: GraphNode[], edges: GraphEdge[]) {
    this.clearScene();

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const layoutNodes: LayoutNode[] = nodes.map((n, i) => {
      const yNorm = 1 - (i / (nodes.length - 1)) * 1.8;
      const r = Math.sqrt(Math.max(0, 1 - yNorm * yNorm)) * 200;
      const a = goldenAngle * i;
      return {
        ...n,
        x: Math.cos(a) * r,
        y: yNorm * 185,
        z: Math.sin(a) * r,
        vx: 0,
        vy: 0,
        vz: 0,
      };
    });

    layoutNodes.forEach((node) => {
      const r = NODE_MIN_SIZE + NODE_BASE_SIZE + node.size * NODE_SIZE_SCALE;
      const side = r * 2;

      const mat = new THREE.MeshBasicMaterial({
        color: BASE_COLOR,
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(side, side, side), mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData.termId = node.id;
      this.scene.add(mesh);

      // Glow: larger companion cube, dark at low opacity — visible as soft shadow on white bg
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x2bd46b,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      // Glow extends ~5 CSS px beyond cube edge (side + 8 world units ≈ 4-5 px at default cam dist)
      const glowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(side + 8, side + 8, side + 8),
        glowMat
      );
      glowMesh.position.set(node.x, node.y, node.z);
      this.scene.add(glowMesh);

      // Label rendered via DOM transform — updating transform doesn't trigger layout
      const span = document.createElement("span");
      span.textContent = node.name.toUpperCase();
      span.style.cssText = [
        "position:absolute",
        "left:0px",
        "top:0px",
        'font-family:"IBM Plex Mono","Courier New",monospace',
        "font-size:10px",
        "font-weight:500",
        "letter-spacing:0.12em",
        "color:#b9d3c4",
        "text-shadow:0 1px 8px #040a13",
        "opacity:0",
        "pointer-events:none",
        "white-space:nowrap",
        "will-change:transform,opacity",
        "transform:translate(0px,0px)", // initialised; updated per-frame with pure px
      ].join(";");
      this.labelContainer.appendChild(span);
      this.labelElements.set(node.id, span);

      this.sceneNodes.set(node.id, {
        id: node.id,
        name: node.name,
        size: node.size,
        radius: r,
        x: node.x,
        y: node.y,
        z: node.z,
        mesh,
        mat,
        glowMesh,
        glowMat,
        driftPhase: new THREE.Vector3(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        driftRate: new THREE.Vector3(
          0.5 + Math.random() * 0.5,
          0.4 + Math.random() * 0.5,
          0.55 + Math.random() * 0.45
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.005
        ),
        currentScale: 1,
        currentLabelOpacity: 0,
        targetColor: new THREE.Color(BASE_COLOR),
        targetOpacity: 0.88,
        targetScale: 1,
        targetLabelOpacity: 0.45,
        isDimmed: false,
      });
    });

    this.buildEdgeLines(edges);
    this.runForceLayout(layoutNodes, edges);
    this.startLoop();
  }

  private buildEdgeLines(edges: GraphEdge[]) {
    this.edgeLines.forEach((l) => {
      this.scene.remove(l);
      this.disposeLine(l);
    });
    this.edgeLines = [];
    edges.forEach((edge) => {
      const a = this.sceneNodes.get(edge.source);
      const b = this.sceneNodes.get(edge.target);
      if (!a || !b) return;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x, a.y, a.z),
        new THREE.Vector3(b.x, b.y, b.z),
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: EDGE_COLOR,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { source: edge.source, target: edge.target };
      this.scene.add(line);
      this.edgeLines.push(line);
    });
  }

  private runForceLayout(nodes: LayoutNode[], edges: GraphEdge[]) {
    for (let iter = 0; iter < LAYOUT_ITERATIONS; iter++) {
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const na = nodes[a],
            nb = nodes[b];
          const dx = nb.x - na.x,
            dy = nb.y - na.y,
            dz = nb.z - na.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
          const f = REPULSION / (dist * dist);
          na.vx -= (dx / dist) * f;
          na.vy -= (dy / dist) * f;
          na.vz -= (dz / dist) * f;
          nb.vx += (dx / dist) * f;
          nb.vy += (dy / dist) * f;
          nb.vz += (dz / dist) * f;
        }
      }
      edges.forEach((edge) => {
        const a = nodes.find((n) => n.id === edge.source);
        const b = nodes.find((n) => n.id === edge.target);
        if (!a || !b) return;
        const dx = b.x - a.x,
          dy = b.y - a.y,
          dz = b.z - a.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
        const f = (dist - 190) * ATTRACTION;
        a.vx += (dx / dist) * f;
        a.vy += (dy / dist) * f;
        a.vz += (dz / dist) * f;
        b.vx -= (dx / dist) * f;
        b.vy -= (dy / dist) * f;
        b.vz -= (dz / dist) * f;
      });
      nodes.forEach((n) => {
        n.vx -= n.x * 0.0018;
        n.vy -= n.y * 0.0018;
        n.vz -= n.z * 0.0018;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.vz *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
      });
    }
    this.resolveCollisions(nodes);
    nodes.forEach((node) => {
      const sn = this.sceneNodes.get(node.id);
      if (!sn) return;
      sn.x = node.x;
      sn.y = node.y;
      sn.z = node.z;
      sn.mesh.position.set(node.x, node.y, node.z);
      sn.glowMesh.position.set(node.x, node.y, node.z);
    });
    const edgeDefs = this.edgeLines.map((l) => ({
      source: l.userData.source as string,
      target: l.userData.target as string,
    }));
    this.buildEdgeLines(edgeDefs);
  }

  // Highly-connected nodes can settle close enough that their cubes touch or
  // overlap after the force simulation converges — push apart any pair whose
  // separation is less than the sum of their radii plus a visual margin.
  private resolveCollisions(nodes: LayoutNode[]) {
    const COLLISION_PADDING = 6;
    const radiusOf = (n: LayoutNode) =>
      NODE_MIN_SIZE + NODE_BASE_SIZE + n.size * NODE_SIZE_SCALE;

    for (let pass = 0; pass < 40; pass++) {
      let moved = false;
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const na = nodes[a],
            nb = nodes[b];
          const dx = nb.x - na.x,
            dy = nb.y - na.y,
            dz = nb.z - na.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const minDist = radiusOf(na) + radiusOf(nb) + COLLISION_PADDING;
          if (dist >= minDist) continue;

          moved = true;
          const hasSeparation = dist > 0.001;
          const ux = hasSeparation ? dx / dist : 1;
          const uy = hasSeparation ? dy / dist : 0;
          const uz = hasSeparation ? dz / dist : 0;
          const push = (minDist - (hasSeparation ? dist : 0)) * 0.5;
          na.x -= ux * push;
          na.y -= uy * push;
          na.z -= uz * push;
          nb.x += ux * push;
          nb.y += uy * push;
          nb.z += uz * push;
        }
      }
      if (!moved) break;
    }
  }

  setActiveTerm(id: string, { focus = true }: { focus?: boolean } = {}) {
    this.activeTermId = id;
    this.edgeAnimProgress = 0;
    this.edgeAnimating = true;

    const relatedLines = this.edgeLines
      .filter(
        (line) => line.userData.source === id || line.userData.target === id
      )
      .sort((a, b) => {
        const aIsOutgoing = a.userData.source === id ? 0 : 1;
        const bIsOutgoing = b.userData.source === id ? 0 : 1;
        return aIsOutgoing - bIsOutgoing;
      })
      .slice(0, MAX_VISIBLE_RELATIONSHIPS);
    const connected = new Set<string>();
    relatedLines.forEach((line) => {
      connected.add(
        line.userData.source === id
          ? (line.userData.target as string)
          : (line.userData.source as string)
      );
    });

    // The first view is an overview. An explicit selection recentres the orbit
    // around the node instead of putting that node between the camera and origin.
    // The latter made otherwise ordinary nodes appear absurdly large.
    const activeSn = this.sceneNodes.get(id);
    if (activeSn && focus) {
      const nx = activeSn.x,
        ny = activeSn.y,
        nz = activeSn.z;
      this.lookAtTargetGoal.set(nx, ny, nz);
      this.camTargetPhi = this.phi;
      this.camTargetTheta = this.theta;
      this.camTargetDist = CAM_TARGET_DIST;
      this.isCamAnimating = true;
    }

    this.sceneNodes.forEach((sn, nodeId) => {
      const label = this.labelElements.get(nodeId);
      if (nodeId === id) {
        label?.style.setProperty("color", "#e5ffe9");
        label?.style.setProperty("font-size", "11px");
        label?.style.setProperty("font-weight", "600");
        sn.targetColor = new THREE.Color(ACTIVE_COLOR);
        sn.targetOpacity = 1.0;
        sn.targetScale = 1.2;
        sn.targetLabelOpacity = 1;
        sn.isDimmed = false;
      } else if (connected.has(nodeId)) {
        label?.style.setProperty("color", "#b9d3c4");
        label?.style.setProperty("font-size", "10px");
        label?.style.setProperty("font-weight", "500");
        sn.targetColor = new THREE.Color(CONN_COLOR);
        sn.targetOpacity = 0.85;
        sn.targetScale = 1.0;
        sn.targetLabelOpacity = 0.7;
        sn.isDimmed = false;
      } else {
        label?.style.setProperty("color", "#527468");
        label?.style.setProperty("font-size", "10px");
        label?.style.setProperty("font-weight", "500");
        sn.targetColor = new THREE.Color(DIM_COLOR);
        sn.targetOpacity = 0.5;
        sn.targetScale = 1.0;
        sn.targetLabelOpacity = 0;
        sn.isDimmed = true;
      }
    });

    // The graph only exposes edges around the active term. A full edge web
    // obscures the actual relationship the reader is exploring.
    this.edgeLines.forEach((l) => {
      (l.material as THREE.LineBasicMaterial).opacity = 0;
    });

    // Rebuild animated connection lines (Line2 = 2px thick) and spawn flow particles
    this.activeEdgeLines.forEach((l) => {
      this.scene.remove(l);
      l.geometry.dispose();
      l.material.dispose();
    });
    this.activeEdgeLines = [];
    this.activeLineMaterials = [];
    this.clearFlowParticles();

    relatedLines.forEach((l) => {
      const a = this.sceneNodes.get(l.userData.source as string);
      const b = this.sceneNodes.get(l.userData.target as string);
      if (!a || !b) return;
      const fromActive = l.userData.source === id;
      const [ox, oy, oz] = fromActive ? [a.x, a.y, a.z] : [b.x, b.y, b.z];
      const [tx, ty, tz] = fromActive ? [b.x, b.y, b.z] : [a.x, a.y, a.z];

      const geo = new LineGeometry();
      geo.setPositions([ox, oy, oz, ox, oy, oz]);
      const mat = new LineMaterial({
        color: AEDGE_COLOR,
        linewidth: 2,
        transparent: true,
        opacity: 0,
        resolution: new THREE.Vector2(this.width, this.height),
      });
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      line.userData = { ox, oy, oz, tx, ty, tz };
      this.scene.add(line);
      this.activeEdgeLines.push(line);
      this.activeLineMaterials.push(mat);

      // Three staggered particles give the active relationship motion without visual noise.
      for (let i = 0; i < 3; i++) {
        this.spawnFlowParticle(ox, oy, oz, tx, ty, tz, i / 4);
      }
    });
  }

  private startLoop() {
    let frame = 0;
    const loop = (nowMs: number) => {
      this.animFrame = requestAnimationFrame(loop);
      frame++;

      // One-time width measurement after first paint — avoids per-frame layout reads
      if (!this.labelsMeasured && frame === 2) {
        this.labelElements.forEach((span, id) => {
          this.labelHalfWidths.set(id, Math.ceil(span.offsetWidth / 2));
        });
        this.labelsMeasured = true;
      }

      // Camera: animate toward target OR auto-rotate
      if (this.isCamAnimating && !this.isDragging) {
        // Shortest-path angle lerp for theta
        let dTheta = this.camTargetTheta - this.theta;
        if (dTheta > Math.PI) dTheta -= Math.PI * 2;
        if (dTheta < -Math.PI) dTheta += Math.PI * 2;
        this.theta += dTheta * 0.045;
        this.phi += (this.camTargetPhi - this.phi) * 0.045;
        this.camDist += (this.camTargetDist - this.camDist) * 0.045;
        this.lookAtTarget.lerp(this.lookAtTargetGoal, 0.045);
        this.syncCamera();
        if (
          Math.abs(dTheta) < 0.005 &&
          Math.abs(this.camTargetPhi - this.phi) < 0.005 &&
          this.lookAtTarget.distanceTo(this.lookAtTargetGoal) < 0.5
        ) {
          this.isCamAnimating = false;
          this.lastInteractMs = nowMs; // begin idle timer so auto-rotate restarts later
        }
      } else if (!this.isDragging) {
        const idle = nowMs - this.lastInteractMs;
        if (idle > AUTO_ROTATE_RESUME_MS) {
          const ramp = Math.min((idle - AUTO_ROTATE_RESUME_MS) / 2000, 1);
          this.theta += AUTO_ROTATE_SPEED * ramp;
          this.syncCamera();
        }
      }

      const glowPulse = 0.06 + Math.sin(frame * 0.048) * 0.025;
      const scalePulse = 1 + Math.sin(frame * 0.048) * 0.04;

      const labelBoxes: Array<{
        left: number;
        right: number;
        top: number;
        bottom: number;
      }> = [];
      const nodesForFrame = [...this.sceneNodes.values()].sort(
        (a, b) =>
          Number(b.id === this.activeTermId) -
          Number(a.id === this.activeTermId)
      );

      nodesForFrame.forEach((sn) => {
        // Slow tumble — dimmed (unrelated) nodes hold still so their silhouette
        // doesn't cycle between a face-on square and a corner-on diamond, which
        // otherwise reads as two different kinds of graph element.
        const rotScale = sn.isDimmed ? 0.04 : 1;
        sn.mesh.rotation.x += sn.rotVel.x * rotScale;
        sn.mesh.rotation.y += sn.rotVel.y * rotScale;
        sn.mesh.rotation.z += sn.rotVel.z * rotScale;
        sn.glowMesh.rotation.copy(sn.mesh.rotation);

        sn.mat.color.lerp(sn.targetColor, 0.08);
        sn.mat.opacity += (sn.targetOpacity - sn.mat.opacity) * 0.08;

        const targetGlow = sn.id === this.activeTermId ? glowPulse : 0;
        sn.glowMat.opacity += (targetGlow - sn.glowMat.opacity) * 0.08;

        sn.currentScale += (sn.targetScale - sn.currentScale) * 0.07;
        const finalScale =
          sn.id === this.activeTermId
            ? sn.currentScale * scalePulse
            : sn.currentScale;
        sn.mesh.scale.setScalar(finalScale);
        sn.glowMesh.scale.setScalar(finalScale);

        // Organic drift
        const t = frame;
        const dx =
          Math.sin(t * 0.00028 * sn.driftRate.x + sn.driftPhase.x) * DRIFT_AMP;
        const dy =
          Math.sin(t * 0.00022 * sn.driftRate.y + sn.driftPhase.y) * DRIFT_AMP;
        const dz =
          Math.sin(t * 0.00032 * sn.driftRate.z + sn.driftPhase.z) * DRIFT_AMP;
        sn.mesh.position.set(sn.x + dx, sn.y + dy, sn.z + dz);
        sn.glowMesh.position.copy(sn.mesh.position);

        // Labels: skip all DOM updates while dragging (container is hidden anyway)
        if (!this.isDragging) {
          const labelY = sn.mesh.position.y + sn.radius * finalScale * 2.2 + 10;
          this._projVec.set(sn.mesh.position.x, labelY, sn.mesh.position.z);
          this._projVec.project(this.camera);
          const span = this.labelElements.get(sn.id);
          if (span) {
            const inFront = this._projVec.z < 1;
            if (inFront) {
              const lx = (this._projVec.x * 0.5 + 0.5) * this.width;
              const ly = (-this._projVec.y * 0.5 + 0.5) * this.height;
              const hw = this.labelHalfWidths.get(sn.id) ?? 0;
              const LABEL_PAD = 4;
              const left = Math.max(
                LABEL_PAD,
                Math.min(this.width - hw * 2 - LABEL_PAD, lx - hw)
              );
              const top = Math.max(
                LABEL_PAD,
                Math.min(this.height - LABEL_PAD, ly)
              );
              const labelBox = {
                left,
                right: left + hw * 2,
                top,
                bottom: top + 14,
              };
              const LABEL_GAP = 8;
              const collides = labelBoxes.some(
                (box) =>
                  labelBox.left < box.right + LABEL_GAP &&
                  labelBox.right > box.left - LABEL_GAP &&
                  labelBox.top < box.bottom + LABEL_GAP &&
                  labelBox.bottom > box.top - LABEL_GAP
              );
              const showLabel = sn.id === this.activeTermId || !collides;
              if (showLabel && sn.targetLabelOpacity > 0) {
                labelBoxes.push(labelBox);
              }
              span.style.transform = `translate(${left.toFixed(1)}px,${top.toFixed(1)}px)`;
              sn.currentLabelOpacity +=
                ((showLabel ? sn.targetLabelOpacity : 0) -
                  sn.currentLabelOpacity) *
                0.1;
              span.style.opacity = (
                inFront ? sn.currentLabelOpacity : 0
              ).toFixed(3);
              return;
            }
            sn.currentLabelOpacity +=
              (sn.targetLabelOpacity - sn.currentLabelOpacity) * 0.1;
            span.style.opacity = (inFront ? sn.currentLabelOpacity : 0).toFixed(
              3
            );
          }
        }
      });

      // Animated Line2 edges growing outward from active node
      if (this.edgeAnimating) {
        this.edgeAnimProgress = Math.min(this.edgeAnimProgress + 0.03, 1);
        const p = this.easeOut(this.edgeAnimProgress);
        this.activeEdgeLines.forEach((l) => {
          const { ox, oy, oz, tx, ty, tz } = l.userData as Record<
            string,
            number
          >;
          const ex = ox + (tx - ox) * p,
            ey = oy + (ty - oy) * p,
            ez = oz + (tz - oz) * p;
          (l.material as LineMaterial).opacity = 0.7 * p;
          (l.geometry as LineGeometry).setPositions([ox, oy, oz, ex, ey, ez]);
          l.computeLineDistances();
        });
        if (this.edgeAnimProgress >= 1) this.edgeAnimating = false;
      }

      // Flow particles — white pixels drifting from active node to each connected node
      this.flowParticles.forEach((fp) => {
        fp.t += fp.speed;
        if (fp.t > 1) {
          fp.t -= 1;
          fp.speed = 0.006 + Math.random() * 0.012;
        }
        const { ox, oy, oz, tx, ty, tz } = fp;
        fp.mesh.position.set(
          ox + (tx - ox) * fp.t,
          oy + (ty - oy) * fp.t,
          oz + (tz - oz) * fp.t
        );
        // Fade in/out at edges; invisible while draw animation hasn't reached this particle yet
        const edgeProgress = this.easeOut(this.edgeAnimProgress);
        const visible = fp.t <= edgeProgress;
        const fade =
          fp.t < 0.08 ? fp.t / 0.08 : fp.t > 0.92 ? (1 - fp.t) / 0.08 : 1;
        fp.mat.opacity = visible ? fade * 0.9 : 0;
      });

      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }

  private easeOut(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private spawnFlowParticle(
    ox: number,
    oy: number,
    oz: number,
    tx: number,
    ty: number,
    tz: number,
    startT: number
  ) {
    const size = 1.2 + Math.random() * 1.6;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
    this.flowParticles.push({
      mesh,
      mat,
      ox,
      oy,
      oz,
      tx,
      ty,
      tz,
      t: startT,
      speed: 0.006 + Math.random() * 0.012,
    });
  }

  private clearFlowParticles() {
    this.flowParticles.forEach((fp) => {
      this.scene.remove(fp.mesh);
      fp.mesh.geometry.dispose();
      fp.mat.dispose();
    });
    this.flowParticles = [];
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private handleMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.hasDragged = false;
    this.isCamAnimating = false;
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      theta: this.theta,
      phi: this.phi,
    };
    this.lastInteractMs = performance.now();
    // Hide labels during drag — avoids per-frame DOM mutations on 43 elements
    this.labelContainer.style.visibility = "hidden";
    (e.currentTarget as HTMLCanvasElement).style.cursor = "grabbing";
  };

  private handleMouseUp = () => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.lastInteractMs = performance.now();
    this.labelContainer.style.visibility = "visible";
    this.renderer.domElement.style.cursor = "default";
  };

  private handleMouseMove = (e: MouseEvent) => {
    const canvas = this.renderer.domElement;
    if (this.isDragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasDragged = true;
      this.theta = this.dragStart.theta - dx * 0.007;
      this.phi = Math.max(
        0.08,
        Math.min(Math.PI - 0.08, this.dragStart.phi + dy * 0.007)
      );
      this.syncCamera();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    this.mouse.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.sceneNodes.values()).map((sn) => sn.mesh);
    canvas.style.cursor =
      this.raycaster.intersectObjects(meshes).length > 0
        ? "pointer"
        : "default";
  };

  private handleClick = (e: MouseEvent) => {
    if (this.hasDragged) return;
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.sceneNodes.values()).map((sn) => sn.mesh);
    const hits = this.raycaster.intersectObjects(meshes);
    if (hits.length > 0) {
      const id = hits[0].object.userData.termId as string;
      if (id) this.onTermSelect(id);
    }
  };

  private handleWheel = (e: WheelEvent) => {
    this.isCamAnimating = false;
    this.camDist = Math.max(
      CAM_DIST_MIN,
      Math.min(CAM_DIST_MAX, this.camDist + e.deltaY * 0.6)
    );
    this.lastInteractMs = performance.now();
    this.syncCamera();
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    // LineMaterial needs viewport size for correct pixel-width lines
    this.activeLineMaterials.forEach((m) => m.resolution.set(width, height));
  }

  destroy() {
    cancelAnimationFrame(this.animFrame);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("click", this.handleClick);
    canvas.removeEventListener("mousemove", this.handleMouseMove);
    canvas.removeEventListener("mousedown", this.handleMouseDown);
    canvas.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("mouseup", this.handleMouseUp);
    this.clearScene();
    this.labelContainer.remove();
    this.renderer.dispose();
  }

  private clearScene() {
    this.sceneNodes.forEach((sn) => {
      this.scene.remove(sn.mesh);
      sn.mesh.geometry.dispose();
      sn.mat.dispose();
      this.scene.remove(sn.glowMesh);
      sn.glowMesh.geometry.dispose();
      sn.glowMat.dispose();
    });
    this.sceneNodes.clear();
    this.labelElements.forEach((span) => span.remove());
    this.labelElements.clear();
    this.labelHalfWidths.clear();
    this.labelsMeasured = false;
    this.edgeLines.forEach((l) => {
      this.scene.remove(l);
      this.disposeLine(l);
    });
    this.edgeLines = [];
    this.activeEdgeLines.forEach((l) => {
      this.scene.remove(l);
      l.geometry.dispose();
      l.material.dispose();
    });
    this.activeEdgeLines = [];
    this.activeLineMaterials = [];
    this.clearFlowParticles();
  }

  private disposeLine(line: THREE.Line) {
    line.geometry.dispose();
    const mats = Array.isArray(line.material) ? line.material : [line.material];
    mats.forEach((m) => m.dispose());
  }
}

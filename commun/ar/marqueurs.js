// Réalité augmentée par marqueurs imprimés, partagée par les jeux « sur la table ».
// Repose sur AR.js (ARToolKit compilé en WebAssembly), copié dans ce dossier pour ne dépendre d'aucun service.
//
// Principe : on filme avec la caméra arrière ; chaque image est analysée par ARToolKit qui retrouve
// la position du marqueur ; on place un groupe three.js (« ancre ») exactement dessus.
// Repère d'une ancre : le marqueur est dans le plan XZ, l'axe Y sort de la table, 1 unité = largeur du marqueur.
//
// La vidéo et le canevas 3D ont exactement la même taille et la même position (image « cover » qui déborde
// de l'écran), ce qui garantit que les objets 3D se superposent au bon endroit sur l'image filmée.

import * as THREE from 'three';
import { ArToolkitContext, ArMarkerControls } from './ar-threex.mjs';

const BASE = new URL('.', import.meta.url).href;

export class MarkerAR {
  /**
   * @param {object} o
   * @param {THREE.WebGLRenderer} o.renderer
   * @param {THREE.PerspectiveCamera} o.camera  doit rester à l'origine, sans rotation
   * @param {THREE.Scene} o.scene
   * @param {HTMLVideoElement} o.video
   * @param {{name:string,url:string,minConfidence?:number}[]} o.markers
   */
  constructor({ renderer, camera, scene, video, markers }) {
    Object.assign(this, { renderer, camera, scene, video, markers });
    this.anchors = {};
    this.mode = 'none'; // 'camera' | 'virtual'
    this.vw = 640; this.vh = 480;
    this.ready = false;
    for (const m of markers) {
      const raw = new THREE.Group(); raw.visible = false; raw.matrixAutoUpdate = false;
      const anchor = new THREE.Group(); anchor.visible = false;
      scene.add(raw); scene.add(anchor);
      this.anchors[m.name] = { raw, anchor, lastSeen: -1e9, seen: false, def: m };
    }
    this._onResize = () => this.layout();
    addEventListener('resize', this._onResize);
  }

  anchor(name) { return this.anchors[name].anchor; }
  tracked(name) { const a = this.anchors[name]; return !!a && a.anchor.visible; }

  /** À appeler dans le geste de l'utilisateur. Renvoie true si la caméra est ouverte. */
  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('pas de caméra');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      const v = this.video;
      v.setAttribute('playsinline', ''); v.muted = true; v.srcObject = stream;
      await new Promise(res => { if (v.readyState >= 1) res(); else v.onloadedmetadata = () => res(); });
      await v.play().catch(() => {});
      this.vw = v.videoWidth || 640; this.vh = v.videoHeight || 480;
      this.mode = 'camera';
      this.layout();
      await this._initContext();
      return true;
    } catch (e) {
      console.warn('Caméra indisponible', e);
      return false;
    }
  }

  _initContext() {
    // L'analyse se fait sur une image réduite (côté max 640 px) aux proportions de la vidéo.
    const s = 640 / Math.max(this.vw, this.vh);
    const cw = Math.round(this.vw * s), ch = Math.round(this.vh * s);
    this.ctx = new ArToolkitContext({
      cameraParametersUrl: BASE + 'camera_para.dat', detectionMode: 'mono',
      canvasWidth: cw, canvasHeight: ch, maxDetectionRate: 30 });
    return new Promise(res => this.ctx.init(() => {
      const ac = this.ctx.arController;
      // ARToolKit écrit chaque motif dans un même fichier virtuel : deux chargements simultanés s'écrasent
      // et les marqueurs ne sont plus reconnus. On met donc les chargements en file d'attente.
      // L'analyse ne démarre qu'une fois tous les motifs chargés (sinon elle occupe le processeur et retarde leur chargement).
      const load = ac.loadMarker.bind(ac);
      let queue = Promise.resolve(), done = 0, allLoaded;
      const loaded = new Promise(r => (allLoaded = r));
      ac.loadMarker = url => (queue = queue.then(() => load(url), () => load(url)).then(id => {
        if (++done >= this.markers.length) allLoaded();
        return id;
      }));
      for (const m of this.markers) {
        new ArMarkerControls(this.ctx, this.anchors[m.name].raw, {
          type: 'pattern', patternUrl: new URL(m.url, location.href).href, changeMatrixMode: 'modelViewMatrix', minConfidence: m.minConfidence ?? 0.6 });
      }
      this.camera.projectionMatrix.copy(this.ctx.getProjectionMatrix());
      this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
      Promise.race([loaded, new Promise(r => setTimeout(r, 8000))]).then(() => { this.ready = true; res(); });
    }));
  }

  /** Mode sans caméra : la « table » est posée devant la caméra virtuelle. */
  startVirtual(pose = {}) {
    this.mode = 'virtual';
    const { distance = 3.4, tilt = 0.85, height = -0.35 } = pose;
    this.layout();
    for (const k in this.anchors) {
      const a = this.anchors[k].anchor;
      a.position.set(0, height, -distance); a.rotation.set(tilt, 0, 0); a.scale.setScalar(1); a.visible = true;
    }
  }

  layout() {
    const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    if (this.mode === 'camera') {
      const k = Math.max(W / this.vw, H / this.vh), dw = Math.round(this.vw * k), dh = Math.round(this.vh * k);
      for (const el of [this.video, this.renderer.domElement]) {
        Object.assign(el.style, { position: 'fixed', width: dw + 'px', height: dh + 'px', left: Math.round((W - dw) / 2) + 'px', top: Math.round((H - dh) / 2) + 'px' });
      }
      this.renderer.setPixelRatio(dpr); this.renderer.setSize(dw, dh, false);
    } else {
      Object.assign(this.renderer.domElement.style, { position: 'fixed', width: W + 'px', height: H + 'px', left: '0px', top: '0px' });
      this.renderer.setPixelRatio(dpr); this.renderer.setSize(W, H, false);
      this.camera.aspect = W / H; this.camera.fov = W < H ? 60 : 45; this.camera.updateProjectionMatrix();
    }
  }

  /** À appeler à chaque image. */
  update(dt, now = performance.now() / 1000) {
    if (this.mode !== 'camera' || !this.ready || this.video.readyState < 2) return;
    this.ctx.update(this.video);
    const kp = 1 - Math.exp(-dt * 16), kq = 1 - Math.exp(-dt * 11);
    for (const k in this.anchors) {
      const a = this.anchors[k];
      if (a.raw.visible) {
        if (!a.seen) { a.anchor.position.copy(a.raw.position); a.anchor.quaternion.copy(a.raw.quaternion); a.anchor.scale.copy(a.raw.scale); }
        else { a.anchor.position.lerp(a.raw.position, kp); a.anchor.quaternion.slerp(a.raw.quaternion, kq); a.anchor.scale.lerp(a.raw.scale, kp); }
        a.seen = true; a.lastSeen = now; a.anchor.visible = true;
      } else if (now - a.lastSeen > 0.45) {
        a.anchor.visible = false; a.seen = false;
      }
    }
  }

  /** Rayon three.js depuis un point de l'écran (coordonnées client). */
  ray(clientX, clientY, raycaster = new THREE.Raycaster()) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(v, this.camera);
    return raycaster;
  }

  /** Projette un point 3D (monde) en coordonnées client. */
  toClient(p) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = p.clone().project(this.camera);
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, front: v.z < 1 };
  }
}

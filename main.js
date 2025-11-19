import { Ground } from "./envi/ground.js";
import { Tree } from "./envi/tree.js";
import { Cloud } from "./envi/cloud.js";
import { ellipsoid } from "./base/ellipsoid.js";
import { createPichu } from "./characters/pichu.js";
import { createPikachu } from "./characters/pikachu.js";
import { createRaichu } from "./characters/raichu.js";
import { createRaichuElectric } from "./characters/raichu_electric.js";

function main() {
  const canvas = document.getElementById("mycanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext("webgl", { antialias: true });
  if (!gl) return alert("WebGL tidak tersedia!");

  // === Shader ===
  const vs = `
    attribute vec3 position;
    attribute vec3 color;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    varying vec3 vColor;
    void main(void) {
      gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
      vColor = color;
    }`;
  const fs = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) { gl_FragColor = vec4(vColor, 1.0); }`;

  const compile = (src, type) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(vs, gl.VERTEX_SHADER));
  gl.attachShader(prog, compile(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const _pos = gl.getAttribLocation(prog, "position");
  const _col = gl.getAttribLocation(prog, "color");
  const _Pm = gl.getUniformLocation(prog, "Pmatrix");
  const _Vm = gl.getUniformLocation(prog, "Vmatrix");
  const _Mm = gl.getUniformLocation(prog, "Mmatrix");
  gl.enableVertexAttribArray(_pos);
  gl.enableVertexAttribArray(_col);

  // === Kamera ===
  let THETA = 0,
    PHI = -0.2;
  let cameraDistance = 14;
  const PROJMATRIX = LIBS.get_projection(
    40,
    canvas.width / canvas.height,
    1,
    100
  );
  let VIEWMATRIX = LIBS.get_I4();

  function updateCamera() {
    VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -cameraDistance);
    LIBS.translateY(VIEWMATRIX, -1.5);
    LIBS.rotateY(VIEWMATRIX, THETA);
    LIBS.rotateX(VIEWMATRIX, PHI);
  }
  updateCamera();

  // === Interaksi kamera ===
  let drag = false,
    x_prev = 0,
    y_prev = 0;
  canvas.addEventListener("mousedown", (e) => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  });
  canvas.addEventListener("mouseup", () => (drag = false));
  canvas.addEventListener("mouseout", () => (drag = false));
  canvas.addEventListener("mousemove", (e) => {
    if (!drag) return;
    const dX = ((e.pageX - x_prev) * 2 * Math.PI) / canvas.width;
    const dY = ((e.pageY - y_prev) * 2 * Math.PI) / canvas.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    updateCamera();
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      cameraDistance += e.deltaY * 0.02;
      cameraDistance = Math.min(Math.max(cameraDistance, 4), 25);
      updateCamera();
    },
    { passive: false }
  );

  // === Lingkungan ===
  const ground = new Ground(gl, prog, _pos, _col, _Mm);
  const trees = [
    new Tree(gl, prog, _pos, _col, _Mm, { x: -7.5, z: -4.5 }),
    new Tree(gl, prog, _pos, _col, _Mm, { x: 7.5, z: -3.5 }),
  ];
  // Besarkan pohon dan pastikan hanya di sisi kiri/kanan
  trees.forEach((t) => LIBS.scale(t.POSITION_MATRIX, 1.4, 1.4, 1.4));
  const clouds = [
    new Cloud(gl, prog, _pos, _col, _Mm, { x: -8, y: 5.2, z: -8, scale: 1.3 }),
    new Cloud(gl, prog, _pos, _col, _Mm, {
      x: -3,
      y: 6.0,
      z: -7.5,
      scale: 1.0,
    }),
    new Cloud(gl, prog, _pos, _col, _Mm, { x: 3, y: 5.6, z: -6.5, scale: 1.1 }),
    new Cloud(gl, prog, _pos, _col, _Mm, { x: 9, y: 5.0, z: -8.5, scale: 1.2 }),
    new Cloud(gl, prog, _pos, _col, _Mm, { x: 0, y: 6.5, z: -9.0, scale: 0.9 }),
  ];

  // === Karakter
  const chars = [
    createPichu(gl, prog, _pos, _col, _Mm),
    createPikachu(gl, prog, _pos, _col, _Mm),
    createRaichu(gl, prog, _pos, _col, _Mm),
    createRaichuElectric(gl, prog, _pos, _col, _Mm),
  ];

  const startX = [-6, -2, 2, 6];
  // Offset Y berbeda untuk tiap karakter agar kaki pas di tanah (ground Y=-2.8)
  // Dihitung ulang dengan benar: groundY - footBottomY untuk tiap karakter
  const startY = [-1.33, -1.11, -1.28, -1.33]; // Pichu, Pikachu, Raichu, RaichuElectric

  // === Fake drop-shadows sederhana (ellipsoid tipis di tanah) ===
  const lightDir = { x: -0.3, y: -1.0, z: -0.2 }; // arah cahaya kira-kira dari kanan-atas
  const shadowOffset = { x: -lightDir.x * 0.8, z: -lightDir.z * 0.8 };
  const shadows = chars.map(
    () =>
      new ellipsoid(gl, prog, _pos, _col, _Mm, {
        rx: 0.9,
        ry: 0.02,
        rz: 0.9,
        segments: 24,
        rings: 16,
        color: [0.1, 0.15, 0.1],
      })
  );

  // === Gerak bolak-balik ===
  const walkers = chars.map((c, i) => ({
    rig: c,
    z: 0,
    speed: 0.03,
    dir: 1, // >>> 1 artinya MAJU (menjauh kamera)
    rotY: 0, // rotasi awal menghadap depan (ke arah kamera)
    rotTarget: 0, // target rotasi
    mode: "breathe", // mode awal: diam-bernapas
    timer: 0,
  }));

  const minZ = -7,
    maxZ = 2;
  let tCloud = 0;
  let lastTime = performance.now();

  // === Render Loop ===
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // Langit biru
  gl.clearColor(0.53, 0.81, 0.98, 1.0);
  gl.clearDepth(1.0);

  function render() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(_Pm, false, PROJMATRIX);
    gl.uniformMatrix4fv(_Vm, false, VIEWMATRIX);

    // Awan bergerak
    tCloud += 0.01;
    clouds.forEach((c, i) =>
      c.setDrift(
        Math.sin(tCloud * (1 + 0.2 * i)) * 0.4,
        Math.sin(tCloud * 0.6) * 0.1
      )
    );

    // Render environment
    ground.render(LIBS.get_I4());
    trees.forEach((t) => t.render(LIBS.get_I4()));
    clouds.forEach((c) => c.render(LIBS.get_I4()));

    // Gerak karakter
    walkers.forEach((w, i) => {
      // Update timer dan mode
      w.timer += dt;
      const breatheDuration = 2.5; // detik
      const walkDuration = 4.0; // detik
      if (w.mode === "breathe" && w.timer >= breatheDuration) {
        w.mode = "walk";
        w.timer = 0;
      } else if (w.mode === "walk" && w.timer >= walkDuration) {
        w.mode = "breathe";
        w.timer = 0;
      }

      // Gerak/z & rotasi hanya saat jalan
      if (w.mode === "walk") {
        w.z += w.speed * w.dir;
        if (w.z > maxZ) {
          w.dir = -1;
          w.rotTarget = Math.PI;
        } else if (w.z < minZ) {
          w.dir = 1;
          w.rotTarget = 0;
        }
      }

      // Transisi rotasi halus (selalu dicapai ke target)
      w.rotY += (w.rotTarget - w.rotY) * 0.1;

      // Update transform rig - MOVE_MATRIX mengontrol posisi dinamis
      LIBS.set_I4(w.rig.MOVE_MATRIX);
      LIBS.translateX(w.rig.MOVE_MATRIX, startX[i]);
      LIBS.translateY(w.rig.MOVE_MATRIX, startY[i]); // Posisi Y berbeda per karakter agar kaki pas di tanah
      LIBS.translateZ(w.rig.MOVE_MATRIX, w.z);
      // tambahkan sedikit bob saat breathe (naik sedikit dari ground)
      if (w.mode === "breathe") {
        const bob = Math.sin(now * 0.006 + i) * 0.05; // naik-turun halus kecil
        LIBS.translateY(w.rig.MOVE_MATRIX, bob);
      }
      LIBS.rotateY(w.rig.MOVE_MATRIX, w.rotY);

      // Perbarui dan render shadow (di tanah, sedikit offset ke arah berlawanan cahaya)
      const sM = shadows[i].POSITION_MATRIX;
      LIBS.set_I4(sM);
      LIBS.translateX(sM, startX[i] + shadowOffset.x);
      LIBS.translateZ(sM, w.z + shadowOffset.z);
      LIBS.translateY(sM, -2.77); // sedikit di atas ground untuk menghindari z-fighting
      // buat shadow lebih lonjong sesuai arah hadap
      const sx = 1.0 + Math.abs(Math.sin(w.rotY)) * 0.2;
      const sz = 1.0 + Math.abs(Math.cos(w.rotY)) * 0.2;
      LIBS.scale(sM, sx, 1.0, sz);
      shadows[i].render(LIBS.get_I4());

      // Animasi rangka:
      if (w.mode === "walk") {
        w.rig.animate(now);
      }
      w.rig.render(LIBS.get_I4());
    });

    gl.flush();
    requestAnimationFrame(render);
  }
  render();
}

window.addEventListener("load", main);

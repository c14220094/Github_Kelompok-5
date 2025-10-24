// raichu.js - Main assembly file with walking animation and ground
import { ellipsoid } from "./ellipsoid.js";
import { cylinder } from "./cylinder.js";
import { lightningTail } from "./lightning-tail.js";
import { group } from "./group.js";
import { curve } from "./curve.js";
import { ellipsoid_kepala } from "./ellipsoid_kepala.js";
import { Foot } from "./kaki.js";
import { Ground } from "./envi.js";
import { Tree } from "./tree.js";
import { Cloud } from "./cloud.js";

function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  var GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }

  var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec3 color;
        varying vec3 vColor;
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;

  var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;

  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert(
        "ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader)
      );
      return false;
    }
    return shader;
  };

  var shader_vertex = compile_shader(
    shader_vertex_source,
    GL.VERTEX_SHADER,
    "VERTEX"
  );
  var shader_fragment = compile_shader(
    shader_fragment_source,
    GL.FRAGMENT_SHADER,
    "FRAGMENT"
  );

  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);

  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  GL.enableVertexAttribArray(_position);
  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  GL.enableVertexAttribArray(_color);

  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

  GL.useProgram(SHADER_PROGRAM);

  const YELLOW = [1.0, 0.85, 0.0];
  const WHITE = [1.0, 1.0, 0.95];
  const BROWN = [0.4, 0.25, 0.1];
  const BLACK = [0.05, 0.05, 0.05];
  const CHEEK_YELLOW = [0.98, 0.9, 0.5];

  // BADAN
  const Badan = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.0,
    ry: 1.2,
    rz: 0.85,
    segments: 48,
    rings: 32,
    color: YELLOW,
  });
  LIBS.set_I4(Badan.POSITION_MATRIX);

  const Perut = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.68,
    ry: 0.8,
    rz: 0.5,
    segments: 32,
    rings: 24,
    color: WHITE,
  });
  LIBS.translateY(Perut.POSITION_MATRIX, -0.15);
  LIBS.translateZ(Perut.POSITION_MATRIX, 0.6);

  // KEPALA
  const Kepala = new ellipsoid_kepala(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 1.45,
      ry: 1.6,
      rz: 1.4,
      segments: 48,
      rings: 32,
      color: YELLOW,
    }
  );
  LIBS.translateY(Kepala.POSITION_MATRIX, 1.8);

  const Moncong = new cylinder(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      radiusTop: 0.1,
      radiusBottom: 0.4,
      height: 0.5,
      segments: 24,
      color: YELLOW,
      caps: true,
    }
  );
  LIBS.rotateX(Moncong.POSITION_MATRIX, Math.PI / 2);
  LIBS.translateY(Moncong.POSITION_MATRIX, -0.15);
  LIBS.translateZ(Moncong.POSITION_MATRIX, 1.3);

  const Hidung = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.08,
      ry: 0.06,
      rz: 0.08,
      segments: 16,
      rings: 10,
      color: BLACK,
    }
  );
  LIBS.set_I4(Hidung.POSITION_MATRIX);
  LIBS.translateY(Hidung.POSITION_MATRIX, 0.25);
  LIBS.translateZ(Hidung.POSITION_MATRIX, -0.01);

  const HighlightHidung = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.03,
      ry: 0.02,
      rz: 0.02,
      segments: 12,
      rings: 10,
      color: WHITE,
    }
  );
  LIBS.set_I4(HighlightHidung.POSITION_MATRIX);
  LIBS.translateY(HighlightHidung.POSITION_MATRIX, 0.06);
  LIBS.translateZ(HighlightHidung.POSITION_MATRIX, -0.01);

  const Mulut = new curve(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    wavy: true,
    width: 0.6,
    amplitude: 0.1,
    thickness: 0.04,
    segments: 30,
    color: BLACK,
  });
  LIBS.set_I4(Mulut.POSITION_MATRIX);
  LIBS.translateY(Mulut.POSITION_MATRIX, -0.55);
  LIBS.translateZ(Mulut.POSITION_MATRIX, 1.35);

  // PIPI
  const PipiKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.4,
      ry: 0.4,
      rz: 0.2,
      segments: 24,
      rings: 16,
      color: CHEEK_YELLOW,
    }
  );
  LIBS.translateX(PipiKiri.POSITION_MATRIX, -1.2);
  LIBS.translateY(PipiKiri.POSITION_MATRIX, -0.1);
  LIBS.translateZ(PipiKiri.POSITION_MATRIX, 0.8);
  LIBS.rotateY(PipiKiri.POSITION_MATRIX, -0.8);

  const PipiKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.4,
      ry: 0.4,
      rz: 0.2,
      segments: 24,
      rings: 16,
      color: CHEEK_YELLOW,
    }
  );
  LIBS.translateX(PipiKanan.POSITION_MATRIX, 1.2);
  LIBS.translateY(PipiKanan.POSITION_MATRIX, -0.1);
  LIBS.translateZ(PipiKanan.POSITION_MATRIX, 0.8);
  LIBS.rotateY(PipiKanan.POSITION_MATRIX, 0.8);

  // TELINGA KIRI
  const TelingaKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.35,
      ry: 1.0,
      rz: 0.28,
      color: YELLOW,
    }
  );
  LIBS.translateX(TelingaKiri.POSITION_MATRIX, -0.85);
  LIBS.translateY(TelingaKiri.POSITION_MATRIX, 0.9);
  LIBS.translateZ(TelingaKiri.POSITION_MATRIX, -0.15);
  LIBS.rotateZ(TelingaKiri.POSITION_MATRIX, -0.3);
  LIBS.rotateY(TelingaKiri.POSITION_MATRIX, 0.2);

  const UjungTelingaKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.38,
      rz: 0.25,
      color: BROWN,
    }
  );
  LIBS.translateY(UjungTelingaKiri.POSITION_MATRIX, 1.05);

  // TELINGA KANAN
  const TelingaKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.35,
      ry: 1.0,
      rz: 0.28,
      color: YELLOW,
    }
  );
  LIBS.translateX(TelingaKanan.POSITION_MATRIX, 0.85);
  LIBS.translateY(TelingaKanan.POSITION_MATRIX, 0.9);
  LIBS.translateZ(TelingaKanan.POSITION_MATRIX, -0.15);
  LIBS.rotateZ(TelingaKanan.POSITION_MATRIX, 0.3);
  LIBS.rotateY(TelingaKanan.POSITION_MATRIX, -0.2);

  const UjungTelingaKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.38,
      rz: 0.25,
      color: BROWN,
    }
  );
  LIBS.translateY(UjungTelingaKanan.POSITION_MATRIX, 1.05);

  // MATA KIRI
  const MataKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.2,
      ry: 0.24,
      rz: 0.12,
      color: BLACK,
    }
  );
  LIBS.translateX(MataKiri.POSITION_MATRIX, -0.5);
  LIBS.translateY(MataKiri.POSITION_MATRIX, 0.2);
  LIBS.translateZ(MataKiri.POSITION_MATRIX, 1.35);

  const HighlightMataKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.09,
      ry: 0.12,
      rz: 0.05,
      color: WHITE,
    }
  );
  LIBS.translateX(HighlightMataKiri.POSITION_MATRIX, 0.07);
  LIBS.translateY(HighlightMataKiri.POSITION_MATRIX, 0.09);
  LIBS.translateZ(HighlightMataKiri.POSITION_MATRIX, 0.1);
  LIBS.rotateZ(HighlightMataKiri.POSITION_MATRIX, -0.12);

  const HighlightMataKiri2 = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.06,
      ry: 0.08,
      rz: 0.04,
      color: BROWN,
    }
  );
  LIBS.translateX(HighlightMataKiri2.POSITION_MATRIX, -0.09);
  LIBS.translateY(HighlightMataKiri2.POSITION_MATRIX, -0.07);
  LIBS.translateZ(HighlightMataKiri2.POSITION_MATRIX, 0.1);

  // MATA KANAN
  const MataKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.2,
      ry: 0.24,
      rz: 0.12,
      color: BLACK,
    }
  );
  LIBS.translateX(MataKanan.POSITION_MATRIX, 0.5);
  LIBS.translateY(MataKanan.POSITION_MATRIX, 0.2);
  LIBS.translateZ(MataKanan.POSITION_MATRIX, 1.35);

  const HighlightMataKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.09,
      ry: 0.12,
      rz: 0.05,
      color: WHITE,
    }
  );
  LIBS.translateX(HighlightMataKanan.POSITION_MATRIX, -0.07);
  LIBS.translateY(HighlightMataKanan.POSITION_MATRIX, 0.09);
  LIBS.translateZ(HighlightMataKanan.POSITION_MATRIX, 0.1);
  LIBS.rotateZ(HighlightMataKanan.POSITION_MATRIX, -0.12);

  const HighlightMataKanan2 = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.06,
      ry: 0.08,
      rz: 0.04,
      color: BROWN,
    }
  );
  LIBS.translateX(HighlightMataKanan2.POSITION_MATRIX, 0.09);
  LIBS.translateY(HighlightMataKanan2.POSITION_MATRIX, -0.07);
  LIBS.translateZ(HighlightMataKanan2.POSITION_MATRIX, 0.1);

  // LENGAN KIRI
  const LenganKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.8,
      rz: 0.3,
      color: YELLOW,
    }
  );
  LIBS.translateX(LenganKiri.POSITION_MATRIX, -0.9);
  LIBS.translateY(LenganKiri.POSITION_MATRIX, 0.3);
  LIBS.translateZ(LenganKiri.POSITION_MATRIX, 0.15);
  LIBS.rotateZ(LenganKiri.POSITION_MATRIX, -0.8);
  LIBS.rotateY(LenganKiri.POSITION_MATRIX, -0.4);

  const UjungLenganKiri = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.2,
      ry: 0.2,
      rz: 0.2,
      color: BROWN,
    }
  );
  LIBS.translateY(UjungLenganKiri.POSITION_MATRIX, -0.8);

  // LENGAN KANAN
  const LenganKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.8,
      rz: 0.3,
      color: YELLOW,
    }
  );
  LIBS.translateX(LenganKanan.POSITION_MATRIX, 0.9);
  LIBS.translateY(LenganKanan.POSITION_MATRIX, 0.3);
  LIBS.translateZ(LenganKanan.POSITION_MATRIX, 0.15);
  LIBS.rotateZ(LenganKanan.POSITION_MATRIX, 0.8);
  LIBS.rotateY(LenganKanan.POSITION_MATRIX, 0.4);

  const UjungLenganKanan = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.2,
      ry: 0.2,
      rz: 0.2,
      color: BROWN,
    }
  );
  LIBS.translateY(UjungLenganKanan.POSITION_MATRIX, -0.8);

  // KAKI KIRI
  const KakiKiriAtas = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.4,
      rz: 0.3,
      color: YELLOW,
    }
  );
  LIBS.translateX(KakiKiriAtas.POSITION_MATRIX, -0.45);
  LIBS.translateY(KakiKiriAtas.POSITION_MATRIX, -0.85);

  const KakiKiriBawah = new cylinder(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      radiusTop: 0.25,
      radiusBottom: 0.22,
      height: 0.45,
      color: YELLOW,
    }
  );
  LIBS.translateY(KakiKiriBawah.POSITION_MATRIX, -0.5);

  const TelapakKiri = new Foot(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      color: BROWN,
    }
  );
  LIBS.translateY(TelapakKiri.POSITION_MATRIX, -0.3);
  LIBS.translateZ(TelapakKiri.POSITION_MATRIX, 0.1);

  // KAKI KANAN
  const KakiKananAtas = new ellipsoid(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      rx: 0.3,
      ry: 0.4,
      rz: 0.3,
      color: YELLOW,
    }
  );
  LIBS.translateX(KakiKananAtas.POSITION_MATRIX, 0.45);
  LIBS.translateY(KakiKananAtas.POSITION_MATRIX, -0.85);

  const KakiKananBawah = new cylinder(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      radiusTop: 0.25,
      radiusBottom: 0.22,
      height: 0.45,
      color: YELLOW,
    }
  );
  LIBS.translateY(KakiKananBawah.POSITION_MATRIX, -0.5);

  const TelapakKanan = new Foot(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      color: BROWN,
    }
  );
  LIBS.translateY(TelapakKanan.POSITION_MATRIX, -0.3);
  LIBS.translateZ(TelapakKanan.POSITION_MATRIX, 0.1);

  // EKOR
  const PangkalEkor = new cylinder(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      radiusTop: 0.12,
      radiusBottom: 0.15,
      height: 2.0,
      color: BROWN,
    }
  );
  LIBS.translateY(PangkalEkor.POSITION_MATRIX, -0.8);
  LIBS.translateZ(PangkalEkor.POSITION_MATRIX, -0.7);
  LIBS.rotateX(PangkalEkor.POSITION_MATRIX, -2.0);

  const UjungEkorPetir = new lightningTail(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    {
      width: 1.0,
      height: 1.8,
      thickness: 0.08,
      color: YELLOW,
    }
  );
  LIBS.translateY(UjungEkorPetir.POSITION_MATRIX, 1.0);
  LIBS.translateZ(UjungEkorPetir.POSITION_MATRIX, -0.05);
  LIBS.rotateX(UjungEkorPetir.POSITION_MATRIX, 1);

  // GROUND/TANAH
  const Tanah = new Ground(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 10,
    depth: 10,
    height: 1,
    color: [0.4, 0.6, 0.3],
  });
  LIBS.translateY(Tanah.POSITION_MATRIX, -2.86);

  // POHON-POHON
  const Pohon1 = new Tree(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    trunkRadius: 0.2,
    trunkHeight: 1.5,
    crownRadius: 1.0,
    crownHeight: 2.0,
    trunkColor: [0.4, 0.25, 0.1],
    crownColor: [0.1, 0.6, 0.2],
  });
  LIBS.translateX(Pohon1.POSITION_MATRIX, -6);
  LIBS.translateY(Pohon1.POSITION_MATRIX, -1.86);
  LIBS.translateZ(Pohon1.POSITION_MATRIX, -5);

  const Pohon2 = new Tree(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    trunkRadius: 0.18,
    trunkHeight: 1.3,
    crownRadius: 0.9,
    crownHeight: 1.8,
    trunkColor: [0.4, 0.25, 0.1],
    crownColor: [0.15, 0.65, 0.25],
  });
  LIBS.translateX(Pohon2.POSITION_MATRIX, 6);
  LIBS.translateY(Pohon2.POSITION_MATRIX, -1.86);
  LIBS.translateZ(Pohon2.POSITION_MATRIX, -4);

  const Pohon3 = new Tree(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    trunkRadius: 0.15,
    trunkHeight: 1.2,
    crownRadius: 0.8,
    crownHeight: 1.6,
    trunkColor: [0.4, 0.25, 0.1],
    crownColor: [0.1, 0.6, 0.2],
  });
  LIBS.translateX(Pohon3.POSITION_MATRIX, -5);
  LIBS.translateY(Pohon3.POSITION_MATRIX, -1.86);
  LIBS.translateZ(Pohon3.POSITION_MATRIX, 6);

  const Pohon4 = new Tree(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    trunkRadius: 0.2,
    trunkHeight: 1.6,
    crownRadius: 1.1,
    crownHeight: 2.2,
    trunkColor: [0.4, 0.25, 0.1],
    crownColor: [0.15, 0.65, 0.25],
  });
  LIBS.translateX(Pohon4.POSITION_MATRIX, 7); // ubah dari 5 ke 9 (lebih ke kanan)
  LIBS.translateY(Pohon4.POSITION_MATRIX, -1.86); // tetap sama
  LIBS.translateZ(Pohon4.POSITION_MATRIX, 6);

  // AWAN-AWAN
  const Awan1 = new Cloud(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    color: [0.95, 0.95, 1.0],
    scale: 1.2,
  });
  LIBS.translateX(Awan1.POSITION_MATRIX, -8);
  LIBS.translateY(Awan1.POSITION_MATRIX, 5);
  LIBS.translateZ(Awan1.POSITION_MATRIX, -6);

  const Awan2 = new Cloud(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    color: [0.95, 0.95, 1.0],
    scale: 1.0,
  });
  LIBS.translateX(Awan2.POSITION_MATRIX, 7);
  LIBS.translateY(Awan2.POSITION_MATRIX, 6);
  LIBS.translateZ(Awan2.POSITION_MATRIX, -4);

  const Awan3 = new Cloud(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    color: [0.95, 0.95, 1.0],
    scale: 0.9,
  });
  LIBS.translateX(Awan3.POSITION_MATRIX, 0);
  LIBS.translateY(Awan3.POSITION_MATRIX, 7);
  LIBS.translateZ(Awan3.POSITION_MATRIX, -8);

  // HIERARCHY
  Hidung.childs.push(HighlightHidung);
  MataKiri.childs.push(HighlightMataKiri, HighlightMataKiri2);
  MataKanan.childs.push(HighlightMataKanan, HighlightMataKanan2);
  Moncong.childs.push(Hidung);
  TelingaKiri.childs.push(UjungTelingaKiri);
  TelingaKanan.childs.push(UjungTelingaKanan);
  LenganKiri.childs.push(UjungLenganKiri);
  LenganKanan.childs.push(UjungLenganKanan);
  Kepala.childs.push(
    Moncong,
    Mulut,
    MataKiri,
    MataKanan,
    PipiKiri,
    PipiKanan,
    TelingaKiri,
    TelingaKanan
  );
  KakiKiriBawah.childs.push(TelapakKiri);
  KakiKiriAtas.childs.push(KakiKiriBawah);
  KakiKananBawah.childs.push(TelapakKanan);
  KakiKananAtas.childs.push(KakiKananBawah);
  PangkalEkor.childs.push(UjungEkorPetir);
  Badan.childs.push(
    Perut,
    Kepala,
    LenganKiri,
    LenganKanan,
    KakiKiriAtas,
    KakiKananAtas,
    PangkalEkor
  );

  const Rig = new group();
  Rig.childs.push(Badan);
  Rig.setup();

  // MATRICES & CAMERA
  var PROJMATRIX = LIBS.get_projection(
    40,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  var VIEWMATRIX = LIBS.get_I4();
  var THETA = 0,
    PHI = 0,
    cameraDistance = 11;
  const minDistance = 2,
    maxDistance = 20;
  var drag = false,
    x_prev,
    y_prev;

  function updateCamera() {
    VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -cameraDistance);
    LIBS.translateY(VIEWMATRIX, -1);
    LIBS.rotateY(VIEWMATRIX, THETA);
    LIBS.rotateX(VIEWMATRIX, PHI);
  }

  CANVAS.addEventListener("mousedown", function (e) {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  });
  CANVAS.addEventListener("mouseup", function () {
    drag = false;
  });
  CANVAS.addEventListener("mouseout", function () {
    drag = false;
  });
  CANVAS.addEventListener("mousemove", function (e) {
    if (!drag) return;
    let dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    let dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    updateCamera();
  });
  CANVAS.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      cameraDistance += e.deltaY * 0.02;
      cameraDistance = Math.min(
        Math.max(cameraDistance, minDistance),
        maxDistance
      );
      updateCamera();
    },
    { passive: false }
  );

  updateCamera();

  // ANIMATION
  let raichuX = 0,
    direction = 1;
  const speed = 0.015,
    batas = 3.5;
  let walkCycle = 0;
  let treeSwing = 0;
  let cloudDrift = 0;
  let headScale = 1.0;

  // ========== ANIMASI RAICHU ==========
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.8, 0.8, 0.8, 1.0);
  GL.clearDepth(1.0);

  var animate = function (time) {
    raichuX += speed * direction;
    if (raichuX > batas || raichuX < -batas) direction *= -1;

    walkCycle += 0.1;
    const legSwing = Math.sin(walkCycle) * 0.4;

    const armSwing = Math.sin(walkCycle) * 0.4;

    // Animasi kepala membesar-mengecil
    headScale = 1.0 + Math.sin(walkCycle * 2) * 0.02; // Skala 0.85 - 1.15

    LIBS.set_I4(KakiKiriAtas.POSITION_MATRIX);
    LIBS.translateX(KakiKiriAtas.POSITION_MATRIX, -0.45);
    LIBS.translateY(KakiKiriAtas.POSITION_MATRIX, -0.85);
    LIBS.rotateX(KakiKiriAtas.POSITION_MATRIX, legSwing);

    LIBS.set_I4(KakiKananAtas.POSITION_MATRIX);
    LIBS.translateX(KakiKananAtas.POSITION_MATRIX, 0.45);
    LIBS.translateY(KakiKananAtas.POSITION_MATRIX, -0.85);
    LIBS.rotateX(KakiKananAtas.POSITION_MATRIX, -legSwing);


    LIBS.set_I4(LenganKiri.POSITION_MATRIX);
LIBS.translateX(LenganKiri.POSITION_MATRIX, -0.9);
LIBS.translateY(LenganKiri.POSITION_MATRIX, 0.3);
LIBS.translateZ(LenganKiri.POSITION_MATRIX, 0.15);
LIBS.rotateZ(LenganKiri.POSITION_MATRIX, -0.8 + armSwing);
LIBS.rotateY(LenganKiri.POSITION_MATRIX, -0.4);

// Animasi lengan kanan
LIBS.set_I4(LenganKanan.POSITION_MATRIX);
LIBS.translateX(LenganKanan.POSITION_MATRIX, 0.9);
LIBS.translateY(LenganKanan.POSITION_MATRIX, 0.3);
LIBS.translateZ(LenganKanan.POSITION_MATRIX, 0.15);
LIBS.rotateZ(LenganKanan.POSITION_MATRIX, 0.8 - armSwing);
LIBS.rotateY(LenganKanan.POSITION_MATRIX, 0.4);

    // Aplikasikan skala kepala
    LIBS.set_I4(Kepala.POSITION_MATRIX);
    LIBS.scale(Kepala.POSITION_MATRIX, headScale, headScale, headScale);
    LIBS.translateY(Kepala.POSITION_MATRIX, 1.8);

    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    // ========== ANIMASI POHON GOYANG ==========
    treeSwing += 0.03;
    const swingAngle = Math.sin(treeSwing) * 0.15;

    LIBS.set_I4(Pohon1.POSITION_MATRIX);
    LIBS.translateX(Pohon1.POSITION_MATRIX, -6);
    LIBS.translateY(Pohon1.POSITION_MATRIX, -1.86);
    LIBS.translateZ(Pohon1.POSITION_MATRIX, -5);
    LIBS.rotateZ(Pohon1.POSITION_MATRIX, swingAngle);

    LIBS.set_I4(Pohon2.POSITION_MATRIX);
    LIBS.translateX(Pohon2.POSITION_MATRIX, 6);
    LIBS.translateY(Pohon2.POSITION_MATRIX, -1.86);
    LIBS.translateZ(Pohon2.POSITION_MATRIX, -4);
    LIBS.rotateZ(Pohon2.POSITION_MATRIX, swingAngle * 0.8);

    LIBS.set_I4(Pohon3.POSITION_MATRIX);
    LIBS.translateX(Pohon3.POSITION_MATRIX, -5);
    LIBS.translateY(Pohon3.POSITION_MATRIX, -1.86);
    LIBS.translateZ(Pohon3.POSITION_MATRIX, 6);
    LIBS.rotateZ(Pohon3.POSITION_MATRIX, swingAngle * 1.2);

    LIBS.set_I4(Pohon4.POSITION_MATRIX);
    LIBS.translateX(Pohon4.POSITION_MATRIX, 7);
    LIBS.translateY(Pohon4.POSITION_MATRIX, -1.86);
    LIBS.translateZ(Pohon4.POSITION_MATRIX, 6);
    LIBS.rotateZ(Pohon4.POSITION_MATRIX, swingAngle);

    // ========== ANIMASI AWAN MELAYANG ==========
    cloudDrift += 0.01;

    LIBS.set_I4(Awan1.POSITION_MATRIX);
    LIBS.translateX(Awan1.POSITION_MATRIX, -8 + Math.sin(cloudDrift) * 0.3);
    LIBS.translateY(
      Awan1.POSITION_MATRIX,
      5 + Math.sin(cloudDrift * 0.7) * 0.1
    );
    LIBS.translateZ(Awan1.POSITION_MATRIX, -6);

    LIBS.set_I4(Awan2.POSITION_MATRIX);
    LIBS.translateX(
      Awan2.POSITION_MATRIX,
      7 + Math.sin(cloudDrift * 1.2) * 0.4
    );
    LIBS.translateY(
      Awan2.POSITION_MATRIX,
      6 + Math.sin(cloudDrift * 0.5) * 0.15
    );
    LIBS.translateZ(Awan2.POSITION_MATRIX, -4);

    LIBS.set_I4(Awan3.POSITION_MATRIX);
    LIBS.translateX(Awan3.POSITION_MATRIX, Math.sin(cloudDrift * 0.8) * 0.5);
    LIBS.translateY(
      Awan3.POSITION_MATRIX,
      7 + Math.sin(cloudDrift * 0.6) * 0.12
    );
    LIBS.translateZ(Awan3.POSITION_MATRIX, -8);

    Tanah.render(LIBS.get_I4());
    Pohon1.render(LIBS.get_I4());
    Pohon2.render(LIBS.get_I4());
    Pohon3.render(LIBS.get_I4());
    Pohon4.render(LIBS.get_I4());
    Awan1.render(LIBS.get_I4());
    Awan2.render(LIBS.get_I4());
    Awan3.render(LIBS.get_I4());

    LIBS.set_I4(Rig.MOVE_MATRIX);
    LIBS.translateZ(Rig.MOVE_MATRIX, raichuX);
    if (direction === -1) LIBS.rotateY(Rig.MOVE_MATRIX, Math.PI);

    Rig.render(LIBS.get_I4());
    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

window.addEventListener("load", main);

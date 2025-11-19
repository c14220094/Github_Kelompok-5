import { ellipsoid } from "../base/ellipsoid.js";
import { cylinder } from "../base/cylinder.js";
import { lightningTail } from "../base/lightning-tail.js";
import { group } from "../base/group.js";
import { curve } from "../base/curve.js";
import { ellipsoid_kepala } from "../base/ellipsoid_kepala.js";
import { Foot } from "../base/kaki.js";

const YELLOW = [1.0, 0.93, 0.0];
const BLACK = [0.05, 0.05, 0.05];
const PINK = [1.0, 0.65, 0.75];
const WHITE = [1.0, 1.0, 1.0];

export function createPichu(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
  // === BADAN MUNGIL ===
  const Body = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.75, ry: 0.85, rz: 0.65, segments: 48, rings: 32, color: YELLOW
  });
  LIBS.set_I4(Body.POSITION_MATRIX);

  // Perut
  const Belly = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.45, ry: 0.55, rz: 0.4, segments: 32, rings: 24, color: WHITE
  });
  LIBS.translateY(Belly.POSITION_MATRIX, -0.1);
  LIBS.translateZ(Belly.POSITION_MATRIX, 0.5);

  // === KEPALA BULAT IMUT ===
  const Head = new ellipsoid_kepala(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.0, ry: 1.05, rz: 1.0, color: YELLOW
  });
  LIBS.translateY(Head.POSITION_MATRIX, 1.45);

  // === WAJAH (lebih tinggi & membulat) ===
  const EyeL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.15, ry: 0.18, rz: 0.1, color: BLACK
  });
  LIBS.translateX(EyeL.POSITION_MATRIX, -0.35);
  LIBS.translateY(EyeL.POSITION_MATRIX, 0.35);
  LIBS.translateZ(EyeL.POSITION_MATRIX, 1.05);

  const EyeR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.15, ry: 0.18, rz: 0.1, color: BLACK
  });
  LIBS.translateX(EyeR.POSITION_MATRIX, 0.35);
  LIBS.translateY(EyeR.POSITION_MATRIX, 0.35);
  LIBS.translateZ(EyeR.POSITION_MATRIX, 1.05);

  // highlight mata
  const EyeHL_L = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.06, ry: 0.07, rz: 0.05, color: WHITE
  });
  LIBS.translateX(EyeHL_L.POSITION_MATRIX, -0.05);
  LIBS.translateY(EyeHL_L.POSITION_MATRIX, 0.08);
  LIBS.translateZ(EyeHL_L.POSITION_MATRIX, 0.1);

  const EyeHL_R = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.06, ry: 0.07, rz: 0.05, color: WHITE
  });
  LIBS.translateX(EyeHL_R.POSITION_MATRIX, 0.05);
  LIBS.translateY(EyeHL_R.POSITION_MATRIX, 0.08);
  LIBS.translateZ(EyeHL_R.POSITION_MATRIX, 0.1);

  // pipi pink (lebih ke atas)
  const CheekL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.25, rz: 0.15, color: PINK
  });
  LIBS.translateX(CheekL.POSITION_MATRIX, -0.75);
  LIBS.translateY(CheekL.POSITION_MATRIX, 0.0);
  LIBS.translateZ(CheekL.POSITION_MATRIX, 0.75);

  const CheekR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.25, rz: 0.15, color: PINK
  });
  LIBS.translateX(CheekR.POSITION_MATRIX, 0.75);
  LIBS.translateY(CheekR.POSITION_MATRIX, 0.0);
  LIBS.translateZ(CheekR.POSITION_MATRIX, 0.75);

  // senyum manis (naik & lebih lebar)
  const Smile = new curve(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    wavy: false,
    width: 0.5,
    amplitude: -0.12,
    thickness: 0.04,
    segments: 40,
    color: BLACK
  });
  LIBS.translateY(Smile.POSITION_MATRIX, -0.25);
  LIBS.translateZ(Smile.POSITION_MATRIX, 1.15);

  // === TELINGA BESAR BERUJUNG HITAM ===
  const EarL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 1.0, rz: 0.25, color: YELLOW
  });
  LIBS.translateX(EarL.POSITION_MATRIX, -0.8);
  LIBS.translateY(EarL.POSITION_MATRIX, 1.0);
  LIBS.rotateZ(EarL.POSITION_MATRIX, -0.75);

  const EarTipL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.4, rz: 0.25, color: BLACK
  });
  LIBS.translateY(EarTipL.POSITION_MATRIX, 0.8);

  const EarR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 1.0, rz: 0.25, color: YELLOW
  });
  LIBS.translateX(EarR.POSITION_MATRIX, 0.8);
  LIBS.translateY(EarR.POSITION_MATRIX, 1.0);
  LIBS.rotateZ(EarR.POSITION_MATRIX, 0.75);

  const EarTipR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.4, rz: 0.25, color: BLACK
  });
  LIBS.translateY(EarTipR.POSITION_MATRIX, 0.8);

  // === LENGAN DAN KAKI ===
  const ArmL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.2, ry: 0.55, rz: 0.22, color: YELLOW
  });
  LIBS.translateX(ArmL.POSITION_MATRIX, -0.6);
  LIBS.translateY(ArmL.POSITION_MATRIX, 0.15);
  LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.6);

  const ArmTipL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.15, ry: 0.15, rz: 0.15, color: BLACK
  });
  LIBS.translateY(ArmTipL.POSITION_MATRIX, -0.6);

  const ArmR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.2, ry: 0.55, rz: 0.22, color: YELLOW
  });
  LIBS.translateX(ArmR.POSITION_MATRIX, 0.6);
  LIBS.translateY(ArmR.POSITION_MATRIX, 0.15);
  LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.6);

  const ArmTipR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.15, ry: 0.15, rz: 0.15, color: BLACK
  });
  LIBS.translateY(ArmTipR.POSITION_MATRIX, -0.6);

  // kaki
  const ThighL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.22, ry: 0.28, rz: 0.22, color: YELLOW
  });
  LIBS.translateX(ThighL.POSITION_MATRIX, -0.35);
  LIBS.translateY(ThighL.POSITION_MATRIX, -0.75);

  const LegL = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.15, radiusBottom: 0.14, height: 0.35, color: YELLOW
  });
  LIBS.translateY(LegL.POSITION_MATRIX, -0.35);

  const FootL = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BLACK });
  LIBS.translateY(FootL.POSITION_MATRIX, -0.25);

  const ThighR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.22, ry: 0.28, rz: 0.22, color: YELLOW
  });
  LIBS.translateX(ThighR.POSITION_MATRIX, 0.35);
  LIBS.translateY(ThighR.POSITION_MATRIX, -0.75);

  const LegR = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.15, radiusBottom: 0.14, height: 0.35, color: YELLOW
  });
  LIBS.translateY(LegR.POSITION_MATRIX, -0.35);

  const FootR = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BLACK });
  LIBS.translateY(FootR.POSITION_MATRIX, -0.25);

  // ekor kecil
  const Tail = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.6, height: 0.8, thickness: 0.06, color: BLACK
  });
  LIBS.translateY(Tail.POSITION_MATRIX, -0.6);
  LIBS.translateZ(Tail.POSITION_MATRIX, -0.5);
  LIBS.rotateX(Tail.POSITION_MATRIX, -2.2);

  // === HIERARKI ===
  EyeL.childs.push(EyeHL_L);
  EyeR.childs.push(EyeHL_R);
  ArmL.childs.push(ArmTipL);
  ArmR.childs.push(ArmTipR);
  ThighL.childs.push(LegL); LegL.childs.push(FootL);
  ThighR.childs.push(LegR); LegR.childs.push(FootR);
  EarL.childs.push(EarTipL);
  EarR.childs.push(EarTipR);
  Head.childs.push(EyeL, EyeR, CheekL, CheekR, Smile, EarL, EarR);
  Body.childs.push(Belly, Head, ArmL, ArmR, ThighL, ThighR, Tail);

  const Rig = new group();
  Rig.childs.push(Body);
  Rig.setup();

  // === ANIMASI: jalan sinkron + telinga goyang lucu ===
  let t = 0;
  Rig.animate = function () {
    t += 0.12;
    const legSwing = Math.sin(t) * 0.35;
    const armSwing = Math.sin(t) * 0.45;
    const earWiggle = Math.sin(t * 2.5) * 0.15;
    const headScale = 1.0 + Math.sin(t * 2.0) * 0.012;

    // kaki
    LIBS.set_I4(ThighL.POSITION_MATRIX);
    LIBS.translateX(ThighL.POSITION_MATRIX, -0.35);
    LIBS.translateY(ThighL.POSITION_MATRIX, -0.75);
    LIBS.rotateX(ThighL.POSITION_MATRIX, legSwing);

    LIBS.set_I4(ThighR.POSITION_MATRIX);
    LIBS.translateX(ThighR.POSITION_MATRIX, 0.35);
    LIBS.translateY(ThighR.POSITION_MATRIX, -0.75);
    LIBS.rotateX(ThighR.POSITION_MATRIX, -legSwing);

    // tangan
    LIBS.set_I4(ArmL.POSITION_MATRIX);
    LIBS.translateX(ArmL.POSITION_MATRIX, -0.65);
    LIBS.translateY(ArmL.POSITION_MATRIX, 0.15);
    LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.6 + armSwing);

    LIBS.set_I4(ArmR.POSITION_MATRIX);
    LIBS.translateX(ArmR.POSITION_MATRIX, 0.65);
    LIBS.translateY(ArmR.POSITION_MATRIX, 0.15);
    LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.6 - armSwing);

    // kepala & telinga ikut bob
    LIBS.set_I4(Head.POSITION_MATRIX);
    LIBS.scale(Head.POSITION_MATRIX, headScale, headScale, headScale);
    LIBS.translateY(Head.POSITION_MATRIX, 1.45);

    LIBS.set_I4(EarL.POSITION_MATRIX);
    LIBS.translateX(EarL.POSITION_MATRIX, -0.8);
    LIBS.translateY(EarL.POSITION_MATRIX, 1.0);
    LIBS.rotateZ(EarL.POSITION_MATRIX, -0.75 + earWiggle);

    LIBS.set_I4(EarR.POSITION_MATRIX);
    LIBS.translateX(EarR.POSITION_MATRIX, 0.8);
    LIBS.translateY(EarR.POSITION_MATRIX, 1.0);
    LIBS.rotateZ(EarR.POSITION_MATRIX, 0.75 - earWiggle);
  };

  return Rig;
}

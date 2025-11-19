import { ellipsoid } from "../base/ellipsoid.js";
import { cylinder } from "../base/cylinder.js";
import { lightningTail } from "../base/lightning-tail.js";
import { group } from "../base/group.js";
import { curve } from "../base/curve.js";
import { ellipsoid_kepala } from "../base/ellipsoid_kepala.js";
import { Foot } from "../base/kaki.js";

// warna
const ORANGE = [1.0, 0.55, 0.1];
const LEMON = [1.0, 0.93, 0.4];
const DARK_BROWN = [0.3, 0.18, 0.05];
const WHITE = [1.0, 1.0, 0.96];
const BLACK = [0.05, 0.05, 0.05];
const YELLOW = [1.0, 0.9, 0.1];

export function createRaichu(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
  // === BADAN ===
  const Body = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.0, ry: 1.25, rz: 0.9, segments: 48, rings: 32, color: ORANGE
  });
  LIBS.set_I4(Body.POSITION_MATRIX);

  const Belly = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.65, ry: 0.85, rz: 0.55, color: WHITE
  });
  LIBS.translateY(Belly.POSITION_MATRIX, -0.1);
  LIBS.translateZ(Belly.POSITION_MATRIX, 0.6);

  // === KEPALA ===
  const Head = new ellipsoid_kepala(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.35, ry: 1.45, rz: 1.25, color: ORANGE
  });
  LIBS.translateY(Head.POSITION_MATRIX, 1.6);

  // === MATA + highlight ===
  const EyeL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.18, ry: 0.22, rz: 0.12, color: BLACK
  });
  LIBS.translateX(EyeL.POSITION_MATRIX, -0.48);
  LIBS.translateY(EyeL.POSITION_MATRIX, 0.25);
  LIBS.translateZ(EyeL.POSITION_MATRIX, 1.05);

  const EyeR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.18, ry: 0.22, rz: 0.12, color: BLACK
  });
  LIBS.translateX(EyeR.POSITION_MATRIX, 0.48);
  LIBS.translateY(EyeR.POSITION_MATRIX, 0.25);
  LIBS.translateZ(EyeR.POSITION_MATRIX, 1.05);

  const EyeHL_L = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.07, ry: 0.08, rz: 0.05, color: WHITE
  });
  LIBS.translateX(EyeHL_L.POSITION_MATRIX, -0.05);
  LIBS.translateY(EyeHL_L.POSITION_MATRIX, 0.06);
  LIBS.translateZ(EyeHL_L.POSITION_MATRIX, 0.09);

  const EyeHL_R = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.07, ry: 0.08, rz: 0.05, color: WHITE
  });
  LIBS.translateX(EyeHL_R.POSITION_MATRIX, 0.05);
  LIBS.translateY(EyeHL_R.POSITION_MATRIX, 0.06);
  LIBS.translateZ(EyeHL_R.POSITION_MATRIX, 0.09);

  // === PIPI ===
  const CheekL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 0.35, rz: 0.2, color: LEMON
  });
  LIBS.translateX(CheekL.POSITION_MATRIX, -1.0);
  LIBS.translateY(CheekL.POSITION_MATRIX, -0.1);
  LIBS.translateZ(CheekL.POSITION_MATRIX, 0.75);

  const CheekR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 0.35, rz: 0.2, color: LEMON
  });
  LIBS.translateX(CheekR.POSITION_MATRIX, 1.0);
  LIBS.translateY(CheekR.POSITION_MATRIX, -0.1);
  LIBS.translateZ(CheekR.POSITION_MATRIX, 0.75);

  // === MULUT senyum (curve) ===
  const Smile = new curve(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    wavy: false,
    width: 0.75,
    amplitude: -0.12,
    thickness: 0.05,
    segments: 40,
    color: BLACK
  });
  LIBS.translateY(Smile.POSITION_MATRIX, -0.48);
  LIBS.translateZ(Smile.POSITION_MATRIX, 1.15);

  // === TELINGA ===
  const EarL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 1.25, rz: 0.25, color: LEMON
  });
  LIBS.translateX(EarL.POSITION_MATRIX, -0.85);
  LIBS.translateY(EarL.POSITION_MATRIX, 0.9);
  LIBS.rotateZ(EarL.POSITION_MATRIX, -0.55);

  const EarTipL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.4, rz: 0.25, color: DARK_BROWN
  });
  LIBS.translateY(EarTipL.POSITION_MATRIX, 1.0);

  const EarringL = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.25, height: 0.3, thickness: 0.04, color: YELLOW
  });
  LIBS.translateY(EarringL.POSITION_MATRIX, 1.3);
  LIBS.translateX(EarringL.POSITION_MATRIX, -0.1);
  LIBS.rotateZ(EarringL.POSITION_MATRIX, -0.3);

  const EarR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 1.25, rz: 0.25, color: LEMON
  });
  LIBS.translateX(EarR.POSITION_MATRIX, 0.85);
  LIBS.translateY(EarR.POSITION_MATRIX, 0.9);
  LIBS.rotateZ(EarR.POSITION_MATRIX, 0.55);

  const EarTipR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.4, rz: 0.25, color: DARK_BROWN
  });
  LIBS.translateY(EarTipR.POSITION_MATRIX, 1.0);

  const EarringR = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.25, height: 0.3, thickness: 0.04, color: YELLOW
  });
  LIBS.translateY(EarringR.POSITION_MATRIX, 1.3);
  LIBS.translateX(EarringR.POSITION_MATRIX, 0.1);
  LIBS.rotateZ(EarringR.POSITION_MATRIX, 0.3);

  // === LENGAN ===
  const ArmL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.85, rz: 0.28, color: ORANGE
  });
  LIBS.translateX(ArmL.POSITION_MATRIX, -0.9);
  LIBS.translateY(ArmL.POSITION_MATRIX, 0.3);
  LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.8);

  const HandL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.25, rz: 0.25, color: DARK_BROWN
  });
  LIBS.translateY(HandL.POSITION_MATRIX, -0.9);

  const ArmR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.85, rz: 0.28, color: ORANGE
  });
  LIBS.translateX(ArmR.POSITION_MATRIX, 0.9);
  LIBS.translateY(ArmR.POSITION_MATRIX, 0.3);
  LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.8);

  const HandR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.25, ry: 0.25, rz: 0.25, color: DARK_BROWN
  });
  LIBS.translateY(HandR.POSITION_MATRIX, -0.9);

  // === KAKI ===
  const LegL = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.28, radiusBottom: 0.25, height: 0.6, color: ORANGE
  });
  LIBS.translateX(LegL.POSITION_MATRIX, -0.45);
  LIBS.translateY(LegL.POSITION_MATRIX, -1.1);

  const FootL = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: DARK_BROWN });
  LIBS.translateY(FootL.POSITION_MATRIX, -0.3);

  const LegR = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.28, radiusBottom: 0.25, height: 0.6, color: ORANGE
  });
  LIBS.translateX(LegR.POSITION_MATRIX, 0.45);
  LIBS.translateY(LegR.POSITION_MATRIX, -1.1);

  const FootR = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: DARK_BROWN });
  LIBS.translateY(FootR.POSITION_MATRIX, -0.3);

  // === EKOR PETIR ===
  const TailBase = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.15, radiusBottom: 0.18, height: 1.8, color: DARK_BROWN
  });
  LIBS.translateY(TailBase.POSITION_MATRIX, -0.8);
  LIBS.translateZ(TailBase.POSITION_MATRIX, -0.9);
  LIBS.rotateX(TailBase.POSITION_MATRIX, -2.1);

  const TailBolt = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 1.1, height: 2.0, thickness: 0.08, color: YELLOW
  });
  LIBS.translateY(TailBolt.POSITION_MATRIX, 1.0);
  LIBS.translateZ(TailBolt.POSITION_MATRIX, -0.1);
  LIBS.rotateX(TailBolt.POSITION_MATRIX, 1);

  // === HIERARKI ===
  EyeL.childs.push(EyeHL_L);
  EyeR.childs.push(EyeHL_R);
  EarL.childs.push(EarTipL, EarringL);
  EarR.childs.push(EarTipR, EarringR);
  ArmL.childs.push(HandL);
  ArmR.childs.push(HandR);
  LegL.childs.push(FootL);
  LegR.childs.push(FootR);
  TailBase.childs.push(TailBolt);
  Head.childs.push(EyeL, EyeR, CheekL, CheekR, Smile, EarL, EarR);
  Body.childs.push(Belly, Head, ArmL, ArmR, LegL, LegR, TailBase);

  // === RIG ===
  const Rig = new group();
  Rig.childs.push(Body);
  Rig.setup();

  // === ANIMASI (jalan + head bob) ===
  let t = 0;
  Rig.animate = function () {
    t += 0.12;
    const legSwing = Math.sin(t) * 0.35;
    const armSwing = Math.sin(t) * 0.45;
    const headScale = 1.0 + Math.sin(t * 2.0) * 0.015;

    LIBS.set_I4(LegL.POSITION_MATRIX);
    LIBS.translateX(LegL.POSITION_MATRIX, -0.45);
    LIBS.translateY(LegL.POSITION_MATRIX, -1.1);
    LIBS.rotateX(LegL.POSITION_MATRIX, legSwing);

    LIBS.set_I4(LegR.POSITION_MATRIX);
    LIBS.translateX(LegR.POSITION_MATRIX, 0.45);
    LIBS.translateY(LegR.POSITION_MATRIX, -1.1);
    LIBS.rotateX(LegR.POSITION_MATRIX, -legSwing);

    LIBS.set_I4(ArmL.POSITION_MATRIX);
    LIBS.translateX(ArmL.POSITION_MATRIX, -0.9);
    LIBS.translateY(ArmL.POSITION_MATRIX, 0.3);
    LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.8 + armSwing);

    LIBS.set_I4(ArmR.POSITION_MATRIX);
    LIBS.translateX(ArmR.POSITION_MATRIX, 0.9);
    LIBS.translateY(ArmR.POSITION_MATRIX, 0.3);
    LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.8 - armSwing);

    // Head bob (lembut)
    LIBS.set_I4(Head.POSITION_MATRIX);
    LIBS.scale(Head.POSITION_MATRIX, headScale, headScale, headScale);
    LIBS.translateY(Head.POSITION_MATRIX, 1.6);
  };

  return Rig;
}

import { ellipsoid } from "../base/ellipsoid.js";
import { cylinder } from "../base/cylinder.js";
import { lightningTail } from "../base/lightning-tail.js";
import { group } from "../base/group.js";
import { curve } from "../base/curve.js";
import { ellipsoid_kepala } from "../base/ellipsoid_kepala.js";
import { Foot } from "../base/kaki.js";

const GOLD = [1.0, 0.85, 0.0];
const ORANGE = [1.0, 0.6, 0.1];
const WHITE = [1.0, 1.0, 0.96];
const BLACK = [0.05, 0.05, 0.05];
const BROWN = [0.32, 0.2, 0.06];
const LEMON = [1.0, 0.93, 0.4];
const SOFT_YEL = [1.0, 0.95, 0.55];
const PINK = [1.0, 0.6, 0.65];

export function createRaichuElectric(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
  // ===== BODY =====
  const Body = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.0, ry: 1.25, rz: 0.9, segments: 48, rings: 32, color: GOLD,
  });
  LIBS.set_I4(Body.POSITION_MATRIX);

  const Belly = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.65, ry: 0.85, rz: 0.55, color: WHITE,
  });
  LIBS.translateY(Belly.POSITION_MATRIX, -0.1);
  LIBS.translateZ(Belly.POSITION_MATRIX, 0.6);

  // ===== HEAD =====
  const Head = new ellipsoid_kepala(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 1.35, ry: 1.45, rz: 1.25, color: GOLD,
  });
  LIBS.translateY(Head.POSITION_MATRIX, 1.7);

  // ===== EYES =====
  const EyeL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.18, ry: 0.22, rz: 0.12, color: BLACK,
  });
  LIBS.translateX(EyeL.POSITION_MATRIX, -0.48);
  LIBS.translateY(EyeL.POSITION_MATRIX, 0.25);
  LIBS.translateZ(EyeL.POSITION_MATRIX, 1.05);

  const EyeR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.18, ry: 0.22, rz: 0.12, color: BLACK,
  });
  LIBS.translateX(EyeR.POSITION_MATRIX, 0.48);
  LIBS.translateY(EyeR.POSITION_MATRIX, 0.25);
  LIBS.translateZ(EyeR.POSITION_MATRIX, 1.05);

  // highlight putih (gemas)
  const EyeHL_L = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.07, ry: 0.08, rz: 0.05, color: WHITE,
  });
  LIBS.translateX(EyeHL_L.POSITION_MATRIX, -0.05);
  LIBS.translateY(EyeHL_L.POSITION_MATRIX, 0.06);
  LIBS.translateZ(EyeHL_L.POSITION_MATRIX, 0.09);

  const EyeHL_R = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.07, ry: 0.08, rz: 0.05, color: WHITE,
  });
  LIBS.translateX(EyeHL_R.POSITION_MATRIX, 0.05);
  LIBS.translateY(EyeHL_R.POSITION_MATRIX, 0.06);
  LIBS.translateZ(EyeHL_R.POSITION_MATRIX, 0.09);

  // ===== CHEEKS =====
  const CheekL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 0.35, rz: 0.2, color: ORANGE,
  });
  LIBS.translateX(CheekL.POSITION_MATRIX, -1.0);
  LIBS.translateY(CheekL.POSITION_MATRIX, -0.1);
  LIBS.translateZ(CheekL.POSITION_MATRIX, 0.75);

  const CheekR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.35, ry: 0.35, rz: 0.2, color: ORANGE,
  });
  LIBS.translateX(CheekR.POSITION_MATRIX, 1.0);
  LIBS.translateY(CheekR.POSITION_MATRIX, -0.1);
  LIBS.translateZ(CheekR.POSITION_MATRIX, 0.75);

  // ===== MOUTH (smile) =====
  const Smile = new curve(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    wavy: false,
    width: 0.8,
    amplitude: -0.13,
    thickness: 0.05,
    segments: 40,
    color: BLACK,
  });
  LIBS.translateY(Smile.POSITION_MATRIX, -0.48);
  LIBS.translateZ(Smile.POSITION_MATRIX, 1.15);

  // lidah mungil
  const Tongue = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.15, ry: 0.09, rz: 0.05, color: PINK,
  });
  LIBS.translateY(Tongue.POSITION_MATRIX, -0.58);
  LIBS.translateZ(Tongue.POSITION_MATRIX, 1.15);

  // ===== EARS (lightning style) =====
  const EarL = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.9, height: 1.5, thickness: 0.09, color: LEMON,
  });
  LIBS.translateX(EarL.POSITION_MATRIX, -0.95);
  LIBS.translateY(EarL.POSITION_MATRIX, 0.9);
  LIBS.rotateZ(EarL.POSITION_MATRIX, -0.35);

  const EarTipL = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.45, height: 0.6, thickness: 0.09, color: BLACK,
  });
  LIBS.translateY(EarTipL.POSITION_MATRIX, 1.0);

  const EarR = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.9, height: 1.5, thickness: 0.09, color: LEMON,
  });
  LIBS.translateX(EarR.POSITION_MATRIX, 0.95);
  LIBS.translateY(EarR.POSITION_MATRIX, 0.9);
  LIBS.rotateZ(EarR.POSITION_MATRIX, 0.35);

  const EarTipR = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 0.45, height: 0.6, thickness: 0.09, color: BLACK,
  });
  LIBS.translateY(EarTipR.POSITION_MATRIX, 1.0);

  // ===== LIMBS =====
  const ArmL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.85, rz: 0.28, color: GOLD,
  });
  LIBS.translateX(ArmL.POSITION_MATRIX, -0.9);
  LIBS.translateY(ArmL.POSITION_MATRIX, 0.3);
  LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.8);

  const HandL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.22, ry: 0.22, rz: 0.22, color: BROWN,
  });
  LIBS.translateY(HandL.POSITION_MATRIX, -0.9);

  const ArmR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.3, ry: 0.85, rz: 0.28, color: GOLD,
  });
  LIBS.translateX(ArmR.POSITION_MATRIX, 0.9);
  LIBS.translateY(ArmR.POSITION_MATRIX, 0.3);
  LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.8);

  const HandR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    rx: 0.22, ry: 0.22, rz: 0.22, color: BROWN,
  });
  LIBS.translateY(HandR.POSITION_MATRIX, -0.9);

  // ===== LEGS =====
  const LegL = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.26, radiusBottom: 0.24, height: 0.55, color: GOLD,
  });
  LIBS.translateX(LegL.POSITION_MATRIX, -0.45);
  LIBS.translateY(LegL.POSITION_MATRIX, -1.05);

  const FootL = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BROWN });
  LIBS.translateY(FootL.POSITION_MATRIX, -0.3);

  const LegR = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.26, radiusBottom: 0.24, height: 0.55, color: GOLD,
  });
  LIBS.translateX(LegR.POSITION_MATRIX, 0.45);
  LIBS.translateY(LegR.POSITION_MATRIX, -1.05);

  const FootR = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BROWN });
  LIBS.translateY(FootR.POSITION_MATRIX, -0.3);

  // ===== TAIL =====
  const TailBase = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    radiusTop: 0.15, radiusBottom: 0.18, height: 1.8, color: BROWN,
  });
  LIBS.translateY(TailBase.POSITION_MATRIX, -0.8);
  LIBS.translateZ(TailBase.POSITION_MATRIX, -0.9);
  LIBS.rotateX(TailBase.POSITION_MATRIX, -2.1);

  const TailBolt = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
    width: 1.1, height: 2.0, thickness: 0.08, color: GOLD,
  });
  LIBS.translateY(TailBolt.POSITION_MATRIX, 1.0);
  LIBS.translateZ(TailBolt.POSITION_MATRIX, -0.1);
  LIBS.rotateX(TailBolt.POSITION_MATRIX, 1);

  // ===== SPARKS =====
  const SPARK_COUNT = 10;
  const Sparks = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    const s = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.1, ry: 0.1, rz: 0.1, color: SOFT_YEL,
    });
    LIBS.translateX(s.POSITION_MATRIX, 1.0 + Math.random() * 0.6);
    LIBS.translateY(s.POSITION_MATRIX, 1.0 + Math.random() * 0.6);
    LIBS.translateZ(s.POSITION_MATRIX, 0.2 + Math.random() * 0.3);
    Sparks.push({ node: s, seed: Math.random() * 100, side: i % 2 === 0 ? -1 : 1 });
  }

  // ===== HIERARCHY =====
  EarL.childs.push(EarTipL);
  EarR.childs.push(EarTipR);
  ArmL.childs.push(HandL);
  ArmR.childs.push(HandR);
  LegL.childs.push(FootL);
  LegR.childs.push(FootR);
  TailBase.childs.push(TailBolt);
  EyeL.childs.push(EyeHL_L);
  EyeR.childs.push(EyeHL_R);

  Head.childs.push(EyeL, EyeR, CheekL, CheekR, Smile, Tongue, EarL, EarR);
  Sparks.forEach(s => Head.childs.push(s.node));

  Body.childs.push(Belly, Head, ArmL, ArmR, LegL, LegR, TailBase);

  const Rig = new group();
  Rig.childs.push(Body);
  Rig.setup();

  // ===== ANIMATION =====
  let t = 0;
  Rig.animate = function () {
    t += 0.12;
    const legSwing = Math.sin(t) * 0.35;
    const armSwing = Math.sin(t) * 0.45;

    // Legs
    LIBS.set_I4(LegL.POSITION_MATRIX);
    LIBS.translateX(LegL.POSITION_MATRIX, -0.45);
    LIBS.translateY(LegL.POSITION_MATRIX, -1.05);
    LIBS.rotateX(LegL.POSITION_MATRIX, legSwing);

    LIBS.set_I4(LegR.POSITION_MATRIX);
    LIBS.translateX(LegR.POSITION_MATRIX, 0.45);
    LIBS.translateY(LegR.POSITION_MATRIX, -1.05);
    LIBS.rotateX(LegR.POSITION_MATRIX, -legSwing);

    // Arms
    LIBS.set_I4(ArmL.POSITION_MATRIX);
    LIBS.translateX(ArmL.POSITION_MATRIX, -0.9);
    LIBS.translateY(ArmL.POSITION_MATRIX, 0.3);
    LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.8 + armSwing);

    LIBS.set_I4(ArmR.POSITION_MATRIX);
    LIBS.translateX(ArmR.POSITION_MATRIX, 0.9);
    LIBS.translateY(ArmR.POSITION_MATRIX, 0.3);
    LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.8 - armSwing);

    // Head gentle bob
    LIBS.set_I4(Head.POSITION_MATRIX);
    LIBS.translateY(Head.POSITION_MATRIX, 1.7 + Math.sin(t * 2.0) * 0.05);

    // Tail pulse
    const pulse = 1.0 + Math.sin(t * 1.6) * 0.05;
    LIBS.set_I4(TailBolt.POSITION_MATRIX);
    LIBS.scale(TailBolt.POSITION_MATRIX, pulse, pulse, pulse);
    LIBS.translateY(TailBolt.POSITION_MATRIX, 1.0);
    LIBS.translateZ(TailBolt.POSITION_MATRIX, -0.1);
    LIBS.rotateX(TailBolt.POSITION_MATRIX, 1.0);

    // Soft sparks (orbit effect)
    Sparks.forEach((s, i) => {
      const tt = t * 0.9 + s.seed;
      const r = 0.35 + 0.18 * Math.sin(tt * 0.7);
      const ang = tt * 1.3 * s.side;

      const baseX = s.side > 0 ? 1.05 : -1.05;
      const px = baseX + Math.cos(ang) * r;
      const py = 1.05 + Math.sin(ang * 1.2) * (0.25 + 0.1 * s.side);
      const pz = 0.25 + 0.1 * Math.sin(ang * 0.8);

      const scale = 0.65 + 0.35 * Math.max(0, Math.sin(tt * 1.1));
      LIBS.set_I4(s.node.POSITION_MATRIX);
      LIBS.scale(s.node.POSITION_MATRIX, scale, scale, scale);
      LIBS.translateX(s.node.POSITION_MATRIX, px);
      LIBS.translateY(s.node.POSITION_MATRIX, py);
      LIBS.translateZ(s.node.POSITION_MATRIX, pz);
    });
  };

  return Rig;
}

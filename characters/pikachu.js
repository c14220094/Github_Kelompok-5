  import { ellipsoid } from "../base/ellipsoid.js";
  import { cylinder } from "../base/cylinder.js";
  import { lightningTail } from "../base/lightning-tail.js";
  import { group } from "../base/group.js";
  import { curve } from "../base/curve.js";
  import { ellipsoid_kepala } from "../base/ellipsoid_kepala.js";
  import { Foot } from "../base/kaki.js";

  // warna
  const YELLOW = [1.0, 0.88, 0.0];
  const YELLOW_LIGHT = [1.0, 0.92, 0.05];
  const BLACK = [0.05, 0.05, 0.05];
  const WHITE = [1.0, 1.0, 0.97];
  const BROWN = [0.42, 0.27, 0.11];
  const RED_CHEEK = [0.92, 0.16, 0.16];

  export function createPikachu(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
    // BADAN
    const Body = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.85, ry: 1.05, rz: 0.75, segments: 48, rings: 32, color: YELLOW
    });
    LIBS.set_I4(Body.POSITION_MATRIX);

    // Perut (oval terang di depan)
    const Belly = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.55, ry: 0.7, rz: 0.42, segments: 32, rings: 24, color: WHITE
    });
    LIBS.translateY(Belly.POSITION_MATRIX, -0.1);
    LIBS.translateZ(Belly.POSITION_MATRIX, 0.5);

    // KEPALA (sedikit lebih besar dari badan)
    const Head = new ellipsoid_kepala(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 1.1, ry: 1.2, rz: 1.0, segments: 48, rings: 32, color: YELLOW
    });
    LIBS.translateY(Head.POSITION_MATRIX, 1.4);

    // Moncong kecil
    const Snout = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      radiusTop: 0.08, radiusBottom: 0.28, height: 0.4, segments: 24, color: YELLOW, caps: true
    });
    LIBS.rotateX(Snout.POSITION_MATRIX, Math.PI / 2);
    LIBS.translateY(Snout.POSITION_MATRIX, -0.05);
    LIBS.translateZ(Snout.POSITION_MATRIX, 0.9);

    // Hidung titik
    const Nose = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.05, ry: 0.04, rz: 0.05, segments: 14, rings: 10, color: BLACK
    });
    LIBS.set_I4(Nose.POSITION_MATRIX);
    LIBS.translateY(Nose.POSITION_MATRIX, 0.16);
    LIBS.translateZ(Nose.POSITION_MATRIX, 0.02);

    // Mulut terbuka (silinder tipis merah tua)
    const Mouth = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      radiusTop: 0.12, radiusBottom: 0.12, height: 0.08, segments: 24, color: [0.55, 0.1, 0.1], caps: true
    });
    LIBS.rotateX(Mouth.POSITION_MATRIX, Math.PI / 2);
    LIBS.translateY(Mouth.POSITION_MATRIX, -0.18);
    LIBS.translateZ(Mouth.POSITION_MATRIX, 1.0);

    // Mata (hitam + highlight putih)
    const EyeL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.16, ry: 0.20, rz: 0.10, color: BLACK
    });
    LIBS.translateX(EyeL.POSITION_MATRIX, -0.45);
    LIBS.translateY(EyeL.POSITION_MATRIX, 0.18);
    LIBS.translateZ(EyeL.POSITION_MATRIX, 1.05);

    const EyeR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.16, ry: 0.20, rz: 0.10, color: BLACK
    });
    LIBS.translateX(EyeR.POSITION_MATRIX, 0.45);
    LIBS.translateY(EyeR.POSITION_MATRIX, 0.18);
    LIBS.translateZ(EyeR.POSITION_MATRIX, 1.05);

    const EyeHL_L = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.06, ry: 0.08, rz: 0.05, color: WHITE
    });
    LIBS.translateX(EyeHL_L.POSITION_MATRIX, -0.05);
    LIBS.translateY(EyeHL_L.POSITION_MATRIX, 0.06);
    LIBS.translateZ(EyeHL_L.POSITION_MATRIX, 0.09);

    const EyeHL_R = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.06, ry: 0.08, rz: 0.05, color: WHITE
    });
    LIBS.translateX(EyeHL_R.POSITION_MATRIX, 0.05);
    LIBS.translateY(EyeHL_R.POSITION_MATRIX, 0.06);
    LIBS.translateZ(EyeHL_R.POSITION_MATRIX, 0.09);

    // Pipi merah
    const CheekL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.28, ry: 0.28, rz: 0.15, segments: 24, rings: 16, color: RED_CHEEK
    });
    LIBS.translateX(CheekL.POSITION_MATRIX, -0.9);
    LIBS.translateY(CheekL.POSITION_MATRIX, -0.05);
    LIBS.translateZ(CheekL.POSITION_MATRIX, 0.6);
    LIBS.rotateY(CheekL.POSITION_MATRIX, -0.6);

    const CheekR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.28, ry: 0.28, rz: 0.15, segments: 24, rings: 16, color: RED_CHEEK
    });
    LIBS.translateX(CheekR.POSITION_MATRIX, 0.9);
    LIBS.translateY(CheekR.POSITION_MATRIX, -0.05);
    LIBS.translateZ(CheekR.POSITION_MATRIX, 0.6);
    LIBS.rotateY(CheekR.POSITION_MATRIX, 0.6);

    // TELINGA panjang dengan ujung hitam
    const EarL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.28, ry: 1.2, rz: 0.26, color: YELLOW_LIGHT
    });
    LIBS.translateX(EarL.POSITION_MATRIX, -0.75);
    LIBS.translateY(EarL.POSITION_MATRIX, 0.9);
    LIBS.translateZ(EarL.POSITION_MATRIX, -0.05);
    LIBS.rotateZ(EarL.POSITION_MATRIX, -0.35);
    LIBS.rotateY(EarL.POSITION_MATRIX, 0.12);

    const EarTipL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.24, ry: 0.35, rz: 0.22, color: BLACK
    });
    LIBS.translateY(EarTipL.POSITION_MATRIX, 1.05);

    const EarR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.28, ry: 1.2, rz: 0.26, color: YELLOW_LIGHT
    });
    LIBS.translateX(EarR.POSITION_MATRIX, 0.75);
    LIBS.translateY(EarR.POSITION_MATRIX, 0.9);
    LIBS.translateZ(EarR.POSITION_MATRIX, -0.05);
    LIBS.rotateZ(EarR.POSITION_MATRIX, 0.35);
    LIBS.rotateY(EarR.POSITION_MATRIX, -0.12);

    const EarTipR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.24, ry: 0.35, rz: 0.22, color: BLACK
    });
    LIBS.translateY(EarTipR.POSITION_MATRIX, 1.05);

    // Lengan
    const ArmL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.25, ry: 0.7, rz: 0.25, color: YELLOW
    });
    LIBS.translateX(ArmL.POSITION_MATRIX, -0.8);
    LIBS.translateY(ArmL.POSITION_MATRIX, 0.15);
    LIBS.translateZ(ArmL.POSITION_MATRIX, 0.1);
    LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.7);
    LIBS.rotateY(ArmL.POSITION_MATRIX, -0.35);

    const ArmTipL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.18, ry: 0.18, rz: 0.18, color: BROWN
    });
    LIBS.translateY(ArmTipL.POSITION_MATRIX, -0.7);

    const ArmR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.25, ry: 0.7, rz: 0.25, color: YELLOW
    });
    LIBS.translateX(ArmR.POSITION_MATRIX, 0.8);
    LIBS.translateY(ArmR.POSITION_MATRIX, 0.15);
    LIBS.translateZ(ArmR.POSITION_MATRIX, 0.1);
    LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.7);
    LIBS.rotateY(ArmR.POSITION_MATRIX, 0.35);

    const ArmTipR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.18, ry: 0.18, rz: 0.18, color: BROWN
    });
    LIBS.translateY(ArmTipR.POSITION_MATRIX, -0.7);

    // Kaki
    const ThighL = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.26, ry: 0.34, rz: 0.26, color: YELLOW
    });
    LIBS.translateX(ThighL.POSITION_MATRIX, -0.38);
    LIBS.translateY(ThighL.POSITION_MATRIX, -0.85);

    const LegL = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      radiusTop: 0.2, radiusBottom: 0.18, height: 0.4, color: YELLOW
    });
    LIBS.translateY(LegL.POSITION_MATRIX, -0.45);

    const FootL = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BROWN });
    LIBS.translateY(FootL.POSITION_MATRIX, -0.27);
    LIBS.translateZ(FootL.POSITION_MATRIX, 0.08);

    const ThighR = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      rx: 0.26, ry: 0.34, rz: 0.26, color: YELLOW
    });
    LIBS.translateX(ThighR.POSITION_MATRIX, 0.38);
    LIBS.translateY(ThighR.POSITION_MATRIX, -0.85);

    const LegR = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      radiusTop: 0.2, radiusBottom: 0.18, height: 0.4, color: YELLOW
    });
    LIBS.translateY(LegR.POSITION_MATRIX, -0.45);

    const FootR = new Foot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, { color: BROWN });
    LIBS.translateY(FootR.POSITION_MATRIX, -0.27);
    LIBS.translateZ(FootR.POSITION_MATRIX, 0.08);

    // Ekor: pangkal cokelat + petir kuning
    const TailBase = new cylinder(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      radiusTop: 0.10, radiusBottom: 0.12, height: 0.65, color: BROWN
    });
    LIBS.translateY(TailBase.POSITION_MATRIX, -0.75);
    LIBS.translateZ(TailBase.POSITION_MATRIX, -0.55);
    LIBS.rotateX(TailBase.POSITION_MATRIX, -2.0);

    const Tail = new lightningTail(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
      width: 0.9, height: 1.5, thickness: 0.07, color: YELLOW
    });
    LIBS.translateY(Tail.POSITION_MATRIX, 0.8);
    LIBS.translateZ(Tail.POSITION_MATRIX, -0.03);
    LIBS.rotateX(Tail.POSITION_MATRIX, 1.0);

    // HIERARKI
    EyeL.childs.push(EyeHL_L);
    EyeR.childs.push(EyeHL_R);
    Snout.childs.push(Nose);
    ArmL.childs.push(ArmTipL);
    ArmR.childs.push(ArmTipR);
    ThighL.childs.push(LegL); LegL.childs.push(FootL);
    ThighR.childs.push(LegR); LegR.childs.push(FootR);
    Head.childs.push(Snout, Mouth, EyeL, EyeR, CheekL, CheekR, EarL, EarR);
    EarL.childs.push(EarTipL);
    EarR.childs.push(EarTipR);
    TailBase.childs.push(Tail);
    Body.childs.push(Belly, Head, ArmL, ArmR, ThighL, ThighR, TailBase);

    // RIG
    const Rig = new group();
    Rig.childs.push(Body);
    Rig.setup();

    // ====== ANIMASI SEDERHANA (jalan & head-bob) ======
    let t = 0;
    Rig.animate = function () {
      t += 0.12;
      const legSwing = Math.sin(t) * 0.35;
      const armSwing = Math.sin(t) * 0.45;
      const headScale = 1.0 + Math.sin(t * 2.0) * 0.015;

      // kaki
      LIBS.set_I4(ThighL.POSITION_MATRIX);
      LIBS.translateX(ThighL.POSITION_MATRIX, -0.38);
      LIBS.translateY(ThighL.POSITION_MATRIX, -0.85);
      LIBS.rotateX(ThighL.POSITION_MATRIX, legSwing);

      LIBS.set_I4(ThighR.POSITION_MATRIX);
      LIBS.translateX(ThighR.POSITION_MATRIX, 0.38);
      LIBS.translateY(ThighR.POSITION_MATRIX, -0.85);
      LIBS.rotateX(ThighR.POSITION_MATRIX, -legSwing);

      // lengan
      LIBS.set_I4(ArmL.POSITION_MATRIX);
      LIBS.translateX(ArmL.POSITION_MATRIX, -0.8);
      LIBS.translateY(ArmL.POSITION_MATRIX, 0.15);
      LIBS.translateZ(ArmL.POSITION_MATRIX, 0.1);
      LIBS.rotateZ(ArmL.POSITION_MATRIX, -0.7 + armSwing);
      LIBS.rotateY(ArmL.POSITION_MATRIX, -0.35);

      LIBS.set_I4(ArmR.POSITION_MATRIX);
      LIBS.translateX(ArmR.POSITION_MATRIX, 0.8);
      LIBS.translateY(ArmR.POSITION_MATRIX, 0.15);
      LIBS.translateZ(ArmR.POSITION_MATRIX, 0.1);
      LIBS.rotateZ(ArmR.POSITION_MATRIX, 0.7 - armSwing);
      LIBS.rotateY(ArmR.POSITION_MATRIX, 0.35);

      // head bob (scale halus)
      LIBS.set_I4(Head.POSITION_MATRIX);
      LIBS.scale(Head.POSITION_MATRIX, headScale, headScale, headScale);
      LIBS.translateY(Head.POSITION_MATRIX, 1.4);
    };

    return Rig;
  }

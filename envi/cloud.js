import { ellipsoid } from "../base/ellipsoid.js";

export class Cloud{
  constructor(gl, prog, p, c, m, opt={}){
    this.b1 = new ellipsoid(gl, prog, p, c, m, {rx:.9*opt.scale||.9, ry:.55*(opt.scale||1), rz:.7*(opt.scale||1), color:[0.95,0.95,1]});
    this.b2 = new ellipsoid(gl, prog, p, c, m, {rx:.75*(opt.scale||1), ry:.5*(opt.scale||1), rz:.65*(opt.scale||1), color:[0.95,0.95,1]});
    this.b3 = new ellipsoid(gl, prog, p, c, m, {rx:.65*(opt.scale||1), ry:.45*(opt.scale||1), rz:.6*(opt.scale||1), color:[0.95,0.95,1]});
    LIBS.translateX(this.b1.POSITION_MATRIX, -0.4);
    LIBS.translateX(this.b3.POSITION_MATRIX,  0.5);

    this.anchor = LIBS.get_I4();
    LIBS.translateX(this.anchor, opt.x||0);
    LIBS.translateY(this.anchor, opt.y||5);
    LIBS.translateZ(this.anchor, opt.z||-6);
    this.dx=0; this.dy=0;
  }
  setDrift(dx,dy){ this.dx=dx; this.dy=dy; }
  render(parent){
    const base = LIBS.multiply(parent,this.anchor);
    const drift = LIBS.clone(base);
    LIBS.translateX(drift,this.dx); LIBS.translateY(drift,this.dy);
    this.b1.render(drift); this.b2.render(drift); this.b3.render(drift);
  }
}

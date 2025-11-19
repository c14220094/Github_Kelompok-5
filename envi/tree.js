import { cylinder } from "../base/cylinder.js";
import { ellipsoid } from "../base/ellipsoid.js";

export class Tree{
  constructor(gl, prog, p, c, m, opt={}){
    this.trunk = new cylinder(gl, prog, p, c, m, {
      radiusTop:.18, radiusBottom:.22, height:1.6,
      segments:20, color: opt.trunk||[0.4,0.25,0.1]
    });
    this.crown = new ellipsoid(gl, prog, p, c, m, {
      rx: 0.9, ry:1.2, rz:0.9, color: opt.crown||[0.1,0.6,0.2]
    });
    LIBS.translateY(this.crown.POSITION_MATRIX, 1.4);

    this.POSITION_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.POSITION_MATRIX, opt.x||0);
    LIBS.translateY(this.POSITION_MATRIX, -1.9);
    LIBS.translateZ(this.POSITION_MATRIX, opt.z||-4);

    this._p=p; this._c=c; this._m=m; this.GL=gl;
    this.sway=0;
  }
  setSway(a){ this.sway=a; }
  render(parent){
    const base = LIBS.multiply(parent,this.POSITION_MATRIX);
    // goyangkan sedikit
    const M = LIBS.clone(base); LIBS.rotateZ(M,this.sway);
    this.trunk.render(M);
    this.crown.render(M);
  }
}

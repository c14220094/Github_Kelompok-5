import { ellipsoid } from "./ellipsoid.js";
export class Foot extends ellipsoid{
  constructor(gl, prog, p, c, m, opt={}){
    super(gl, prog, p, c, m, {
      rx: .25, ry: .12, rz: .2,
      segments: 20, rings: 14,
      color: opt.color||[0.4,0.25,0.1]
    });
  }
}

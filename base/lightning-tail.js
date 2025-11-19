export class lightningTail{
  constructor(gl, prog, p, c, m, opt={}){
    this.GL=gl; this._p=p; this._c=c; this._m=m;
    const w=opt.width||1, h=opt.height||1.6, t=opt.thickness||0.08;
    const col=opt.color||[1,0.85,0];
    // zigzag petir (2D billboard)
    const path=[[-w*0.5,0],[ -w*0.1,h*0.35],[ -w*0.4,h*0.35],[ w*0.1,h*0.75],[ -w*0.1,h*0.75],[ w*0.4,h]];
    const verts=[], cols=[];
    for(let i=0;i<path.length-1;i++){
      const [x1,y1]=path[i], [x2,y2]=path[i+1];
      const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy), nx=-dy/len, ny=dx/len;
      // quad
      verts.push(x1+nx*t, y1+ny*t, 0,  x1-nx*t, y1-ny*t, 0,
                 x2+nx*t, y2+ny*t, 0,  x2-nx*t, y2-ny*t, 0);
      cols.push(...col,...col,...col,...col);
    }
    const idx=[];
    for(let i=0;i<path.length-1;i++){
      const o=i*4; idx.push(o,o+1,o+2, o+1,o+3,o+2);
    }
    const GL=gl;
    this.vb=GL.createBuffer(); GL.bindBuffer(GL.ARRAY_BUFFER,this.vb);
    GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(verts),GL.STATIC_DRAW);
    this.cb=GL.createBuffer(); GL.bindBuffer(GL.ARRAY_BUFFER,this.cb);
    GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(cols),GL.STATIC_DRAW);
    this.ib=GL.createBuffer(); GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),GL.STATIC_DRAW);
    this.count=idx.length;
    this.POSITION_MATRIX=LIBS.get_I4();
    this.childs=[];
  }
  render(parent){
    const GL=this.GL, M=LIBS.multiply(parent,this.POSITION_MATRIX);
    GL.uniformMatrix4fv(this._m,false,M);
    GL.bindBuffer(GL.ARRAY_BUFFER,this.vb); GL.vertexAttribPointer(this._p,3,GL.FLOAT,false,0,0);
    GL.bindBuffer(GL.ARRAY_BUFFER,this.cb); GL.vertexAttribPointer(this._c,3,GL.FLOAT,false,0,0);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.drawElements(GL.TRIANGLES,this.count,GL.UNSIGNED_SHORT,0);
    this.childs.forEach(ch=>ch.render(M));
  }
}

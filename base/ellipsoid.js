export class ellipsoid{
  constructor(gl, prog, posLoc, colLoc, mmLoc, opt={}){
    this.GL=gl; this._p=posLoc; this._c=colLoc; this._m=mmLoc;
    const seg = opt.segments||32, rings = opt.rings||24;
    const rx=opt.rx||1, ry=opt.ry||1, rz=opt.rz||1;
    const color = opt.color||[1,1,1];
    const verts=[], cols=[], idx=[];
    for(let i=0;i<=rings;i++){
      const v=i/rings*Math.PI;
      for(let j=0;j<=seg;j++){
        const u=j/seg*2*Math.PI;
        const x=rx*Math.sin(v)*Math.cos(u);
        const y=ry*Math.cos(v);
        const z=rz*Math.sin(v)*Math.sin(u);
        verts.push(x,y,z); cols.push(color[0],color[1],color[2]);
      }
    }
    for(let i=0;i<rings;i++){
      for(let j=0;j<seg;j++){
        const a=i*(seg+1)+j;
        const b=a+seg+1;
        idx.push(a,b,a+1, b,a+1,b+1);
      }
    }
    const GL=gl;
    this.vb=GL.createBuffer(); GL.bindBuffer(GL.ARRAY_BUFFER,this.vb);
    GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(verts),GL.STATIC_DRAW);
    this.cb=GL.createBuffer(); GL.bindBuffer(GL.ARRAY_BUFFER,this.cb);
    GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(cols),GL.STATIC_DRAW);
    this.ib=GL.createBuffer(); GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),GL.STATIC_DRAW);
    this.count=idx.length;

    this.POSITION_MATRIX = LIBS.get_I4();
    this.childs=[];
  }
  render(parent){
    const GL=this.GL;
    const M = LIBS.multiply(parent,this.POSITION_MATRIX);
    GL.uniformMatrix4fv(this._m,false,M);
    GL.bindBuffer(GL.ARRAY_BUFFER,this.vb);
    GL.vertexAttribPointer(this._p,3,GL.FLOAT,false,0,0);
    GL.bindBuffer(GL.ARRAY_BUFFER,this.cb);
    GL.vertexAttribPointer(this._c,3,GL.FLOAT,false,0,0);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.drawElements(GL.TRIANGLES,this.count,GL.UNSIGNED_SHORT,0);
    // children
    this.childs.forEach(ch=>ch.render(M));
  }
}

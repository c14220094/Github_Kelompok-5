export class curve{
  constructor(gl, prog, posLoc, colLoc, mmLoc, opt={}){
    this.GL=gl; this._p=posLoc; this._c=colLoc; this._m=mmLoc;
    const width=opt.width||0.6, amp=opt.amplitude||0.1, thick=opt.thickness||0.04;
    const seg=opt.segments||24, color=opt.color||[0,0,0];
    const verts=[], cols=[], idx=[];
    for(let i=0;i<=seg;i++){
      const t=i/seg, x=(t-0.5)*width, y=Math.sin(t*Math.PI)*amp;
      verts.push(x, y+thick/2, 0.02,  x, y-thick/2, 0.02);
      cols.push(...color, ...color);
    }
    for(let i=0;i<seg;i++){
      const a=i*2, b=a+1, c=a+2, d=a+3;
      idx.push(a,b,c, b,d,c);
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

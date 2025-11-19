export class Ground{
  constructor(gl, prog, p, c, m, opt={}){
    this.GL=gl; this._p=p; this._c=c; this._m=m;
    const y=-2.8, col=(opt.color||[0.4,0.6,0.3]);
    const verts = new Float32Array([
      -12,y,-10, col[0],col[1],col[2],
       12,y,-10, col[0],col[1],col[2],
       12,y, 12, col[0],col[1],col[2],
      -12,y, 12, col[0],col[1],col[2],
    ]);
    const idx = new Uint16Array([0,1,2, 0,2,3]);
    const GL=gl;
    this.vb=GL.createBuffer(); GL.bindBuffer(GL.ARRAY_BUFFER,this.vb);
    GL.bufferData(GL.ARRAY_BUFFER,verts,GL.STATIC_DRAW);
    this.ib=GL.createBuffer(); GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,idx,GL.STATIC_DRAW);
    this.POSITION_MATRIX = LIBS.get_I4();
  }
  render(parent){
    const GL=this.GL, M=LIBS.multiply(parent,this.POSITION_MATRIX);
    GL.uniformMatrix4fv(this._m,false,M);
    GL.bindBuffer(GL.ARRAY_BUFFER,this.vb);
    GL.vertexAttribPointer(this._p,3,GL.FLOAT,false,24,0);
    GL.vertexAttribPointer(this._c,3,GL.FLOAT,false,24,12);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.ib);
    GL.drawElements(GL.TRIANGLES,6,GL.UNSIGNED_SHORT,0);
  }
}

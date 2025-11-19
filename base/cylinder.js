export class cylinder{
  constructor(gl, prog, posLoc, colLoc, mmLoc, opt={}){
    this.GL=gl; this._p=posLoc; this._c=colLoc; this._m=mmLoc;
    const seg=opt.segments||24;
    const rt=opt.radiusTop??0.5, rb=opt.radiusBottom??0.5, h=opt.height??1;
    const color=opt.color||[1,1,1]; const caps = opt.caps!==false;

    const verts=[], cols=[], idx=[];
    for(let i=0;i<=seg;i++){
      const u=i/seg*2*Math.PI, cu=Math.cos(u), su=Math.sin(u);
      // top ring
      verts.push(rt*cu, +h/2, rt*su); cols.push(...color);
      // bottom ring
      verts.push(rb*cu, -h/2, rb*su); cols.push(...color);
    }
    for(let i=0;i<seg;i++){
      const a=i*2, b=a+1, c=a+2, d=a+3;
      idx.push(a,b,c,  b,d,c);
    }
    // caps
    if(caps){
      const topCenter = verts.length/3; verts.push(0,h/2,0); cols.push(...color);
      const botCenter = topCenter+1;    verts.push(0,-h/2,0); cols.push(...color);
      for(let i=0;i<seg;i++){
        const a=i*2, c=i*2+2;
        idx.push(topCenter, c, a);
        idx.push(botCenter, a+1, c+1);
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
    this.childs.forEach(ch=>ch.render(M));
  }
}

// ===== WebGL helpers =====
function initWebGL(canvas){
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if(!gl){ alert("WebGL tidak didukung browser."); return null; }
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  return gl;
}
function createShader(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(sh)); gl.deleteShader(sh); return null; }
  return sh;
}
function createProgram(gl, vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(p)); return null; }
  return p;
}

// ===== mini mat4 =====
const mat4 = {
  create(){ const o=new Float32Array(16); o[0]=o[5]=o[10]=o[15]=1; return o; },
  multiply(out,a,b){
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3], a10=a[4],a11=a[5],a12=a[6],a13=a[7],
          a20=a[8],a21=a[9],a22=a[10],a23=a[11], a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    const b00=b[0],b01=b[1],b02=b[2],b03=b[3], b10=b[4],b11=b[5],b12=b[6],b13=b[7],
          b20=b[8],b21=b[9],b22=b[10],b23=b[11], b30=b[12],b31=b[13],b32=b[14],b33=b[15];
    out[0]=a00*b00+a10*b01+a20*b02+a30*b03; out[1]=a01*b00+a11*b01+a21*b02+a31*b03; out[2]=a02*b00+a12*b01+a22*b02+a32*b03; out[3]=a03*b00+a13*b01+a23*b02+a33*b03;
    out[4]=a00*b10+a10*b11+a20*b12+a30*b13; out[5]=a01*b10+a11*b11+a21*b12+a31*b13; out[6]=a02*b10+a12*b11+a22*b12+a32*b13; out[7]=a03*b10+a13*b11+a23*b12+a33*b13;
    out[8]=a00*b20+a10*b21+a20*b22+a30*b23; out[9]=a01*b20+a11*b21+a21*b22+a31*b23; out[10]=a02*b20+a12*b21+a22*b22+a32*b23; out[11]=a03*b20+a13*b21+a23*b22+a33*b23;
    out[12]=a00*b30+a10*b31+a20*b32+a30*b33; out[13]=a01*b30+a11*b31+a21*b32+a31*b33; out[14]=a02*b30+a12*b31+a22*b32+a32*b33; out[15]=a03*b30+a13*b31+a23*b32+a33*b33;
    return out;
  },
  translate(out,a,v){ const x=v[0],y=v[1],z=v[2]; if(out!==a) out.set(a);
    out[12]=a[0]*x+a[4]*y+a[8]*z+a[12]; out[13]=a[1]*x+a[5]*y+a[9]*z+a[13]; out[14]=a[2]*x+a[6]*y+a[10]*z+a[14]; out[15]=a[3]*x+a[7]*y+a[11]*z+a[15]; return out; },
  scale(out,a,v){ const x=v[0],y=v[1],z=v[2];
    out[0]=a[0]*x; out[1]=a[1]*x; out[2]=a[2]*x; out[3]=a[3]*x;
    out[4]=a[4]*y; out[5]=a[5]*y; out[6]=a[6]*y; out[7]=a[7]*y;
    out[8]=a[8]*z; out[9]=a[9]*z; out[10]=a[10]*z; out[11]=a[11]*z;
    out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15]; return out; },
  rotate(out,a,rad,axis){
    let x=axis[0],y=axis[1],z=axis[2],len=Math.hypot(x,y,z); if(!len) return null; x/=len;y/=len;z/=len;
    const s=Math.sin(rad),c=Math.cos(rad),t=1-c;
    const r00=x*x*t+c,   r01=y*x*t+z*s, r02=z*x*t-y*s,
          r10=x*y*t-z*s, r11=y*y*t+c,   r12=z*y*t+x*s,
          r20=x*z*t+y*s, r21=y*z*t-x*s, r22=z*z*t+c;
    const b00=a[0],b01=a[1],b02=a[2],b03=a[3], b10=a[4],b11=a[5],b12=a[6],b13=a[7], b20=a[8],b21=a[9],b22=a[10],b23=a[11];
    out[0]=b00*r00+b10*r01+b20*r02; out[1]=b01*r00+b11*r01+b21*r02; out[2]=b02*r00+b12*r01+b22*r02; out[3]=b03*r00+b13*r01+b23*r02;
    out[4]=b00*r10+b10*r11+b20*r12; out[5]=b01*r10+b11*r11+b21*r12; out[6]=b02*r10+b12*r11+b22*r12; out[7]=b03*r10+b13*r11+b23*r12;
    out[8]=b00*r20+b10*r21+b20*r22; out[9]=b01*r20+b11*r21+b21*r22; out[10]=b02*r20+b12*r21+b22*r22; out[11]=b03*r20+b13*r21+b23*r22;
    out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15]; return out;
  },
  perspective(out,fovy,aspect,near,far){
    const f=1/Math.tan(fovy/2);
    out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
    out[4]=0; out[5]=f; out[6]=0; out[7]=0;
    out[8]=0; out[9]=0; out[10]=(far+near)/(near-far); out[11]=-1;
    out[12]=0; out[13]=0; out[14]=(2*far*near)/(near-far); out[15]=0; return out;
  },
  lookAt(out,eye,ctr,up){
    let zx=eye[0]-ctr[0], zy=eye[1]-ctr[1], zz=eye[2]-ctr[2];
    let len=Math.hypot(zx,zy,zz); zx/=len; zy/=len; zz/=len;
    let xx=up[1]*zz-up[2]*zy, xy=up[2]*zx-up[0]*zz, xz=up[0]*zy-up[1]*zx; len=Math.hypot(xx,xy,xz);
    if(len===0){ xx=1; xy=0; xz=0; } else { xx/=len; xy/=len; xz/=len; }
    let yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx;
    out[0]=xx; out[1]=yx; out[2]=zx; out[3]=0;
    out[4]=xy; out[5]=yy; out[6]=zy; out[7]=0;
    out[8]=xz; out[9]=yz; out[10]=zz; out[11]=0;
    out[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);
    out[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);
    out[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);
    out[15]=1; return out;
  },
  invert(out,a){ const m=new Float32Array(a),inv=new Float32Array(16);
    inv[0]=m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];
    inv[4]=-m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    inv[8]=m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];
    inv[12]=-m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    inv[1]=-m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];
    inv[5]=m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    inv[9]=-m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];
    inv[13]=m[0]*m[9]*m[14]-m[0]*m[10]*m[13]+m[8]*m[1]*m[14]-m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    inv[2]=m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];
    inv[6]=-m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    inv[10]=m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];
    inv[14]=-m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    inv[3]=-m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];
    inv[7]=m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    inv[11]=-m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];
    inv[15]=m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];
    let det=m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12]; det=1/det; for(let i=0;i<16;i++) out[i]=inv[i]*det; return out;
  },
  transpose(out,a){ if(out!==a) out.set(a); const t=(i,j)=>{const k=out[i];out[i]=out[j];out[j]=k;};
    t(1,4);t(2,8);t(3,12);t(6,9);t(7,13);t(11,14); return out; }
};

// ===== buffers =====
function createBuffer(gl, mesh){
  const vao = {};
  vao.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
  vao.nbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vao.nbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
  vao.ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vao.ibo);
  vao.count = mesh.indices.length;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
  return vao;
}

// ===== quadric creators =====
function createEllipsoid(rx, ry, rz, uSeg=24, vSeg=18){
  const v=[], n=[], idx=[];
  for(let i=0;i<=vSeg;i++){
    const theta=i*Math.PI/vSeg;
    for(let j=0;j<=uSeg;j++){
      const phi=j*2*Math.PI/uSeg;
      const x=Math.sin(theta)*Math.cos(phi), y=Math.cos(theta), z=Math.sin(theta)*Math.sin(phi);
      v.push(rx*x, ry*y, rz*z);
      const nx=x/rx, ny=y/ry, nz=z/rz, s=1/Math.hypot(nx,ny,nz);
      n.push(nx*s, ny*s, nz*s);
    }
  }
  const cols=uSeg+1;
  for(let i=0;i<vSeg;i++) for(let j=0;j<uSeg;j++){
    const a=i*cols+j, b=a+cols, c=b+1, d=a+1; idx.push(a,b,d, b,c,d);
  }
  return {vertices:v, normals:n, indices:idx};
}
function createCylinder(r=0.2, h=0.5, seg=20){
  const v=[],n=[],idx=[],half=h/2;
  for(let i=0;i<=seg;i++){
    const a=i*2*Math.PI/seg, x=Math.cos(a), z=Math.sin(a);
    v.push(r*x,-half,r*z); n.push(x,0,z);
    v.push(r*x, half,r*z); n.push(x,0,z);
  }
  for(let i=0;i<seg;i++){ const a=i*2,b=a+1,c=a+2,d=a+3; idx.push(a,b,d, a,d,c); }
  // caps
  const bi=v.length/3; v.push(0,-half,0); n.push(0,-1,0);
  for(let i=0;i<=seg;i++){ const a=i*2*Math.PI/seg, x=Math.cos(a), z=Math.sin(a); v.push(r*x,-half,r*z); n.push(0,-1,0); }
  for(let i=0;i<seg;i++) idx.push(bi, bi+1+i, bi+2+i);
  const ti=v.length/3; v.push(0,half,0); n.push(0,1,0);
  for(let i=0;i<=seg;i++){ const a=i*2*Math.PI/seg, x=Math.cos(a), z=Math.sin(a); v.push(r*x,half,r*z); n.push(0,1,0); }
  for(let i=0;i<seg;i++) idx.push(ti, ti+2+i, ti+1+i);
  return {vertices:v, normals:n, indices:idx};
}
function createEllipticParaboloid(a=0.15,b=0.15,height=0.3, seg=16){
  const v=[],n=[],idx=[];
  for(let i=0;i<=seg;i++){
    const t=i/seg, z=t*height, r=Math.sqrt(z/height);
    for(let j=0;j<=seg;j++){
      const ang=j*2*Math.PI/seg, x=a*r*Math.cos(ang), y=b*r*Math.sin(ang);
      v.push(x,y,z);
      const nx=-2*x/(a*a), ny=-2*y/(b*b), nz=1, s=1/Math.hypot(nx,ny,nz); n.push(nx*s,ny*s,nz*s);
    }
  }
  const cols=seg+1;
  for(let i=0;i<seg;i++) for(let j=0;j<seg;j++){
    const a0=i*cols+j,b0=a0+cols,c0=b0+1,d0=a0+1; idx.push(a0,b0,d0, b0,c0,d0);
  }
  return {vertices:v, normals:n, indices:idx};
}
function createHyperboloidOneSheet(a=0.15,b=0.15,c=0.3,height=0.5, seg=18){
  const v=[],n=[],idx=[],half=height/2;
  for(let i=0;i<=seg;i++){
    const y=-half+(i/seg)*height, radius=Math.sqrt(1+(y*y)/(c*c));
    for(let j=0;j<=seg;j++){
      const ang=j*2*Math.PI/seg, x=a*radius*Math.cos(ang), z=b*radius*Math.sin(ang);
      v.push(x,y,z);
      const nx=2*x/(a*a), ny=-2*y/(c*c), nz=2*z/(b*b), s=1/Math.hypot(nx,ny,nz);
      n.push(nx*s,ny*s,nz*s);
    }
  }
  const cols=seg+1;
  for(let i=0;i<seg;i++) for(let j=0;j<seg;j++){
    const A=i*cols+j,B=A+cols,C=B+1,D=A+1; idx.push(A,B,D, B,C,D);
  }
  return {vertices:v, normals:n, indices:idx};
}
function createHyperboloidTwoSheets(a=0.12,b=0.12,c=0.2,height=0.15, seg=18){
  const v=[],n=[],idx=[];
  for(let i=0;i<=seg;i++){
    const y=c+(i/seg)*height, radius=Math.sqrt((y*y)/(c*c)-1);
    for(let j=0;j<=seg;j++){
      const ang=j*2*Math.PI/seg, x=a*radius*Math.cos(ang), z=b*radius*Math.sin(ang);
      v.push(x,y,z);
      const nx=2*x/(a*a), ny=-2*y/(c*c), nz=2*z/(b*b), s=1/Math.hypot(nx,ny,nz);
      n.push(nx*s,ny*s,nz*s);
    }
  }
  const cols=seg+1;
  for(let i=0;i<seg;i++) for(let j=0;j<seg;j++){
    const A=i*cols+j,B=A+cols,C=B+1,D=A+1; idx.push(A,B,D, B,C,D);
  }
  return {vertices:v, normals:n, indices:idx};
}
function createCircle(radius=0.06, seg=8){
  const v=[],n=[],idx=[];
  v.push(0,0,0); n.push(0,0,1);
  for(let i=0;i<=seg;i++){ const a=i*2*Math.PI/seg; v.push(radius*Math.cos(a), radius*Math.sin(a), 0); n.push(0,0,1); }
  for(let i=1;i<=seg;i++) idx.push(0,i,i+1);
  return {vertices:v, normals:n, indices:idx};
}
// ribbon extrude (ekor)
function createCurveMesh(curvePoints, segments=24, halfWidth=0.10){
  function lerp(a,b,t){ return [a[0]*(1-t)+b[0]*t, a[1]*(1-t)+b[1]*t, a[2]*(1-t)+b[2]*t]; }
  function interp(t){ const m=(curvePoints.length-1)*t, i=Math.floor(m), f=m-i; return lerp(curvePoints[Math.max(0,i)], curvePoints[Math.min(curvePoints.length-1,i+1)], f); }
  const up=[0,1,0];
  const v=[],n=[],idx=[], pts=[];
  for(let i=0;i<=segments;i++) pts.push(interp(i/segments));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{ const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l]; };
  for(let i=0;i<pts.length;i++){
    const p=pts[i], prev=pts[Math.max(0,i-1)], next=pts[Math.min(pts.length-1,i+1)];
    let t=norm([next[0]-prev[0], next[1]-prev[1], next[2]-prev[2]]);
    let b=norm(cross(t, up)); if(Math.hypot(...b)<1e-6) b=[1,0,0];
    const L=[p[0]-halfWidth*b[0], p[1]-halfWidth*b[1], p[2]-halfWidth*b[2]];
    const R=[p[0]+halfWidth*b[0], p[1]+halfWidth*b[1], p[2]+halfWidth*b[2]];
    v.push(...L, ...R); n.push(0,1,0, 0,1,0);
    if(i<pts.length-1){ const k=i*2; idx.push(k,k+1,k+2, k+1,k+3,k+2); }
  }
  return {vertices:v, normals:n, indices:idx};
}
// garis/strip yang nempel ke permukaan ellipsoid 
function createDegenerateStripeOnEllipsoid(points, rx, ry, rz, segments=20, width=0.01, eps=0.0035){
  // Project each center to ellipsoid surface, then offset by normal*eps; ribbon width along binormal = cross(tangent, normal)
  const res=[];
  for(let i=0;i<points.length-1;i++){
    for(let t=0;t<=segments;t++){
      const f=t/segments, p0=points[i], p1=points[i+1];
      res.push([p0[0]*(1-f)+p1[0]*f, p0[1]*(1-f)+p1[1]*f, p0[2]*(1-f)+p1[2]*f]);
    }
  }
  const v=[],n=[],idx=[];
  const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  for(let i=0;i<res.length;i++){
    const p=res[i], prev=res[Math.max(0,i-1)], next=res[Math.min(res.length-1,i+1)];
    // project to ellipsoid surface along radial
    const k=1/Math.sqrt((p[0]*p[0])/(rx*rx)+(p[1]*p[1])/(ry*ry)+(p[2]*p[2])/(rz*rz));
    const s=[p[0]*k, p[1]*k, p[2]*k];
    // ellipsoid normal at s (gradient)
    let nor=[2*s[0]/(rx*rx), 2*s[1]/(ry*ry), 2*s[2]/(rz*rz)]; nor=norm(nor);
    // tangent along curve
    const tan=norm([next[0]-prev[0], next[1]-prev[1], next[2]-prev[2]]);
    // binormal along surface
    let bin=norm(cross(tan, nor)); if(Math.hypot(...bin)<1e-6) bin=[1,0,0];
    const center=[s[0]+nor[0]*eps, s[1]+nor[1]*eps, s[2]+nor[2]*eps];
    const L=[center[0]-width*bin[0], center[1]-width*bin[1], center[2]-width*bin[2]];
    const R=[center[0]+width*bin[0], center[1]+width*bin[1], center[2]+width*bin[2]];
    v.push(...L,...R); n.push(...nor, ...nor);
    if(i<res.length-1){ const k2=i*2; idx.push(k2,k2+1,k2+2, k2+1,k2+3,k2+2); }
  }
  return {vertices:v, normals:n, indices:idx};
}

function createDegenerateMesh(points, segments=16, width=0.015){
  const up=[0,1,0], v=[],n=[],idx=[], res=[];
  for(let i=0;i<points.length-1;i++) for(let t=0;t<=segments;t++){
    const f=t/segments, p0=points[i], p1=points[i+1];
    res.push([p0[0]*(1-f)+p1[0]*f, p0[1]*(1-f)+p1[1]*f, p0[2]*(1-f)+p1[2]*f]);
  }
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
  for(let i=0;i<res.length;i++){
    const p=res[i], prev=res[Math.max(0,i-1)], next=res[Math.min(res.length-1,i+1)];
    let t=norm([next[0]-prev[0],next[1]-prev[1],next[2]-prev[2]]); let b=norm(cross(t,up)); if(Math.hypot(...b)<1e-6) b=[1,0,0];
    const L=[p[0]-width*b[0],p[1]-width*b[1],p[2]-width*b[2]], R=[p[0]+width*b[0],p[1]+width*b[1],p[2]+width*b[2]];
    v.push(...L,...R); n.push(0,1,0, 0,1,0);
    if(i<res.length-1){ const k=i*2; idx.push(k,k+1,k+2, k+1,k+3,k+2); }
  }
  return {vertices:v, normals:n, indices:idx};
}
function createGround(size=60, seg=60){
  const v=[],n=[],idx=[],half=size/2,step=size/seg;
  for(let i=0;i<=seg;i++) for(let j=0;j<=seg;j++){ const x=-half+j*step, z=-half+i*step; v.push(x,0,z); n.push(0,1,0); }
  const cols=seg+1;
  for(let i=0;i<seg;i++) for(let j=0;j<seg;j++){ const a=i*cols+j,b=a+cols,c=b+1,d=a+1; idx.push(a,b,d, b,c,d); }
  return {vertices:v, normals:n, indices:idx};
}

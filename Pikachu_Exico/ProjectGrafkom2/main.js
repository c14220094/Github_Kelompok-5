// ===== Shaders =====
const vs = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uProjection, uModelView, uNormalMatrix;
varying vec3 vN; varying vec3 vP;
void main(){
  vec4 wp = uModelView * vec4(aPosition,1.0);
  gl_Position = uProjection * wp;
  vP = wp.xyz;
  vN = mat3(uNormalMatrix) * aNormal;
}
`;
const fs = `
precision mediump float;
varying vec3 vN; varying vec3 vP;
uniform vec3 uLightPos;
uniform vec3 uKa,uKd,uKs; uniform float uShiny;
void main(){
  vec3 N = normalize(vN);
  vec3 L = normalize(uLightPos - vP);
  vec3 V = normalize(-vP);
  vec3 R = reflect(-L,N);
  float lambert = max(dot(N,L), 0.0);
  float spec = pow(max(dot(R,V),0.0), uShiny);
  vec3 color = uKa + lambert*uKd + spec*uKs;
  gl_FragColor = vec4(color,1.0);
}
`;

// ===== GL state =====
let gl, prog, aPos, aNor, uProj, uMV, uNM, uLight, uKa, uKd, uKs, uSh;

// ===== Buffers =====
let ground;
let body, head, snout;
let earL, earR, earLShaft, earRShaft, earLTip, earRTip;
let upArmL, upArmR, loArmL, loArmR, handL, handR, finger;
let thighL, thighR, calfL, calfR, footL, footR, footCapL, footCapR, toe;
let tail, tailSeg, tailTip;
let cheekL, cheekR, eye, pupil, nose, mouth, backLine;

// ===== Camera & Model =====
let rotX=0, rotY=0, isAnim=true, t=0;

// tinggi badan agar telapak bawah sedikit di atas rumput
const BODY_Y = 1.34;
// anchor ekor supaya nempel (x,y,z) relatif ke pusat badan
const TAIL_ANCHOR = [0.02, -0.08, -0.58];
let TAIL_TIP_POS=[0,0,0], TAIL_TIP_DIR=[0,0,1];

const CAM_DEFAULT = { dist: 8, height: 2.4, ax: -0.22, ay: 0.0, roll: 0.0 };
let camDist=CAM_DEFAULT.dist, camH=CAM_DEFAULT.height, camAX=CAM_DEFAULT.ax, camAY=CAM_DEFAULT.ay, camRoll=CAM_DEFAULT.roll;

let dragging=false, lx=0, ly=0;

// vec helpers
const vdot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const vsub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const vlen=a=>Math.hypot(a[0],a[1],a[2]);
const vnorm=a=>{const l=vlen(a)||1; return [a[0]/l,a[1]/l,a[2]/l];};
const vcross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// ===== Helpers =====
function setMaterial(Ka,Kd,Ks,Sh){ gl.uniform3fv(uKa,Ka); gl.uniform3fv(uKd,Kd); gl.uniform3fv(uKs,Ks); gl.uniform1f(uSh,Sh); }
function setMatrices(mv){
  gl.uniformMatrix4fv(uMV,false,mv);
  const nm=mat4.create(); mat4.invert(nm,mv); mat4.transpose(nm,nm); gl.uniformMatrix4fv(uNM,false,nm);
}
function draw(buf, mv, Ka,Kd,Ks,Sh){
  gl.bindBuffer(gl.ARRAY_BUFFER, buf.vbo); gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf.nbo); gl.vertexAttribPointer(aNor,3,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(aNor);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.ibo);
  setMaterial(Ka,Kd,Ks,Sh);
  setMatrices(mv);
  gl.drawElements(gl.TRIANGLES, buf.count, gl.UNSIGNED_SHORT, 0);
}

function init(){
  const canvas=document.getElementById('glcanvas'); canvas.width=innerWidth; canvas.height=innerHeight;
  gl=initWebGL(canvas); if(!gl) return;
  prog=createProgram(gl,vs,fs); gl.useProgram(prog);
  aPos=gl.getAttribLocation(prog,"aPosition"); aNor=gl.getAttribLocation(prog,"aNormal");
  uProj=gl.getUniformLocation(prog,"uProjection"); uMV=gl.getUniformLocation(prog,"uModelView"); uNM=gl.getUniformLocation(prog,"uNormalMatrix");
  uLight=gl.getUniformLocation(prog,"uLightPos"); uKa=gl.getUniformLocation(prog,"uKa"); uKd=gl.getUniformLocation(prog,"uKd"); uKs=gl.getUniformLocation(prog,"uKs"); uSh=gl.getUniformLocation(prog,"uShiny");

  // ===== Environment (tetap, tidak ikut rotasi WASD) =====
  ground = createBuffer(gl, createGround(60,60));

  // ===== Pikachu geometry =====
  body = createBuffer(gl, createEllipsoid(0.65,0.95,0.60,28,20));
  head = createBuffer(gl, createEllipsoid(0.55,0.55,0.55,24,18));
  snout= createBuffer(gl, createCylinder(0.16,0.30,18));

  // telinga
  earL = createBuffer(gl, createEllipsoid(0.18,0.42,0.18,18,14));
  earR = createBuffer(gl, createEllipsoid(0.18,0.42,0.18,18,14));
  earLShaft = createBuffer(gl, createCylinder(0.10,0.50,24));
  earRShaft = createBuffer(gl, createCylinder(0.10,0.50,24));
  earLTip = createBuffer(gl, createEllipticParaboloid(0.10,0.10,0.28,20));
  earRTip = createBuffer(gl, createEllipticParaboloid(0.10,0.10,0.28,20));

  upArmL = createBuffer(gl, createEllipsoid(0.20,0.40,0.20,16,14));
  upArmR = createBuffer(gl, createEllipsoid(0.20,0.40,0.20,16,14));
  loArmL = createBuffer(gl, createCylinder(0.14,0.36,16));
  loArmR = createBuffer(gl, createCylinder(0.14,0.36,16));
  handL  = createBuffer(gl, createEllipsoid(0.22,0.14,0.18,14,12));
  handR  = createBuffer(gl, createEllipsoid(0.22,0.14,0.18,14,12));
  finger = createBuffer(gl, createCircle(0.06,6));

  thighL = createBuffer(gl, createEllipsoid(0.30,0.48,0.30,16,14));
  thighR = createBuffer(gl, createEllipsoid(0.30,0.48,0.30,16,14));
  calfL  = createBuffer(gl, createCylinder(0.22,0.45,16));
  calfR  = createBuffer(gl, createCylinder(0.22,0.45,16));
  footL  = createBuffer(gl, createEllipsoid(0.35,0.16,0.23,16,14));
  footR  = createBuffer(gl, createEllipsoid(0.35,0.16,0.23,16,14));
  footCapL = createBuffer(gl, createHyperboloidTwoSheets(0.12,0.12,0.20,0.15,16));
  footCapR = createBuffer(gl, createHyperboloidTwoSheets(0.12,0.12,0.20,0.15,16));
  toe = createBuffer(gl, createCircle(0.05,5));

  // ===== ekor (curve & tip info)
  const tailCurve = [
    [0.00, 0.00,  0.00],
    [0.35, 0.15, -0.20],
    [-0.25,0.30, -0.45],
    [0.45, 0.45, -0.65],
    [0.10, 0.55, -0.90]
  ];
  tail    = createBuffer(gl, createCurveMesh(tailCurve, 32, 0.10));
  tailSeg = createBuffer(gl, createHyperboloidOneSheet(0.10,0.10,0.25,0.36,18));
  tailTip = createBuffer(gl, createEllipticParaboloid(0.15,0.15,0.30,24));
  // simpan posisi & arah ujung agar tip bisa align dengan tangent
  const pA = tailCurve[tailCurve.length-2], pB = tailCurve[tailCurve.length-1];
  TAIL_TIP_POS = pB;
  TAIL_TIP_DIR = vnorm( vsub(pB, pA) );

  cheekL = createBuffer(gl, createEllipsoid(0.28,0.22,0.16,14,12));
  cheekR = createBuffer(gl, createEllipsoid(0.28,0.22,0.16,14,12));
  eye    = createBuffer(gl, createEllipsoid(0.11,0.14,0.11,14,12));
  pupil  = createBuffer(gl, createEllipsoid(0.06,0.08,0.06,12,10));
  nose   = createBuffer(gl, createEllipsoid(0.04,0.04,0.04,10,8));
  // mulut (lokal) – ditempel via transform ke ujung moncong
  mouth  = createBuffer(gl, createDegenerateMesh(
    [[-0.06,-0.02,0.000],[0.00,-0.04,0.015],[0.06,-0.02,0.000]], 14, 0.008));

  // GARIS PUNGGUNG: proyeksi ke ellipsoid agar nempel (rx,ry,rz = body)
  backLine = createBuffer(gl, createDegenerateStripeOnEllipsoid(
    [[0,0.45,-0.65],[0,0.05,-0.55],[0,-0.25,-0.45],[0,-0.60,-0.35]],
    0.65,0.95,0.60, 22, 0.010, 0.0035
  ));

  // events
  window.addEventListener('resize',()=>{canvas.width=innerWidth;canvas.height=innerHeight;gl.viewport(0,0,canvas.width,canvas.height);});
  document.addEventListener('keydown',onKey);
  canvas.addEventListener('mousedown',e=>{dragging=true; lx=e.clientX; ly=e.clientY;});
  canvas.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const dx=e.clientX-lx, dy=e.clientY-ly;
    camAY += dx*0.01; camAX += dy*0.01;
    camAX = Math.max(-Math.PI/3, Math.min(Math.PI/3, camAX));
    lx=e.clientX; ly=e.clientY;
  });
  canvas.addEventListener('mouseup',()=> dragging=false);

  requestAnimationFrame(render);
}

function onKey(e){
  const k=e.key.toLowerCase();
  if(k==='w') rotX -= 0.10;
  else if(k==='s') rotX += 0.10;
  else if(k==='a') rotY -= 0.10;
  else if(k==='d') rotY += 0.10;
  else if(k==='q') camRoll -= 0.05;
  else if(k==='e') camRoll += 0.05;
  else if(k==='f'){ camRoll = 0; camAX=CAM_DEFAULT.ax; camAY=CAM_DEFAULT.ay; }
  else if(k===' ') isAnim = !isAnim;
  else if(k==='r'){ rotX=rotY=0; camDist=CAM_DEFAULT.dist; camH=CAM_DEFAULT.height; camAX=CAM_DEFAULT.ax; camAY=CAM_DEFAULT.ay; camRoll=CAM_DEFAULT.roll; }
}

function render(ms){
  t = ms*0.001;
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  // ===== Kamera
  const projection = mat4.create();
  mat4.perspective(projection, 45*Math.PI/180, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
  gl.uniformMatrix4fv(uProj, false, projection);

  const cx = camDist*Math.sin(camAY)*Math.cos(camAX);
  const cy = camH + camDist*Math.sin(camAX);
  const cz = camDist*Math.cos(camAY)*Math.cos(camAX);
  const view = mat4.create();
  mat4.lookAt(view, [cx,cy,cz], [0,BODY_Y,0], [0,1,0]);
  mat4.rotate(view, view, camRoll, [0,0,1]);
  gl.uniform3fv(uLight, new Float32Array([8,12,8]));

  // ===== Environment 
  const mvGround = mat4.create();
  draw(ground, mat4.multiply(mvGround, view, mat4.create()), [0.26,0.46,0.22],[0.34,0.79,0.36],[0.08,0.08,0.08], 10.0);

  
  const model = mat4.create(); mat4.rotate(model, model, rotX, [1,0,0]); mat4.rotate(model, model, rotY, [0,1,0]);

  // ===== Body
  const bodyM = mat4.create(); mat4.multiply(bodyM, model, bodyM);
  mat4.translate(bodyM, bodyM, [0, BODY_Y, 0]);
  if(isAnim){ const s = 1.0 + 0.03*Math.sin(t*2.0); mat4.scale(bodyM, bodyM, [s,s,s]); }
  draw(body, mat4.multiply(mat4.create(), view, bodyM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 24);

  // ===== Head
  const headM = mat4.create(); mat4.multiply(headM, bodyM, headM);
  mat4.translate(headM, headM, [0, 1.05, 0]);
  draw(head, mat4.multiply(mat4.create(), view, headM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 24);

  // snout (cylinder)
  const snoutM = mat4.create(); mat4.multiply(snoutM, headM, snoutM);
  mat4.translate(snoutM, snoutM, [0,-0.15,0.48]); mat4.rotate(snoutM, snoutM, Math.PI/2, [1,0,0]);
  draw(snout, mat4.multiply(mat4.create(), view, snoutM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);

  // ===== Ears
  const eL = mat4.create(); mat4.multiply(eL, headM, eL);
  mat4.translate(eL, eL, [-0.22,0.52,-0.02]); mat4.rotate(eL, eL, -Math.PI/12, [1,0,0]);
  draw(earL, mat4.multiply(mat4.create(), view, eL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const eLS = mat4.create(); mat4.multiply(eLS, eL, eLS); mat4.translate(eLS, eLS, [0,0.25,0]); mat4.rotate(eLS, eLS, Math.PI/2, [1,0,0]);
  draw(earLShaft, mat4.multiply(mat4.create(), view, eLS), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const eLT = mat4.create(); mat4.multiply(eLT, eL, eLT); mat4.translate(eLT, eLT, [0,0.49,0]); mat4.rotate(eLT, eLT, Math.PI/2.15, [1,0,0]);
  draw(earLTip, mat4.multiply(mat4.create(), view, eLT), [0.02,0.02,0.02],[0.02,0.02,0.02],[0.25,0.25,0.25], 28);

  const eR = mat4.create(); mat4.multiply(eR, headM, eR);
  mat4.translate(eR, eR, [0.22,0.52,-0.02]); mat4.rotate(eR, eR, -Math.PI/12, [1,0,0]);
  draw(earR, mat4.multiply(mat4.create(), view, eR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const eRS = mat4.create(); mat4.multiply(eRS, eR, eRS); mat4.translate(eRS, eRS, [0,0.25,0]); mat4.rotate(eRS, eRS, Math.PI/2, [1,0,0]);
  draw(earRShaft, mat4.multiply(mat4.create(), view, eRS), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const eRT = mat4.create(); mat4.multiply(eRT, eR, eRT); mat4.translate(eRT, eRT, [0,0.49,0]); mat4.rotate(eRT, eRT, Math.PI/2.15, [1,0,0]);
  draw(earRTip, mat4.multiply(mat4.create(), view, eRT), [0.02,0.02,0.02],[0.02,0.02,0.02],[0.25,0.25,0.25], 28);

  // ===== Wajah
  const putEye = (x)=>{ const m=mat4.create(); mat4.multiply(m, headM, m); mat4.translate(m,m,[x,0.10,0.46]); return m; };
  const putPupil = (x)=>{ const m=mat4.create(); mat4.multiply(m, headM, m); mat4.translate(m,m,[x,0.10,0.52]); return m; };
  draw(eye,   mat4.multiply(mat4.create(), view, putEye(-0.16)), [0.1,0.1,0.1],[0.05,0.05,0.05],[0.2,0.2,0.2], 24);
  draw(eye,   mat4.multiply(mat4.create(), view, putEye( 0.16)), [0.1,0.1,0.1],[0.05,0.05,0.05],[0.2,0.2,0.2], 24);
  draw(pupil, mat4.multiply(mat4.create(), view, putPupil(-0.16)), [0.02,0.02,0.02],[0.02,0.02,0.02],[0.3,0.3,0.3], 24);
  draw(pupil, mat4.multiply(mat4.create(), view, putPupil( 0.16)), [0.02,0.02,0.02],[0.02,0.02,0.02],[0.3,0.3,0.3], 24);
  draw(nose,  mat4.multiply(mat4.create(), view, ( ()=>{const m=mat4.create(); mat4.multiply(m, headM, m); mat4.translate(m,m,[0,-0.02,0.50]); return m;} )()), [0.08,0.08,0.08],[0.08,0.08,0.08],[0.2,0.2,0.2], 18);

  // MULUT nempel di ujung moncong
  const mouthM = mat4.create(); mat4.multiply(mouthM, headM, mouthM);
  mat4.translate(mouthM, mouthM, [0, -0.11, 0.63]);
  draw(mouth, mat4.multiply(mat4.create(), view, mouthM), [0.62,0.22,0.22],[0.92,0.32,0.32],[0.1,0.1,0.1], 12);

  draw(cheekL,mat4.multiply(mat4.create(), view, ( ()=>{const m=mat4.create(); mat4.multiply(m, headM, m); mat4.translate(m,m,[-0.31,-0.01,0.44]); return m;} )()), [0.68,0.14,0.14],[0.92,0.22,0.22],[0.1,0.1,0.1], 12);
  draw(cheekR,mat4.multiply(mat4.create(), view, ( ()=>{const m=mat4.create(); mat4.multiply(m, headM, m); mat4.translate(m,m,[ 0.31,-0.01,0.44]); return m;} )()), [0.68,0.14,0.14],[0.92,0.22,0.22],[0.1,0.1,0.1], 12);

  // ===== Tangan
  const upL = mat4.create(); mat4.multiply(upL, bodyM, upL); mat4.translate(upL, upL, [-0.55,0.50,0.15]);
  draw(upArmL, mat4.multiply(mat4.create(), view, upL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const loL = mat4.create(); mat4.multiply(loL, upL, loL); mat4.translate(loL, loL, [0,-0.35,0.10]); mat4.rotate(loL, loL, Math.PI/3, [1,0,0]);
  draw(loArmL, mat4.multiply(mat4.create(), view, loL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const handLM = mat4.create(); mat4.multiply(handLM, loL, handLM); mat4.translate(handLM, handLM, [0, -0.20, 0.08]);
  draw(handL,  mat4.multiply(mat4.create(), view, handLM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const fingerLM = mat4.create(); mat4.multiply(fingerLM, handLM, fingerLM); mat4.translate(fingerLM, fingerLM, [0,0,0.12]); mat4.rotate(fingerLM, fingerLM, Math.PI/2,[1,0,0]);
  draw(finger, mat4.multiply(mat4.create(), view, fingerLM), [0.95,0.95,0.95],[0.95,0.95,0.95],[0.2,0.2,0.2], 1);

  const upR = mat4.create(); mat4.multiply(upR, bodyM, upR); mat4.translate(upR, upR, [0.55,0.50,0.15]);
  draw(upArmR, mat4.multiply(mat4.create(), view, upR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const loR = mat4.create(); mat4.multiply(loR, upR, loR); mat4.translate(loR, loR, [0,-0.35,0.10]); mat4.rotate(loR, loR, Math.PI/3, [1,0,0]);
  draw(loArmR, mat4.multiply(mat4.create(), view, loR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const handRM = mat4.create(); mat4.multiply(handRM, loR, handRM); mat4.translate(handRM, handRM, [0, -0.20, 0.08]);
  draw(handR,  mat4.multiply(mat4.create(), view, handRM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const fingerRM = mat4.create(); mat4.multiply(fingerRM, handRM, fingerRM); mat4.translate(fingerRM, fingerRM, [0,0,0.12]); mat4.rotate(fingerRM, fingerRM, Math.PI/2,[1,0,0]);
  draw(finger, mat4.multiply(mat4.create(), view, fingerRM), [0.95,0.95,0.95],[0.95,0.95,0.95],[0.2,0.2,0.2], 1);

  // ===== Kaki
  const thL = mat4.create(); mat4.multiply(thL, bodyM, thL); mat4.translate(thL, thL, [-0.24,-0.58,0.08]);
  draw(thighL, mat4.multiply(mat4.create(), view, thL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const caL  = mat4.create(); mat4.multiply(caL, thL, caL); mat4.translate(caL, caL, [0,-0.33,0.06]);
  draw(calfL,  mat4.multiply(mat4.create(), view, caL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const ftL  = mat4.create(); mat4.multiply(ftL, caL, ftL); mat4.translate(ftL, ftL, [0,-0.24,0.17]);
  draw(footL,  mat4.multiply(mat4.create(), view, ftL), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const capL = mat4.create(); mat4.multiply(capL, ftL, capL); mat4.rotate(capL, capL, Math.PI/2, [1,0,0]); mat4.translate(capL, capL, [0,0.06,0]);
  draw(footCapL, mat4.multiply(mat4.create(), view, capL), [0.95,0.90,0.76],[0.95,0.90,0.76],[0.2,0.2,0.2], 10);
  const toesL= mat4.create(); mat4.multiply(toesL, ftL, toesL); mat4.translate(toesL, toesL, [0,0,0.22]); mat4.rotate(toesL, toesL, Math.PI/2,[1,0,0]);
  draw(toe, mat4.multiply(mat4.create(), view, toesL), [0.95,0.95,0.95],[0.95,0.95,0.95],[0.2,0.2,0.2], 1);

  const thR = mat4.create(); mat4.multiply(thR, bodyM, thR); mat4.translate(thR, thR, [0.24,-0.58,0.08]);
  draw(thighR, mat4.multiply(mat4.create(), view, thR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const caR  = mat4.create(); mat4.multiply(caR, thR, caR); mat4.translate(caR, caR, [0,-0.33,0.06]);
  draw(calfR,  mat4.multiply(mat4.create(), view, caR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const ftR  = mat4.create(); mat4.multiply(ftR, caR, ftR); mat4.translate(ftR, ftR, [0,-0.24,0.17]);
  draw(footR,  mat4.multiply(mat4.create(), view, ftR), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.35,0.35,0.35], 18);
  const capR = mat4.create(); mat4.multiply(capR, ftR, capR); mat4.rotate(capR, capR, Math.PI/2, [1,0,0]); mat4.translate(capR, capR, [0,0.06,0]);
  draw(footCapR, mat4.multiply(mat4.create(), view, capR), [0.95,0.90,0.76],[0.95,0.90,0.76],[0.2,0.2,0.2], 10);
  const toesR= mat4.create(); mat4.multiply(toesR, ftR, toesR); mat4.translate(toesR, toesR, [0,0,0.22]); mat4.rotate(toesR, toesR, Math.PI/2,[1,0,0]);
  draw(toe, mat4.multiply(mat4.create(), view, toesR), [0.95,0.95,0.95],[0.95,0.95,0.95],[0.2,0.2,0.2], 1);

  // ===== Ekor
  const seg = mat4.create(); mat4.multiply(seg, bodyM, seg);
  mat4.translate(seg, seg, TAIL_ANCHOR);
  mat4.rotate(seg, seg, Math.PI/2,[1,0,0]);
  draw(tailSeg, mat4.multiply(mat4.create(), view, seg), [0.65,0.48,0.18],[0.75,0.55,0.20],[0.1,0.1,0.1], 10);

  const tailM = mat4.create(); mat4.multiply(tailM, bodyM, tailM);
  mat4.translate(tailM, tailM, TAIL_ANCHOR);
  draw(tail, mat4.multiply(mat4.create(), view, tailM), [0.98,0.88,0.18],[0.98,0.88,0.18],[0.2,0.2,0.2], 10);

  // ===== Ujung ekor hitam 
  const tip = mat4.create(); mat4.multiply(tip, tailM, tip);
  mat4.translate(tip, tip, TAIL_TIP_POS);
  // rotasi agar sumbu +Z sejajar tangent
  const zaxis=[0,0,1], dir=TAIL_TIP_DIR.slice();
  let axis = vcross(zaxis, dir); let axisLen = vlen(axis);
  if(axisLen<1e-6){ axis=[1,0,0]; axisLen=1; }
  axis=[axis[0]/axisLen,axis[1]/axisLen,axis[2]/axisLen];
  const ang = Math.acos( clamp(vdot(zaxis, dir), -1, 1) );
  mat4.rotate(tip, tip, ang, axis);
  // selipkan sedikit ke dalam agar sambungan rapi
  mat4.translate(tip, tip, [-dir[0]*0.015, -dir[1]*0.015, -dir[2]*0.015]);
  // skala kecil biar meruncing halus
  mat4.scale(tip, tip, [0.95,0.95,0.95]);
  draw(tailTip, mat4.multiply(mat4.create(), view, tip), [0.02,0.02,0.02],[0.02,0.02,0.02],[0.25,0.25,0.25], 24);

  // ===== Garis punggung (menempel ke badan)
  draw(backLine, mat4.multiply(mat4.create(), view, bodyM), [0.35,0.2,0.1],[0.45,0.25,0.12],[0.1,0.1,0.1], 10);

  requestAnimationFrame(render);
}

window.onload = init;

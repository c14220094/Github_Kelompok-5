// === SETUP DASAR ===
const canvas = document.getElementById('glCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');
if (!gl) alert('WebGL tidak didukung!');

// === SHADER ===
const vsSource = `
attribute vec3 aPosition;      // Posisi vertex
attribute vec3 aNormal;        // Normal vertex
uniform mat4 uModelMatrix;     // Matriks transformasi model
uniform mat4 uViewMatrix;      // Matriks view (kamera)
uniform mat4 uProjectionMatrix; // Matriks proyeksi
uniform mat4 uNormalMatrix;    // Matriks untuk normal
varying vec3 vNormal;          // Normal diteruskan ke fragment shader
varying vec3 vPosition;        // Posisi diteruskan ke fragment shader
void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}`;

const fsSource = `
precision mediump float;
uniform vec3 uColor;           // Warna objek
uniform vec3 uLightPosition;   // Posisi cahaya
varying vec3 vNormal;           // Normal interpolasi
varying vec3 vPosition;         // Posisi interpolasi
void main() {
    vec3 normal = normalize(vNormal);                     // Normalisasi
    vec3 lightDir = normalize(uLightPosition - vPosition); // Arah cahaya
    float ambientStrength = 0.4;                          // Kekuatan cahaya ambient
    vec3 ambient = ambientStrength * uColor;             // Hitung ambient
    float diff = max(dot(normal, lightDir), 0.0);        // Hitung diffuse
    vec3 diffuse = 0.6 * diff * uColor;
    gl_FragColor = vec4(ambient + diffuse, 1.0);         // Warna akhir
}`;
// === KOMPILE SHADER ===
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

const vs = compileShader(vsSource, gl.VERTEX_SHADER);
const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);


const locs = {
    aPosition: gl.getAttribLocation(prog, 'aPosition'),
    aNormal: gl.getAttribLocation(prog, 'aNormal'),
    uModelMatrix: gl.getUniformLocation(prog, 'uModelMatrix'),
    uViewMatrix: gl.getUniformLocation(prog, 'uViewMatrix'),
    uProjectionMatrix: gl.getUniformLocation(prog, 'uProjectionMatrix'),
    uNormalMatrix: gl.getUniformLocation(prog, 'uNormalMatrix'),
    uColor: gl.getUniformLocation(prog, 'uColor'),
    uLightPosition: gl.getUniformLocation(prog, 'uLightPosition')
};

// === MATRIKS DASAR ===
function identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}
function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    return new Float32Array([
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far+near)/(near-far), -1,
        0, 0, (2*far*near)/(near-far), 0
    ]);
}
function lookAt(eye, center) {
    const z = [eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]];
    const zl = Math.hypot(...z); z[0]/=zl; z[1]/=zl; z[2]/=zl;
    const x = [z[1], -z[0], 0];
    const xl = Math.hypot(x[0], x[1]); x[0]/=xl; x[1]/=xl;
    const y = [z[1]*x[2]-z[2]*x[1], z[2]*x[0]-z[0]*x[2], z[0]*x[1]-z[1]*x[0]];
    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
        -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
        -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
    ]);
}

function translate(m, v) {
    const out = new Float32Array(m);
    out[12] += v[0];
    out[13] += v[1];
    out[14] += v[2];
    return out;
}
function rotateY(m, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const out = new Float32Array(m);
    out[0]=m[0]*c-m[8]*s; out[8]=m[0]*s+m[8]*c;
    out[1]=m[1]*c-m[9]*s; out[9]=m[1]*s+m[9]*c;
    out[2]=m[2]*c-m[10]*s; out[10]=m[2]*s+m[10]*c;
    return out;
}

// === BUFFER UTILITY ===
function createBuf(geom) {
    const pb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pb);
    gl.bufferData(gl.ARRAY_BUFFER, geom.vertices, gl.STATIC_DRAW);
    const nb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb);
    gl.bufferData(gl.ARRAY_BUFFER, geom.normals, gl.STATIC_DRAW);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);
    return {p: pb, n: nb, i: ib, c: geom.indices.length};
}

// === GEOMETRI RUMPUT ===
function createGround(size) {
    const half = size / 2;
    const vertices = new Float32Array([
        -half, 0, -half,
         half, 0, -half,
         half, 0,  half,
        -half, 0,  half
    ]);
    const normals = new Float32Array([0,1,0, 0,1,0, 0,1,0, 0,1,0]);
    const indices = new Uint16Array([0,1,2, 0,2,3]);
    return { vertices, normals, indices };
}

// === KONSTRUKSI OBJEK ===
// Pisahkan environment dan Pichu
const ground = {
    b: createBuf(createGround(10)),
    col: [0.13, 0.55, 0.13],
    pos: [0, 0, 0],
    rot: [0, 0, 0]
};
const pichuObjects = pichuParts.map(p => ({
    b: createBuf(p.geom),
    col: p.col,
    pos: p.pos,
    rot: p.rot
}));

// === KAMERA DAN KONTROL ===
let rotY = 0;
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// === DRAW ===
function draw() {
    if (keys['a']) rotY -= 0.03;
    if (keys['d']) rotY += 0.03;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(prog);

    const proj = perspective(0.78, canvas.width / canvas.height, 0.1, 100);
    const view = lookAt([0, 2.5, 6], [0, 1, 0]);

    gl.uniformMatrix4fv(locs.uProjectionMatrix, false, proj);
    gl.uniformMatrix4fv(locs.uViewMatrix, false, view);
    gl.uniform3fv(locs.uLightPosition, [5, 10, 5]);

    // === GAMBAR RUMPUT (tidak ikut rotasi) ===
    let m = identity();
    gl.uniformMatrix4fv(locs.uModelMatrix, false, m);
    gl.uniformMatrix4fv(locs.uNormalMatrix, false, m);
    gl.uniform3fv(locs.uColor, ground.col);
    gl.bindBuffer(gl.ARRAY_BUFFER, ground.b.p);
    gl.vertexAttribPointer(locs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locs.aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, ground.b.n);
    gl.vertexAttribPointer(locs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locs.aNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground.b.i);
    gl.drawElements(gl.TRIANGLES, ground.b.c, gl.UNSIGNED_SHORT, 0);

    // === GAMBAR PICHU 
    pichuObjects.forEach(p => {
    let m = identity();
    m = translate(m, p.pos); // pindahkan ke posisi Pichu
    m = rotateY(m, rotY);    // rotasi di tempatnya sendiri

    gl.uniformMatrix4fv(locs.uModelMatrix, false, m);
    gl.uniformMatrix4fv(locs.uNormalMatrix, false, m);
    gl.uniform3fv(locs.uColor, p.col);

    gl.bindBuffer(gl.ARRAY_BUFFER, p.b.p);
    gl.vertexAttribPointer(locs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locs.aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, p.b.n);
    gl.vertexAttribPointer(locs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locs.aNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.b.i);
    gl.drawElements(gl.TRIANGLES, p.b.c, gl.UNSIGNED_SHORT, 0);
});


    requestAnimationFrame(draw);
}

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
};

// === WARNA LANGIT ===
gl.clearColor(0.53, 0.81, 0.92, 1);
gl.viewport(0, 0, canvas.width, canvas.height);
draw();

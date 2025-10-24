function createEllipsoid(rx, ry, rz) {
    const vertices = []; // posisi titik (x, y, z)
    const normals = [];  // arah normal permukaan (untuk pencahayaan)
    const indices = [];  // hubungan antar titik membentuk segitiga
    const segments = 20; // tingkat detail (semakin besar semakin halus)

    for (let lat = 0; lat <= segments; lat++) {
        const theta = lat * Math.PI / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        for (let lon = 0; lon <= segments; lon++) {
            const phi = lon * 2 * Math.PI / segments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            
            vertices.push(rx * x, ry * y, rz * z);
            normals.push(x, y, z);
        }
    }
    
    for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            const first = lat * (segments + 1) + lon;
            const second = first + segments + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

function createCylinder(radiusTop, radiusBottom, height) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const segments = 20;
    const halfHeight = height / 2;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta);
        const z = Math.sin(theta);
        
        vertices.push(radiusTop * x, halfHeight, radiusTop * z);
        normals.push(x, 0, z);
        vertices.push(radiusBottom * x, -halfHeight, radiusBottom * z);
        normals.push(x, 0, z);
    }
    
    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2);
        indices.push(a + 1, a + 3, a + 2);
    }
    
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

function createHyperboloid(scale) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const segments = 20;
    const heightSegments = 16;
    
    for (let i = 0; i <= heightSegments; i++) {
        const v = i / heightSegments;
        const y = (v - 0.5) * 2 * scale;
        const radius = Math.sqrt(1 + y * y) * 0.5 * scale;
        
        for (let j = 0; j <= segments; j++) {
            const u = j / segments;
            const theta = u * Math.PI * 2;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            
            vertices.push(x, y, z);
            
            const nx = Math.cos(theta) / Math.sqrt(1 + y * y);
            const ny = -y / Math.sqrt(1 + y * y);
            const nz = Math.sin(theta) / Math.sqrt(1 + y * y);
            normals.push(nx, ny, nz);
        }
    }
    
    for (let i = 0; i < heightSegments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + segments + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }
    
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

function createEllipticParaboloid(scale) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const segments = 20;
    const radialSegments = 16;
    
    for (let i = 0; i <= radialSegments; i++) {
        const r = i / radialSegments;
        const y = r * r * scale;
        
        for (let j = 0; j <= segments; j++) {
            const theta = (j / segments) * Math.PI * 2;
            const x = r * Math.cos(theta) * scale;
            const z = r * Math.sin(theta) * scale;
            
            vertices.push(x, y, z);
            
            const dydx = 2 * r * Math.cos(theta);
            const dydz = 2 * r * Math.sin(theta);
            const len = Math.sqrt(dydx * dydx + 1 + dydz * dydz);
            normals.push(-dydx / len, 1 / len, -dydz / len);
        }
    }
    
    for (let i = 0; i < radialSegments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + segments + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }
    
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

const pichuParts = [
// Daftar  bagian tubuh Pichu 

// Col = Warna 
// Pos = Posisi
// Rot = Rotasi
    // --- KEPALA ---
    {geom: createEllipsoid(0.5, 0.5, 0.45), col: [1, 0.85, 0], pos: [0, 1.8, 0], rot: [0, 0, 0]}, 
    // Kepala utama, bentuk ellipsoid (bola lonjong).

    // --- HIDUNG ---
    {geom: createCylinder(0.03, 0.03, 0.05), col: [0.55, 0.27, 0.07], pos: [0, 1.75, 0.45], rot: [1.57, 0, 0]}, 
    // Silinder kecil sebagai hidung, warna coklat gelap,

    // --- MATA (bagian hitam) ---
    {geom: createEllipsoid(0.08, 0.12, 0.08), col: [0, 0, 0], pos: [-0.18, 1.85, 0.35], rot: [0, 0, 0]}, 
    {geom: createEllipsoid(0.08, 0.12, 0.08), col: [0, 0, 0], pos: [0.18, 1.85, 0.35], rot: [0, 0, 0]},
    // Dua ellipsoid kecil  hitam, untuk  mata.

    // --- PUPIL (bagian putih refleksi mata) ---
    {geom: createEllipsoid(0.03, 0.04, 0.03), col: [1, 2, 1], pos: [-0.16, 1.9, 0.38], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.05, 0.05, 0.05), col: [1, 1, 1], pos: [0.2, 1.9, 0.40], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.05, 0.05, 0.05), col: [1, 1, 1], pos: [-0.2, 1.9, 0.40], rot: [0, 0, 0]},
    // Ellipsoid putih di atas mata hitam .

    // --- PIPI (Kantong listrik merah) ---
    {geom: createEllipsoid(0.12, 0.12, 0.08), col: [1, 0.41, 0.71], pos: [-0.42, 1.7, 0.2], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.12, 0.12, 0.08), col: [1, 0.41, 0.71], pos: [0.42, 1.7, 0.2], rot: [0, 0, 0]},
    // Dua elipsoid pipi merah muda, posisi di sisi wajah.

    

    // --- TELINGA (bentuk hyperboloid & paraboloid) ---
    {geom: createHyperboloid(0.40), col: [1, 0.84, 0], pos: [-0.35, 2.2, 0], rot: [0, 0, 0.52]},
    {geom: createHyperboloid(0.40), col: [1, 0.84, 0], pos: [0.35, 2.2, 0], rot: [0, 0, 0.52]},
    // Hyperboloid  digunakan untuk bagian bawah telinga agar tampak melengkung runcing.


    {geom: createEllipticParaboloid(0.35), col: [0, 0, 0], pos: [-0.35, 2.5, 0], rot: [3.14, 0, 0]},
    {geom: createEllipticParaboloid(0.35), col: [0, 0, 0], pos: [0.35, 2.5, 0], rot: [3.14, 0, 0]},
    // Paraboloid hitam di ujung telinga,
    // --- BADAN ---
    {geom: createEllipsoid(0.45, 0.5, 0.4), col: [1, 0.84, 0], pos: [0, 1, 0], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.2, 0.2, 0.15), col: [0, 0, 0], pos: [0, 1.35, 0], rot: [0, 0, 0]},



    // Badan utama berbentuk ellipsoid besar, warna kuning seperti kepala.

    // --- TANGAN KIRI ---
    {geom: createEllipsoid(0.12, 0.2, 0.12), col: [1, 0.84, 0], pos: [-0.5, 1.2, 0], rot: [0, 0, 0]},
    {geom: createCylinder(0.08, 0.08, 0.25), col: [1, 0.84, 0], pos: [-0.55, 0.9, 0], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.1, 0.08, 0.1), col: [1, 0.84, 0], pos: [-0.55, 0.75, 0], rot: [0, 0, 0]},
    // Kombinasi ellipsoid dan cylinder untuk lengan & tangan kiri.

    // --- TANGAN KANAN ---
    {geom: createEllipsoid(0.12, 0.2, 0.12), col: [1, 0.84, 0], pos: [0.5, 1.2, 0], rot: [0, 0, 0]},
    {geom: createCylinder(0.08, 0.08, 0.25), col: [1, 0.84, 0], pos: [0.55, 0.9, 0], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.1, 0.08, 0.1), col: [1, 0.84, 0], pos: [0.55, 0.75, 0], rot: [0, 0, 0]},
    // Sama seperti tangan kiri, tapi di sisi kanan.

    // --- KAKI KIRI ---
    {geom: createEllipsoid(0.15, 0.2, 0.15), col: [1, 0.84, 0], pos: [-0.2, 0.7, 0], rot: [0, 0, 0]},
    {geom: createCylinder(0.1, 0.1, 0.3), col: [1, 0.84, 0], pos: [-0.2, 0.35, 0], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.15, 0.08, 0.2), col: [1, 0.84, 0], pos: [-0.2, 0.15, 0.1], rot: [0, 0, 0]},
    // Kaki kiri — ellipsoid untuk paha, cylinder untuk betis, ellipsoid untuk telapak.

    // --- JARI KAKI KIRI ---
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [-0.25, 0.12, 0.25], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [-0.2, 0.12, 0.28], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [-0.15, 0.12, 0.25], rot: [0, 0, 0]},
    // Tiga bola kecil (ellipsoid) untuk jari kaki kiri.

    // --- KAKI KANAN ---
    {geom: createEllipsoid(0.15, 0.2, 0.15), col: [1, 0.84, 0], pos: [0.2, 0.7, 0], rot: [0, 0, 0]},
    {geom: createCylinder(0.1, 0.1, 0.3), col: [1, 0.84, 0], pos: [0.2, 0.35, 0], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.15, 0.08, 0.2), col: [1, 0.84, 0], pos: [0.2, 0.15, 0.1], rot: [0, 0, 0]},
    // Struktur sama seperti kaki kiri, tapi di sisi kanan.

    // --- JARI KAKI KANAN ---
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [0.15, 0.12, 0.25], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [0.2, 0.12, 0.28], rot: [0, 0, 0]},
    {geom: createEllipsoid(0.04, 0.04, 0.04), col: [1, 0.84, 0], pos: [0.25, 0.12, 0.25], rot: [0, 0, 0]},
    // Tiga bola kecil untuk jari kanan.

    // --- EKOR ---
    {geom: createCylinder(0.08, 0.06, 0.6), col: [1, 0.84, 0], pos: [0, 1, -0.3], rot: [0.78, 0, 0]},
    

    {geom: createEllipsoid(0.15, 0.2, 0.05), col: [0, 0, 0], pos: [0, 0.5, -0.4], rot: [0, 0, 0]}
    // Ellipsoid hitam di ujung ekor, membentuk ujung petir khas Pichu.
];

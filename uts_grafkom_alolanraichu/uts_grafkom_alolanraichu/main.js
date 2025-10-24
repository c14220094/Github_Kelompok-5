// ============================================
// COLOR PALETTE
// ============================================
const COLORS = {
    BODY_MAIN:            [0.73, 0.48, 0.25],
    BODY_LIGHT:           [0.82, 0.58, 0.35],
    BODY_DARK:            [0.60, 0.38, 0.18],
    
    BELLY_WHITE:          [0.98, 0.98, 0.96],
    STRIPE_WHITE:         [0.96, 0.96, 0.94],
    FEET_WHITE:           [0.97, 0.97, 0.95],
    
    EAR_YELLOW:           [0.98, 0.85, 0.18],
    EAR_TIP:              [0.95, 0.75, 0.12],
    CHEEK_YELLOW:         [1.0, 0.88, 0.22],
    
    EYE_BLUE:             [0.28, 0.62, 0.92],
    EYE_HIGHLIGHT:        [0.88, 0.94, 1.0],
    
    EAR_INNER:            [0.45, 0.28, 0.15],
    NOSE_BROWN:           [0.30, 0.18, 0.10],
    TAIL_LIGHTNING:       [0.98, 0.88, 0.25],
    TAIL_BASE:            [0.70, 0.46, 0.24],
};

// ============================================
// ENVIRONMENT COLORS
// ============================================
const ENV_COLORS = {
    GROUND:               [0.34, 0.52, 0.28],
    GRASS:                [0.28, 0.62, 0.32],
    TREE_TRUNK:           [0.55, 0.35, 0.20],
    TREE_FOLIAGE:         [0.22, 0.55, 0.18],
    SKY:                  [0.85, 0.92, 0.98],
};

let g_angleX = -Math.PI / 8, g_angleY = Math.PI / 6, g_isDragging = false;
let g_lastMouseX = 0, g_lastMouseY = 0;
let g_zoom = -11.0, g_targetZoom = -11.0;
let g_rotVelocityX = 0, g_rotVelocityY = 0;

window.onload = main;

function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl', { antialias: true });
    if (!gl) { alert('WebGL tidak didukung.'); return; }
    
    const programInfo = setupShaderProgram(gl);
    const buffers = initBuffers(gl);
    setupMouseHandlers(canvas);
    
    function render() {
        resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawScene(gl, programInfo, buffers);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function setupMouseHandlers(canvas) {
    let lastTime = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        g_isDragging = true;
        g_lastMouseX = e.clientX;
        g_lastMouseY = e.clientY;
        g_rotVelocityX = 0;
        g_rotVelocityY = 0;
        lastTime = performance.now();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!g_isDragging) return;
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        
        const deltaX = e.clientX - g_lastMouseX;
        const deltaY = e.clientY - g_lastMouseY;
        
        g_angleY += deltaX * 0.005;
        g_angleX += deltaY * 0.005;
        g_angleX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, g_angleX));
        
        g_rotVelocityY = deltaX * 0.02 / dt;
        g_rotVelocityX = deltaY * 0.02 / dt;
        
        g_lastMouseX = e.clientX;
        g_lastMouseY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', () => { g_isDragging = false; });
    canvas.addEventListener('mouseleave', () => { g_isDragging = false; });
    
    canvas.addEventListener('wheel', (e) => {
        g_targetZoom -= e.deltaY * 0.01;
        g_targetZoom = Math.min(-4, Math.max(-20, g_targetZoom));
        e.preventDefault();
    });
}

function setupShaderProgram(gl) {
    const vsSource = document.getElementById('vertex-shader').textContent;
    const fsSource = document.getElementById('fragment-shader').textContent;
    
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Gagal link shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uPMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uMVMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNMatrix'),
        },
    };
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Error kompilasi shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initBuffers(gl) {
    const model = createCompleteScene();
    return {
        position: createAndBindBuffer(gl, new Float32Array(model.vertices), gl.ARRAY_BUFFER),
        normal: createAndBindBuffer(gl, new Float32Array(model.normals), gl.ARRAY_BUFFER),
        color: createAndBindBuffer(gl, new Float32Array(model.colors), gl.ARRAY_BUFFER),
        indices: createAndBindBuffer(gl, new Uint16Array(model.indices), gl.ELEMENT_ARRAY_BUFFER),
        vertexCount: model.indices.length,
    };
}

function createAndBindBuffer(gl, data, target) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buffer;
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(ENV_COLORS.SKY[0], ENV_COLORS.SKY[1], ENV_COLORS.SKY[2], 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const fieldOfView = 40 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);
    
    const modelViewMatrix = mat4.create();
    g_zoom += (g_targetZoom - g_zoom) * 0.1;
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, -0.8, g_zoom]);
    
    if (!g_isDragging) {
        g_angleY += g_rotVelocityY * 0.001;
        g_angleX += g_rotVelocityX * 0.001;
        g_rotVelocityY *= 0.95;
        g_rotVelocityX *= 0.95;
    }
    
    mat4.rotate(modelViewMatrix, modelViewMatrix, g_angleX, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, g_angleY, [0, 1, 0]);
    
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    
    gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

// ============================================
// ENVIRONMENT FUNCTIONS
// ============================================

function createGroundPlane() {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const groundColor = ENV_COLORS.GROUND;
    const gridSize = 40;
    const spacing = 0.5;
    
    for (let z = 0; z <= gridSize; z++) {
        for (let x = 0; x <= gridSize; x++) {
            vertices.push(
                (x - gridSize / 2) * spacing,
                -1.35,
                (z - gridSize / 2) * spacing
            );
            normals.push(0, 1, 0);
            
            const variation = 0.92 + Math.sin(x * 0.5) * 0.06 + Math.cos(z * 0.5) * 0.06;
            colors.push(
                groundColor[0] * variation,
                groundColor[1] * variation,
                groundColor[2] * variation
            );
        }
    }
    
    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const a = z * (gridSize + 1) + x;
            const b = a + 1;
            const c = a + gridSize + 1;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    return { vertices, normals, colors, indices };
}

function createGrassCluster(basePos) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const grassColor = ENV_COLORS.GRASS;
    const numBlades = 12;
    const bladeHeight = 0.15;
    
    for (let i = 0; i < numBlades; i++) {
        const angle = (i / numBlades) * Math.PI * 2;
        const x = basePos[0] + Math.cos(angle) * 0.08;
        const z = basePos[2] + Math.sin(angle) * 0.08;
        
        vertices.push(x, basePos[1], z);
        normals.push(Math.cos(angle), 0.2, Math.sin(angle));
        colors.push(...grassColor);
        
        vertices.push(
            x + Math.cos(angle) * 0.05,
            basePos[1] + bladeHeight,
            z + Math.sin(angle) * 0.05
        );
        normals.push(Math.cos(angle), 0.7, Math.sin(angle));
        colors.push(grassColor[0] * 0.8, grassColor[1] * 0.8, grassColor[2] * 0.8);
        
        const base = i * 2;
        const next = ((i + 1) % numBlades) * 2;
        
        indices.push(base, base + 1, next);
        indices.push(next, base + 1, next + 1);
    }
    
    return { vertices, normals, colors, indices };
}

function createTreeTrunk(baseX, baseZ, height = 0.8, radius = 0.12) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const segments = 8;
    const trunkColor = ENV_COLORS.TREE_TRUNK;
    
    for (let h = 0; h <= 8; h++) {
        const currentHeight = (h / 8) * height;
        const currentRadius = radius * (1 - h / 20);
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            
            vertices.push(
                baseX + Math.cos(angle) * currentRadius,
                -1.35 + currentHeight,
                baseZ + Math.sin(angle) * currentRadius
            );
            
            normals.push(
                Math.cos(angle),
                0.2,
                Math.sin(angle)
            );
            
            colors.push(...trunkColor);
        }
    }
    
    for (let h = 0; h < 8; h++) {
        for (let i = 0; i < segments; i++) {
            const a = h * segments + i;
            const b = a + 1;
            let bIdx = b;
            if (b % segments === 0) bIdx = h * segments;
            
            const c = a + segments;
            const d = c + 1;
            let dIdx = d;
            if (d % segments === 0) dIdx = (h + 1) * segments;
            
            indices.push(a, c, bIdx);
            indices.push(bIdx, c, dIdx);
        }
    }
    
    return { vertices, normals, colors, indices };
}

function createTreeFoliage(baseX, baseZ, height = 0.8) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const foliageColor = ENV_COLORS.TREE_FOLIAGE;
    const foliagePos = -1.35 + height + 0.15;
    
    for (let i = 0; i < 3; i++) {
        const offsetY = i * 0.18;
        const scaleRadius = 0.35 - i * 0.08;
        
        const vertexStart = vertices.length / 3;
        const sphereSegments = 12;
        
        for (let lat = 0; lat <= sphereSegments; lat++) {
            const phi = (lat / sphereSegments) * Math.PI;
            for (let lon = 0; lon <= sphereSegments; lon++) {
                const theta = (lon / sphereSegments) * Math.PI * 2;
                
                vertices.push(
                    baseX + scaleRadius * Math.sin(phi) * Math.cos(theta),
                    foliagePos + offsetY + scaleRadius * Math.cos(phi),
                    baseZ + scaleRadius * Math.sin(phi) * Math.sin(theta)
                );
                
                normals.push(
                    Math.sin(phi) * Math.cos(theta),
                    Math.cos(phi),
                    Math.sin(phi) * Math.sin(theta)
                );
                
                const colorVar = 0.85 + Math.random() * 0.15;
                colors.push(
                    foliageColor[0] * colorVar,
                    foliageColor[1] * colorVar,
                    foliageColor[2] * colorVar
                );
            }
        }
        
        for (let lat = 0; lat < sphereSegments; lat++) {
            for (let lon = 0; lon < sphereSegments; lon++) {
                const first = vertexStart + lat * (sphereSegments + 1) + lon;
                const second = first + sphereSegments + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
    }
    
    return { vertices, normals, colors, indices };
}

function createCompleteTree(baseX, baseZ) {
    let vertices = [];
    let normals = [];
    let colors = [];
    let indices = [];
    let vertexOffset = 0;
    
    function appendModel(model) {
        vertices.push(...model.vertices);
        normals.push(...model.normals);
        colors.push(...model.colors);
        model.indices.forEach(i => indices.push(i + vertexOffset));
        vertexOffset += model.vertices.length / 3;
    }
    
    const trunk = createTreeTrunk(baseX, baseZ, 0.8, 0.12);
    const foliage = createTreeFoliage(baseX, baseZ, 0.8);
    
    appendModel(trunk);
    appendModel(foliage);
    
    return { vertices, normals, colors, indices };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function createSmoothSphere(radius, latSegments, lonSegments, colorMain, colorAlt = null) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    for (let lat = 0; lat <= latSegments; lat++) {
        const phi = (lat / latSegments) * Math.PI;
        for (let lon = 0; lon <= lonSegments; lon++) {
            const theta = (lon / lonSegments) * Math.PI * 2;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            vertices.push(x, y, z);
            normals.push(x / radius, y / radius, z / radius);
            
            if (colorAlt && lat > latSegments / 2) {
                colors.push(...colorAlt);
            } else {
                colors.push(...colorMain);
            }
        }
    }
    
    for (let lat = 0; lat < latSegments; lat++) {
        for (let lon = 0; lon < lonSegments; lon++) {
            const first = lat * (lonSegments + 1) + lon;
            const second = first + lonSegments + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    
    return { vertices, normals, colors, indices };
}

function createEarSpiralRibbon(color) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const spiralTurns = 2.5;
    const spiralPoints = 32;
    
    for (let i = 0; i <= spiralPoints; i++) {
        const t = i / spiralPoints;
        const angle = t * Math.PI * 2 * spiralTurns;
        const x = Math.cos(angle) * (0.3 - t * 0.05);
        const y = t * 0.7 - 0.35;
        const z = Math.sin(angle) * (0.3 - t * 0.05);
        
        vertices.push(x, y, z);
        normals.push(1, 0, 0);
        colors.push(...color);
    }
    
    for (let i = 0; i < spiralPoints; i++) {
        indices.push(i, i + 1, i + 1);
    }
    
    return { vertices, normals, colors, indices };
}

function createSolidLightningBoltSurfboard(colorBright, colorDim) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const zigzagPoints = [
        [0.0, 0.0],
        [0.4, 0.3],
        [-0.2, 0.6],
        [0.5, 1.0],
        [-0.3, 1.3],
        [0.3, 1.6],
        [-0.1, 1.9],
        [0.2, 2.0]
    ];
    
    const thickness = 0.4;
    
    for (let segment = 0; segment < zigzagPoints.length - 1; segment++) {
        const p1 = zigzagPoints[segment];
        const p2 = zigzagPoints[segment + 1];
        
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len;
        const ny = dx / len;
        
        const baseIdx = vertices.length / 3;
        
        for (let w = -1; w <= 1; w += 2) {
            vertices.push(p1[0] + nx * thickness * w, p1[1], p1[2] || 0);
            normals.push(0, 0, 1);
            colors.push(...(segment % 2 === 0 ? colorBright : colorDim));
            
            vertices.push(p2[0] + nx * thickness * w, p2[1], p2[2] || 0);
            normals.push(0, 0, 1);
            colors.push(...(segment % 2 === 0 ? colorBright : colorDim));
        }
        
        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        indices.push(baseIdx + 2, baseIdx + 1, baseIdx + 3);
    }
    
    return { vertices, normals, colors, indices };
}

function transformModel(model, matrix) {
    const transformed = {
        vertices: [],
        normals: [],
        colors: [...model.colors],
        indices: [...model.indices]
    };
    
    for (let i = 0; i < model.vertices.length; i += 3) {
        const pos = vec3.fromValues(model.vertices[i], model.vertices[i + 1], model.vertices[i + 2]);
        vec3.transformMat4(pos, pos, matrix);
        transformed.vertices.push(pos[0], pos[1], pos[2]);
        
        const norm = vec3.fromValues(model.normals[i], model.normals[i + 1], model.normals[i + 2]);
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, matrix);
        mat4.transpose(normalMatrix, normalMatrix);
        vec3.transformMat4(norm, norm, normalMatrix);
        vec3.normalize(norm, norm);
        transformed.normals.push(norm[0], norm[1], norm[2]);
    }
    
    return transformed;
}

// ============================================
// ALOLAN RAICHU MODEL
// ============================================

function createAlolanRaichuGeometry() {
    let vertices = [], normals = [], colors = [], indices = [];
    let vertexOffset = 0;
    
    function appendModel(model, transformMatrix = null) {
        let finalModel = model;
        if (transformMatrix) {
            finalModel = transformModel(finalModel, transformMatrix);
        }
        
        vertices.push(...finalModel.vertices);
        normals.push(...finalModel.normals);
        colors.push(...finalModel.colors);
        finalModel.indices.forEach(i => indices.push(i + vertexOffset));
        vertexOffset += finalModel.vertices.length / 3;
    }
    
    let m;
    
    // =========================================
    // BODY
    // =========================================
    m = mat4.create();
    mat4.translate(m, m, [0, 0.4, 0]);
    mat4.scale(m, m, [1.05, 1.1, 0.95]);
    appendModel(createSmoothSphere(1.0, 32, 32, COLORS.BODY_MAIN, COLORS.BODY_LIGHT), m);
    
    // =========================================
    // BELLY
    // =========================================
    m = mat4.create();
    mat4.translate(m, m, [0, 0.28, 0.88]);
    mat4.scale(m, m, [0.76, 0.90, 0.18]);
    appendModel(createSmoothSphere(1.0, 28, 28, COLORS.BELLY_WHITE), m);
    
    m = mat4.create();
    mat4.translate(m, m, [0, 0.22, 0.78]);
    mat4.scale(m, m, [0.82, 0.86, 0.25]);
    appendModel(createSmoothSphere(1.0, 24, 24, COLORS.BELLY_WHITE), m);
    
    m = mat4.create();
    mat4.translate(m, m, [0, -0.12, 0.82]);
    mat4.scale(m, m, [0.68, 0.62, 0.20]);
    appendModel(createSmoothSphere(1.0, 20, 20, COLORS.BELLY_WHITE), m);
    
    // =========================================
    // BACK STRIPES
    // =========================================
    const stripePositions = [
        [0, 0.68, -0.88, 0.60, 0.14],
        [0, 0.10, -0.90, 0.54, 0.13]
    ];
    
    for (let stripe of stripePositions) {
        m = mat4.create();
        mat4.translate(m, m, [stripe[0], stripe[1], stripe[2]]);
        mat4.scale(m, m, [stripe[3], stripe[4], 0.06]);
        appendModel(createSmoothSphere(1.0, 16, 16, COLORS.STRIPE_WHITE), m);
    }
    
    // =========================================
    // HEAD
    // =========================================
    m = mat4.create();
    mat4.translate(m, m, [0, 1.75, 0.08]);
    mat4.scale(m, m, [0.82, 0.85, 0.78]);
    appendModel(createSmoothSphere(1.0, 32, 32, COLORS.BODY_MAIN, COLORS.BODY_LIGHT), m);
    
    m = mat4.create();
    mat4.translate(m, m, [0, 1.12, 0.08]);
    mat4.scale(m, m, [0.68, 0.48, 0.68]);
    appendModel(createSmoothSphere(1.0, 20, 20, COLORS.BODY_MAIN), m);
    
    // =========================================
    // EARS
    // =========================================
    for (let s of [-1, 1]) {
        m = mat4.create();
        mat4.translate(m, m, [0.50 * s, 2.50, 0.0]);
        mat4.rotateZ(m, m, s * 0.20);
        mat4.rotateY(m, m, s * 0.10);
        mat4.scale(m, m, [0.28, 1.10, 0.22]);
        appendModel(createSmoothSphere(1.0, 32, 32, COLORS.EAR_YELLOW), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.51 * s, 2.48, 0.25]);
        mat4.rotateZ(m, m, s * 0.20);
        mat4.rotateY(m, m, s * 0.10);
        mat4.scale(m, m, [0.26, 0.26, 1.0]);
        appendModel(createEarSpiralRibbon(COLORS.EAR_INNER), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.44 * s, 2.08, 0.04]);
        mat4.scale(m, m, [0.24, 0.26, 0.22]);
        appendModel(createSmoothSphere(1.0, 16, 16, COLORS.EAR_YELLOW), m);
    }
    
    // =========================================
    // EYES
    // =========================================
    for (let s of [-1, 1]) {
        m = mat4.create();
        mat4.translate(m, m, [0.30 * s, 1.80, 0.72]);
        mat4.scale(m, m, [0.17, 0.20, 0.10]);
        appendModel(createSmoothSphere(1.0, 20, 20, [1.0, 1.0, 1.0]), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.30 * s, 1.80, 0.78]);
        mat4.scale(m, m, [0.13, 0.16, 0.04]);
        appendModel(createSmoothSphere(1.0, 18, 18, COLORS.EYE_BLUE), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.30 * s, 1.82, 0.81]);
        mat4.scale(m, m, [0.06, 0.08, 0.02]);
        appendModel(createSmoothSphere(1.0, 12, 12, [0.08, 0.08, 0.08]), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.33 * s, 1.86, 0.82]);
        mat4.scale(m, m, [0.035, 0.035, 0.01]);
        appendModel(createSmoothSphere(1.0, 10, 10, COLORS.EYE_HIGHLIGHT), m);
    }
    
    // =========================================
    // NOSE
    // =========================================
    m = mat4.create();
    mat4.translate(m, m, [0, 1.65, 0.82]);
    mat4.scale(m, m, [0.09, 0.07, 0.05]);
    appendModel(createSmoothSphere(1.0, 12, 12, COLORS.NOSE_BROWN), m);
    
    // =========================================
    // CHEEKS
    // =========================================
    for (let s of [-1, 1]) {
        m = mat4.create();
        mat4.translate(m, m, [0.64 * s, 1.52, 0.52]);
        mat4.scale(m, m, [0.28, 0.28, 0.15]);
        appendModel(createSmoothSphere(1.0, 20, 20, COLORS.CHEEK_YELLOW), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.68 * s, 1.60, 0.58]);
        mat4.scale(m, m, [0.07, 0.07, 0.03]);
        appendModel(createSmoothSphere(1.0, 10, 10, [1.0, 1.0, 0.88]), m);
    }
    
    // =========================================
    // ARMS
    // =========================================
    for (let s of [-1, 1]) {
        m = mat4.create();
        mat4.translate(m, m, [0.88 * s, 0.62, 0.22]);
        mat4.rotateZ(m, m, s * 0.35);
        mat4.scale(m, m, [0.24, 0.42, 0.22]);
        appendModel(createSmoothSphere(1.0, 20, 20, COLORS.BODY_MAIN, COLORS.BODY_DARK), m);
        
        m = mat4.create();
        mat4.translate(m, m, [1.25 * s, 0.28, 0.22]);
        mat4.rotateZ(m, m, s * 0.22);
        mat4.scale(m, m, [0.38, 0.20, 0.20]);
        appendModel(createSmoothSphere(1.0, 18, 18, COLORS.BODY_MAIN), m);
        
        m = mat4.create();
        mat4.translate(m, m, [1.62 * s, 0.22, 0.22]);
        mat4.scale(m, m, [0.22, 0.20, 0.20]);
        appendModel(createSmoothSphere(1.0, 16, 16, COLORS.FEET_WHITE), m);
    }
    
    // =========================================
    // LEGS
    // =========================================
    for (let s of [-1, 1]) {
        m = mat4.create();
        mat4.translate(m, m, [0.52 * s, -0.38, 0.32]);
        mat4.scale(m, m, [0.30, 0.42, 0.30]);
        appendModel(createSmoothSphere(1.0, 20, 20, COLORS.BODY_MAIN, COLORS.BODY_DARK), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.52 * s, -0.88, 0.38]);
        mat4.scale(m, m, [0.26, 0.25, 0.26]);
        appendModel(createSmoothSphere(1.0, 18, 18, COLORS.BODY_MAIN), m);
        
        m = mat4.create();
        mat4.translate(m, m, [0.52 * s, -1.16, 0.44]);
        mat4.scale(m, m, [0.26, 0.16, 0.32]);
        appendModel(createSmoothSphere(1.0, 16, 16, COLORS.FEET_WHITE), m);
    }
    
    // =========================================
    // SURFBOARD
    // =========================================
    m = mat4.create();
    mat4.translate(m, m, [0, -1.24, 0.44]);
    mat4.rotateY(m, m, Math.PI / 2);
    mat4.scale(m, m, [2.0, 2.4, 1.0]);
    appendModel(createSolidLightningBoltSurfboard(COLORS.TAIL_LIGHTNING, COLORS.EAR_TIP), m);
    
    // =========================================
    // TAIL
    // =========================================
    const tailSegments = 40;
    for (let i = 0; i <= tailSegments; i++) {
        const t = i / tailSegments;
        
        // Kurva tail
        const angle = t * Math.PI * 0.55;
        const x = 0;
        const y = -0.30 - t * 0.95 + Math.cos(angle) * 0.12;
        const z = -0.75 - Math.sin(angle) * 0.70;
        
        const thickness = 0.16 * Math.pow(1 - t, 0.5);
        
        m = mat4.create();
        mat4.translate(m, m, [x, y, z]);
        mat4.rotateX(m, m, -angle * 0.70);
        mat4.scale(m, m, [thickness, thickness, thickness]);
        
        const yellowMix = Math.pow(t, 0.80);
        const mixColor = [
            COLORS.BODY_MAIN[0] * (1 - yellowMix) + COLORS.TAIL_LIGHTNING[0] * yellowMix,
            COLORS.BODY_MAIN[1] * (1 - yellowMix) + COLORS.TAIL_LIGHTNING[1] * yellowMix,
            COLORS.BODY_MAIN[2] * (1 - yellowMix) + COLORS.TAIL_LIGHTNING[2] * yellowMix
        ];
        
        appendModel(createSmoothSphere(1.0, 14, 14, mixColor), m);
    }
    
    // Tail connection
    for (let i = 0; i < 10; i++) {
        const t = i / 9;
        m = mat4.create();
        mat4.translate(m, m, [0, -1.25 - t * 0.02, -1.40 + t * 0.15]);
        mat4.scale(m, m, [0.08 - t * 0.03, 0.04, 0.08 - t * 0.03]);
        appendModel(createSmoothSphere(1.0, 10, 10, COLORS.TAIL_LIGHTNING), m);
    }
    
    return { vertices, normals, colors, indices };
}

// ============================================
// COMPLETE SCENE
// ============================================

function createCompleteScene() {
    let vertices = [];
    let normals = [];
    let colors = [];
    let indices = [];
    let vertexOffset = 0;
    
    function appendModel(model) {
        vertices.push(...model.vertices);
        normals.push(...model.normals);
        colors.push(...model.colors);
        model.indices.forEach(i => indices.push(i + vertexOffset));
        vertexOffset += model.vertices.length / 3;
    }
    
    // Ground
    const ground = createGroundPlane();
    appendModel(ground);
    
    // Grass
    const grassPositions = [
        [-3.0, -1.35, 2.5],
        [-2.0, -1.35, 3.5],
        [2.5, -1.35, 3.2],
        [3.2, -1.35, 2.0],
        [-3.5, -1.35, -2.0],
        [3.5, -1.35, -2.5],
        [0, -1.35, 4.0],
        [-4.0, -1.35, 0]
    ];
    
    for (let pos of grassPositions) {
        const grass = createGrassCluster(pos);
        appendModel(grass);
    }
    
    // Trees
    const treePositions = [
        [-6.5, 3.0],
        [6.5, 3.0],
        [-7.0, -4.0],
        [7.0, -4.0]
    ];
    
    for (let pos of treePositions) {
        const tree = createCompleteTree(pos[0], pos[1]);
        appendModel(tree);
    }
    
    // Alolan Raichu
    const character = createAlolanRaichuGeometry();
    appendModel(character);
    
    return { vertices, normals, colors, indices };
}
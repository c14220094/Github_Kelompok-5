// ============================================
// GEOMETRY FUNCTIONS untuk mendefinisikan dan menyimpan bentuk-bentuk dasar yang akan digambar
// ============================================

// Smooth sphere with gradient coloring
function createSmoothSphere(radius, lats, longs, colorBottom, colorTop = null) {
    let vertices = [], normals = [], colors = [], indices = [];
    
    if (!colorTop) colorTop = colorBottom;
    
    for (let i = 0; i <= lats; i++) {
        const theta = i * Math.PI / lats;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        const t = i / lats;
        const currentColor = [
            colorBottom[0] * (1 - t) + colorTop[0] * t,
            colorBottom[1] * (1 - t) + colorTop[1] * t,
            colorBottom[2] * (1 - t) + colorTop[2] * t
        ];
        
        for (let j = 0; j <= longs; j++) {
            const phi = j * 2 * Math.PI / longs;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            
            vertices.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
            colors.push(...currentColor);
        }
    }
    
    for (let i = 0; i < lats; i++) {
        for (let j = 0; j < longs; j++) {
            const first = (i * (longs + 1)) + j;
            const second = first + longs + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    
    return { vertices, normals, colors, indices };
}

function createEarSpiralRibbon(color) {
    let vertices = [], normals = [], colors = [], indices = [];
    
    const spiralTurns = 2.5; // spiral turns
    const segments = 80; // for smoothness
    const ribbonWidth = 0.055; // Width of the spiral line
    
    // Spiral path points
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 * spiralTurns;
        const radius = 0.75 - t * 0.68; // Start outer, spiral to center
        
        // Main spiral position
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        
        // Direction for next point (tangent)
        const nextT = t + 0.01;
        const nextAngle = nextT * Math.PI * 2 * spiralTurns;
        const nextRadius = 0.75 - nextT * 0.68;
        const nx = Math.cos(nextAngle) * nextRadius;
        const ny = Math.sin(nextAngle) * nextRadius;
        
        // Tangent vector
        const tx = nx - cx;
        const ty = ny - cy;
        const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
        const tnx = tx / tLen;
        const tny = ty / tLen;
        
        // Perpendicular vector (for ribbon width)
        const px = -tny;
        const py = tnx;
        
        // Width taper - thinner toward center
        const widthScale = 0.8 + t * 0.2;
        const w = ribbonWidth * widthScale;
        
        // Create quad vertices (4 points per segment)
        const baseIdx = vertices.length / 3;
        
        // Left edge of ribbon
        vertices.push(cx - px * w, cy - py * w, 0);
        normals.push(0, 0, 1);
        colors.push(...color);
        
        // Right edge of ribbon
        vertices.push(cx + px * w, cy + py * w, 0);
        normals.push(0, 0, 1);
        colors.push(...color);
        
        // Create triangles (connect to previous segment)
        if (i > 0) {
            const prevBase = baseIdx - 2;
            
            // Triangle 1
            indices.push(prevBase, prevBase + 1, baseIdx);
            // Triangle 2
            indices.push(prevBase + 1, baseIdx + 1, baseIdx);
        }
    }
    
    // Add slight depth (back side)
    const frontVertCount = vertices.length / 3;
    const depth = -0.015;
    
    for (let i = 0; i < frontVertCount; i++) {
        vertices.push(vertices[i * 3], vertices[i * 3 + 1], depth);
        normals.push(0, 0, -1);
        colors.push(...color);
    }
    
    // Back face indices (reversed winding)
    const indexCount = indices.length;
    for (let i = 0; i < indexCount; i += 3) {
        indices.push(
            indices[i + 2] + frontVertCount,
            indices[i + 1] + frontVertCount,
            indices[i] + frontVertCount
        );
    }
    
    // Add side edges for thickness
    for (let i = 0; i < frontVertCount - 2; i += 2) {
        // Left edge side
        indices.push(i, i + frontVertCount, i + 2);
        indices.push(i + 2, i + frontVertCount, i + 2 + frontVertCount);
        
        // Right edge side
        indices.push(i + 1, i + 3, i + 1 + frontVertCount);
        indices.push(i + 3, i + 3 + frontVertCount, i + 1 + frontVertCount);
    }
    
    return { vertices, normals, colors, indices };
}



// Lightning bolt shape - accurate zigzag
function createLightningBolt(color) {
    const profile = [
        [0, 0], [0.15, 0.25], [0.08, 0.45], [0.22, 0.65],
        [0.10, 0.85], [0.28, 1.15], [0.12, 1.35], [0.35, 1.65],
        [0.15, 1.85], [0.40, 2.15], [0.10, 2.35], [0, 2.5],
        [-0.10, 2.35], [-0.40, 2.15], [-0.15, 1.85], [-0.35, 1.65],
        [-0.12, 1.35], [-0.28, 1.15], [-0.10, 0.85], [-0.22, 0.65],
        [-0.08, 0.45], [-0.15, 0.25], [0, 0]
    ];
    
    let vertices = [], normals = [], colors = [], indices = [];
    const depth = 0.15;
    const steps = 12;
    
    for (let i = 0; i < steps; i++) {
        const z = -depth / 2 + i * depth / (steps - 1);
        const bulge = 1 + 0.15 * Math.sin(i * Math.PI / (steps - 1));
        
        for (let j = 0; j < profile.length; j++) {
            const [x, y] = profile[j];
            vertices.push(x * bulge, y, z);
            
            const nx = (j < profile.length / 2) ? 0.3 : -0.3;
            const ny = 0.3;
            const nz = (i < steps / 2) ? -0.5 : 0.5;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals.push(nx / len, ny / len, nz / len);
            
            colors.push(...color);
        }
    }
    
    const profLen = profile.length;
    for (let i = 0; i < steps - 1; i++) {
        for (let j = 0; j < profLen - 1; j++) {
            const a = i * profLen + j;
            const b = a + 1;
            const c = (i + 1) * profLen + j;
            const d = c + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    
    return { vertices, normals, colors, indices };
}

// SURFBOARD TAIL
function createSolidLightningBoltSurfboard(color, colorDark) {
    let vertices = [], normals = [], colors = [], indices = [];
    
    // Lightning bolt points - SIDEWAYS (X axis is length, Z is width)
    const lightningPoints = [
        // Back section
        { x: 0.0, z: 0.0 },
        { x: 0.1, z: 0.25 },
        
        // First zigzag
        { x: 0.35, z: 0.3 },
        { x: 0.45, z: 0.15 },  // Inner point
        { x: 0.65, z: 0.2 },
        
        // Second zigzag
        { x: 0.75, z: 0.45 },  // Outer point
        { x: 1.05, z: 0.48 },
        { x: 1.15, z: 0.25 },  // Inner point
        { x: 1.45, z: 0.26 },
        
        // Narrow to tip
        { x: 1.7, z: 0.12 },
        { x: 2.0, z: 0.0 },    // Sharp tip
        
        // Other side (mirrored in Z)
        { x: 1.7, z: -0.12 },
        { x: 1.45, z: -0.26 },
        { x: 1.15, z: -0.25 },
        { x: 1.05, z: -0.48 },
        { x: 0.75, z: -0.45 },
        { x: 0.65, z: -0.2 },
        { x: 0.45, z: -0.15 },
        { x: 0.35, z: -0.3 },
        { x: 0.1, z: -0.25 }
    ];
    
    const numPoints = lightningPoints.length;
    const heightLayers = 3;
    
    // Create layers with thickness
    for (let layer = 0; layer < heightLayers; layer++) {
        const yPos = (layer / (heightLayers - 1) - 0.5) * 0.16;
        
        for (let i = 0; i < numPoints; i++) {
            const point = lightningPoints[i];
            
            vertices.push(point.x, yPos, point.z);
            
            // Normals
            const ny = layer === 0 ? -1 : (layer === heightLayers - 1 ? 1 : 0);
            normals.push(0, ny, 0);
            
            // Color gradient along length
            const lengthFactor = point.x / 2.0;
            const darken = lengthFactor * 0.18;
            colors.push(
                color[0] * (1 - darken) + colorDark[0] * darken,
                color[1] * (1 - darken) + colorDark[1] * darken,
                color[2] * (1 - darken) + colorDark[2] * darken
            );
        }
    }
    
    // Top surface
    const topLayer = (heightLayers - 1) * numPoints;
    const centerVertex = vertices.length / 3;
    
    // Center point for top
    vertices.push(1.0, 0.08, 0.0);
    normals.push(0, 1, 0);
    colors.push(...color);
    
    for (let i = 0; i < numPoints; i++) {
        const next = (i + 1) % numPoints;
        indices.push(centerVertex, topLayer + i, topLayer + next);
    }
    
    // Bottom surface
    const bottomVertex = vertices.length / 3;
    vertices.push(1.0, -0.08, 0.0);
    normals.push(0, -1, 0);
    colors.push(...color);
    
    for (let i = 0; i < numPoints; i++) {
        const next = (i + 1) % numPoints;
        indices.push(bottomVertex, next, i);
    }
    
    // Side walls
    for (let layer = 0; layer < heightLayers - 1; layer++) {
        for (let i = 0; i < numPoints; i++) {
            const next = (i + 1) % numPoints;
            
            const a = layer * numPoints + i;
            const b = layer * numPoints + next;
            const c = (layer + 1) * numPoints + i;
            const d = (layer + 1) * numPoints + next;
            
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    
    return { vertices, normals, colors, indices };
}
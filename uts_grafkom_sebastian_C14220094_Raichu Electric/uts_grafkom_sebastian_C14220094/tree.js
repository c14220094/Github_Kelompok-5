// tree.js - Class untuk pohon sederhana
export class Tree {
  constructor(gl, program, positionAttr, colorAttr, matrixUniform, options = {}) {
    this.gl = gl;
    this.program = program;
    this.positionAttribute = positionAttr;
    this.colorAttribute = colorAttr;
    this.matrixUniform = matrixUniform;

    const trunkRadius = options.trunkRadius || 0.2;
    const trunkHeight = options.trunkHeight || 1.5;
    const crownRadius = options.crownRadius || 1.0;
    const crownHeight = options.crownHeight || 2.0;
    const trunkColor = options.trunkColor || [0.4, 0.25, 0.1];
    const crownColor = options.crownColor || [0.1, 0.6, 0.2];

    const segments = 16;
    
    const trunkVertices = [];
    const trunkColors = [];
    const trunkIndices = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * trunkRadius;
      const z = Math.sin(angle) * trunkRadius;
      
      trunkVertices.push(x, 0, z);
      trunkColors.push(...trunkColor);
      
      trunkVertices.push(x, trunkHeight, z);
      trunkColors.push(...trunkColor);
    }
    
    for (let i = 0; i < segments; i++) {
      const bottom1 = i * 2;
      const bottom2 = (i + 1) * 2;
      const top1 = bottom1 + 1;
      const top2 = bottom2 + 1;
      
      trunkIndices.push(bottom1, top1, top2);
      trunkIndices.push(bottom1, top2, bottom2);
    }

    const crownVertices = [];
    const crownColors = [];
    const crownIndices = [];
    
    const crownSegments = 16;
    const crownRings = 8;
    
    for (let ring = 0; ring <= crownRings; ring++) {
      const y = (ring / crownRings) * crownHeight;
      const radius = crownRadius * (1 - ring / crownRings);
      
      for (let seg = 0; seg <= crownSegments; seg++) {
        const angle = (seg / crownSegments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        crownVertices.push(x, trunkHeight + y, z);
        crownColors.push(...crownColor);
      }
    }
    
    for (let ring = 0; ring < crownRings; ring++) {
      for (let seg = 0; seg < crownSegments; seg++) {
        const current = ring * (crownSegments + 1) + seg;
        const next = current + crownSegments + 1;
        
        crownIndices.push(current, next, current + 1);
        crownIndices.push(current + 1, next, next + 1);
      }
    }

    this.trunkVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trunkVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkVertices), gl.STATIC_DRAW);

    this.trunkColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trunkColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkColors), gl.STATIC_DRAW);

    this.trunkIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trunkIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(trunkIndices), gl.STATIC_DRAW);
    this.trunkIndexCount = trunkIndices.length;

    this.crownVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.crownVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(crownVertices), gl.STATIC_DRAW);

    this.crownColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.crownColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(crownColors), gl.STATIC_DRAW);

    this.crownIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.crownIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(crownIndices), gl.STATIC_DRAW);
    this.crownIndexCount = crownIndices.length;

    this.POSITION_MATRIX = this.getIdentityMatrix();
    this.childs = [];
  }

  getIdentityMatrix() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  render(stack) {
    const gl = this.gl;
    const currentMatrix = [...stack];

    this.multMat(this.POSITION_MATRIX, currentMatrix);
    gl.uniformMatrix4fv(this.matrixUniform, false, currentMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.trunkVertexBuffer);
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.trunkColorBuffer);
    gl.vertexAttribPointer(this.colorAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trunkIndexBuffer);
    gl.drawElements(gl.TRIANGLES, this.trunkIndexCount, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.crownVertexBuffer);
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.crownColorBuffer);
    gl.vertexAttribPointer(this.colorAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.crownIndexBuffer);
    gl.drawElements(gl.TRIANGLES, this.crownIndexCount, gl.UNSIGNED_SHORT, 0);

    for (let child of this.childs) {
      child.render(currentMatrix);
    }
  }

  multMat(a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    b[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    b[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    b[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    b[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    b[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    b[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    b[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    b[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    b[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    b[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    b[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    b[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    b[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    b[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    b[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    b[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
}
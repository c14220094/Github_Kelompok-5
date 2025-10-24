// cloud.js - Class untuk awan
export class Cloud {
  constructor(gl, program, positionAttr, colorAttr, matrixUniform, options = {}) {
    this.gl = gl;
    this.program = program;
    this.positionAttribute = positionAttr;
    this.colorAttribute = colorAttr;
    this.matrixUniform = matrixUniform;

    const color = options.color || [1.0, 1.0, 1.0]; // putih default
    const scale = options.scale || 1.0;

    // Awan dibuat dari beberapa sphere yang digabung
    const vertices = [];
    const colors = [];
    const indices = [];

    // Buat 5 sphere untuk membentuk awan
    const spheres = [
      { x: 0, y: 0, z: 0, r: 0.5 * scale },      // tengah
      { x: -0.6 * scale, y: 0.1, z: 0, r: 0.4 * scale },  // kiri
      { x: 0.6 * scale, y: 0.1, z: 0, r: 0.4 * scale },   // kanan
      { x: -0.3 * scale, y: 0.3, z: 0, r: 0.35 * scale }, // kiri atas
      { x: 0.3 * scale, y: 0.3, z: 0, r: 0.35 * scale }   // kanan atas
    ];

    const segments = 12;
    const rings = 8;
    let indexOffset = 0;

    // Generate setiap sphere
    for (let s of spheres) {
      const sphereVertices = [];
      
      // Generate vertices untuk sphere
      for (let ring = 0; ring <= rings; ring++) {
        const theta = (ring / rings) * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let seg = 0; seg <= segments; seg++) {
          const phi = (seg / segments) * Math.PI * 2;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          const x = s.x + s.r * cosPhi * sinTheta;
          const y = s.y + s.r * cosTheta;
          const z = s.z + s.r * sinPhi * sinTheta;

          vertices.push(x, y, z);
          colors.push(...color);
          sphereVertices.push({ x, y, z });
        }
      }

      // Generate indices untuk sphere
      for (let ring = 0; ring < rings; ring++) {
        for (let seg = 0; seg < segments; seg++) {
          const first = indexOffset + ring * (segments + 1) + seg;
          const second = first + segments + 1;

          indices.push(first, second, first + 1);
          indices.push(second, second + 1, first + 1);
        }
      }

      indexOffset += (rings + 1) * (segments + 1);
    }

    // Create buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.indexCount = indices.length;
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(this.colorAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

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
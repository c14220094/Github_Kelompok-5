// envi.js - Environment class untuk tanah/ground
export class Ground {
  constructor(gl, program, positionAttr, colorAttr, matrixUniform, options = {}) {
    this.gl = gl;
    this.program = program;
    this.positionAttribute = positionAttr;
    this.colorAttribute = colorAttr;
    this.matrixUniform = matrixUniform;

    const width = options.width || 10;
    const depth = options.depth || 10;
    const height = options.height || 0.2;
    const color = options.color || [0.4, 0.6, 0.3]; // hijau rumput default

    // Vertices untuk box (ground berbentuk kotak pipih)
    const vertices = [
      // Top face
      -width, height, -depth,
      width, height, -depth,
      width, height, depth,
      -width, height, depth,
      // Bottom face
      -width, 0, -depth,
      width, 0, -depth,
      width, 0, depth,
      -width, 0, depth,
    ];

    // Colors (semua vertex sama warna)
    const colors = [];
    for (let i = 0; i < 8; i++) {
      colors.push(...color);
    }

    // Indices untuk membuat faces
    const indices = [
      // Top
      0, 1, 2, 0, 2, 3,
      // Bottom
      4, 5, 6, 4, 6, 7,
      // Front
      3, 2, 6, 3, 6, 7,
      // Back
      0, 1, 5, 0, 5, 4,
      // Left
      0, 3, 7, 0, 7, 4,
      // Right
      1, 2, 6, 1, 6, 5,
    ];

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

    // Multiply with position matrix
    this.multMat(this.POSITION_MATRIX, currentMatrix);

    // Set uniform
    gl.uniformMatrix4fv(this.matrixUniform, false, currentMatrix);

    // Bind and draw
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(this.colorAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

    // Render children
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
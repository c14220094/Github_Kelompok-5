// ellipsoid.js
export class ellipsoid {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;
  OBJECT_FACES = null;

  vertex = [];
  faces = [];

  POSITION_MATRIX = LIBS.get_I4(); // Mpos
  MOVE_MATRIX     = LIBS.get_I4(); // Mmove

  childs = [];

  /**
   * @param {WebGLRenderingContext} GL
   * @param {WebGLProgram} SHADER_PROGRAM
   * @param {GLuint} _position - attribute location for position
   * @param {GLuint} _color - attribute location for color
   * @param {WebGLUniformLocation} _Mmatrix - uniform location for model matrix
   * @param {Object} opts
   *   opts.rx, opts.ry, opts.rz  : radii along x,y,z (default 1,1,1)
   *   opts.segments (longitudes) : default 36
   *   opts.rings (latitudes)     : default 24
   */
  constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, opts = {}) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._MMatrix = _Mmatrix;
    

    const rx = opts.rx ?? 1.0;
    const ry = opts.ry ?? 1.0;
    const rz = opts.rz ?? 1.0;
    const segments = Math.max(3, opts.segments ?? 36);
    const rings    = Math.max(2, opts.rings ?? 24);
    const color = opts.color ?? null; // [r,g,b] 0..1 atau null

     this.bone = {
        name: opts.name ?? "unnamed",
        position: opts.position ?? [0, 0, 0],
        rotation: opts.rotation ?? [0, 0, 0],
        scale:    opts.scale ?? [1, 1, 1],
    };


    this._buildEllipsoid(rx, ry, rz, segments, rings, color);
  }

  _buildEllipsoid(rx, ry, rz, segments, rings, color) {
    const vertices = [];
    const faces = [];

    // Generate vertices menggunakan pendekatan yang sama seperti hyperboloid-double.js
    for (let i = 0; i <= rings; i++) {
      const u = -Math.PI / 2 + (i / rings) * Math.PI; // latitude -90 to 90 degrees
      const cu = Math.cos(u);
      const su = Math.sin(u);

      for (let j = 0; j <= segments; j++) {
        const v = (j / segments) * 2 * Math.PI; // longitude 0 to 360 degrees
        const cv = Math.cos(v);
        const sv = Math.sin(v);

        // Ellipsoid parametric equations
        const x = rx * cv * cu;
        const y = ry * su;
        const z = rz * sv * cu;

        // Push position
        vertices.push(x, y, z);

        // Push color - sama seperti hyperboloid-double.js format
        if (color) {
          vertices.push(color[0], color[1], color[2]);
        } else {
          // Default color berdasarkan posisi
          vertices.push((x / (2 * rx)) + 0.5, (y / (2 * ry)) + 0.5, (z / (2 * rz)) + 0.5);
        }
      }
    }

    // Build faces - sama seperti hyperboloid-double.js
    const rowLength = segments + 1;
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const first = i * rowLength + j;
        const second = first + 1;
        const third = first + rowLength;
        const fourth = third + 1;

        // Two triangles per quad
        faces.push(first, second, fourth);
        faces.push(first, fourth, third);
      }
    }

    this.vertex = vertices;
    this.faces = faces;
  }

  updateBoneMatrix() {
  let m = LIBS.get_I4();
  LIBS.translateLocal(m, this.bone.position[0], this.bone.position[1], this.bone.position[2]);
  LIBS.rotateX(m, this.bone.rotation[0]);
  LIBS.rotateY(m, this.bone.rotation[1]);
  LIBS.rotateZ(m, this.bone.rotation[2]);
  LIBS.scale(m, this.bone.scale[0], this.bone.scale[1], this.bone.scale[2]);

  this.POSITION_MATRIX = m;
  }

  setup() {
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    this.childs.forEach(child => child.setup());
  }

  render(PARENT_MATRIX) {
  // MODEL = Parent * Position * Move
  const M = LIBS.get_I4();
  LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX); // translasi/offset lokal
  LIBS.mul(M, M, this.MOVE_MATRIX);                 // rotasi/scale lokal
  this.MODEL_MATRIX = M;

  this.GL.useProgram(this.SHADER_PROGRAM);
  this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

  this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
  this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
  this.GL.vertexAttribPointer(this._color,    3, this.GL.FLOAT, false, 24, 12);

  this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
  this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

  this.childs.forEach(child => child.render(this.MODEL_MATRIX));
}
}

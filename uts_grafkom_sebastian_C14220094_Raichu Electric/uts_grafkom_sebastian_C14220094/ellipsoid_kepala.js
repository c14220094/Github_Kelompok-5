// ellipsoid_kepala.js - Bentuk kepala custom untuk Raichu
export class ellipsoid_kepala {
  GL = null; SHADER_PROGRAM = null;
  _position = null; _color = null; _MMatrix = null;
  OBJECT_VERTEX = null; OBJECT_FACES = null;
  vertex = []; faces = [];
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();
  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, opts = {}) {
    this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
    
    const rx = opts.rx ?? 1.0;
    const ry = opts.ry ?? 1.0;
    const rz = opts.rz ?? 1.0;
    const segments = Math.max(3, opts.segments ?? 36);
    const rings = Math.max(2, opts.rings ?? 24);
    const color = opts.color ?? [1,1,1];

    this._buildEllipsoid(rx, ry, rz, segments, rings, color);
  }

  _buildEllipsoid(rx, ry, rz, segments, rings, color) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= rings; i++) {
      const u = -Math.PI / 2 + (i / rings) * Math.PI;
      const cu = Math.cos(u);
      const su = Math.sin(u);

      // --- RUMUS MODIFIKASI UNTUK BENTUK KEPALA SEMPURNA ---
      // Formula ini memipihkan bagian atas dan bawah secara berbeda
      // untuk menciptakan bentuk yang lebih bulat dan tidak menonjol.
      let squashFactor = 1.0;
      if (su < 0) { // Bagian bawah kepala
          // Dipipihkan untuk memberikan dasar yang lebih lebar
          squashFactor = 1 - Math.pow(-su, 2) * 0.2;
      } else { // Bagian atas kepala
          // Dipipihkan sedikit agar tidak terlalu menonjol/runcing
          squashFactor = 1 - Math.pow(su, 2) * 0.1;
      }

      for (let j = 0; j <= segments; j++) {
        const v = (j / segments) * 2 * Math.PI;
        const cv = Math.cos(v);
        const sv = Math.sin(v);

        const x = rx * cv * cu;
        // Terapkan 'squashFactor' pada sumbu Y untuk memodifikasi bentuk vertikal
        const y = ry * su * squashFactor;
        const z = rz * sv * cu;

        vertices.push(x, y, z);
        vertices.push(color[0], color[1], color[2]);
      }
    }

    const rowLength = segments + 1;
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const first = i * rowLength + j;
        const second = first + 1;
        const third = first + rowLength;
        const fourth = third + 1;

        faces.push(first, second, fourth);
        faces.push(first, fourth, third);
      }
    }

    this.vertex = vertices;
    this.faces = faces;
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
    const M = LIBS.get_I4();
    LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
    LIBS.mul(M, M, this.MOVE_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(this._MMatrix, false, M);

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
    this.GL.vertexAttribPointer(this._color,    3, this.GL.FLOAT, false, 24, 12);

    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    this.childs.forEach(child => child.render(M));
  }
}


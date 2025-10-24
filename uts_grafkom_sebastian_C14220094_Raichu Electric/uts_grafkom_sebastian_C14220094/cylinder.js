// TIDAK ADA IMPORT LIBS DI SINI

export class cylinder {
  GL = null; SHADER_PROGRAM = null;
  _position = null; _color = null; _MMatrix = null;
  OBJECT_VERTEX = null; OBJECT_FACES = null;
  vertex = []; faces = [];
  POSITION_MATRIX = LIBS.get_I4(); // Ini akan bekerja karena LIBS adalah variabel global
  MOVE_MATRIX = LIBS.get_I4();
  childs = [];

  /**
   * Cylinder along Y-axis (bottom at -height/2, top at +height/2)
   * opts: { radiusTop, radiusBottom, height, segments, color, caps, name, position, rotation, scale }
   */
  constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, opts = {}) {
    this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;

    const radiusTop = opts.radiusTop ?? 0.2;
    const radiusBottom = opts.radiusBottom ?? 0.2;
    const height = opts.height ?? 1.0;
    const segments = Math.max(8, opts.segments ?? 32);
    const color = opts.color ?? [1, 1, 1];
    const caps = opts.caps ?? true;

    this.bone = {
      name: opts.name ?? "cylinder",
      position: opts.position ?? [0, 0, 0],
      rotation: opts.rotation ?? [0, 0, 0],
      scale: opts.scale ?? [1, 1, 1],
    };

    this._buildCylinder({ radiusTop, radiusBottom, height, segments, color, caps });
  }

  addChild(c) { this.childs.push(c); }

  _buildCylinder({ radiusTop, radiusBottom, height, segments, color, caps }) {
    const v = [], idx = [];
    const h2 = height / 2;

    // Side vertices (alternating bottom-top)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      
      // Bottom ring (y = -h2)
      v.push(radiusBottom * cos, -h2, radiusBottom * sin, color[0], color[1], color[2]);
      // Top ring (y = +h2)
      v.push(radiusTop * cos, h2, radiusTop * sin, color[0], color[1], color[2]);
    }

    // Side faces (quads as 2 triangles)
    for (let i = 0; i < segments; i++) {
      const a = i * 2;       // bottom current
      const b = a + 2;       // bottom next
      const c = a + 1;       // top current
      const d = b + 1;       // top next
      idx.push(a, b, d, a, d, c);
    }

    if (caps) {
      // Bottom cap (facing -Y)
      const centerB = v.length / 6;
      v.push(0, -h2, 0, color[0], color[1], color[2]);
      const startB = v.length / 6;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        v.push(radiusBottom * Math.cos(angle), -h2, radiusBottom * Math.sin(angle), 
               color[0], color[1], color[2]);
      }
      for (let i = 0; i < segments; i++) {
        idx.push(startB + i + 1, startB + i, centerB);
      }

      // Top cap (facing +Y)
      const centerT = v.length / 6;
      v.push(0, h2, 0, color[0], color[1], color[2]);
      const startT = v.length / 6;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        v.push(radiusTop * Math.cos(angle), h2, radiusTop * Math.sin(angle), 
               color[0], color[1], color[2]);
      }
      for (let i = 0; i < segments; i++) {
        idx.push(centerT, startT + i, startT + i + 1);
      }
    }

    this.vertex = v;
    this.faces = idx;
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

    this.childs.forEach(c => c.setup());
  }

  render(PARENT_MATRIX) {
    const M = LIBS.get_I4();
    LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
    LIBS.mul(M, M, this.MOVE_MATRIX);
    this.MODEL_MATRIX = M;

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);

    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    this.childs.forEach(c => c.render(this.MODEL_MATRIX));
  }
}


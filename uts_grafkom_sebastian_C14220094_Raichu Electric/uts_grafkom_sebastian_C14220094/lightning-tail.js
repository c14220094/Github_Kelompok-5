// lightning-tail.js - Custom mesh untuk ujung ekor petir Raichu
export class lightningTail {
  GL = null; SHADER_PROGRAM = null;
  _position = null; _color = null; _MMatrix = null;
  OBJECT_VERTEX = null; OBJECT_FACES = null;
  vertex = []; faces = [];
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();
  childs = [];

  /**
   * Lightning bolt shape (zigzag petir)
   * opts: { width, height, thickness, color, name, position, rotation, scale }
   */
  constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, opts = {}) {
    this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;

    const width = opts.width ?? 0.8;
    const height = opts.height ?? 1.2;
    const thickness = opts.thickness ?? 0.1;
    const color = opts.color ?? [1, 0.85, 0];

    this.bone = {
      name: opts.name ?? "lightningTail",
      position: opts.position ?? [0, 0, 0],
      rotation: opts.rotation ?? [0, 0, 0],
      scale: opts.scale ?? [1, 1, 1],
    };

    this._buildLightning({ width, height, thickness, color });
  }

  addChild(c) { this.childs.push(c); }

  _buildLightning({ width, height, thickness, color }) {
    // Lightning bolt outline (2D zigzag pattern)
    // Bentuk seperti petir Pokemon: atas lebar, tengah zigzag, bawah runcing
    const profile = [
      // [x, y] dalam koordinat lokal
      [0, height],           // puncak tengah
      [-width*0.4, height*0.7],  // kiri atas
      [0, height*0.5],       // tengah atas
      [-width*0.5, height*0.3],  // kiri tengah
      [width*0.2, height*0.3],   // kanan tengah (zigzag)
      [-width*0.3, 0],       // kiri bawah
      [0, -height*0.3],      // ujung runcing bawah
      [width*0.3, 0],        // kanan bawah
      [width*0.2, height*0.3],   // kembali ke atas
      [width*0.5, height*0.3],   // kanan tengah luar
      [0, height*0.5],       // tengah atas
      [width*0.4, height*0.7],   // kanan atas
    ];

    const v = [], idx = [];
    const z1 = thickness / 2, z2 = -thickness / 2;

    // Extrude profile menjadi 3D (front & back faces)
    // Front face (z = +thickness/2)
    for (let i = 0; i < profile.length; i++) {
      v.push(profile[i][0], profile[i][1], z1, color[0], color[1], color[2]);
    }
    // Back face (z = -thickness/2)
    for (let i = 0; i < profile.length; i++) {
      v.push(profile[i][0], profile[i][1], z2, color[0], color[1], color[2]);
    }

    const n = profile.length;

    // Front face triangles (fan from center)
    const centerF = v.length / 6;
    v.push(0, height*0.3, z1, color[0], color[1], color[2]);
    for (let i = 0; i < n - 1; i++) {
      idx.push(centerF, i, i + 1);
    }
    idx.push(centerF, n - 1, 0);

    // Back face triangles (fan from center)
    const centerB = v.length / 6;
    v.push(0, height*0.3, z2, color[0], color[1], color[2]);
    for (let i = 0; i < n - 1; i++) {
      idx.push(centerB, n + i + 1, n + i);
    }
    idx.push(centerB, n, n + n - 1);

    // Side faces (connecting front and back edges)
    for (let i = 0; i < n; i++) {
      const a = i;
      const b = (i + 1) % n;
      const c = n + i;
      const d = n + ((i + 1) % n);
      idx.push(a, b, d, a, d, c);
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
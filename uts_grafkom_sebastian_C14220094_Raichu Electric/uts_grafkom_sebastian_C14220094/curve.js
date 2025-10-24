export class curve {
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

        const width = opts.width ?? 1.0;
        const height = opts.height ?? 0.2;
        const thickness = opts.thickness ?? 0.05;
        const segments = Math.max(3, opts.segments ?? 20);
        const color = opts.color ?? [0, 0, 0];
        
        this._buildCurve({ width, height, thickness, segments, color });
    }

    _buildCurve({ width, height, thickness, segments, color }) {
        const v = [], idx = [];
        const w2 = width / 2;
        const t2 = thickness / 2;

        for (let i = 0; i <= segments; i++) {
            const x = -w2 + (i / segments) * width;
            // Formula parabola untuk membuat lengkungan senyum
            const y = height * (x / w2) * (x / w2);

            // Buat 2 titik (atas & bawah) untuk ketebalan
            v.push(x, y + t2, 0, color[0], color[1], color[2]);
            v.push(x, y - t2, 0, color[0], color[1], color[2]);
        }

        for (let i = 0; i < segments; i++) {
            const a = i * 2, b = a + 2, c = a + 1, d = b + 1;
            idx.push(a, b, d, a, d, c);
        }

        this.vertex = v;
        this.faces = idx;
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

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(c => c.render(M));
    }
}

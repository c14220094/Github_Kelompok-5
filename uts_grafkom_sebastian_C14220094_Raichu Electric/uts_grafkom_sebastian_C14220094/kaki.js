import { ellipsoid } from "./ellipsoid.js";
import { group } from "./group.js";

/**
 * Foot class to create a composite foot shape with a sole and three toes.
 */
export class Foot extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, options) {
        super(); // Call the constructor of the parent 'group' class

        const color = options.color || [0.4, 0.25, 0.1]; // Default to BROWN
        const BLACK = [0.05, 0.05, 0.05]; // Definisi warna hitam

        // 1. TELAPAK KAKI (BAGIAN UTAMA)
        this.telapak = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.28, ry: 0.18, rz: 0.32,
            color: color
        });
        LIBS.set_I4(this.telapak.POSITION_MATRIX);

        // 2. JARI-JARI KAKI
        this.jariTengah = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.1, ry: 0.1, rz: 0.15,
            color: color
        });
        LIBS.translateZ(this.jariTengah.POSITION_MATRIX, 0.2);
        LIBS.translateY(this.jariTengah.POSITION_MATRIX, -0.05);

        this.jariKiri = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.1, ry: 0.1, rz: 0.15,
            color: color
        });
        LIBS.translateX(this.jariKiri.POSITION_MATRIX, -0.12);
        LIBS.translateZ(this.jariKiri.POSITION_MATRIX, 0.18);
        LIBS.translateY(this.jariKiri.POSITION_MATRIX, -0.05);
        LIBS.rotateY(this.jariKiri.POSITION_MATRIX, 0.3);

        this.jariKanan = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.1, ry: 0.1, rz: 0.15,
            color: color
        });
        LIBS.translateX(this.jariKanan.POSITION_MATRIX, 0.12);
        LIBS.translateZ(this.jariKanan.POSITION_MATRIX, 0.18);
        LIBS.translateY(this.jariKanan.POSITION_MATRIX, -0.05);
        LIBS.rotateY(this.jariKanan.POSITION_MATRIX, -0.3);

        
        this.garisKiri = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.02,  // Sangat tipis
            ry: 0.08,  // Cukup tinggi untuk menjadi garis
            rz: 0.08,  // Cukup dalam
            color: BLACK
        });
        
        LIBS.translateX(this.garisKiri.POSITION_MATRIX, -0.07); // Geser ke celah kiri
        LIBS.translateY(this.garisKiri.POSITION_MATRIX, -0.02); // NAIKKAN ke atas (nilai Y lebih mendekati nol)
        LIBS.translateZ(this.garisKiri.POSITION_MATRIX, 0.22);  // MAJUKAN ke depan agar terlihat
        LIBS.rotateY(this.garisKiri.POSITION_MATRIX, 0.2);      // Miringkan agar pas

        // Garis antara Jari Kanan dan Jari Tengah
        this.garisKanan = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, {
            rx: 0.02,
            ry: 0.08,
            rz: 0.08,
            color: BLACK
        });
        // Posisikan DI ANTARA dan DI ATAS, bukan di bawah
        LIBS.translateX(this.garisKanan.POSITION_MATRIX, 0.07); // Geser ke celah kanan
        LIBS.translateY(this.garisKanan.POSITION_MATRIX, -0.02); // NAIKKAN ke atas
        LIBS.translateZ(this.garisKanan.POSITION_MATRIX, 0.22);  // MAJUKAN ke depan
        LIBS.rotateY(this.garisKanan.POSITION_MATRIX, -0.2);     // Miringkan agar pas

        // 4. MENGGABUNGKAN SEMUA BAGIAN
        this.telapak.childs.push(this.jariTengah, this.jariKiri, this.jariKanan, 
                                  this.garisKiri, this.garisKanan);

        this.childs.push(this.telapak);
    }
}
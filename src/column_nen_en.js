"use strict";
import "./mnkappa"

function detM0e(m1, m2) {
    /*
     * Determine M0e conform NEN-EN 1992-1-1 art. 5.8.8.2(2).
     *
     * @param m1: (float) Bending moment at top or bottom of column.
     * @param m2: (float) Bending moment at top or bottom of column.
     * */
    let m02 = Math.max(m1, m2);
    let m01 = Math.min(m1, m2);
    let m0e = 0.6 * m02 + 0.4 * m01;
    return m0e > 0.4 * m02 ? m0e : 0.4 * m0e

class ColumnNENEN {
    constructor(m1, m2) {
        this.m1 = m1;
        this.m2 = m2;
        this.m0e = detM0e(m1, m2);

    }


}
}

console.log(new ColumnNENEN(20, 30))
"use strict";
import {rectangle, m_n_kappa, B500, diagramNoConcreteTension, diagramConcreteBiLinearULS} from "./mnkappa.js"

const fyd = 435;
const eps_yd = fyd / 2e5;

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
    return m0e > 0.4 * m02 ? m0e : 0.4 * m0e;
}

class ColumnNENEN {
    constructor(m1, m2, ned, fck, rho, l0) {
        this.m1 = m1;
        this.m2 = m2;
        this.ned = ned;
        this.fck = fck;
        this.rho = rho;
        this.l0 = l0;
        this.m0e = detM0e(m1, m2);

        this.i = 0 // needs to be determined before det params

    }

    det_params(area) {
        // Kr
        let n = this.ned / (area * this.fck / 1.5);
        this.as = area * this.rho;
        this.omega = this.as * fyd / (area * this.fck / 1.5);
        let n_u= 1 + this.omega;
        let n_bal = 0.4;
        let kr = (n_u - n) / (n_u - n_bal) < 1 ? (n_u - n) / (n_u - n_bal) : 1;

        // K_phi
        let lambda = this.l0 / this.i;
        let beta = 0.35 + this.fck / 200 - lambda / 150;
        let phi_eff = 2.5;
        let k_phi = 1 + beta * phi_eff;

        let d = 0.8 * Math.sqrt(area); // only with squares.
        let _1_div_r0 = eps_yd / (0.45 * d);
        let _1_div_r = kr * k_phi * _1_div_r0;
        let e2 = _1_div_r * Math.pow(this.l0, 2) / Math.pow(Math.PI, 2);
        let M2 = this.ned * e2;
        return {"M2": M2}
    }

    solve() {
        let b = 100;

        let as = this.rho * Math.pow(b, 2) / 2;
        let cs = rectangle(b, b);
        let fc = diagramConcreteBiLinearULS(this.fck / 1.5);
        let m = m_n_kappa(cs, fc, diagramNoConcreteTension, [B500, B500], [as, as], [0.2 * b, 0.8 * b]  ,
            -Math.abs(this.ned));
        m.solver(true, 3.5, false);
        m.det_m_kappa();
        console.log(m.moment)

    }



}

let test = new ColumnNENEN(100, 100, 100, 100, 100, 100);
test.solve()
console.log("ja")
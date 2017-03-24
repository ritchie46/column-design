"use strict";
import {rectangle, m_n_kappa, B500, diagramNoConcreteTension, diagramConcreteBiLinearULS,
calcHookup} from "./mnkappa.js"

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

export default class ColumnNENEN {
    /*
     * Compute the minimum required column dimension conform NEN-EN.
     * Units:
     *  N
     *  mm
     *  %
     *
     */
    constructor(m1, m2, ned, fck, rho, l0) {
        this.m1 = m1;
        this.m2 = m2;
        this.ned = ned;
        this.fck = fck;
        this.rho = rho;
        this.l0 = l0;
        this.m0ed = detM0e(m1, m2);

        this.i = 0; // needs to be determined before det params

        // results
        this.validity = false;
        this.width = null;
        this.As = null
    }

    det_params(area) {
        /*
         * Determine the NEN-EN parameters. All the parameters are required to determine M2. These are assigned for
         * readability.
         *
         */
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
        let M2 = -this.ned * e2;
        return {"M2": M2}
    }

    solve() {
        /*
         * Solve for the minimum required dimensions. First for Ned. If with these dimensions Med > Mrd, determine
         * the dimension based on Med.
         */
        let fcd = this.fck / 1.5;
        let fc = diagramConcreteBiLinearULS(fcd);
        let b = 1000;
        let c = 0;
        let area;
        let m;
        let as;
        let nrd;

        let assign = () => {
            this.validity = true;
            this.width = b;
            this.As = as;
            this.mrd = m.moment;
            this.nrd = nrd
        };

        // Iterate the minimum required dimension for the axial force.
        while(true) {
            area = Math.pow(b, 2);
            nrd = this.axialForceResistance(area);
            if (std.convergence_conditions(nrd, -this.ned, 1.01, 0.99)) {
                as = this.rho * area / 2;
                let cs = rectangle(b, b);
                m = m_n_kappa(cs, fc, diagramNoConcreteTension, B500, [as, as], [0.2 * b, 0.8 * b] , this.ned);
                calcHookup(0.05, m);
                m.det_m_kappa();
                console.log("convergence", m.moment / 1e6, "count", c);
                assign();
                break
            }
            b *= std.convergence(nrd, -this.ned);
            c++;

            if (c > 200) {
                break;
            }
        }

        // Validate if the the minimum required cross section for the axial force is able to bear the total moment.
        this.i = b / 3.46;
        let M2 = this.det_params(area).M2;
        let M0EdM2 = Math.max(this.m0ed + M2, this.m2, this.m1 + 0.5 * M2);
        if (m.moment > M0EdM2) {  // The cross section is sufficient.
            console.log("Minimal axial force is sufficient")
        }
        else {
            c = 0;

            while(true) {
                this.i = b / 3.46;
                area = Math.pow(b, 2);
                as = this.rho * area / 2;
                let cs = rectangle(b, b);

                m = m_n_kappa(cs, fc, diagramNoConcreteTension, B500, [as, as], [0.2 * b, 0.8 * b] , this.ned);
                calcHookup(0.05, m);
                m.det_m_kappa();

                let M2 = this.det_params(area).M2;
                let M0EdM2 = Math.max(this.m0ed + M2, this.m2, this.m1 + 0.5 * M2);

                let factor = std.convergence(m.moment, M0EdM2, 4);
                console.log("factor: ", factor);
                b *= factor;

                // if (this.axialForceResistance(area) < -this.ned) {
                //     console.log(std.convergence(this.axialForceResistance(area), -this.ned), this.axialForceResistance(area)/1e3);
                //     console.log("minimal axial force dimension");
                //     break
                // }

                if (std.convergence_conditions(M0EdM2, m.moment, 1.01, 0.99) && m.validity()) {
                    console.log("convergence");
                    assign();
                    break
                }


                console.log(M0EdM2, m.moment, m.validity(), b);

                if (!isFinite(b)) {
                    this.validity = false;
                    console.log("break");
                    break
                }
                c++;

                if (c > 250) {
                    this.validity = false;
                    console.log("max iter");
                    break
                }
            }
        }
    }

    axialForceResistance(area) {
        return area * this.fck / 1.5 + area * this.rho * B500.det_stress(1.75)
    }


}


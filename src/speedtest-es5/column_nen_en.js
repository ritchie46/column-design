"use strict";
import {rectangle, m_n_kappa, B500, diagramNoConcreteTension, diagramConcreteBiLinearULS,
calcHookup} from "./mnkappa.js"
let vanilla = require("./vanilla_mkap.min.js");

const fyd = 435;
const eps_yd = fyd / 2e5;

function detM0e(m1, m2) {
    /*
     * Determine M0e conform NEN-EN 1992-1-1 art. 5.8.8.2(2).
     *
     * @param m1: (float) Bending moment at top or bottom of column.
     * @param m2: (float) Bending moment at top or bottom of column.
     * */
    var m02 = Math.max(m1, m2);
    var m01 = Math.min(m1, m2);
    var m0e = 0.6 * m02 + 0.4 * m01;
    return m0e > 0.4 * m02 ? m0e : 0.4 * m0e;
}

export default function ColumnNENEN(m1, m2, ned, fck, rho, l0) {
    /*
     * Compute the minimum required column dimension conform NEN-EN.
     * Units:
     *  N
     *  mm
     *  %
     *
     */
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
ColumnNENEN.prototype.det_params = function(area) {
        /*
         * Determine the NEN-EN parameters. All the parameters are required to determine M2. These are assigned for
         * readability.
         *
         */
        // Kr
        var n = this.ned / (area * this.fck / 1.5);
        this.as = area * this.rho;
        this.omega = this.as * fyd / (area * this.fck / 1.5);
        var n_u= 1 + this.omega;
        var n_bal = 0.4;
        var kr = (n_u - n) / (n_u - n_bal) < 1 ? (n_u - n) / (n_u - n_bal) : 1;

        // K_phi
        var lambda = this.l0 / this.i;
        var beta = 0.35 + this.fck / 200 - lambda / 150;
        var phi_eff = 2.5;
        var k_phi = 1 + beta * phi_eff;

        var d = 0.8 * Math.sqrt(area); // only with squares.
        var _1_div_r0 = eps_yd / (0.45 * d);
        var _1_div_r = kr * k_phi * _1_div_r0;
        var e2 = _1_div_r * Math.pow(this.l0, 2) / Math.pow(Math.PI, 2);
        var M2 = -this.ned * e2;
        return {"M2": M2}
    };

ColumnNENEN.prototype.solve = function () {
        /*
         * Solve for the minimum required dimensions. First for Ned. If with these dimensions Med > Mrd, determine
         * the dimension based on Med.
         */
        var fcd = this.fck / 1.5;
        var fc = diagramConcreteBiLinearULS(fcd);
        var b = 1000;
        var c = 0;
        var area;
        var m;
        var as;
        var nrd;

        var assign = () => {
            this.validity = true;
            this.width = b;
            this.As = as;
            this.mrd = m.moment;
            this.nrd = nrd
        };
        var fHistoryHigh = 1e12;
        var fHistoryLow = -1e12;
        var div = 3;
        // Iterate the minimum required dimension for the axial force.
        while(true) {
            area = Math.pow(b, 2);
            nrd = this.axialForceResistance(area);
            if (vanilla.std.convergence_conditions(nrd, -this.ned, 1.01, 0.975)) {
                as = this.rho * area / 2;
                var cs = rectangle(b, b);
                m = m_n_kappa(cs, fc, diagramNoConcreteTension, B500, [as, as], [0.2 * b, 0.8 * b] , this.ned);
                calcHookup(0.05, m);
                m.det_m_kappa();
                console.log("Axial force convergence", "count", c);
                assign();
                break
            }
            var factor = vanilla.std.convergence(nrd, -this.ned, div);
            b *= factor;
            c++;

            if (c > 50) {
                break;
            }
            // Adaptive convergence divider
            // Change the division based on the factor history
            if (factor > 1) {
                if (factor > fHistoryHigh) {
                    div++
                }
                fHistoryHigh = factor;
            }
            else {
                if (factor < fHistoryLow) {
                    div++
                }
                fHistoryLow = factor
            }
        }

        // Validate if the the minimum required cross section for the axial force is able to bear the total moment.
        this.i = b / 3.46;
        var M2 = this.det_params(area).M2;
        var M0EdM2 = Math.max(this.m0ed + M2, this.m2, this.m1 + 0.5 * M2);
        if (m.moment > M0EdM2) {  // The cross section is sufficient.
            console.log("Minimal axial force is sufficient")
        }
        else {
            console.log("Axial force dimensions not sufficient");
            c = 0;

            var fHistoryHigh = 1e12;
            var fHistoryLow = -1e12;
            var div = 5;

            while(true) {
                this.i = b / 3.46;
                area = Math.pow(b, 2);
                as = this.rho * area / 2;
                var cs = rectangle(b, b);

                m = m_n_kappa(cs, fc, diagramNoConcreteTension, B500, [as, as], [0.2 * b, 0.8 * b] , this.ned);
                calcHookup(0.05, m);
                m.det_m_kappa();

                var M2 = this.det_params(area).M2;
                var M0EdM2 = Math.max(this.m0ed + M2, this.m2, this.m1 + 0.5 * M2);

                factor = vanilla.std.convergence(m.moment, M0EdM2, div);
                console.log("factor: ", factor, "div", div, "count", c, "width", b);
                b *= factor;

                console.log("conditions", vanilla.std.convergence_conditions(M0EdM2, m.moment, 1.05, 0.95),
                    m.validity());

                if (vanilla.std.convergence_conditions(m.moment, M0EdM2, 1.05, 0.95) && m.validity()) {
                    console.log("convergence");
                    assign();
                    break
                }

                //console.log(M0EdM2, m.moment, m.validity(), b);

                if (!isFinite(b)) {
                    this.validity = false;
                    console.log("break");
                    break
                }
                c++;

                if (c > 20) {
                    this.validity = false;
                    console.log("max iter");
                    break
                }

                // Adaptive convergence divider
                // Change the division based on the factor history
                if (factor > 1) {
                    if (factor > fHistoryHigh) {
                        div++
                    }
                    fHistoryHigh = factor;
                }
                else {
                    if (factor < fHistoryLow) {
                        div++
                    }
                    fHistoryLow = factor
                }

            }
        }
    };

ColumnNENEN.prototype.axialForceResistance = function(area) {
        return area * this.fck / 1.5 + area * this.rho * B500.det_stress(1.75)
    };



"use strict";
let vanilla = require("./vanilla_mkap.min.js");

function rectangle(b, h) {
    /**
    * Create a cross section required for the M-N-Kappa solver.
    *
    * @param a: (float) Width of the cross section
    * @param b: (float) Height of the cross section
    * */

    let pg = [[0, 0], [0, b], [h, b], [h, 0], [0, 0]];

    for (let i in pg) {
        pg[i] = new vanilla.vector.Point(pg[i][0], pg[i][1])
    }
    return new vanilla.crsn.PolyGon(pg)
}

function m_n_kappa(cs, fc, fct, fs, as, z, ned) {
    /**
    * Prepare a m_n_kappa instance.
    *
    * @param cs: (Polygon)
    * @param fc: (StressStrain) Concrete compressive stress strain diagram.
    * @param fct: (StressStrain) Concrete tensile stress strain diagram.
    * @param fs: (StressStrain) Reinforcement stress strain diagram.
    * @param as: (Array) Array with area values of the reinforcement.
    * @param z: (Array) Distance of the reinforcement from the bottom of the cross section.
    * @param ned: (float) Axial force value.
    *
    * @returns moment kappa instance
    * */

    let m = new vanilla.mkap.MomentKappa(cs, fc, fct);
    m.instantiate_standard_reinforcement(as, z, fs);
    m.normal_force = ned;

    return m
}


function diagramConcreteBiLinearULS(stress) {
    return new vanilla.mkap.StressStrain([0, 1.75, 3.5], [0, stress, stress])
}

const diagramNoConcreteTension = new vanilla.mkap.StressStrain([0, 0], [0, 0]);
const B500 = new vanilla.mkap.StressStrain([0, 2.175, 25], [0, 435, 435]);
let calcHookup = vanilla.mkap.calcHookup;

export {rectangle, m_n_kappa, diagramConcreteBiLinearULS, B500, diagramNoConcreteTension, calcHookup}
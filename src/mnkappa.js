"use strict";
import "./vanilla_mkap.min"

function rectangle(b, h) {
    /*
    * Create a cross section required for the M-N-Kappa solver.
    *
    * @param a: (float) Width of the cross section
    * @param b: (float) Height of the cross section
    * */

    let pg = [[0, 0], [0, b], [h, b], [h, 0], [0, 0]];

    for (let i in pg) {
        pg[i] = new vector.Point(pg[i][0], pg[i][1])
    }
    return new crsn.PolyGon(pg)
}

function m_n_kappa(cs, fc, fct, fs, as, z, ned) {
    /*
    * Prepare a m_n_kappa instance.
    *
    * @param cs: (Polygon)
    * @param fc: (StressStrain) Concrete compressive stress strain diagram.
    * @param fct: (StressStrain) Concrete tensile stress strain diagram.
    * @param fs: (StressStrain) Reinforcement stress strain diagram.
    * @param as: (Array) Array with area values of the reinforcement.
    * @param z: (Array) Distance of the reinforcement from the top of the cross section.
    * @param ned: (float) Axial force value.
    *
    * @returns moment kappa instance
    * */

    let m = new mkap.MomentKappa(cs, fc, fct);
    m.normal_force = ned;
    m.rebar_As = as;
    m.m0 = Array.apply(null, Array(as.length).map(Number.prototype.valueOf, 0));
    m.prestress = m.d_strain = m.d_stress = m.m0;
    m.rebar_z = z;
    m.rebar_diam = fs;
    return m
}


function diagramConcreteBiLinearULS(stress) {
    return new mkap.StressStrain([0, 1.75, 3.5], [0, stress, stress])
}

let B500 = new mkap.StressStrain([0, 2.175, 25], [0, 435, 435]);


import ColumnNENEN from "./column_nen_en.js"

// Method that accepts the PostMessage event
onmessage = function (e) {
    console.log("Starting calculation on worker");
    let calc = new ColumnNENEN(e.data.M1 * 1e6, e.data.M2 * 1e6, e.data.Ned * 1e3 * e.data.UC, e.data.concrete,
        e.data.rho / 1e2, e.data.l0 * 1e3);
    calc.solve();

    postMessage({width: calc.width, As: calc.As, mrd: calc.mrd, nrd: calc.nrd, M0EdM2: calc.M0EdM2})

};

import ColumnNENEN from "./column_nen_en.js"

let t0 = performance.now()
let test = new ColumnNENEN(2e6, 2e6, -1000e3, 30, 0.02, 2e3);
test.solve()
let t1 = performance.now()
console.log("time", t1 -t0)
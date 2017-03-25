import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import ColumnNENEN from "./column_nen_en.js"
let workerModule = require("worker-loader?name=outputWorker.js!./worker.js");

class App extends Component {
    constructor() {
        super();
        this.input = {"UC": 1};
    }

    render() {
        return (
          <div className="App">
            <div className="App-header">
              <h2>Column design</h2>
            </div>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
              <Input label="Axial force: " unit="kN" name="Ned" function={this.setHandler}/>
              <Input label="Bending moment top: " unit="kNm" name="M1" function={this.setHandler}/>
              <Input label="Bending moment bottom: " unit="kNm" name="M2" function={this.setHandler}/>
              <Input label="Buckling length :" unit="m" name="l0" function={this.setHandler}/>
              <Input label="Reinforcement percentage: " unit="%" name="rho" function={this.setHandler}/>
              <Input label="Unity check: " value="1" name="UC" function={this.setHandler}/>
              <Button label="Go!" function={this.executeColumn} args={this.input}/>
              {this.props.output}
            </div>
    )
    }

    setHandler = (e) => {
        this.input[e.target.name] = parseFloat(e.target.value);
        console.log(this.input)

    };

    // Use arrow functions because this will remain on class level.
    executeColumn = (i) => {

        i.concrete = 30;
        let worker = new workerModule();

        worker.postMessage(i);

        // wrap in an async function so that rendering of the loader will be rendered first.
        let compute = function (i) {
            let c = i.concrete
            let calc = new ColumnNENEN(i.M1 * 1e6, i.M2 * 1e6, i.Ned * 1e3 * i.UC, i.concrete, i.rho / 1e2, i.l0 * 1e3);
            calc.solve();

            result.push(<th>{c}</th>);
            console.log("result", result)

            console.log(calc.validity);
            if (calc.validity) {
                let output = <div>
                    <h2>Output</h2>
                    <table>
                        <tbody>
                            <tr>
                                <th></th>
                                <th>Units</th>
                                <th>C30/37</th>
                                {result}
                            </tr>
                            <tr>
                                <td>Dimensions</td>
                                <td>mm x mm</td>
                                <td>{Math.round(calc.width)}x{Math.round(calc.width)}</td>
                            </tr>
                            <tr>
                                <td>As</td>
                                <td>mm<sup>2</sup></td>
                                <td>{Math.round(calc.As)}</td>
                            </tr>
                            <tr>
                                <td>M<sub>Rd</sub></td>
                                <td>kNm</td>
                                <td>{Math.round(calc.mrd / 1e6 * 100) / 100}</td>
                            </tr>
                            <tr>
                                <td>N<sub>Rd</sub></td>
                                <td>kN</td>
                                <td>{Math.round(calc.nrd / 1e3 * 100) / 100}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>;

                ReactDOM.render(<App output={output}/>, document.getElementById('root'))
            }

        }
        //
        // let concrete = [20, 30, 40];
        // let result = []
        //
        // ReactDOM.render(<Loader callback={compute} args={i} />, document.getElementById("root"));
        //
        // for (let j = 0; j < 2; j++) {
        //     console.log("in loop")
        //     i.concrete = concrete[j];
        //     window.
        //     compute(i)
        //
        // }

}


}

function Input(props) {
    let type = props.type || "number";

    return (
        <div>
            <label>
                {props.label}
                <input type={type} name={props.name} defaultValue={props.value} onChange={props.function}/>
                <span>{props.unit}</span>
            </label>
        </div>
    )
}


class Button extends React.Component {
    render() {
        return (
            <div>
                <button type="button" onClick={() => this.props.function(this.props.args)}>{this.props.label} </button>
            </div>
        )
    }
}

class Loader extends React.Component {
    constructor(arg) {
        // call the Loader with callback = {callback function}
        // args = {arguments}
        super();
        this.callback = arg.callback;
        this.arguments = arg.args;
    }
    render() {
        return (
            <div className="loader"></div>
        )
    }
}

// Loader.prototype.componentWillMount = function () {
//     return (
//         this.callback(this.arguments)
//     )
// };


function async(func) {
    return function () {
        let args = arguments;
        setTimeout(function() {
            func.apply(this, args)
        }, 0);
    };
}

export default App;

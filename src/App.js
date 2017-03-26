import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import ColumnNENEN from "./column_nen_en.js"
let workerModule = require("worker-loader?name=outputWorker.js!./worker.js");

class App extends Component {
    constructor(props) {
        super(props);
        this.values = this.props.values  // more will be appended in setHandler()
    }

    render() {
        return (
          <div className="App">
            <div className="App-header">
              <h2>Column design</h2>
            </div>
            <div>
              <Input label="Axial force: " value={Math.abs(this.values.Ned)} unit="kN" name="Ned" function={this.setHandler}/>
              <Input label="Bending moment top: " value={this.values.M1} unit="kNm" name="M1" function={this.setHandler}/>
              <Input label="Bending moment bottom: " value={this.values.M2} unit="kNm" name="M2" function={this.setHandler}/>
              <Input label="Buckling length :" unit="m" value={this.values.l0} name="l0" function={this.setHandler}/>
              <Input label="Reinforcement percentage: " value={this.values.rho} unit="%" name="rho" function={this.setHandler}/>
              <Input label="Unity check: " value={this.values.UC}  name="UC" function={this.setHandler}/>
              <Button label="Go!" function={this.executeColumn} args={this.values}/>
              {this.props.output}
            </div>
            </div>
    )
    }

    setHandler = (e) => {
        this.values[e.target.name] = parseFloat(e.target.value);
    };

    // Use arrow functions because this will remain on class level.
    executeColumn = (i) => {
        ReactDOM.render(<Loader header="Crunching the numbers"/>, document.getElementById("root"));
        i.concrete = 30;
        i.Ned = -Math.abs(i.Ned);
        let worker = new workerModule();
        let t0 = performance.now();
        worker.postMessage(i);

        // Event handler when worker has finished.
        worker.onmessage = function (e) {
            let t1 = performance.now();
            console.log("time", t1 -t0);
            console.log("output", e.data);

            let output = <div>
                <h2>Output</h2>
                <table>
                    <tbody>
                    <tr>
                        <th></th>
                        <th>Units</th>
                        <th>C30/37</th>
                    </tr>
                    <tr>
                        <td>Dimensions</td>
                        <td>mm x mm</td>
                        <td>{Math.round(e.data.width)}x{Math.round(e.data.width)}</td>
                    </tr>
                    <tr>
                        <td>As</td>
                        <td>mm<sup>2</sup></td>
                        <td>{Math.round(e.data.As)}</td>
                    </tr>
                    <tr>
                        <td>M<sub>Rd</sub></td>
                        <td>kNm</td>
                        <td>{Math.round(e.data.mrd / 1e6 * 100) / 100}</td>
                    </tr>
                    <tr>
                        <td>N<sub>Rd</sub></td>
                        <td>kN</td>
                        <td>{Math.round(e.data.nrd / 1e3 * 100) / 100}</td>
                    </tr>
                    <tr>
                        <td>M<sub>Ed;2nd</sub></td>
                        <td>kN</td>
                        <td>{Math.round(e.data.M0EdM2 / 1e6 * 100) / 100}</td>
                    </tr>
                    </tbody>
                </table>
            </div>;

            ReactDOM.render(<App output={output} values={i}/>, document.getElementById("root"))
        };
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

function Loader(props) {
    return (
        <div className="loader-header">
            <h2>{props.header}</h2>
            <div className="loader"></div>
        </div>
    )
}

export default App;

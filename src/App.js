import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import {settingsContainer} from "./settings-view.js"
let workerModule = require("worker-loader?name=outputWorker.js!./worker.js");

function Header(props) {
    return (
    <div className="App-header">
        <h2>Column design</h2>
        <div className="header-tab">
            <Tab function={tab_app} args={props.computeValues} label="App"/>
            <Tab function={tab_settings} args={props.computeValues} label="Settings"/>
        </div>
    </div>
    )
}

function Tab(props) {
    return (
        <button onClick={() => props.function(props.args)}>{props.label}</button>
    )
}

function tab_app(values) {
    ReactDOM.render(<App values={values}/>, document.getElementById("root"))
}

function tab_settings(values) {
    ReactDOM.render(<div className="App">
        <Header computeValues={values}/>
        {settingsContainer}
    </div>, document.getElementById("root"))
}

class App extends Component {
    constructor(props) {
        super(props);
        this.values = this.props.values; // more will be appended in setHandler()
    }

    render() {
        return (
          <div className="App">
              <Header computeValues={this.values}/>
              <div className="col-5">
                  <h2>Input</h2>
                <form className="base-input">
                  <Input label="Axial force: " value={Math.abs(this.values.Ned)} unit="kN" name="Ned" function={this.setHandler}/>
                  <Input label="Bending moment top: " value={this.values.M1} unit="kNm" name="M1" function={this.setHandler}/>
                  <Input label="Bending moment bottom: " value={this.values.M2} unit="kNm" name="M2" function={this.setHandler}/>
                  <Input label="Buckling length:" unit="m" value={this.values.l0} name="l0" function={this.setHandler}/>
                  <Input label="Reinforcement percentage: " value={this.values.rho} unit="%" name="rho" function={this.setHandler}/>
                  <Input label="Unity check: " value={this.values.UC}  name="UC" function={this.setHandler}/>
                  <Button label="Go!" function={this.executeColumn} args={this.values}/>
                </form>
              </div>

              <div id="output" className="col-6">
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
        let t0 = performance.now();
        let worker = new workerModule();


        let fck = [20, 25, 30, 35];
        let label = [<th>C20/25</th>, <th>C25/30</th>, <th>C30/37</th>, <th>35/45</th>];


        for (let j = 0; j < fck.length; j++) {
            i.concrete = fck[j];
            i.Ned = -Math.abs(i.Ned);
            worker.postMessage(i);
        }

        // results
        let width = [];
        let as = [];
        let mrd = [];
        let nrd = [];
        let M0EdM2 = [];
        let count = 0;


        // Event handler when worker has finished.
        worker.onmessage = function (e) {
            count ++;
            width.push(<td>{Math.round(e.data.width)} x {Math.round(e.data.width)}</td>);
            as.push(<td>{Math.round(e.data.As)}</td>);
            mrd.push(<td>{Math.round(e.data.mrd / 1e6)}</td>);
            nrd.push(<td>{Math.round(e.data.nrd / 1e3)}</td>);
            M0EdM2.push(<td>{Math.round(e.data.M0EdM2 / 1e6)}</td>);

            if (count === fck.length) {

                let t1 = performance.now();
                console.log("time", t1 - t0);

                let output = <div>
                    <h2>Output</h2>
                    <table>
                        <thead>
                        <tr>
                            <th/>
                            <th>Units</th>
                            {label}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th>Dimensions</th>
                            <td className="fonts-italic">mm x mm</td>
                            {width}
                        </tr>
                        <tr>
                            <th>As</th>
                            <td className="fonts-italic">mm<sup>2</sup></td>
                            {as}
                        </tr>
                        <tr>
                            <th>N<sub>Rd</sub></th>
                            <td className="fonts-italic">kN</td>
                            {nrd}
                        </tr>
                        <tr>
                            <th>M<sub>Rd</sub></th>
                            <td className="fonts-italic">kNm</td>
                            {mrd}
                        </tr>
                        <tr>
                            <th>M<sub>Ed;2nd</sub></th>
                            <td className="fonts-italic">kNm</td>
                            {M0EdM2}
                        </tr>
                        </tbody>
                    </table>
                </div>;

                ReactDOM.render(<App output={output} values={i}/>, document.getElementById("root"))
            }
        };
    }
}


function Input(props) {
    let type = props.type || "text";

    return (
        <div className="input-container">
            <label>
                {props.label}
            </label>
                <input className="input-style-1" type={type} name={props.name} defaultValue={props.value} onChange={props.function}/>
                <span>{props.unit}</span>
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
            <div className="loader"/>
        </div>
    )
}



export default App;

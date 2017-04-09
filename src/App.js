import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import {SettingsContainer} from "./settings-view"
import {Input, Button, Loader, Header} from "./components"
let workerModule = require("worker-loader?name=outputWorker.js!./worker.js");


class App extends Component {
    constructor(props) {
        super(props);
        this.values = this.props.values; // more will be appended in setHandler()
    }

    render() {
        return (
          <div className="App">
              <Header functionTab1={this.TabApp} functionTab2={this.TabSettings}/>
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
        console.log(this.values);
        this.values[e.target.name] = parseFloat(e.target.value);
    };

    TabApp = () => {
        ReactDOM.render(this.render(), document.getElementById("root"))
    };

    TabSettings = () => {
        ReactDOM.render(
            <div className="App">
                <Header functionTab1={this.TabApp} functionTab2={this.TabSettings}/>
                {<SettingsContainer function={this.setHandler} values={this.values}/>}
            </div>, document.getElementById("root")
        )
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
    };
}







export default App;

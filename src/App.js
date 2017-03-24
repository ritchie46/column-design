import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import ColumnNENEN from "./column_nen_en.js"

class App extends Component {
    constructor() {
        super();
        this.input = {"UC": 1};
        this.output = null
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
              {this.output}
            </div>
    )
    }

    setHandler = (e) => {
        this.input[e.target.name] = parseFloat(e.target.value);
        console.log(this.input)

    };

    // Use arrow functions because this will remain on class level.
    executeColumn = (i) => {
        ReactDOM.render(<Loader callback={test} args={i} />, document.getElementById("root"));



}


}

function test(i) {
    console.log("hier")
    let calc = new ColumnNENEN(i.M1 * 1e6, i.M2 * 1e6, i.Ned * 1e3 * i.UC, 30, i.rho / 1e2, i.l0 * 1e3);
    calc.solve();
    // console.log(calc.validity, calc.width)
    // if (calc.validity) {
    //
    //     this.output = <div>
    //         <h2>Output</h2>
    //         <table>
    //             <tr>
    //                 <th></th>
    //                 <th>C30/37</th>
    //             </tr>
    //             <tr>
    //                 <td>Dimensions</td>
    //                 <td>{Math.round(calc.width)}x{Math.round(calc.width)}</td>
    //             </tr>
    //             <tr>
    //                 <td>As</td>
    //                 <td>{calc.As}</td>
    //             </tr>
    //             <tr>
    //                 <td>M<sub>Rd</sub></td>
    //             </tr>
    //             <tr>
    //                 <td>N<sub>Rd</sub></td>
    //             </tr>
    //         </table>
    //     </div>;
    // }
    // ReactDOM.render(<App />, document.getElementById('root'))
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

Loader.prototype.componentWillMount = function () {
    return (
        this.callback(this.arguments)
    )
};




export default App;

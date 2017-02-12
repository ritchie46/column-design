import React, { Component } from 'react';

import './App.css';
import "./column_nen_en.js"

class App extends Component {
    constructor() {
        super();
        this.input = {"UC": 1}
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
          <Button label="Go!" function={executeColumn}/>
        </div>
  );
  }

  setHandler = (e) => {
      this.input[e.target.name] = parseFloat(e.target.value);
      console.log(this.input)
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
                <button type="button" onClick={this.props.function}>{this.props.label} </button>
            </div>
        )
    }
}


function executeColumn() {

}



export default App;

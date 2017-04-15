import React from 'react';

function Header(props) {
    return (
        <div className="App-header">
            <h2>Column design</h2>
            <div className="header-tab">
                <Tab function={props.functionTab1} label="App"/>
                <Tab function={props.functionTab2} label="Settings"/>
            </div>
        </div>
    )
}

function Tab(props) {
    return (
        <button onClick={() => props.function(props.args)}>{props.label}</button>
    )
}

function Input(props) {
    let type = props.type || "text";

    return (
        <div className="input-container">
            <label>
                {props.label}
            </label>
            <input className="input-style-1" type={type} name={props.name} defaultValue={props.value}
                   onChange={props.function}/>
            <span>{props.unit}</span>
        </div>
    )
}

function RadioButton(props) {
    let {...destruct} = props;
    destruct.type = "radio";
    return (
        Input(destruct)
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


export {Input, Button, Loader, Tab, Header, RadioButton}

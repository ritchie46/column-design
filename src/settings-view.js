import React from 'react';
import {Input, Button, Loader} from "./components"


function SettingsContainer(props) {

    return (
        <div className="base-input">
            <Input label={<span>Φ<sub>eff (art. 5.8.4)</sub></span>} value={props.values.phi_eff}
                   function={props.function} name="phi_eff"/>
            <Input label="a" value={props.values.a_as} function={props.function} name="a_as"/>
            <Input label="b / h" value={props.values.bh_ratio} function={props.function} name="bh_ratio"/>
        </div>
    )
}

export {SettingsContainer}

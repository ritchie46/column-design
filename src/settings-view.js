import React from 'react';
import {Input, Button, Loader} from "./components"


function SettingsContainer(props) {
    return (
        <div className="base-input">
            <Input label={<span>Φ<sub>eff (art. 5.8.4)</sub></span>} value={props.values.phi_eff}
                   function={props.function} name="phi_eff"/>
        </div>
    )
}

export {SettingsContainer}

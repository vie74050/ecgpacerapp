import './scss/styles.scss';

import * as HRGRAPH from "./Graph/GraphHR";
import * as BPGraph from "./Graph/GraphBP";
import * as UISettings from "./UI/SettingsPanel";
import * as UIDisplay from "./UI/DisplayPanel";
import * as UIPacer from "./UI/PacerPanel";

var $ = require( 'jquery' );
require('../node_modules/jquery-ui/dist/jquery-ui.min.js');

$(() => {
    

    // MONITOR events
    UIDisplay.Setup("#mon-area .value, #nX");

    // SETTINGS events
    UISettings.Setup("#_settings input, #_settings select");
    
    // PACER events
    UIPacer.Setup("#_pacer input, #_pacer select");
    
    HRGRAPH.Init("canvashr");
    BPGraph.Init("canvasbp");    

    $("#_pacer").draggable({ containment: "window", stack: "section" });
    $("#_settings").draggable({ containment: "window", stack: "section" });

});

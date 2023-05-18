import './scss/styles.scss';
import $ from "jquery";
import { HRGraph } from "./Graph/GraphHR";
import { BPGraph } from "./Graph/GraphBP";
import * as UISettings from "./UI/SettingsPanel";
import * as UIDisplay from "./UI/DisplayPanel";
import * as UIPacer from "./UI/PacerPanel";

require('../node_modules/jquery-ui/dist/jquery-ui.min.js');

$(() => {
    

    // MONITOR events
    UIDisplay.Setup("#mon-area .value, #nX");

    // SETTINGS events
    UISettings.Setup("#_settings input, #_settings select");
    
    // PACER events
    UIPacer.Setup("#_pacer input, #_pacer select");
    
    new HRGraph("canvashr");
    new BPGraph("canvasbp");    
    
    $("#_pacer").draggable({ containment: "window", stack: "section" });
    $("#_settings").draggable({ containment: "window", stack: "section" });

});

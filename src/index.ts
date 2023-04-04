import './scss/styles.scss';
import $ from "jquery";
import { HRGraph } from "./Graph/GraphHR";
import { BPGraph } from "./Graph/GraphBP";
import * as UISettings from "./UI/SettingsPanel";
import * as UIDisplay from "./UI/DisplayPanel";
import * as UIPacer from "./UI/PacerPanel";

$(() => {
    

    // MONITOR events
    UIDisplay.Setup("#mon-area .value, #nX");

    // SETTINGS events
    UISettings.Setup("#_settings input, #_settings select");
    
    // PACER events
    UIPacer.Setup("#_pacer input, #_pacer select");
    
    new HRGraph("canvashr");
    new BPGraph("canvasbp");
    
});

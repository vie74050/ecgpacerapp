import './scss/styles.scss';
import $ from "jquery";
import { HRGraph } from "./Graph/GraphHR";
import { BPGraph } from "./Graph/GraphBP";
import * as UISettings from "./UI_Events/SettingsPanel";
import * as UIDisplay from "./UI_Events/DisplayPanel";
import * as UIPacer from "./UI_Events/PacerPanel";

$(() => {
    

    // MONITOR events
    UIDisplay.Setup("#mon-area .value");

    // SETTINGS events
    UISettings.Setup("#_settings input");
    
    // PACER events
    UIPacer.Setup("#_pacer input");
    
    const hr_graph = new HRGraph("canvashr");
    const bp_graph = new BPGraph("canvasbp");
    
});

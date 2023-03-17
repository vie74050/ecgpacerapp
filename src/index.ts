import './scss/styles.scss';
import $ from "jquery";
import { IDomNodes, IDomInputNodes } from "./Interfaces";
import { getDomNodes, getDomInputNodes, GraphMonitor } from "./helpers";
import * as UIEventsSettings from "./UI_Events/SettingsEvents";
import * as UIEventsMonitor from "./UI_Events/DisplayEvents";
import * as UIEventsPacer from "./UI_Events/PacerEvents";
import * as HRGraph from './Presets/HR_graphY';
import * as BPGraph from './Presets/BP_graphY';

$(() => {
   
    // DOM elements
    const DISPLAY_ELEMS: IDomNodes = getDomNodes("#mon-area .value"); 
    console.log(`display outs:`, DISPLAY_ELEMS);
    
    const SETTINGS_INPUTS: IDomInputNodes = getDomInputNodes("#setup-area input"); 
    console.log(`settings:`, SETTINGS_INPUTS);

    const PACER_INPUTS: IDomInputNodes = getDomInputNodes("#pacer-controls input"); 
    console.log(`pacer_settings:`, PACER_INPUTS);
    
    const nX = <HTMLInputElement>document.getElementById("nX");   

    // CREATE GRAPHS
    const hr_graph = new GraphMonitor("canvashr", { nDIVX: Number(nX?.value) || 5 });
    hr_graph.Y = (x) => {
        return HRGraph.GraphY(x, hr_graph, SETTINGS_INPUTS, PACER_INPUTS, DISPLAY_ELEMS);
    }
    const bp_graph = new GraphMonitor("canvasbp", { nDIVX: Number(nX?.value) || 5 });
    bp_graph.Y = (x) => {
        return BPGraph.GraphY(x, bp_graph, SETTINGS_INPUTS);
    }

    // PACER events
    UIEventsPacer.Setup(PACER_INPUTS);

    // SETTINGS events
    UIEventsSettings.Setup(DISPLAY_ELEMS, SETTINGS_INPUTS);

    // MONITOR events
    UIEventsMonitor.Setup(hr_graph, bp_graph);
});

import './scss/styles.scss';
import $ from "jquery";
import { IDomNodes, IDomInputNodes } from "./Interfaces";
import { getDomNodes, getDomInputNodes, findGetParameters } from "./helpers";
import { GraphMonitor } from "./Graph/GraphMonitor";
import * as UISettings from "./UI_Events/SettingsPanel";
import * as UIDisplay from "./UI_Events/DisplayPanel";
import * as UIPacer from "./UI_Events/PacerPanel";
import * as HRGraph from './Graph/HR_graphY';
import * as BPGraph from './Graph/BP_graphY';

$(() => {
    const hr_graph = new GraphMonitor("canvashr");
    const bp_graph = new GraphMonitor("canvasbp");

    // MONITOR events
    UIDisplay.Setup("#mon-area .value", hr_graph, bp_graph);

    // SETTINGS events
    UISettings.Setup("#_settings input");
    
    // PACER events
    UIPacer.Setup("#_pacer input");
    
    // SET GRAPHING f(x)
   
    hr_graph.Y = (x) => {
        return HRGraph.GraphY(x, hr_graph);
    }
    
    bp_graph.Y = (x) => {
        return BPGraph.GraphY(x, bp_graph);
    }

});

import './scss/styles.scss';
import $ from "jquery";
import { IDomNodes, IDomInputNodes } from "./Interfaces";
import { getDomNodes, getDomInputNodes, GraphMonitor, findGetParameters } from "./helpers";
import * as UIEventsSettings from "./UI_Events/SettingsEvents";
import * as SetContent from "./UI_Events/SetContent";
import * as UIEventsMonitor from "./UI_Events/DisplayEvents";
import * as UIEventsPacer from "./UI_Events/PacerEvents";
import * as HRGraph from './Presets/HR_graphY';
import * as BPGraph from './Presets/BP_graphY';

$(() => {
   
    // DOM elements
    const DISPLAY_ELEMS: IDomNodes = getDomNodes("#mon-area .value"); 
    //console.log(`display outs:`, DISPLAY_ELEMS);
    
    const SETTINGS_INPUTS: IDomInputNodes = getDomInputNodes("#_settings input"); 
    //console.log(`settings:`, SETTINGS_INPUTS);

    const PACER_INPUTS: IDomInputNodes = getDomInputNodes("#_pacer input"); 
    //console.log(`pacer_settings:`, PACER_INPUTS);
    
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

    /** Hide DOM element based on URL params: classid=0
    * NB: must prefix class id with `_` in index.html if hideable
    * e.g. ?pacer=0&bpgraph=0&settings=0 
    */
    let setup_params = findGetParameters();
    let initdata = {};
    setup_params.forEach( (v,i)=>{
        let key = decodeURI(v[0]).toString();
        let val = decodeURI(v[1]).toString();

        // check for DOM element target, `_{id}`, to hide
        if (val==='false' || val==='none' || val==='0') {
            $('._'+v[0])?.hide();
        }

        // check for custom rhythm settings
        if (SETTINGS_INPUTS[v[0]]) {    
            
            //console.log(SETTINGS_INPUTS[decodeURI(v[0])],decodeURI(v[1]));
            initdata[key] = val;
        }

        if (key === 'title') initdata['title'] = val;
    });
    if (Object.keys(initdata).length>0) {
        let title = initdata['title'] || 'Custom'; console.log(setup_params);
        SetContent.SetContent(title, initdata, SETTINGS_INPUTS);
    }

});

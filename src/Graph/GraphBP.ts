import { IDomInputNodes, IGraphOptions } from '../Interfaces';
import { GraphMonitor, Pulse } from './GraphMonitor';
import * as HRGraph from './GraphHR';
import * as SETTINGS from '../UI/SettingsPanel';

var hr_bpm = 0;

export function Init(id: string) {

    let bpGraph = new GraphMonitor(id);
    bpGraph.Y = (x) => graphY(x, bpGraph);
}


function graphY(x: number, bp_graph: GraphMonitor) {
    const settings: IDomInputNodes = SETTINGS.INPUTS;

    const h = bp_graph.HEIGHT, w = bp_graph.WIDTH, dT = bp_graph.nDIVX, maxH = 240;
    const systolic_bpm = settings['sys_r']?.value != 'undefined' ? Number(settings['sys_r']?.value) : 120;
    const diastolic_bpm = settings['dia_r']?.value != 'undefined' ? Number(settings['dia_r']?.value) : 60;
    const dh = systolic_bpm - diastolic_bpm;

    const RPULSEX = HRGraph.RRPrevX; 

    // use the higher HR
    hr_bpm = HRGraph.HR_BPM ; 
  
    let rx = 60 * (w / dT) / hr_bpm;
  
    const pw = 0.1 * rx;
    
    const pulse_sys = Pulse(x, RPULSEX + 2.5 * pw, 1, pw);
    const pulse_dia = Pulse(x, RPULSEX + 5.5 * pw, 0.7, 1.3 * pw);
    const pulse = hr_bpm > 0 ? dh * (pulse_sys + pulse_dia) - diastolic_bpm : 0;

    let y = RPULSEX > -1 ? pulse / maxH * h + h : h;

    return y;
}
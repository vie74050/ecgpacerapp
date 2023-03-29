import { IDomInputNodes } from "../Interfaces";
import { Pulse } from "../helpers";
import { GraphMonitor } from "../GraphMonitor";
import * as HRGraph from "./HR_graphY";

export function GraphY(x: number, bp_graph: GraphMonitor, SETTINGS_INPUTS: IDomInputNodes) {
    const h = bp_graph.HEIGHT, w = bp_graph.WIDTH, dT = bp_graph.nDIVX;
    const hr_bpm = HRGraph.HR_BPM;
    const RPULSEX = HRGraph.RRPrevX;
    const maxH = 200;
    const systolic_bpm = SETTINGS_INPUTS["sys_r"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["sys_r"]?.value) : 120;
    const diastolic_bpm = SETTINGS_INPUTS["dia_r"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["dia_r"]?.value) : 60;
    const rx = 60 * (w / dT) / hr_bpm;
    const pw = 0.1 * rx;
    const dh = systolic_bpm - diastolic_bpm;

    const pulse_sys = Pulse(x, RPULSEX + 2.5 * pw, 1, pw);
    const pulse_dia = Pulse(x, RPULSEX + 5 * pw, 0.6, 1.5 * pw);
    const pulse = hr_bpm > 0 ? dh * (pulse_sys + pulse_dia) - diastolic_bpm : 0;

    return RPULSEX > 0 ? pulse / maxH * h + h : h;
}
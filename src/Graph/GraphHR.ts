import { IDomNodes, IDomInputNodes, IGraphOptions } from "../Interfaces";
import { getRandomInt } from "../helpers";
import { GraphMonitor, Pulse } from "./GraphMonitor";
import * as Pacer from "../UI/PacerPanel";
import * as Ref from "../Presets/ReferenceDefaults";
import * as SETTINGS from '../UI/SettingsPanel';
import * as PACER from '../UI/PacerPanel';
import * as DISPLAY from '../UI/DisplayPanel';
import { nX } from "../UI/DisplayPanel";

var SETTINGS_INPUTS: IDomInputNodes = SETTINGS.INPUTS, 
    PACER_INPUTS: IDomInputNodes = PACER.INPUTS,
    DISPLAY_ELEMS: IDomNodes = DISPLAY.DisplayNodes,
    SN_VAR: number = 0,
    AV_VAR: number = 0,
    QRS_VAR: number = 0,
    RPULSEX: number = 0, // latest x when R 
    PPULSEX: number = 0, // latest x when P
    APULSEX: number = 0,
    VPULSEX: number = 0,
    RRPrevX: number = 0,
    HR_BPM: number = 0;

export {HR_BPM, RRPrevX};

export function Init(id: string) {
    reset();
    nX.addEventListener("change", reset); 
    SETTINGS_INPUTS = SETTINGS.INPUTS; //console.log(SETTINGS_INPUTS);
    let hrGraph = new GraphMonitor(id);
    hrGraph.Y = (x) => graphY(x, hrGraph);
}

function reset(){
    SN_VAR = 0;
    AV_VAR = 0;
    QRS_VAR = 0;
    RPULSEX = 0; // latest x when R 
    PPULSEX = 0; // latest x when P
    APULSEX = 0;
    VPULSEX = 0;
    RRPrevX = 0;
    HR_BPM = 0;

    SETTINGS_INPUTS = SETTINGS.INPUTS;
    PACER_INPUTS = PACER.INPUTS;
    DISPLAY_ELEMS = DISPLAY.DisplayNodes; 
    //console.log("reset HR Graph VARS");
} 
function updateDisplayHR (hr:number, DISPLAY_ELEMS: IDomNodes) {
    let str = "--";
    
    if (hr > 0 && hr < 600) { // hotfix 
        str = hr.toString();
        HR_BPM = hr;
    }
        
    DISPLAY_ELEMS["hr_display_v"].textContent = str;
}

function graphY(x: number, hr_graph: GraphMonitor) {
    const w = hr_graph.WIDTH, 
          h = hr_graph.HEIGHT, 
          dT = hr_graph.nDIVX,
          maxH_mV = 10; // y-axis in mV --> full h in px
    const dx = x % w;

    // Get values from page
    // settings vars
    const snr_bpm = Number(SETTINGS_INPUTS['sn_r']?.value);
    const avr_bpm = Number(SETTINGS_INPUTS['av_r']?.value);
    const p_h_mod = Number(SETTINGS_INPUTS["p_h"]?.value);
    const p_w_mod = Number(SETTINGS_INPUTS["p_w"]?.value);
    const pr_w_mod = Number(SETTINGS_INPUTS["pr_w"]?.value);
    const st_w_mod = Number(SETTINGS_INPUTS['st_w']?.value);
    const pr_h_mod = Number(SETTINGS_INPUTS["pr_h"]?.value); /*TODO? pr elevation*/
    const st_h_mod = Number(SETTINGS_INPUTS['st_h']?.value); /*TODO?* st elevation*/
    const t_w_mod = Number(SETTINGS_INPUTS["t_w"]?.value);
    const qrs_n = Number(SETTINGS_INPUTS["qrs_n"]?.value);
    const qrs_w_mod = Number(SETTINGS_INPUTS["qrs_w"]?.value);
    const qrs_h_mod = Number(SETTINGS_INPUTS["qrs_h"]?.value);
    const t_h_mod = Number(SETTINGS_INPUTS["t_h"]?.value);
    const s_h_mod = Number(SETTINGS_INPUTS["s_h"]?.value);
    const labels_cb = SETTINGS_INPUTS["labels"]?.checked; 

    // modifiers
    const pr_cb = SETTINGS_INPUTS["pr_cb"]?.checked || false;
    const qrs_cb = SETTINGS_INPUTS["qrs_cb"]?.checked || false;
    const snr_cb = SETTINGS_INPUTS["snr_cb"]?.checked || false;
    const avr_cb = SETTINGS_INPUTS["avr_cb"]?.checked || false;
    
    // pacer vars
    const ap_detect = PACER_INPUTS["ap_detect"];
    const as_detect = PACER_INPUTS["as_detect"];
    const vp_detect = PACER_INPUTS["vp_detect"];
    const vs_detect = PACER_INPUTS["vs_detect"];
    
    const pacer_bpm = Number(PACER_INPUTS["pacer_rate"].value);
    const aout_min = Number(SETTINGS_INPUTS["a_out_min"].value) || 0;
    const a_out_mA = Number(PACER_INPUTS["a_out"]?.value) || 0;
    const asense_mV = Number(PACER_INPUTS["a_sense"]?.value) || 0;

    const responsemode = Pacer.ResponseMode;
    const vout_min = Number(SETTINGS_INPUTS["v_out_min"].value) || 0;
    const v_out_mA = Number(PACER_INPUTS["v_out"].value) || 0;
    
    const vsense_mV = Number(PACER_INPUTS["v_sense"].value) || 0;
    

    // bpm --> bps --> pxps
    const dx1ps = (60 / snr_bpm) * (w / dT) || 0,
          dx2ps = (60 / avr_bpm) * (w / dT) || 0; 

    //** INNATE RHYTHM **//
    const n1 = Math.floor(x / dx1ps) || 0,
          n2 = Math.floor(x / dx2ps) || 0; 

    var p = 0, q = 0, r = 0, s = 0, t = 0;

    // default amplitudes
    let p_h = Ref.p.h * p_h_mod,
        q_h = Ref.q.h * qrs_h_mod,
        r_h = Ref.r.h * qrs_h_mod,
        s_h = Ref.s.h * s_h_mod,
        t_h = Ref.t.h * t_h_mod;
    let noise = Math.random() * 0.2 + 1;

    // default durations (seconds)
    let p_w = Ref.p.w * p_w_mod,
        q_w = Ref.q.w * qrs_w_mod,
        r_w = Ref.r.w * qrs_w_mod,
        s_w = Ref.s.w * qrs_w_mod,
        t_w = Ref.t.w * t_w_mod;

    let qrs_drop_counter = qrs_n > 0 ? n2 % (qrs_n + QRS_VAR) : n2 + 1;
    let drop = !(qrs_drop_counter > 0) ? 0 : 1;
    let pq_multiplier = pr_cb ? qrs_drop_counter : 1;
    let p_q_interval = Ref.pq.w * pr_w_mod * pq_multiplier;

    let p_i = (p_w / 2 + Ref.p.i) * (w / dT); 
    let q_i = p_i + (p_w + q_w / 2 + p_q_interval)* (w / dT);
    let r_i = q_i + (q_w + r_w / 2 + Ref.r.i) * (w / dT);
    let s_i = r_i + (r_w + s_w / 2 + Ref.s.i * (w / dT));
    let t_i = s_i + (s_w + t_w / 2 + Ref.st.w * st_w_mod * (w / dT));

    let p_dx_max = p_i + n1 * dx1ps;
    // Innate P wave
    if (snr_bpm > 0) {

        // update params on new SN beat
        if (Math.floor((hr_graph.X - 1) / dx1ps) != n1) {
            // arrhythmia due to variable sn node rate +/- 25%
            SN_VAR = snr_cb ? 0.75 * dx1ps * Math.random() * 0.25 + 1 : 0;
        };
        p_dx_max = p_i + n1 * dx1ps + SN_VAR;
        p = Pulse(x, p_dx_max, p_h * noise, p_w * (w / dT));
        
        if ( Math.floor(x - p_dx_max) == -5) { 
            
            if (-p>0) {
                if (labels_cb) hr_graph.Label("p", dx, 50, 8);
                PPULSEX = x;
            }; 
        }
    }

    // Innate QRST
    let r_dx_max = 0;
    if (avr_bpm > 0) {
        // update params on new AV beat
        if (Math.floor((hr_graph.X - 1) / dx2ps) != n2) {
            // arrhythmia due to variable sn node rate +/- 25%
            AV_VAR = avr_cb ? 0.75 * dx2ps * Math.random() * 0.25 + 1 : SN_VAR;

            // drop qrs randomly based on qrs_n -- min qrs_n, max 2*qrs_n 
            QRS_VAR = qrs_cb ? getRandomInt(0, qrs_n) : 0; //console.log(qrs_drop_counter,drop);

        };

        r_dx_max = r_i + n2 * dx2ps + AV_VAR;
        q = Pulse(x, q_i + n2 * dx2ps + AV_VAR, q_h * noise * drop, q_w * (w / dT));
        r = Pulse(x, r_dx_max, r_h * noise * drop, r_w * (w / dT));
        s = Pulse(x, s_i + n2 * dx2ps + AV_VAR, s_h * noise * drop, s_w * (w / dT));
        t = Pulse(x, t_i + n2 * dx2ps + AV_VAR, t_h * drop, t_w * (w / dT));    
        
        if ( Math.floor(x - r_dx_max) == 0) { 
            
            if (-r>0) {
                if (labels_cb) hr_graph.Label("r", dx, 30, 8); 
                //console.log(r);
                RPULSEX = x;
            }; 
        }
    }

    //** PACER A PULSE & RESPONSE **//
    const dx3ps = (60 / pacer_bpm) * (w / dT) || 0;
    //const n3 = Math.floor(x / dx3ps) || 0
        
    let apace = !PACER_INPUTS["a_out"].disabled && pacer_bpm > 0;             //@TODO - fail pace 
    let acapture = a_out_mA > 0 && a_out_mA >= aout_min;                      //@TODO - fail capture
    let asensing = !PACER_INPUTS["a_sense"].disabled && pacer_bpm > 0;        //@TODO - fail sense 
    let asensitivity = p_h/h * maxH_mV > asense_mV ;       
    let asensed = apace && asensing 
                  && asensitivity && -p>0
                  && x - PPULSEX < dx3ps;    
   
    // A Pulse	
    let a = 0, a_h = 60; 
                   
    as_detect.checked = false;
    ap_detect.checked = false;
    
    let offseta = p_i  - (5 * p_w ) * (w / dT);

    if (x > offseta && apace && x >= dx3ps) {
        //console.log(p_h/h * maxH_mV, p_h, h, p_w, w, dT) ; 
        if (!asensing || !asensitivity) {
            // A pacing but not sensing
            if ( (x - offseta) % dx3ps < 5 ) {
                ap_detect.checked = true ;
                if ( (x - offseta) % dx3ps < 1 ){
                    a = a_h;
                    if (labels_cb) hr_graph.Label("A", dx, 20); 
                    //console.log("pacing");
                    APULSEX = x;
                }
            }
        } else { // a sensing
            
            if ( (x -  PPULSEX) % (dx3ps) < 5 ) {   
                // inhibit if a sensed            
                if (asensed && (responsemode == 1 || responsemode == 3)) {
                    // atrial sensed (p)
                    as_detect.checked = true;

                    if ((x -  PPULSEX) % (dx3ps) < 1 && labels_cb)
                        hr_graph.Label("as", dx, 120);

                }else {
                    
                    ap_detect.checked = true;
                    
                    if ((x -  PPULSEX) % (dx3ps) < 1){
                        a = a_h;
                        if (labels_cb) hr_graph.Label("A", dx, 20); 
                        APULSEX = x;
                    }
                }   
                              
            }
        }
    }  
    
    // A Response Curves
    const doAResponse = apace && acapture && !asensed && APULSEX >= dx3ps;
    if (doAResponse) { 
        
        p_i = APULSEX + 5;
        q_i = p_i + (p_w + q_w / 2 + p_q_interval) * (w / dT);
        r_i = q_i + (q_w + r_w / 2 + 0.02) * (w / dT);
        s_i = r_i + (r_w + s_w / 2 + 0.01) * (w / dT);
        t_i = s_i + (s_w + t_w / 2 + 0.20 * st_w_mod) * (w / dT);
       
        p = Math.floor(Math.abs(p))==0? Pulse(x, p_i, p_h, 0.01*dx3ps) : p; //console.log(n3, Math.floor(p_i));
        
        // trigger innate qrst ?
        if (responsemode >= 1) {
            r_dx_max = r_i + AV_VAR;
            q = Math.floor(Math.abs(q))==0? Pulse(x, q_i + AV_VAR , q_h * noise * drop, q_w * (w / dT)) : q;
            r = Math.floor(Math.abs(r))==0? Pulse(x, r_i + AV_VAR , r_h * noise * drop, r_w * (w / dT)) : r;
            s = Math.floor(Math.abs(s))==0? Pulse(x, s_i + AV_VAR , s_h * noise * drop, s_w * (w / dT)) : s;
            t = Math.floor(Math.abs(t))==0? Pulse(x, t_i + AV_VAR , t_h * noise * drop, t_w * (w / dT)) : t;
            
            if ( Math.floor(x - r_dx_max) == 0) { 
                               if (-r>0) {
                    if (labels_cb) hr_graph.Label("rt", dx, h-15, 10); 
                    //console.log(r);
                    RPULSEX = x;
                }; 
            }
        }
    }

    /** PACER V PULSE & RESPONSE **/
    const qrs_w = (q_w + r_w + s_w ) * (4 * w / dT); //console.log(qrs_w);
    const delay = (responsemode>=2 && doAResponse)? qrs_w : 0;
    const offsetv = offseta + 9.5*p_w * (w / dT);
    let vpacing = !PACER_INPUTS["v_out"].disabled && pacer_bpm > 0;         //@TODO - fail to pace
    let vcapture = v_out_mA > 0 && v_out_mA >= vout_min;                    //@TODO - fail to capture
    let vsensing = !PACER_INPUTS["v_sense"].disabled;                       //@TODO - fail to vsense 
    let vsensitivity = r_h/h * maxH_mV > vsense_mV;  
    let vsenseAtX = RPULSEX + delay; 
    let vsensed =  vsensing 
                    && vsensitivity
                    && x  < dx3ps + vsenseAtX;         

    // V Pulse
    let v = 0, v_h = 80;
    vs_detect.checked = false;
    vp_detect.checked = false;
    
    if ( x > offsetv && vpacing && x > dx3ps ) {

        if (!vsensing || !vsensitivity) {
            // V pacing but not sensing
            if ( (x - offsetv) % dx3ps < 5) {
                vp_detect.checked = true;
                if ((x - offsetv) % dx3ps < 1){
                    v = v_h;
                    if (labels_cb) hr_graph.Label("V", dx, 20);
                    VPULSEX = x;
                }
            }
        }else{
            if ((x - RPULSEX) % (dx3ps) < 5) {
                //console.log("v sensing", vsensing, vsensitivity, x-RPULSEX, dx3ps );
                if (vsensed && (responsemode == 1 || responsemode == 3)) {
                    // vent. activity sensed (r)
                    vs_detect.checked = true; //console.log("vsensed");

                    if ((x - RPULSEX) % (dx3ps) < 1 && labels_cb) {
                        hr_graph.Label("vs", dx, 130);
                    }
                }else {
                    
                    vp_detect.checked = true;

                    if ((x - RPULSEX) % (dx3ps) < 1){
                        v = v_h;
                        if (labels_cb) hr_graph.Label("V", dx, 20);
                        VPULSEX = x;
                    }
                }
            }
        }
    }
    
    // V Response
    const doVResponse = vpacing && vcapture && !vsensed && VPULSEX >= dx3ps;
    
    if (doVResponse) {        
        let vr = graphVResponse(x, VPULSEX+10, dx3ps);   
        if ( Math.abs(Math.floor(vr)) > 0 )  r = vr;            
    }else {
        //console.log("no v response", vpacing, vcapture, !vsensed, VPULSEX > RPULSEX, VPULSEX >= dx3ps);
    }

    let y = a + p + v + q + r + s + t;
 
    // Update R-R interval, HR
    let bpm = avr_bpm;
    //HR_BPM = HR_BPM==0? bpm : HR_BPM;
    
    if ( (x == RPULSEX || x == VPULSEX) 
        && (RPULSEX > 0 || VPULSEX > 0)
    ) 
    {
        let deltaRRx = x==RPULSEX? RPULSEX - RRPrevX : VPULSEX - RRPrevX;
        //console.log(x, deltaRRx, VPULSEX, RPULSEX, RRPrevX);
        if (deltaRRx > 10) {
            bpm = RRPrevX>0? (60/((deltaRRx)*dT/w)) : bpm;
            updateDisplayHR( Math.round( bpm ), DISPLAY_ELEMS);
            RRPrevX =  x==RPULSEX? RPULSEX : VPULSEX;
        }
        
    }
    
    return Math.min(y + h / 2, h);
}

 /* Innate signals */
 function graphP(x: number, xi: number, rate_dx: number): number{
    const p_h_mod = Number(SETTINGS_INPUTS["p_h"].value);
    
    const noise = Math.random() * 0.2 + 1;
    const p_h = Ref.p.h * p_h_mod;
    const p_w = Ref.p.w; 
    const p_i = (p_w / 2 + Ref.p.i) ;

    let p = 0;
       
    // Innate P wave
    p = Pulse(x, p_i + PPULSEX, p_h * noise, p_w);

    return p;
}

/* Pacer signals */
function graphVResponse(x: number, xi:number, rate_dx: number): number {
    const r_h = -50, 
        r_w = 0.04*rate_dx,
        r_i = xi;
    const t_h = 25,
        t_w = 0.08 * rate_dx,
        t_i = r_i + 2 * t_w;
    const r = Pulse(x, r_i, r_h, r_w);
    const t = Pulse(x, t_i, t_h, t_w);

    let y = r + t;

    return y;
}


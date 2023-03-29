import { IDomNodes, IDomInputNodes } from "../Interfaces";
import { Pulse, getRandomInt } from "../helpers";
import { GraphMonitor } from "../GraphMonitor";
import * as Pacer from "../UI_Events/PacerEvents";
import * as Ref from "./ReferenceDefaults";

export var SN_VAR: number = 0,
            AV_VAR: number = 0,
            QRS_VAR: number = 0,
            RPULSEX = 0, // latest x when R 
            PPULSEX = 0, // latest x when P
            APULSEX = 0,
            VPULSEX = 0,
            RRPrevX = 0,
            HR_BPM = 0;

export function reset(){
    SN_VAR = 0;
    AV_VAR = 0;
    QRS_VAR = 0;
    RPULSEX = 0; // latest x when R 
    PPULSEX = 0; // latest x when P
    APULSEX = 0;
    VPULSEX = 0;
    RRPrevX = 0;
    HR_BPM = 0;
} 
export function GraphY(x: number, hr_graph: GraphMonitor, SETTINGS_INPUTS: IDomInputNodes, PACER_INPUTS: IDomInputNodes, DISPLAY_ELEMS: IDomNodes) {
    const w = hr_graph.WIDTH, h = hr_graph.HEIGHT, dT = hr_graph.nDIVX;
    const maxH_mV = 10; // y-axis in mV --> full h in px

    // Get values from page
    // settings vars
    const snr_bpm = SETTINGS_INPUTS['sn_r']?.value != 'undefined' ? Number(SETTINGS_INPUTS['sn_r']?.value) : 60;
    const avr_bpm = SETTINGS_INPUTS['av_r']?.value != 'undefined' ? Number(SETTINGS_INPUTS['av_r']?.value) : 60;
    const p_h_mod = SETTINGS_INPUTS["p_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["p_h"]?.value) : 1;
    const pr_w_mod = SETTINGS_INPUTS["pr_w"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["pr_w"]?.value) : 1;
    const st_mod = SETTINGS_INPUTS['st_w']?.value != 'undefined' ? Number(SETTINGS_INPUTS['st_w']?.value) : 1;
    const t_w_mod = SETTINGS_INPUTS["t_w"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["t_w"]?.value) : 1;
    const qrs_n = Number(SETTINGS_INPUTS["qrs_n"]?.value) || 0;
    const qrs_w_mod = SETTINGS_INPUTS["qrs_w"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["qrs_w"]?.value) : 1;
    const qrs_h_mod = SETTINGS_INPUTS["qrs_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["qrs_h"]?.value) : 1;
    const t_h_mod = SETTINGS_INPUTS["t_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["t_h"]?.value) : 1;
    const s_h_mod = SETTINGS_INPUTS["s_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["s_h"]?.value) : 1;
    // modifiers
    const pr_cb = SETTINGS_INPUTS["pr_cb"]?.checked || false;
    const qrs_cb = SETTINGS_INPUTS["qrs_cb"]?.checked || false;
    const snr_cb = SETTINGS_INPUTS["snr_cb"]?.checked || false;
    const avr_cb = SETTINGS_INPUTS["avr_cb"]?.checked || false;
    
    // pacer vars
    const p_detect = PACER_INPUTS["p_detect"];
    const s_detect = PACER_INPUTS["s_detect"];
    const pacer_bpm = PACER_INPUTS["pacer_rate"]?.value != 'undefined' ? Number(PACER_INPUTS["pacer_rate"].value) : 80;
    const aout_min = Number(SETTINGS_INPUTS["a_out_min"]?.value) || 0;
    const a_out_mA = Number(PACER_INPUTS["a_out"]?.value) || 0;
    const asense_mV = Number(PACER_INPUTS["a_sense"]?.value) || 0;

    const responsemode = Pacer.ResponseMode;
    const vout_min = Number(SETTINGS_INPUTS["v_out_min"]?.value) || 0;
    const v_out_mA = Number(PACER_INPUTS["v_out"]?.value) || 0;
    
    const vsense_mV = Number(PACER_INPUTS["v_sense"]?.value) || 0;
    const dx = x % w;

    // bpm --> bps --> pxps
    const dx1ps = (60 / snr_bpm) * (w / dT) || 0,
          dx2ps = (60 / avr_bpm) * (w / dT) || 0; 

    //** INNATE RHYTHM **//
    const n1 = Math.floor(x / dx1ps) || 0,
          n2 = Math.floor(x / dx2ps) || 0;

    let p = 0, q = 0, r = 0, s = 0.000, t = 0;

    // default amplitudes
    let p_h = Ref.p.h * p_h_mod,
        q_h = Ref.q.h * qrs_h_mod,
        r_h = Ref.r.h * qrs_h_mod,
        s_h = Ref.s.h * s_h_mod,
        t_h = Ref.t.h * t_h_mod;
    let noise = Math.random() * 0.2 + 1;

    // default durations (seconds)
    let p_w = Ref.p.w,
        q_w = Ref.q.w * qrs_w_mod,
        r_w = Ref.r.w * qrs_w_mod,
        s_w = Ref.s.w * qrs_w_mod,
        t_w = Ref.t.w * t_w_mod;

    let qrs_drop_counter = qrs_n > 0 ? n2 % (qrs_n + QRS_VAR) : n2 + 1;
    let drop = !(qrs_drop_counter > 0) ? 0 : 1;
    let pq_multiplier = pr_cb ? qrs_drop_counter : 1;
    let p_q_interval = Ref.pq.w * pr_w_mod * pq_multiplier;

    let p_i = p_w / 2 + 0.2; 
    let q_i = p_i + p_w + q_w / 2 + p_q_interval;
    let r_i = q_i + q_w + r_w / 2 + 0.02;
    let s_i = r_i + r_w + s_w / 2 + 0.01;
    let t_i = s_i + s_w + t_w / 2 + Ref.st.w * st_mod;

    let p_dx_max = p_i * (w / dT) + n1 * dx1ps + SN_VAR;
    // Innate P wave
    if (snr_bpm > 0) {

        // update params on new SN beat
        if (Math.floor((hr_graph.X - 1) / dx1ps) != n1) {
            // arrhythmia due to variable sn node rate +/- 25%
            SN_VAR = snr_cb ? 0.75 * dx1ps * Math.random() * 0.25 + 1 : 0;
        };

        p = Pulse(x, p_dx_max, p_h * noise, p_w * (w / dT));
        
        if ( Math.floor(x - p_dx_max) == -5) { 
            
            if (-p>0) {
                hr_graph.Label("p", dx, 80, 8);
                PPULSEX = x;
            }; 
        }
    }

    // Innate QRST
    if (avr_bpm > 0) {
        // update params on new AV beat
        if (Math.floor((hr_graph.X - 1) / dx2ps) != n2) {
            // arrhythmia due to variable sn node rate +/- 25%
            AV_VAR = avr_cb ? 0.75 * dx2ps * Math.random() * 0.25 + 1 : SN_VAR;

            // drop qrs randomly based on qrs_n -- min qrs_n, max 2*qrs_n 
            QRS_VAR = qrs_cb ? getRandomInt(0, qrs_n) : 0; //console.log(qrs_drop_counter,drop);

        };

        let r_dx_max = r_i * (w / dT) + n2 * dx2ps + AV_VAR;
        q = Pulse(x, q_i * (w / dT) + n2 * dx2ps + AV_VAR, q_h * noise * drop, q_w * (w / dT));
        r = Pulse(x, r_dx_max, r_h * noise * drop, r_w * (w / dT));
        s = Pulse(x, s_i * (w / dT) + n2 * dx2ps + AV_VAR, s_h * noise * drop, s_w * (w / dT));
        t = Pulse(x, t_i * (w / dT) + n2 * dx2ps + AV_VAR, t_h * noise * drop, t_w * (w / dT));

        if ( Math.floor(x - r_dx_max) == 0) { 
            
            if (-r>0) {
                hr_graph.Label("r", dx-10, 40, 8); //console.log(r);
                RPULSEX = x;
            }; 
        }
        
    }

    //** PACER A PULSE & RESPONSE **//
    const dx3ps = (60 / pacer_bpm) * (w / dT) || 0;
    //const n3 = Math.floor(x / dx3ps) || 0
        
    let apace = !PACER_INPUTS["a_out"].disabled && pacer_bpm > 0;             //@TODO - fail to pace 
    let acapture = a_out_mA > 0 && a_out_mA >= aout_min;                      //@TODO - fail to capture
    let asensing = !PACER_INPUTS["a_sense"].disabled && pacer_bpm > 0;        //@TODO - fail to sense 
    let asensitivity = p_h/h * maxH_mV > asense_mV ;       
    let asensed = asensing 
                    && asensitivity && -p>0
                    && x - PPULSEX < dx3ps;    
   
    // A Pulse	
    let a = 0, a_h = 60;
                   
    s_detect.checked = false;
    p_detect.checked = false;

    let offseta = (p_i  - 5 * p_w ) * (w / dT);

    if (x > offseta && apace) {
        //console.log(p_h/h * maxH_mV, p_h, h, p_w, w, dT) ; 
        if (!asensing || !asensitivity) {
            if ( (x - offseta) % dx3ps < 1 ) {
                a = a_h;
                hr_graph.Label("A", dx, 20); 
                //console.log("pacing");
                APULSEX = x;
            }
        } else { // a sensing
            
            if ( (x -  PPULSEX) % (dx3ps) < 1 ) {               
                if (asensed && (responsemode == 1 || responsemode == 3)) {
                    hr_graph.Label("as", dx, 20);
                    s_detect.checked = true;
                }else {
                    a = a_h;
                    hr_graph.Label("A", dx, 20); 
                    p_detect.checked = true ;
                    APULSEX = x;
                }   
                //@TODO trigger or dual modes?                
            }
        }
    }  
    
    // A Response Curves
    if (apace && acapture && !asensed) { 
        
        p_i = APULSEX + 5;//offseta + n3 * dx3ps + 10;//pixels
        q_i = p_i + (p_w + q_w / 2 + p_q_interval) * (w / dT);
        r_i = q_i + (q_w + r_w / 2 + 0.02) * (w / dT);
        s_i = r_i + (r_w + s_w / 2 + 0.01) * (w / dT);
        t_i = s_i + (s_w + t_w / 2 + 0.20 * st_mod) * (w / dT);
       
        p += Pulse(x, p_i, 30, 0.01*dx3ps); //console.log(n3, Math.floor(p_i));
        
        // trigger innate qrst ?
        q = Pulse(x, q_i + AV_VAR , q_h * noise * drop, q_w * (w / dT));
        r = Pulse(x, r_i + AV_VAR , r_h * noise * drop, r_w * (w / dT));
        s = Pulse(x, s_i + AV_VAR , s_h * noise * drop, s_w * (w / dT));
        t = Pulse(x, t_i + AV_VAR , t_h * noise * drop, t_w * (w / dT));
    }

/** PACER V PULSE & RESPONSE **/
    let vpacing = !PACER_INPUTS["v_out"].disabled && pacer_bpm > 0;         //@TODO - fail to pace
    let vcapture = v_out_mA > 0 && v_out_mA >= vout_min;                    //@TODO - fail to capture
    let vsensing = !PACER_INPUTS["v_sense"].disabled;                       //@TODO - fail to vsense 
    let vsensitivity = r_h/h * maxH_mV > vsense_mV;  
    let vsensed =  vsensing 
                    && vsensitivity
                    && x - RPULSEX < dx3ps;                                   

    // V Pulse
    let v = 0, v_h = 80;

    const offsetv = offseta + 10 * p_w * (w / dT);     

    if (x > offsetv && vpacing) {
        if (!vsensing || !vsensitivity) {
            if ( (x - offsetv) % dx3ps < 1) {
                v = v_h;
                hr_graph.Label("V", dx, 20);
                VPULSEX = x;
            }
        }else{
            if ((x - RPULSEX) % (dx3ps) < 1) {
                //console.log("v sensing", vsensing, vsensitivity, x-RPULSEX, dx3ps );
                if (vsensed && (responsemode == 1 || responsemode == 3)) {
                    hr_graph.Label("vs", dx, 20);
                    s_detect.checked = true; //console.log("vsensed");
                }else {
                    v = v_h;
                    hr_graph.Label("V", dx, 20);
                    p_detect.checked = true;
                    VPULSEX = x;
                }
            }
        }
    }
    
    // V Response
    if (vpacing && vcapture && !vsensed) { //console.log('triggering v');        
        
        r_h = -50 * noise;
        r_w = 0.04* dx3ps;
        r_i = VPULSEX+10;

        t_h = 25 * noise;
        t_w = 0.08 * dx3ps;
        t_i = r_i + 2 * t_w;

        r = Pulse(x, r_i, r_h, r_w);
        t = Pulse(x, t_i, t_h, t_w);
        
    }

    let y = a + p + v + q + r + s + t;

    // UI OUTPUT VARS
    
    // Update R-R interval, HR
    let bpm = avr_bpm;
    let deltaRRx = Math.round( bpm );
    if ( x == RPULSEX  && RPULSEX != RRPrevX ) {
        bpm =  RRPrevX > 0 ? (60/((RPULSEX - RRPrevX)*dT/w)) : bpm;
        deltaRRx = Math.round( bpm ); 
        updateDisplayHR(deltaRRx, DISPLAY_ELEMS);
        RRPrevX = RPULSEX;
    }
    if ( x == VPULSEX  && VPULSEX != RRPrevX) {
        bpm = (60/((VPULSEX - RRPrevX)*dT/w));
        deltaRRx = Math.round( bpm );
        updateDisplayHR(deltaRRx, DISPLAY_ELEMS);
        RRPrevX = VPULSEX;
    }
    
    // @TODO Update RPULSEX (R-R interval) for RPULSE-dependents (i.e. HR, BP...etc.)
    
    return Math.min(y + h / 2, h);
}

function updateDisplayHR (hr:number, DISPLAY_ELEMS: IDomNodes) {
    HR_BPM = hr;
    DISPLAY_ELEMS["hr_display_v"].textContent = hr.toString();
}
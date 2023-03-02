import $ from "jquery";
import {IPresetFunctions, IDomNodes, IDomInputNodes} from "./Interfaces";
import {Pulse, getRandomInt, getDomNodes, getDomInputNodes, GraphMonitor} from "./helpers";

var SN_VAR: number = 0, AV_VAR: number = 0, QRS_VAR:number = 0;
var RPULSEX = 0; // x when r pulsed


$(() => {

    // DOM elements
    const DISPLAY_ELEMS: IDomNodes = getDomNodes("#mon-area .value"); console.log(`display outs:`, DISPLAY_ELEMS);
    const SETTINGS_INPUTS: IDomInputNodes = getDomInputNodes("#setup-area input"); console.log(`settings:`, SETTINGS_INPUTS);
    const PACER_INPUTS: IDomInputNodes = getDomInputNodes("#pacer-controls input"); console.log(`pacer_settings:`, PACER_INPUTS);

    // SETTINGS events
    const reset_btn = document.getElementById("reset_btn"); 
    reset_btn.onclick = (event) => {
        Array.from(document.getElementsByTagName('input')).forEach( input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change')); 
            
            if (input.type=="checkbox"){
                input.checked = input.defaultChecked;
            }
        });
        Array.from(document.getElementsByTagName('select')).forEach( sel => {
            sel.selectedIndex = 0; 
            sel.dispatchEvent(new Event('change')); 
        });
    }
    const hide_settings_btn = document.getElementById("hide_settings_btn");
    hide_settings_btn.onclick = (event) => {
        //.classList.toggle
        var target = document.getElementById("setup-area");
    target.classList.toggle("_mini");
    }

    // Preset innate rhythm selection options
    const presets_sel = document.getElementById("innate-sel");
    var PRESETS: IPresetFunctions = {
        "2ndavb1": () => {
            SETTINGS_INPUTS["pr_v"].value='2';
            SETTINGS_INPUTS["pr_cb"].checked = true;
            SETTINGS_INPUTS["qrs_n"].value='3';
        },
        "2ndavb2": () => {
            SETTINGS_INPUTS["qrs_n"].value='3';
            SETTINGS_INPUTS["qrs_r"].checked = true;
        },
        "3rdavb": () => {
            SETTINGS_INPUTS["snr_v"].value='100';
            SETTINGS_INPUTS["avr_v"].value='30';
            SETTINGS_INPUTS["qrs_w"].value='5';
        },
        "junctionalbd": () => {
            SETTINGS_INPUTS["snr_v"].value='50';
            SETTINGS_INPUTS["avr_v"].value='50';
            SETTINGS_INPUTS["p_h"].value='-1';
            SETTINGS_INPUTS["qrs_w"].value='0.8';
        },
        "ventescape": () => {
            SETTINGS_INPUTS["snr_v"].value='10';
            SETTINGS_INPUTS["avr_v"].value='40';
            SETTINGS_INPUTS["qrs_n"].value='4';
            SETTINGS_INPUTS["qrs_w"].value='5';
        }
        
    }
    presets_sel.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        Array.from(document.getElementsByTagName('input')).forEach( input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change')); 
            
            if (input.type=="checkbox"){
                input.checked = input.defaultChecked;
            }
        });
        if (key in PRESETS) {
            PRESETS[key]();
        }
    };

    const snr_btn = SETTINGS_INPUTS["snr_v"];
    snr_btn.onchange = (event: Event) => {
        SETTINGS_INPUTS["avr_v"].value = snr_btn.value;
    };

    const sys_btn = SETTINGS_INPUTS["sys_v"];
    sys_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS["sys_display_v"].textContent = newV.toString();
    };
    sys_btn.defaultValue='100';
    sys_btn.dispatchEvent(new Event('change'));

    const dia_btn = SETTINGS_INPUTS["dia_v"];
    dia_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS["dia_display_v"].textContent = newV.toString();
    };
    dia_btn.defaultValue='40';
    dia_btn.dispatchEvent(new Event('change'));

    // MONITOR control events
    const pp_btn = document.getElementById("playpause_btn");
    pp_btn.onclick = (event) => {
        hr_graph.PlayPause();
        bp_graph.PlayPause();
    }
    const nX = <HTMLInputElement>document.getElementById("nX");
    nX.onchange = (event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        hr_graph.X = 0;
        hr_graph.nX = newV;
        bp_graph.X = 0;
        bp_graph.nX = newV;
    };

    // CREATE GRAPHS

    const hr_graph = new GraphMonitor("canvashr", {nDIVX: Number(nX?.value) || 5});
    hr_graph.Y = (x) => {
    const w = hr_graph.WIDTH, h = hr_graph.HEIGHT, dT = hr_graph.nDIVX; 
    
    // Get values from page
    // settings vars
    const snr_bpm = SETTINGS_INPUTS["snr_v"]?.value != 'undefined'? Number(SETTINGS_INPUTS["snr_v"]?.value) : 60;
    const avr_bpm = SETTINGS_INPUTS["avr_v"]?.value != 'undefined'? Number(SETTINGS_INPUTS["avr_v"]?.value) : 60;
    const p_h_mod = SETTINGS_INPUTS["p_h"]?.value != 'undefined'? Number(SETTINGS_INPUTS["p_h"]?.value) : 1;
    const pr_v_mod = SETTINGS_INPUTS["pr_v"]?.value != 'undefined'? Number(SETTINGS_INPUTS["pr_v"]?.value) : 1;
    const st_v_mod = SETTINGS_INPUTS["st_v"]?.value != 'undefined'? Number(SETTINGS_INPUTS["st_v"]?.value) : 1;
    const t_w_mod = SETTINGS_INPUTS["t_w"]?.value != 'undefined'? Number(SETTINGS_INPUTS["t_w"]?.value) : 1;
    const qrs_n = Number(SETTINGS_INPUTS["qrs_n"]?.value) || 0;
    const qrs_w_mod = SETTINGS_INPUTS["qrs_w"]?.value != 'undefined'? Number(SETTINGS_INPUTS["qrs_w"]?.value) : 1;
    const qrs_h_mod = SETTINGS_INPUTS["qrs_h"]?.value != 'undefined'? Number(SETTINGS_INPUTS["qrs_h"]?.value) :  1;
    // modifiers
    const pr_cb = SETTINGS_INPUTS["pr_cb"]?.checked || false; 
    const qrs_cb = SETTINGS_INPUTS["qrs_cb"]?.checked || false; 
    const snr_cb = SETTINGS_INPUTS["snr_cb"]?.checked || false;
    const avr_cb = SETTINGS_INPUTS["avr_cb"]?.checked || false;
    // pacer vars
    const p_detect = PACER_INPUTS["p_detect"]; 
    const s_detect = PACER_INPUTS["s_detect"]; 
    const pacer_bpm = PACER_INPUTS["pacer_rate"]?.value != 'undefined'? Number(PACER_INPUTS["pacer_rate"].value) : 80;
    const aout_min = SETTINGS_INPUTS["a_out_min"]?.value || 0;
    const vout_min = SETTINGS_INPUTS["v_out_min"]?.value || 0;		
    const a_out_mA = PACER_INPUTS["a_out"]?.value || 20;
    const v_out_mA = PACER_INPUTS["v_out"]?.value || 20;
    const dx = x%w; 
    
    // bpm --> bps --> pxps
    const dxps = (60/snr_bpm) * (w/dT) || 0, 
        dx2ps = (60/avr_bpm) * (w/dT) || 0, 
        adxps = (60/pacer_bpm) * (w/dT) || 0;
        
    //** PACER A PULSE **//
    let a = 0;
    const a_i = 0, a_h = 60;
    //console.log(pacer_bpm);	
    if( x % (adxps) < 1 && pacer_bpm !=0) {  
        a += a_h;				
    }
    
    //** INNATE RHYTHM **//
    let n1 = Math.floor(x/dxps) || 0, 
        n2 = Math.floor(x/dx2ps) || 0;
    let p = 0, q = 0, r = 0, s = 0.000, t = 0;	
    
    // default amplitudes
    let p_h = 10*p_h_mod, 
        q_h = -10*qrs_h_mod, r_h = 60*qrs_h_mod, s_h = -20*qrs_h_mod, 
        t_h = 10*qrs_h_mod;
    let noise = Math.random() * 0.2 + 1;
    
    // default durations (seconds)
    let p_w = 0.012, 
        q_w = 0.005*qrs_w_mod, r_w = 0.008*qrs_w_mod, s_w = 0.010*qrs_w_mod, 
        t_w = 0.040*t_w_mod;
    
    let qrs_drop_counter = qrs_n>0? n2%(qrs_n+QRS_VAR) : n2+1;
    let drop = !(qrs_drop_counter>0)? 0:1;
    let pq_multiplier = pr_cb? qrs_drop_counter : 1;
    let p_q_interval = 0.04*pr_v_mod*pq_multiplier; 
    
    let p_i = a_i+p_w/2 + 0.02;
    let q_i = p_i + p_w + q_w/2 + p_q_interval; 
    let r_i = q_i + q_w + r_w/2 + 0.02;
    let s_i = r_i + r_w + s_w/2 + 0.01; 
    let t_i = s_i + s_w + t_w/2 + 0.20*st_v_mod; 		
    
    // P wave
    if (snr_bpm>0){
    
        // update params on new SN beat
        if( Math.floor((hr_graph.X-1)/dxps) != n1) {
        // arrhythmia due to variable sn node rate +/- 25%
        SN_VAR = snr_cb? 0.75*dxps * Math.random() * 0.25 + 1 : 0; 
        
        };
        
        p += Pulse(x, p_i*(w/dT) + n1*dxps + SN_VAR, p_h * noise, p_w*(w/dT));
        
    }
    
    // QRST
    if (avr_bpm>0) {
        // update params on new AV beat
        if( Math.floor((hr_graph.X-1)/dx2ps) != n2) {
        // arrhythmia due to variable sn node rate +/- 25%
        AV_VAR = avr_cb? 0.75*dx2ps * Math.random() * 0.25 + 1 : SN_VAR; 
        
        // drop qrs randomly based on qrs_n -- min qrs_n, max 2*qrs_n 
        QRS_VAR = qrs_cb? getRandomInt(0,qrs_n) : 0; //console.log(qrs_drop_counter,drop);
        
        };
        
        q += Pulse(x, q_i*(w/dT) + n2*dx2ps + AV_VAR, q_h*noise*drop, q_w*(w/dT));
        r += Pulse(x, r_i*(w/dT) + n2*dx2ps + AV_VAR, r_h*noise*drop, r_w*(w/dT));
        s += Pulse(x, s_i*(w/dT) + n2*dx2ps + AV_VAR, s_h*noise*drop, s_w*(w/dT));
        t += Pulse(x, t_i*(w/dT) + n2*dx2ps + AV_VAR, t_h*noise*drop, t_w*(w/dT));
            
        //let v = Pulse(x-0.2*dx2ps,0.1*pr_v_mod*dx2ps+n2*dx2ps, 50, 2) + Pulse(x-0.2*dx2ps,5+n2*dx2ps, 100, 2);; 		
        //console.log(n2, dx2ps, dT);
    }
                                                
    let y = a + p + q + r + s + t;  
        
    // UI OUTPUT VARS
    p_detect.checked = a > 0; 
    if (Math.abs(r)>0.95*r_h) { 
        let offset = +0.15*dx2ps;
        let deltaRx = x-RPULSEX+offset;
        
        if (deltaRx > offset && RPULSEX>0) {
        let HR: number = deltaRx>0? (w / dT)/deltaRx *60 : snr_bpm; 				
        DISPLAY_ELEMS["hr_display_v"].textContent = Math.round(HR).toString(); 
        }
        
        RPULSEX = x+offset; 
        //Math.floor(dT*dx/w) --> count seconds loop graph
    }
    
    return y + h/2; 
    }
    const bp_graph = new GraphMonitor("canvasbp", {nDIVX: Number(nX?.value) || 5});
    bp_graph.Y = (x) => {
        const w = bp_graph.WIDTH, h = bp_graph.HEIGHT, dT = bp_graph.nDIVX; 
        const beat_threshold = 14;
        const maxH = 240;
        const hrY = hr_graph.GetYatX(x);
        const systolic_bpm = SETTINGS_INPUTS["sys_v"]?.value!= 'undefined'? Number(SETTINGS_INPUTS["sys_v"]?.value) : 120;
        const diastolic_bpm = SETTINGS_INPUTS["dia_v"]?.value!= 'undefined'? Number(SETTINGS_INPUTS["dia_v"]?.value) : 60;
            
        const sys_pulse_h = systolic_bpm/maxH * h; 
        const dia_pulse_h = diastolic_bpm/maxH * h; 
        
        let pw = 10;
            
        if (100 - hrY > beat_threshold) {
            //RPULSEX = x;
        }
        
        let pulse1 = Pulse(x, RPULSEX, sys_pulse_h, pw) ; 
        let pulse2 = Pulse(x, RPULSEX+pw*3, dia_pulse_h, pw*2.5); 
        return RPULSEX>0?  pulse1 + pulse2 + h : h;
    }

});

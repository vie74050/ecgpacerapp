import './scss/styles.scss';
import $ from "jquery";
import { IPresetFunctions, IDomNodes, IDomInputNodes } from "./Interfaces";
import { Pulse, getRandomInt, getDomNodes, getDomInputNodes, GraphMonitor } from "./helpers";

$(() => {
    var SN_VAR: number = 0, AV_VAR: number = 0, QRS_VAR: number = 0;
    var RPULSEX = 0; // x when r pulsed

    // DOM elements
    const DISPLAY_ELEMS: IDomNodes = getDomNodes("#mon-area .value"); console.log(`display outs:`, DISPLAY_ELEMS);
    const SETTINGS_INPUTS: IDomInputNodes = getDomInputNodes("#setup-area input"); console.log(`settings:`, SETTINGS_INPUTS);
    const PACER_INPUTS: IDomInputNodes = getDomInputNodes("#pacer-controls input"); console.log(`pacer_settings:`, PACER_INPUTS);

     // MONITOR control events
     const pp_btn = document.getElementById("playpause_btn");
     pp_btn.onclick = (event) => {
         hr_graph.PlayPause();
         bp_graph.PlayPause();
     }
     const nX = <HTMLInputElement>document.getElementById("nX");
     nX.onchange = (event) => {
         let newV = Number((event.target as HTMLInputElement).value);
         hr_graph.X = -1;
         hr_graph.nX = newV;
         bp_graph.X = -1;
         bp_graph.nX = newV;
     };
 
     // PACER control events
     const pacer_mode_btn = document.getElementById("pacer_mode");
     pacer_mode_btn.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        let chars = key.split(''); // [pacing, sensing, sense response]

        // pacing
        switch (chars[0]) {
            case 'a':
                PACER_INPUTS["a_out"].disabled = false;
                PACER_INPUTS["v_out"].disabled = true;
                break;
            case 'v':
                PACER_INPUTS["v_out"].disabled = false;
                PACER_INPUTS["a_out"].disabled = true;
                break;
            case 'd':
                PACER_INPUTS["a_out"].disabled = false;
                PACER_INPUTS["v_out"].disabled = false;
                break;
            case 'o':
                PACER_INPUTS["a_out"].disabled = true;
                PACER_INPUTS["v_out"].disabled = true;
            default:
                break;
        }

        // sensing
        switch (chars[1]) {
            case 'a':
                PACER_INPUTS["a_sense"].disabled = false;
                PACER_INPUTS["v_sense"].disabled = true;
                break;
            case 'v':
                PACER_INPUTS["v_sense"].disabled = false;
                PACER_INPUTS["a_sense"].disabled = true;
                break;
            case 'd':
                PACER_INPUTS["a_sense"].disabled = false;
                PACER_INPUTS["v_sense"].disabled = false;
                break;
            case 'o':
                PACER_INPUTS["a_sense"].disabled = true;
                PACER_INPUTS["v_sense"].disabled = true;
            default:
                break;
        }
       
        switch (chars[2]) { //@TODO
            case 'i':
                break;
            case 'd':
                break;
            case 't':
            case 'o':
            default:
                break;
        }
     }
     pacer_mode_btn.dispatchEvent(new Event('change'));
 
    // SETTINGS events
    const reset_btn = document.getElementById("reset_btn");
    reset_btn.onclick = (event: Event) => {
        Array.from(document.getElementsByTagName('input')).forEach(input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change'));

            if (input.type == "checkbox") {
                input.checked = input.defaultChecked;
            }
        });
        Array.from(document.getElementsByTagName('select')).forEach(sel => {
            sel.selectedIndex = 0;
            sel.dispatchEvent(new Event('change'));
        });
    }
    const hide_settings_btn: HTMLSelectElement = <HTMLSelectElement>document.getElementById("hide_settings_btn");
    hide_settings_btn.onclick = (event: Event) => {
        var target = document.getElementById("setup-area");
        target.classList.toggle("_mini");
    }

    // Preset innate rhythm selection options
    const presets_sel = document.getElementById("innate-sel");
    var PRESETS: IPresetFunctions = {
        "2ndavb1": () => {
            SETTINGS_INPUTS["pr_v"].value = '2';
            SETTINGS_INPUTS["pr_cb"].checked = true;
            SETTINGS_INPUTS["qrs_n"].value = '3';
        },
        "2ndavb2": () => {
            SETTINGS_INPUTS["qrs_n"].value = '3';
            SETTINGS_INPUTS["qrs_r"].checked = true;
        },
        "3rdavb": () => {
            SETTINGS_INPUTS["snr_v"].value = '100';
            SETTINGS_INPUTS["avr_v"].value = '30';
            SETTINGS_INPUTS["qrs_w"].value = '5';
        },
        "junctionalbd": () => {
            SETTINGS_INPUTS["snr_v"].value = '50';
            SETTINGS_INPUTS["avr_v"].value = '50';
            SETTINGS_INPUTS["p_h"].value = '-1';
            SETTINGS_INPUTS["qrs_w"].value = '0.8';
        },
        "ventescape": () => {
            SETTINGS_INPUTS["snr_v"].value = '10';
            SETTINGS_INPUTS["avr_v"].value = '40';
            SETTINGS_INPUTS["qrs_n"].value = '4';
            SETTINGS_INPUTS["qrs_w"].value = '5';
        }

    }
    presets_sel.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        Array.from(document.getElementsByTagName('input')).forEach(input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change'));

            if (input.type == "checkbox") {
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
    sys_btn.defaultValue = sys_btn.value;
    sys_btn.dispatchEvent(new Event('change'));

    const dia_btn = SETTINGS_INPUTS["dia_v"];
    dia_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS["dia_display_v"].textContent = newV.toString();
    };
    dia_btn.defaultValue = dia_btn.value;
    dia_btn.dispatchEvent(new Event('change'));

    // CREATE GRAPHS

    const hr_graph = new GraphMonitor("canvashr", { nDIVX: Number(nX?.value) || 5 });
    hr_graph.Y = (x) => {
        const w = hr_graph.WIDTH, h = hr_graph.HEIGHT, dT = hr_graph.nDIVX;
        const maxH_mV = 25; // y-axis in mV --> 0.5 h in px

        // Get values from page
        // settings vars
        const snr_bpm = SETTINGS_INPUTS["snr_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["snr_v"]?.value) : 60;
        const avr_bpm = SETTINGS_INPUTS["avr_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["avr_v"]?.value) : 60;
        const p_h_mod = SETTINGS_INPUTS["p_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["p_h"]?.value) : 1;
        const pr_v_mod = SETTINGS_INPUTS["pr_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["pr_v"]?.value) : 1;
        const st_v_mod = SETTINGS_INPUTS["st_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["st_v"]?.value) : 1;
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
        const vout_min = Number(SETTINGS_INPUTS["v_out_min"]?.value) || 0;
        const a_out_mA = Number(PACER_INPUTS["a_out"]?.value) || 0;
        const v_out_mA = Number(PACER_INPUTS["v_out"]?.value) || 0;
        const asense_mV = Number(PACER_INPUTS["a_sense"]?.value) || 0;
        const vsense_mV = Number(PACER_INPUTS["v_sense"]?.value) || 0;
        const dx = x % w;

        // bpm --> bps --> pxps
        const dxps = (60 / snr_bpm) * (w / dT) || 0,
            dx2ps = (60 / avr_bpm) * (w / dT) || 0,
            dx3ps = (60 / pacer_bpm) * (w / dT) || 0;
        
        //** INNATE RHYTHM **//
        const n1 = Math.floor(x / dxps) || 0,
            n2 = Math.floor(x / dx2ps) || 0,
            n3 =Math.floor(x / dx3ps) || 0;

        let p = 0, q = 0, r = 0, s = 0.000, t = 0;

        // default amplitudes
        let p_h = 10 * p_h_mod,
            q_h = -10 * qrs_h_mod, 
            r_h = 60 * qrs_h_mod, 
            s_h = -20 * s_h_mod,
            t_h = 10 * t_h_mod;
        let noise = Math.random() * 0.2 + 1;

        // default durations (seconds)
        let p_w = 0.012,
            q_w = 0.005 * qrs_w_mod, 
            r_w = 0.009 * qrs_w_mod, 
            s_w = 0.010 * qrs_w_mod,
            t_w = 0.040 * t_w_mod;

        let qrs_drop_counter = qrs_n > 0 ? n2 % (qrs_n + QRS_VAR) : n2 + 1;
        let drop = !(qrs_drop_counter > 0) ? 0 : 1;
        let pq_multiplier = pr_cb ? qrs_drop_counter : 1;
        let p_q_interval = 0.04 * pr_v_mod * pq_multiplier;

        let p_i = p_w / 2 + 0.2;
        let q_i = p_i + p_w + q_w / 2 + p_q_interval;
        let r_i = q_i + q_w + r_w / 2 + 0.02;
        let s_i = r_i + r_w + s_w / 2 + 0.01;
        let t_i = s_i + s_w + t_w / 2 + 0.20 * st_v_mod;

        // Innate P wave
        if (snr_bpm > 0) {

            // update params on new SN beat
            if (Math.floor((hr_graph.X - 1) / dxps) != n1) {
                // arrhythmia due to variable sn node rate +/- 25%
                SN_VAR = snr_cb ? 0.75 * dxps * Math.random() * 0.25 + 1 : 0;
            };

            p = Pulse(x, p_i * (w / dT) + n1 * dxps + SN_VAR, p_h * noise, p_w * (w / dT));

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

            q = Pulse(x, q_i * (w / dT) + n2 * dx2ps + AV_VAR, q_h * noise * drop, q_w * (w / dT));
            r = Pulse(x, r_i * (w / dT) + n2 * dx2ps + AV_VAR, r_h * noise * drop, r_w * (w / dT));
            s = Pulse(x, s_i * (w / dT) + n2 * dx2ps + AV_VAR, s_h * noise * drop, s_w * (w / dT));
            t = Pulse(x, t_i * (w / dT) + n2 * dx2ps + AV_VAR, t_h * noise * drop, t_w * (w / dT));

            //let v = Pulse(x-0.2*dx2ps,0.1*pr_v_mod*dx2ps+n2*dx2ps, 50, 2) + Pulse(x-0.2*dx2ps,5+n2*dx2ps, 100, 2);; 		
            //console.log(n2, dx2ps, dT);
        }

        //** PACER A PULSE & RESPONSE **//
                
        //const innateP_mV = Pulse(p_i * (w / dT) + n1 * dxps + SN_VAR, p_i * (w / dT) + n1 * dxps + SN_VAR, p_h, p_w * (w / dT)); 
        let apacing = !PACER_INPUTS["a_out"].disabled && pacer_bpm > 0;
        let asensing = !PACER_INPUTS["a_sense"].disabled;   //@TODO - , simulated fail to pace  
        let atrigger = a_out_mA > 0 && a_out_mA >= aout_min;  //@TODO - simulated fail to capture
        let asensed = -p >= asense_mV; //@todo if innate P > asense_mV normalized -- MAGNITUDE ONLY? Maybe look at rate dx..?

        // A Pulse	
        let a = 0, a_h = 60;
        if ( x % (dx3ps) < 1 ) { 
            if (apacing && !asensing || apacing && asensing && !asensed) a = a_h; 
            if (apacing && asensing && asensed) a = -a_h; 
            console.log("A pulse: ", Math.abs(p), a);
        }
        // A Response
        const a_i = 0.04;
        if (apacing && atrigger && !asensed) { //console.log('triggering a');
            p_i = (a_i) * (w / dT);
            p = Pulse(x, p_i + n3 * dx3ps, 2*p_h , p_w * (w / dT));
        }

        //** PACER V PULSE & RESPONSE **//
        let vpacing = !PACER_INPUTS["v_out"].disabled && pacer_bpm > 0;
        let vsensing = !PACER_INPUTS["v_sense"].disabled; //@TODO - look if vsense_mV normalized > innate QRST, simulated fail to pace...etc. 
        let vtrigger = v_out_mA > 0 && v_out_mA >= vout_min; //@TODO - simulated fail to capture
        let vsensed = q_h/h * maxH_mV >= vsense_mV || r_h/h * maxH_mV >= vsense_mV || s_h/h * maxH_mV >= vsense_mV || t_h/h * maxH_mV >= vsense_mV;
   
        // V Pulse
        let v = 0, v_h = 80;
        const v_i = p_i + 4*p_w * (w / dT); //@TODO: Question re: v_i    
        if ( (x-v_i) % (dx3ps) < 1  ) {   
            if (vpacing && !vsensing) v = v_h;           
        }
        // V Response
        if (vpacing && vtrigger) { //console.log('triggering v');        
            
            r_h = -60 * noise;
            r_w = 0.06 * dx3ps;
            r_i = v_i + 5*r_w;

            s_h = -40 * noise;
            s_w = 0.02 * dx3ps;
            s_i = r_i + 4*s_w;
            
            t_h = 30 * noise;
            t_w = 0.1 * dx3ps; 
            t_i = r_i + 1.5*t_w;

            q = 0;
            r = Pulse(x, r_i + n3 * dx3ps, r_h, r_w);
            s = Pulse(x, s_i + n3 * dx3ps, s_h, s_w);
            t = Pulse(x, t_i + n3 * dx3ps, t_h, t_w);
        }
       
        let y = a + p + v + q + r + s + t;

        // UI OUTPUT VARS
        p_detect.checked = a > 0 || v > 0;
        //@TODO s_detect.checked = p_h > 0 || v > 0;

        // Update RPULSEX (R-R interval) for RPULSE-dependents (i.e. HR, BP...etc.)
        if (Math.abs(r) > Math.abs(0.9 * r_h)) { 
            let offset = 0.15 * dx2ps;
            let deltaRx = x - RPULSEX + offset;

            // update displayed HR
            if (deltaRx > offset && RPULSEX > 0) {
                let HR: number = deltaRx > 0 ? (w / dT) / deltaRx * 60 : avr_bpm;
                DISPLAY_ELEMS["hr_display_v"].textContent = Math.round(HR).toString();
            }

            RPULSEX = x + offset;
            //Math.floor(dT*dx/w) --> count seconds loop graph
        }

        return y + h / 2;
    }
    const bp_graph = new GraphMonitor("canvasbp", { nDIVX: Number(nX?.value) || 5 });
    bp_graph.Y = (x) => {
        const h = bp_graph.HEIGHT, w = bp_graph.WIDTH, dT = bp_graph.nDIVX;
        const hr_bpm = Number(SETTINGS_INPUTS["avr_v"].value);
        const maxH = 200;
        const systolic_bpm = SETTINGS_INPUTS["sys_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["sys_v"]?.value) : 120;
        const diastolic_bpm = SETTINGS_INPUTS["dia_v"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["dia_v"]?.value) : 60;
        const rx = 60 * (w/dT) / hr_bpm;
        const pw = 0.035* rx; 
        const dh = systolic_bpm - diastolic_bpm;

        const pulse_sys = Pulse(x/pw, RPULSEX/pw + 1.2*pw, 1, pw);
        const pulse_dia = Pulse(x/pw, RPULSEX/pw  + 3.8*pw, 0.6, 1.2*pw);
        const pulse = hr_bpm>0? dh * (pulse_sys + pulse_dia) - diastolic_bpm : 0;

        //console.log(dT, rx, pw/5);
        return RPULSEX > 0 ? pulse/maxH * h + h  : h;
    }

});

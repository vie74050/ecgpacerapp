import { IDomNodes, IDomInputNodes } from "../Interfaces";
import { Pulse, getRandomInt, GraphMonitor } from "../helpers";

export var SN_VAR: number = 0,
    AV_VAR: number = 0,
    QRS_VAR: number = 0,
    RPULSEX = 0; // x when r pulsed

export function GraphY(x: number, hr_graph: GraphMonitor, SETTINGS_INPUTS: IDomInputNodes, PACER_INPUTS: IDomInputNodes, DISPLAY_ELEMS: IDomNodes) {
    const w = hr_graph.WIDTH, h = hr_graph.HEIGHT, dT = hr_graph.nDIVX;
    const maxH_mV = 25; // y-axis in mV --> 0.5 h in px

    // Get values from page
    // settings vars
    const snr_bpm = SETTINGS_INPUTS['sn_r']?.value != 'undefined' ? Number(SETTINGS_INPUTS['sn_r']?.value) : 60;
    const avr_bpm = SETTINGS_INPUTS['av_r']?.value != 'undefined' ? Number(SETTINGS_INPUTS['av_r']?.value) : 60;
    const p_h_mod = SETTINGS_INPUTS["p_h"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["p_h"]?.value) : 1;
    const pr_w_mod = SETTINGS_INPUTS["pr_w"]?.value != 'undefined' ? Number(SETTINGS_INPUTS["pr_w"]?.value) : 1;
    const st_mod = SETTINGS_INPUTS['st_v']?.value != 'undefined' ? Number(SETTINGS_INPUTS['st_v']?.value) : 1;
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
        n3 = Math.floor(x / dx3ps) || 0;

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
    let p_q_interval = 0.04 * pr_w_mod * pq_multiplier;

    let p_i = p_w / 2 + 0.2;
    let q_i = p_i + p_w + q_w / 2 + p_q_interval;
    let r_i = q_i + q_w + r_w / 2 + 0.02;
    let s_i = r_i + r_w + s_w / 2 + 0.01;
    let t_i = s_i + s_w + t_w / 2 + 0.20 * st_mod;

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

        //let v = Pulse(x-0.2*dx2ps,0.1*pr_w_mod*dx2ps+n2*dx2ps, 50, 2) + Pulse(x-0.2*dx2ps,5+n2*dx2ps, 100, 2);; 		
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
    if (x % (dx3ps) < 1) {
        if (apacing && !asensing || apacing && asensing && !asensed) a = a_h;
        if (apacing && asensing && asensed) a = -a_h;
        //console.log("A pulse: ", Math.abs(p), a);
    }
    // A Response
    const a_i = 0.04;
    if (apacing && atrigger && !asensed) { //console.log('triggering a');
        p_i = (a_i) * (w / dT);
        p = Pulse(x, p_i + n3 * dx3ps, 2 * p_h, p_w * (w / dT));
    }

    //** PACER V PULSE & RESPONSE **//
    let vpacing = !PACER_INPUTS["v_out"].disabled && pacer_bpm > 0;
    let vsensing = !PACER_INPUTS["v_sense"].disabled; //@TODO - look if vsense_mV normalized > innate QRST, simulated fail to pace...etc. 
    let vtrigger = v_out_mA > 0 && v_out_mA >= vout_min; //@TODO - simulated fail to capture
    let vsensed = q_h / h * maxH_mV >= vsense_mV || r_h / h * maxH_mV >= vsense_mV || s_h / h * maxH_mV >= vsense_mV || t_h / h * maxH_mV >= vsense_mV;

    // V Pulse
    let v = 0, v_h = 80;
    const v_i = p_i + 4 * p_w * (w / dT); //@TODO: Question re: v_i    
    if ((x - v_i) % (dx3ps) < 1) {
        if (vpacing && !vsensing) v = v_h;
    }
    // V Response
    if (vpacing && vtrigger) { //console.log('triggering v');        

        r_h = -60 * noise;
        r_w = 0.06 * dx3ps;
        r_i = v_i + 5 * r_w;

        s_h = -40 * noise;
        s_w = 0.02 * dx3ps;
        s_i = r_i + 4 * s_w;

        t_h = 30 * noise;
        t_w = 0.1 * dx3ps;
        t_i = r_i + 1.5 * t_w;

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
import { IDomInputNodes } from "../Interfaces";

enum modes {o,i,t,d};
export var ResponseMode: modes;

export function Setup(PACER_INPUTS: IDomInputNodes, nX:HTMLInputElement) {
    const pacer_mode_btn = document.getElementById("pacer_mode");
     pacer_mode_btn!.onchange = (event: Event) => {
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
       
        ResponseMode = modes[chars[2]];
       
        nX.dispatchEvent(new Event('change')); // redraw graphs

     }
     pacer_mode_btn!.dispatchEvent(new Event('change'));
}
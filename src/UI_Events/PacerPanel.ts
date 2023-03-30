import { IDomInputNodes } from "../Interfaces";
import { getDomInputNodes } from "../helpers";
import * as Display from './DisplayPanel';

enum modes {o,i,t,d};
var ResponseMode: modes;
var INPUTS: IDomInputNodes;
export {ResponseMode, INPUTS};

export function Setup(id: string) {
    INPUTS = getDomInputNodes("#_pacer input"); 

    const nX = Display.nX;

    const pacer_mode_btn = document.getElementById("pacer_mode");
     pacer_mode_btn!.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        let chars = key.split(''); // [pacing, sensing, sense response]

        // pacing
        switch (chars[0]) {
            case 'a':
                INPUTS["a_out"].disabled = false;
                INPUTS["v_out"].disabled = true;
                break;
            case 'v':
                INPUTS["v_out"].disabled = false;
                INPUTS["a_out"].disabled = true;
                break;
            case 'd':
                INPUTS["a_out"].disabled = false;
                INPUTS["v_out"].disabled = false;
                break;
            case 'o':
                INPUTS["a_out"].disabled = true;
                INPUTS["v_out"].disabled = true;
            default:
                break;
        }

        // sensing
        switch (chars[1]) {
            case 'a':
                INPUTS["a_sense"].disabled = false;
                INPUTS["v_sense"].disabled = true;
                break;
            case 'v':
                INPUTS["v_sense"].disabled = false;
                INPUTS["a_sense"].disabled = true;
                break;
            case 'd':
                INPUTS["a_sense"].disabled = false;
                INPUTS["v_sense"].disabled = false;
                break;
            case 'o':
                INPUTS["a_sense"].disabled = true;
                INPUTS["v_sense"].disabled = true;
            default:
                break;
        }
       
        ResponseMode = modes[chars[2]];
       
        nX.dispatchEvent(new Event('change')); // redraw graphs

     }
     pacer_mode_btn!.dispatchEvent(new Event('change'));
}
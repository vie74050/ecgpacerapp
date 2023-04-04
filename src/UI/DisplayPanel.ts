import { IDomNodes } from "../Interfaces";
import { getDomNodes } from "../helpers";

var DisplayNodes: IDomNodes;
var nX: HTMLInputElement;

export {DisplayNodes, nX};

export function Setup(selectors: string) {

    DisplayNodes = getDomNodes(selectors); 
    nX = <HTMLInputElement>DisplayNodes["nX"] || <HTMLInputElement>document.getElementById("nX");

    const pp_btn = document.getElementById("playpause_btn");
    const ppEvent: Event = new Event("playpause");
    
    pp_btn!.onclick = (event) => {
        window.dispatchEvent(ppEvent);
    }
}
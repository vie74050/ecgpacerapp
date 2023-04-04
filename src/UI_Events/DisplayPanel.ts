import { IDomNodes } from "../Interfaces";
import { getDomNodes } from "../helpers";

var DisplayNodes: IDomNodes;
var nX: HTMLInputElement;

export {DisplayNodes, nX};

export function Setup(id: string) {

    DisplayNodes = getDomNodes(id);
    nX = <HTMLInputElement>document.getElementById("nX");

    const pp_btn = document.getElementById("playpause_btn");
    const ppEvent: Event = new Event("playpause");
    
    pp_btn!.onclick = (event) => {
        window.dispatchEvent(ppEvent);
    }
}
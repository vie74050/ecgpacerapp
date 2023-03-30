import { GraphMonitor } from "../Graph/GraphMonitor";
import * as HRGraph from "../Graph/HR_graphY";
import { IDomNodes } from "../Interfaces";
import { getDomNodes } from "../helpers";

var DisplayNodes: IDomNodes;
var nX: HTMLInputElement;
export {DisplayNodes, nX};

export function Setup(id: string, hr_graph: GraphMonitor, bp_graph: GraphMonitor) {

    DisplayNodes = getDomNodes(id);
    nX = <HTMLInputElement>document.getElementById("nX");

    const pp_btn = document.getElementById("playpause_btn");
    pp_btn!.onclick = (event) => {
        hr_graph.PlayPause();
        bp_graph.PlayPause();
    }

    nX.onchange = (event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        hr_graph.X = -1;
        hr_graph.nX = newV;
        bp_graph.X = -1;
        bp_graph.nX = newV;

        HRGraph.reset();
    };

}
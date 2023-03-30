import { GraphMonitor } from "../GraphMonitor";
import * as HRGraph from "../Presets/HR_graphY";

export function Setup(hr_graph: GraphMonitor, bp_graph: GraphMonitor, nX:HTMLInputElement) {
    const pp_btn = document.getElementById("playpause_btn");
    pp_btn.onclick = (event) => {
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
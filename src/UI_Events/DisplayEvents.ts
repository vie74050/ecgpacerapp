import { GraphMonitor } from "../GraphMonitor";

export function Setup(hr_graph: GraphMonitor, bp_graph: GraphMonitor) {
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

}
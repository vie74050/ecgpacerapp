import { IDomNodes, IDomInputNodes } from "./Interfaces";

//** HELPERS DOM & type manipulation *********************************//

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getDomNodes(selector: string): IDomNodes {
    const returnNodes: IDomNodes = {};
    const monarea_list = document.querySelectorAll(selector);
    monarea_list.forEach((node) => returnNodes[node.id] = node);

    return returnNodes;
}

export function getDomInputNodes(selector: string): IDomInputNodes {
    const returnNodes: IDomInputNodes = {};
    const monarea_list = document.querySelectorAll(selector);
    monarea_list.forEach((node) => returnNodes[node.id] = <HTMLInputElement>node);

    return returnNodes;
}

/** Get set up parameters.
 * @returns {Array} Array of [paramName, value]
 */
export function findGetParameters() {
    var result = [];
    location.search
        .substring(1)
        .split("&")
        .forEach(function (item) {
          let tmp = item.split("=");
          result.push(tmp);
        });
    return result;
}
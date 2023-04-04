export interface IGraphOptions {
    HEIGHT?: number;
    WIDTH?: number;
    LINE_COLOUR?: string;
    GETY?(x: number): number;
    nDIVX?: number; // seconds shown in graph
}
export interface IPulse {
    w: number;
    h: number;
    i?: number; // x offset &x @ max/min
}
export interface IPresetFunctions {
    [key: string]: Function;
}

export interface IDomNodes {
    [key: string]: Element;
}

export interface IDomInputNodes {
    [key: string]: HTMLInputElement;
}
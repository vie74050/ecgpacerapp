export interface IGraphOptions {
    HEIGHT?: number;
    WIDTH?: number;
    LINE_COLOUR?: string;
    GETY?(x: number): number;
    nDIVX?: number; // seconds shown in graph
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
// use this site https://app.quicktype.io/#l=ts

export interface Idommanipulation {
    ui?: UI;
}

export interface UI {
    node?: Node;
}

export interface Node {
    div?:  Div[];
    body?: Body[];
}

export interface Body {
    attr?: BodyAttr;
    verb?: string;
}

export interface BodyAttr {
    addClass?: string;
}

export interface Div {
    attr?: DivAttr;
    verb?: string;
}

export interface DivAttr {
    addClass?: string[];
    id?:       string;
}



export interface IAttributes {
    class?: string;
    addClass?: string;
    removeClass?: string;
    id?: string
}

export interface Ihtml {
    data?: string; // the HTML of the page returned
    file?: string; // name of the source file 
    url?: string; // path that we redirct to
    statusCode?: number; // HTTP status code
}
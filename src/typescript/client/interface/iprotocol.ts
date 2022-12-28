

export interface Iprotocol {
    request(cmd: string, data: object): void
    go(file: string): boolean
}

export interface Igo {
    url?: string;
    key?: string;
}

export interface IrequestData {
    key?: string;
}
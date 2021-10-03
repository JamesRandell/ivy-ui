

export default interface iprotocol {
    request(cmd: string, data: object): void
    go(file: string): boolean
}
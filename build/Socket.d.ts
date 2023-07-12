/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import SocketConfig from './types/SocketConfig';
import SocketState from './types/SocketState';
export declare interface Socket {
    on(event: 'connect', handler: () => void): this;
    on(event: 'data', handler: (data: Buffer) => void): this;
    on(event: 'state', handler: (state: SocketState) => void): this;
    on(event: 'failed', handler: () => void): this;
}
export declare class Socket extends EventEmitter {
    #private;
    constructor(host: string, port: number, config?: SocketConfig | undefined);
    connect(): void;
    write(data: any): void;
    request(data: any, wait?: number): Promise<Buffer>;
    close(): void;
    destroy(): void;
    get connected(): SocketState;
    private updateConnectedState;
    private handleReconnect;
    private get config();
}
export { SocketState };
export default Socket;

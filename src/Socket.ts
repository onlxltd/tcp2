import { Socket as NetSocket }  from 'net'
import { EventEmitter }         from 'events'

export declare interface Socket {

}

export class Socket extends EventEmitter {

    #_host      : string
    #_port      : number

    #_socket    : NetSocket

    constructor(host: string, port: number) {
        super()

        this.#_host     = host
        this.#_port     = port
        this.#_socket   = new NetSocket()

        this.#_socket.on('connect', () => this.emit('connect'))
        this.connect()
    }

    private connect() {
        this.#_socket.connect({ host: this.#_host, port: this.#_port })
    }

}

export default Socket
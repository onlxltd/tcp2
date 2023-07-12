import { Socket as NetSocket }      from 'net'
import { EventEmitter }             from 'events'
import SocketConfig                 from './types/SocketConfig'
import SocketError                  from './types/SocketError'
import SocketState                  from './types/SocketState'

export declare interface Socket {
    on(event: 'connect', handler: () => void): this
    on(event: 'data', handler: (data: Buffer) => void): this
    on(event: 'state', handler: (state: SocketState) => void): this
    on(event: 'failed', handler: () => void): this
}

export class Socket extends EventEmitter {

    #_host              : string
    #_port              : number
    #_config            : SocketConfig | undefined

    #_socket            : NetSocket

    #_reconnect         : NodeJS.Timeout | undefined
    #_connectTimeout    : NodeJS.Timeout | undefined

    #_socketState       : SocketState = SocketState.Offline

    constructor(host: string, port: number, config: SocketConfig | undefined = undefined) {
        super()

        this.#_host     = host
        this.#_port     = port
        this.#_config   = config
        this.#_socket   = new NetSocket()

        this.#_socket.on('connect', () => {
            if(this.#_connectTimeout !== undefined) clearTimeout(this.#_connectTimeout)
            this.updateConnectedState(SocketState.Connected)
            this.emit('connect')
        })
        this.#_socket.on('data', (data) => this.emit('data', data))
        this.#_socket.on('error', ({ code }: any) => {
            switch(code) {
                case SocketError.ConnectionRefused:
                    this.handleReconnect(code)
                    break
                case SocketError.ConnectionTimeout:
                    console.log(code)
                    break
            }
        })
        this.#_socket.on('close', (hasError) => {
            if(hasError) return
            this.handleReconnect(SocketError.DidClose)
        })
        this.connect()
    }

    public connect() {
        this.#_connectTimeout = setTimeout(() => {
            this.#_socket.end()
            this.handleReconnect(SocketError.ConnectionTimeout)
        }, this.config.timeout)
        this.#_socket.connect({ host: this.#_host, port: this.#_port })
    }

    public write(data: any) {
        this.#_socket.write(data)
    }

    public request(data: any, wait: number = 50) {
        return new Promise<Buffer>((resolve, reject) => {
            let timeout = setTimeout(() => {
                reject(new Error(SocketError.RequestTimeout))
            }, wait + 100)

            let chunks      : Buffer[] = []
            let handlerWait : NodeJS.Timeout
            let handler = (data: Buffer) => {
                if(timeout !== undefined) clearTimeout(timeout)
                if(handlerWait !== undefined) clearTimeout(handlerWait)
                chunks.push(data)
                handlerWait = setTimeout(() => {
                    this.#_socket.off('data', handler)
                    resolve(Buffer.concat(chunks))
                }, wait)
            }

            this.#_socket.on('data', handler)
            this.#_socket.write(data)
        })
    }

    public close() {
        this.#_socket.end()
    }

    public destroy() {
        this.#_socket.destroy()
    }

    public get connected(): SocketState {
        return this.#_socketState
    }

    private updateConnectedState(state: SocketState) {
        if(this.#_socketState == state) return
        this.emit('state', state)
        this.#_socketState = state
    }

    private handleReconnect(code: string | undefined = undefined) {
        if(!this.config.reconnect) {
            this.updateConnectedState(SocketState.Offline)
            return this.emit('fail', code)
        }
        this.updateConnectedState(SocketState.Connecting)
        if(this.#_reconnect !== undefined) return
        this.#_reconnect = setTimeout(() => {
            this.connect()
            this.#_reconnect = undefined
        }, this.config.reconnectDelay)
    }

    private get config(): SocketConfig {
        let defaultConfig: SocketConfig = {
            timeout         : 1000,
            reconnect       : true,
            reconnectDelay  : 2000
        }
        return this.#_config !== undefined ? { ...defaultConfig, ...this.#_config } : defaultConfig
    }

}

export { SocketState }
export default Socket
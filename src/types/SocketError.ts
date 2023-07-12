export enum SocketError {
    DidClose            = 'EDIDCLOSE',
    ConnectionRefused   = 'ECONNREFUSED',
    ConnectionTimeout   = 'ETIMEDOUT',
    RequestTimeout      = 'EREQUESTTIMEOUT'
}

export default SocketError
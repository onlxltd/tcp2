import { createServer } from 'net'

let server = createServer()
server.on('connection', (conn) => {
    console.log('conn', conn)
    conn.on('connect', () => {
        console.log('did connect')
    })
    conn.on('data', (data) => conn.write('echo ' + data.toString()))
    conn.on('close', () => {
        console.log('did disconnect')
    })
})

server.listen(10001)
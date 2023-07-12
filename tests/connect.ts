import Socket from '../src/Socket'

let socket = new Socket('10.0.0.77', 1710)
socket.on('connect', () => {
    
})
socket.on('state', state => console.log('Updated state', state))
socket.on('data', (data) => {
    console.log(data.toString())
})

process.stdin.resume()
import { render } from 'preact'
import './index.css'
// import application from 'socket:application'
import TerminalComponent from './terminal'
import {spawn} from 'socket:child_process'

// TODO - this is a hack to get the terminal to render, should render app but connect websocket once the binary is spawned

const terminalBinary = spawn('./binaries/terminal')
terminalBinary.stderr.on('data', (data:Buffer) => {
    const stderr = Buffer.from(data).toString()
    console.warn(stderr)
    render(<TerminalComponent />, document.getElementById('app')!)
})
terminalBinary.stdout.on('data', (data:Buffer) => {
    const stdout = Buffer.from(data).toString()
    console.log({stdout})
})

terminalBinary.on('error', (err:string) => {
    console.error(err)
} )




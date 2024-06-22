import { render } from 'preact'
import './index.css'
import application from 'socket:application'
import TerminalComponent from './terminal'
application.backend.open({force:true})

render(<TerminalComponent />, document.getElementById('app')!)


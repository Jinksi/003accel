import createLoop from 'canvas-loop'
import createContext from '2d-context'

const context = createContext()
const canvas = context.canvas

const app = createLoop(canvas, {
  scale: window.devicePixelRatio
})
document.body.appendChild(canvas)

addEventListeners()
app.start()

let time = 0
let opacity = 1
let ease = 0.1
let mouse = {
  x: 0,
  y: 0
}
let desired = {
  x: 0,
  y: 0
}
let thing = {
  x: 0,
  y: 0
}

app.on('tick', (dt) => {
  const [ w, h ] = app.shape
  desired.x = (mouse.x / w) - 0.5
  desired.y = (mouse.y / h) - 0.5
  thing.x += (desired.x - thing.x) * ease
  thing.y += (desired.y - thing.y) * ease
  time += dt / 1000
  // context.clearRect(0, 0, w, h)
  context.fillStyle = `rgba(0,0,0,${0.1})`
  context.scale(app.scale, app.scale)
  context.fillRect(0, 0, w, h)
  context.fillStyle = `rgba(255,255,255,${opacity})`
  context.translate((w / 2) - (thing.x * w), (h / 2) - (thing.y * h))
  context.scale(thing.x * 2, thing.y * 2)
  context.fillRect(0, 0, w, h)
  context.resetTransform()
})

function addEventListeners () {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('devicemotion', handleDeviceMotion)
}

function handleMouseMove (e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function handleDeviceMotion (e) {
  mouse.x = (app.shape[0] / 2) + e.acceleration.x * 50
  mouse.y = (app.shape[1] / 2) + e.acceleration.y * 50
}

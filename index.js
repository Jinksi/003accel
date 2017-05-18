import createLoop from 'canvas-loop'
import createContext from '2d-context'
import Tone from 'tone'
import StartAudioContext from 'startaudiocontext'

const context = createContext()
const canvas = context.canvas

const app = createLoop(canvas, {
  scale: window.devicePixelRatio
})

addEventListeners()

const tonalities = [
  {
    notes: ['C3', 'C4', 'G5'],
    color: 'tomato'
  },
  {
    notes: ['G3', 'G4', 'E5'],
    color: 'turquoise'
  }
]

let time = 0
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
  y: 0,
  color: tonalities[0].color
}
let filter
let dist
let poly

function selectTone () {
  return tonalities[Math.floor(Math.random() * tonalities.length)]
}

StartAudioContext(Tone.context, '#start-button')
  .then(function(){
    document.body.appendChild(canvas)
    filter = new Tone.Filter()
    dist = new Tone.Distortion(1)
    poly = new Tone.PolySynth(3, Tone.Synth)
      .chain(dist, filter, Tone.Master)
      .triggerAttack(tonalities[0].notes, 0, 0.8)
    Tone.Transport.start()
    Tone.Transport.scheduleRepeat(function(time){
      const tonality = selectTone()
    	poly.releaseAll().triggerAttack(tonality.notes, time, 0.8)
      thing.color = tonality.color
    }, '1m', '1m')
    app.start()
  })


app.on('tick', (dt) => {
  const [ w, h ] = app.shape
  desired.x = (mouse.x / w) - 0.5
  desired.y = (mouse.y / h) - 0.5
  thing.x += (desired.x - thing.x) * ease
  thing.y += (desired.y - thing.y) * ease
  time += dt / 1000

  // visual
  context.fillStyle = `rgba(0,0,0,${0.1})`
  context.scale(app.scale, app.scale)
  context.fillRect(0, 0, w, h)
  context.fillStyle = thing.color
  context.translate((w / 2) - (thing.x * w), (h / 2) - (thing.y * h))
  context.scale(thing.x * 2, thing.y * 2)
  context.fillRect(0, 0, w, h)
  context.resetTransform()

  // audio
  const baseFreq = 5000
  filter.frequency.value = Math.abs(thing.x * 2) * baseFreq
  dist.wet.value = Math.abs(thing.y * 2)
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

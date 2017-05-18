import createLoop from 'canvas-loop'
import createContext from '2d-context'
import Tone from 'tone'
import StartAudioContext from 'startaudiocontext'

const context = createContext()
const canvas = context.canvas
document.body.appendChild(canvas)

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
    notes: ['G3', 'G4', 'D5'],
    color: 'turquoise'
  },
  {
    notes: ['E3', 'E4', 'B5'],
    color: 'violet'
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
let masterVol
let filter
let dist
let comp
let vibrato
let poly

function selectTone () {
  return tonalities[Math.floor(Math.random() * tonalities.length)]
}

function initSynth () {
  masterVol = new Tone.Volume(-12)
  filter = new Tone.Filter()
  dist = new Tone.Distortion(1)
  comp = new Tone.Compressor(-30, 8)
  vibrato = new Tone.Vibrato({
    frequency: 2,
    depth: 0
  })
  
  poly = new Tone.PolySynth(3, Tone.Synth)
    .set({
      envelope: {
        attack: 0.5,
        sustain: 1,
        release: 0.1
      }
    })
    .chain(dist, filter, comp, vibrato, masterVol, Tone.Master)
    .triggerAttack(tonalities[0].notes, 0, 0.1)

  Tone.Transport.start()
  Tone.Transport.scheduleRepeat(function(time){
    const tonality = selectTone()
    poly.releaseAll()
    poly.triggerAttack(tonality.notes, time, 0.1)
    thing.color = tonality.color
  }, '1m', '1m')
}

StartAudioContext(Tone.context, '#start-button')
  .then(function(){
    document.body.classList.add('started')
    initSynth()
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
  context.fillStyle = `rgba(0,0,0,${0.05})`
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
  vibrato.depth.value = Math.abs(thing.y)
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

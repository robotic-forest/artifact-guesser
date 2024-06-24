import { useState } from 'react'

// PHRASE GENERATOR
// 3 word types: adverb_adjective_noun
// Ah, nostalgia. A very similar program to this was, in fact, my very first. Technology at its finest.

const adverbs = [
  'hungrily', 'disgustingly', 'overly', 'menacingly', 'intricately', 'gloriously',
  'horrifyingly', 'shamelessly', 'flappily', 'sloppily', 'drunkenly', 'gelatinous', 'fantastically'
]

const adjectives = [
  'flatulent', 'flappy', 'belligerent', 'moist', 'poignant', 'fabulous', 'nauseating',
  'sugary', 'yodelling', 'gargling', 'sensitive', 'flappy', 'shameful', 'kafkaesque', 'gluttonous', 'vile', 'saucy', 'smelly',
  'moldy', 'gangrenous', 'damp'
]

const nouns = [
  'blobfish', 'tentacle-monster', 'spleen', 'slime-creature', 'aardvark', 'platypus', 'booger',
  'mecha-lincoln', 'shrimp', 'gizzard', 'gall-bladder', 'bashibazouk', 'ectoplasm', 'hamster'
]

const colors = ['#00dede', '#ff00ff', '#ff0000', '#00d200', '#dab800', '#005aff']

const randomize = (array) => array[Math.floor(Math.random() * array.length)]

export const generateInsult = (type) => {
  switch(type) {
    case 'name': return `${randomize(adverbs)} ${randomize(adjectives)} ${randomize(nouns)}`
    case 'adjective': return `${randomize(adjectives)}`
    case 'color': return `${randomize(colors)}`
    default: return `Pass in a freakin argument, you ${randomize(adverbs)} ${randomize(adjectives)} ${randomize(nouns)}`
  }
}

export const useInsult = () => {
  const [insult] = useState(generateInsult('name'))

  return insult
}
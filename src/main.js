#!/usr/bin/env node

const readLineSync = require('readline-sync')

const IntCodeComputer = require('./IntcodeComputer')
const $ = require('./Colors')

let opcodes = require('fs').readFileSync(process.argv[2]).toString().split(',').map(v => +v)

function handleOutput(com, _, value) {
  console.log(`${com.id}: ${value.value}`)
}

function handleInput(com, _, value) {
  if (!com.stdin.length) {
    let answer = +readLineSync.question(`${com.id} Input: `)
    com.stdin.push(answer)
  }
}

async function run() {
  let computer = new IntCodeComputer(opcodes, 'Main')

  computer.addOutputHandler(handleOutput)

  computer.addInputHandler(handleInput)

  await computer.run()
  console.log('done')
}

run()
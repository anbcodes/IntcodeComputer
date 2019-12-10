const Program = require('./Program')
const $ = require('./Colors')
const readLine = require('readline-sync')

module.exports = class IntcodeComputer {
  constructor(opcodes, id) {
    this.opcodes = opcodes
    this.id = id

    this.stdin = []
    this.stdout = []

    this.outputHandlers = []
    this.inputHandlers = []

    this.Program = new Program()
    this.addOpcodes()
  }

  addOpcodes() {
    [
      [1, 'Add', 3],
      [2, 'Mul', 3],
      [3, 'Input', 1],
      [4, 'Output', 1],
      [5, 'JumpIfTrue', 2],
      [6, 'JumpIfFalse', 2],
      [7, 'IsLessThen', 3],
      [8, 'IsEqualTo', 3],
      [9, 'OffsetChange', 2],
    ].forEach(code => {
      this.Program.on(code[0], this[`handle${code[1]}`].bind(this), code[2])
    })

    this.Program.on(99, () => -1, 1)
  }

  handleAdd({ opcodes, index }, addend1, addend2, resultPos) {
    opcodes[resultPos.ref] = addend1.value + addend2.value
    return index + 4
  }

  handleMul({ opcodes, index }, factor1, factor2, resultPos) {
    opcodes[resultPos.ref] = factor1.value * factor2.value

    return index + 4
  }

  async handleOutput({ opcodes, index }, value) {
    for (let i = 0; i < this.outputHandlers.length; i += 1) {
      await this.outputHandlers[i][0](this, ...arguments)
    }

    this.stdout.push(value.value)

    return index + 2
  }

  handleInput({ opcodes, index }, toWrite) {
    return new Promise(resolve => {
      (async () => {for (let i = 0; i < this.inputHandlers.length; i += 1) {
        await this.inputHandlers[i][0](this, ...arguments)}
      })().then(() => {
        let interval = setInterval(() => {
          if (this.stdin.length !== 0) {
            let value = this.stdin.pop()
            opcodes[toWrite.ref] = value
            resolve(index + 2)
            clearInterval(interval)
          }
        }, 1)
      })
    })
  }

  handleJumpIfTrue({ opcodes, index }, value, jumpPos) {
    if (value.value !== 0) {
      return jumpPos.value
    } else {
      return index + 3
    }
  }

  handleJumpIfFalse({ opcodes, index }, value, jumpPos) {
    if (value.value === 0) {
      return jumpPos.value
    } else {
      return index + 3
    }
  }

  handleIsLessThen({ opcodes, index }, n1, n2, output) {
    if (n1.value < n2.value) {
      opcodes[output.ref] = 1
    } else {
      opcodes[output.ref] = 0
    }
    return index + 4
  }

  handleIsEqualTo({ opcodes, index }, n1, n2, output) {
    if (n1.value === n2.value) {
      opcodes[output.ref] = 1
    } else {
      opcodes[output.ref] = 0
    }
    return index + 4
  }

  handleOffsetChange({ program, index }, n1) {
    program.offset += n1.value
    return index + 2
  }


  addOutputHandler(func, id) {
    this.outputHandlers.push([func, id])
  }

  removeOutputHandler(id) {
    this.outputHandlers = this.outputHandlers.filter(v => v[1] !== id)
  }

  addInputHandler(func, id) {
    this.inputHandlers.push([func, id])
  }

  removeInputHandler(id) {
    this.inputHandlers = this.inputHandlers.filter(v => v[1] !== id)
  }

  run() {
    return new Promise((resolve) => {
      this.Program.run(this.opcodes).then(() => resolve())
    }) 
  }
}
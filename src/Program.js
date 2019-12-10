module.exports = class Program {
  constructor() {
    this.onOpcodeFunctions = {}
    this.offset = 0
  }

  async runOpcode(opcodes, index) {
    let { opcode, parameterModes } = this.parseOpcode(opcodes[index])
    this.checkIfOpcodeFunctionExists(opcode)
    let opcodeArgs = this.getOpcodeArgs(parameterModes, opcode, index, opcodes)

    let data = {
      program: this,
      opcode,
      opcodes,
      index,
    }
    let nextIndex = await this.onOpcodeFunctions[opcode].func(data, ...opcodeArgs)
    return nextIndex
  }

  parseOpcode(rawOpcode) {
    let opcode = +rawOpcode
      .toString()
      .slice(-2)
    
    let parameterModes = rawOpcode
      .toString()
      .split('')
      .slice(0, -2)
      .map(v => +v)
      .reverse()
    
    return {opcode, parameterModes}
  }

  checkIfOpcodeFunctionExists(opcode) {
    if (!this.onOpcodeFunctions[opcode]) {
      throw new TypeError(`Invaild Opcode ${opcode}`)
    }
  }

  getOpcodeArgs(parameterModes, opcode, index, opcodes) {
    let numberOfArgs = this.onOpcodeFunctions[opcode].len
    let firstArgIndex = index + 1
    let args = opcodes.slice(firstArgIndex, firstArgIndex + numberOfArgs)
    
    args = args.map((a, i) => {
      let mode = parameterModes[i] || 0
      let ref = mode === 2 ? this.offset + +a : +a
      let value = parameterModes[i] === 1 ? +a : opcodes[ref]
      let real = +a
      return {
        mode,
        value,
        ref,
        real,
      }
    })
    
    return args;
  }

  async run(opcodes) {
    let i = 0
    while (i < opcodes.length && i >= 0) {
      i = await this.runOpcode(opcodes, i)
    }
  }

  on(opcode, func, numberOfArgs) {
    this.onOpcodeFunctions[opcode] = {func, len: numberOfArgs}
  }
}
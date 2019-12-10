const colors = [ ['r', 1], ['g', 2], ['b', 4], ['w', 7],
['c', 6], ['m', 5], ['y', 3], ['k', 0], ['e', 0] ]
const toExport = colors.reduce((cs, c) => { cs[c[0]] = c[0] === 'e' ? `\x1b[0m` : `\x1b[3${c[1]}m`; return cs}, {})
toExport.a = [toExport.r, toExport.y, toExport.g, toExport.b, toExport.m, toExport.w]
module.exports = toExport
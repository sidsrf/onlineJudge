const tcs = {
    0: {
        inputs: ['0 1 2', '1 2 3'],
        outputs: ['3', '0']
    },
    1: {
        inputs: [`2\n1 2\n3 4`, `1\n 10 -1`],
        outputs: [`3\n7`, `9`]
    }
}
module.exports = tcs;
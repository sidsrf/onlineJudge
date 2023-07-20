require('dotenv').config()
const express = require('express')
const fs = require('fs')
const { v4: uuid } = require('uuid')
const path = require('path')
const cp = require('child_process')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
const base = path.join(__dirname, 'submissions')
const cbase = path.join(__dirname, 'compiled')

if (!fs.existsSync(base)) {
    fs.mkdirSync(base)
}
if (!fs.existsSync(cbase)) {
    fs.mkdirSync(cbase)
}

app.route('/compile').post(async (req, res) => {
    // gen file
    const { code, ext } = req.body;
    const fname = uuid();
    const fullname = `${fname}.${ext}`
    const filePath = path.join(base, fullname)
    fs.writeFileSync(filePath, code)
    // file now generated, compile filepath now
    if (ext == 'py') {
        console.log("COMPILED SUCCESSFUL")
        return res.send({ file: filePath })
    }
    const cPath = path.join(cbase, fname)
    const commands = {
        cpp: `g++ ${filePath} -o ${cPath}`
    }

    cp.exec(commands[ext], (error, stdout, stderr) => {
        if (stderr) {
            console.log('STDERR', stderr)
            return res.send({ error: 'compilation error' })
        }
        if (error) {
            return res.send({ error: "Internal error" })
        }
        console.log("COMPILED SUCCESSFUL")
        return res.send({ file: cPath })
    })

})

app.route('/run').post((req, res) => {
    const { cfilePath, inpStr, ext } = req.body;
    console.log(req.body);
    const commands = {
        cpp: ``,
        py: `python`
    }
    let child;
    if (commands[ext]) {
        child = cp.spawn(commands[ext], [cfilePath])
    } else {
        child = cp.spawn(cfilePath)
    }
    if (inpStr) {
        child.stdin.write(inpStr)
        child.stdin.end()
    }

    var returnobj = {}

    child.stdout.on('data', (data) => {
        console.log({ output: data.toString().trim() })
        returnobj = { output: data.toString().trim() }
    })

    child.stderr.on('data', (data) => {
        returnobj = { error: 'Runtime error' }
        console.log('runtime error',data.toString())
    })
    child.on('error', (err) => {
        console.log('child error', err)
        returnobj = { error: "internal error" }
    })

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        res.send(returnobj)
    });
})

const { PORT } = process.env

app.listen(PORT, () => {
    console.log(`OC running at http://localhost:${PORT}`)
})

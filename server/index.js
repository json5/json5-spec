const fs = require('fs')
const path = require('path')
const ecmarkup = require('ecmarkup')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const cors = require('cors')
const errorHandler = require('errorhandler')
const helmet = require('helmet')
const morgan = require('morgan')
const serveFavicon = require('serve-favicon')
const serveStatic = require('serve-static')

const indir = path.resolve(__dirname, '../src')
const outdir = path.resolve(__dirname, '../docs')

build()

fs.watch(indir, (event, filename) => {
  console.log({event, filename})
  build()
})

function build() {
  console.log('Building')
  ecmarkup.build(path.resolve(indir, 'index.html'), fetch, {
    assets: 'none',
    cssOut: path.resolve(outdir, 'ecmarkup.css'),
    jsOut: path.resolve(outdir, 'ecmarkup.js')
  })
  .then(spec => {
    fs.writeFile(path.resolve(outdir, 'index.html'), spec.toHTML())
  })
  .catch(err => {
    console.error(err)
  })
}

function fetch(file) {
  return new Promise((resolve, reject) => {
    const outfile = path.resolve(outdir, file)
    fs.readFile(outfile, 'utf8', (err, data) => {
      if(!err) {
        resolve(data)
      } else {
        const infile = path.resolve(indir, file)
        fs.readFile(infile, 'utf8', (err, data) => {
          if(err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      }
    })
  })
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression())
app.use(cors())
app.use(helmet())
app.use(serveFavicon(path.resolve(__dirname, '../docs/icon.ico')))
app.use(morgan('dev'))
app.use(serveStatic(path.resolve(__dirname, '../docs')))

app.listen(5000, () => {
  console.log('Listening on port 5000')
})

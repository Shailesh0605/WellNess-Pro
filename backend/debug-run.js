try {
  console.log('Starting debug-run: require ./src/index.js')
  require('./src/index.js')
  console.log('server module loaded; keeping process alive')
  setInterval(() => {}, 1000)
} catch (err) {
  console.error('Error while requiring server:', err && err.stack ? err.stack : err)
  process.exit(1)
}

// Simple logger
/*function log(msg) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${msg}`);
}

module.exports = { log };
*/
class Logger {
  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }
}

module.exports = Logger;



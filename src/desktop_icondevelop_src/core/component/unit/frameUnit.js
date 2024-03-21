
class Main {
  parsedArgs = null
  getParameters(para_key) {
    const args = process.argv.slice(1);
    if (this.parsedArgs) {
      if (para_key) {
        return this.parsedArgs[para_key]
      }
      return this.parsedArgs
    }
    this.parsedArgs = {};
    let currentKey = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('-')) {
        const keyValue = arg.replace(/^-+/, '');
        const [key, value] = keyValue.includes(':')
          ? keyValue.split(':')
          : keyValue.split('=');

        currentKey = key;
        this.parsedArgs[currentKey] = value || true;
      } else if (currentKey !== null) {
        this.parsedArgs[currentKey] = arg.replace(/"/g, ''); // Remove surrounding quotes
        currentKey = null;
      }
    }
    if (para_key) {
      return this.parsedArgs[para_key]
    }
    return this.parsedArgs;
  }

  isParameter(key) {
    if (!this.parsedArgs) {
      this.getParameters()
    }
    return key in this.parsedArgs;
  }

  getParameter(para_key) {
    return this.getParameters(para_key)
  }

}

module.exports = new Main()


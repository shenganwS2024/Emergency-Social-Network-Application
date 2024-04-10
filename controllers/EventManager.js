class EventManager {
  constructor() {
    this.listeners = {}
  }

  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }
}

const eventManager = new EventManager()
export { eventManager }

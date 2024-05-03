// import emitter from 'tiny-emitter/instance'

export const useEventBus = () => {
  return {
    $on: (...args) => {
      _ = args
      // emitter.on(...args)
    },
    $once: (...args) => {
      _ = args
      // emitter.once(...args)
    },
    $off: (...args) => {
      _ = args
      // emitter.off(...args)
    },
    $emit: (...args) => {
      _ = args
      // emitter.emit(...args)
    }
  }
}

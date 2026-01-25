export default {
  title: 'Plugin',
  field: {
    typeMap: {
      ui: 'UI',
      system: 'System',
      mix: 'Mix',
    },
  },
  install: {
    tip: {
      file: 'Place the project in the directory, the file name cannot contain special characters (ignore if already placed)',
      input: 'Enter the project name to install (file name)',
    },
    goDir: 'Go to the plugin directory',
  },
  message: {
    install:
      'Asynchronous installation in progress, a timeout does not necessarily indicate failure, please refresh later to check...',
    uninstall:
      'Asynchronous uninstallation in progress, a timeout does not necessarily indicate failure, please refresh later to check...',
    start:
      'Asynchronous start in progress, a timeout does not necessarily indicate failure, please refresh later to check...',
    stop: 'Asynchronous stop in progress, a timeout does not necessarily indicate failure, please refresh later to check...',
  },
};

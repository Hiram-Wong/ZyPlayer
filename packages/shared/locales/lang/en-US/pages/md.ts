import binaryHelpMD from './assets/binary-help.md?raw';
import customPlayerMD from './assets/custom-player.md?raw';
import disclaimerMD from './assets/disclaimer.md?raw';
import labEditHelpMD from './assets/lab-edit-help.md?raw';
import liveEpgMD from './assets/live-epg.md?raw';
import liveLogoMD from './assets/live-logo.md?raw';

export default {
  customPlayer: {
    title: 'Custom Player',
    content: customPlayerMD,
  },
  disclaimer: {
    title: 'Disclaimer',
    content: disclaimerMD,
    readComplete: 'Read complete',
    readProcess: 'Read {0}%',
    message: {
      agree: 'Discover the world through movie watching',
      disagree: 'Automatically exit the software after 3 seconds',
    },
  },
  liveEpg: {
    title: 'Live Channel Epg',
    content: liveEpgMD,
  },
  liveLogo: {
    title: 'Live Channel Logo',
    content: liveLogoMD,
  },
  labEditHelp: {
    title: 'Source Editor Help',
    content: labEditHelpMD,
  },
  binaryHelp: {
    title: 'Installation Help',
    content: binaryHelpMD,
  },
};

import { MediaPlayer } from "./libvlc.js";
// import initModule from "./experimental.js";

export async function VLCPlayer(video) {
  let canvas = document.getElementById("canvas");
  if (canvas === null) {
    console.error("No canvas with id 'canvas' found.");
    return;
  }

  window.Module = await initModule({
    vlc_access_file: {},
  });

  let media_player;

  let vlc_opts_array = video.options.split(' ');

  let vlc_opts_size = 0;
  for (let i in vlc_opts_array) {
    vlc_opts_size += vlc_opts_array[i].length + 1;
  }

  let buffer = Module._malloc(vlc_opts_size);
  let wrote_size = 0;
  for (let i in vlc_opts_array) {
    Module.writeAsciiToMemory(vlc_opts_array[i], buffer + wrote_size, false);
    wrote_size += vlc_opts_array[i].length + 1;
  }

  let vlc_argv = Module._malloc(vlc_opts_array.length * 4 + 4);
  let view_vlc_argv = new Uint32Array(
    Module.wasmMemory.buffer,
    vlc_argv,
    vlc_opts_array.length
  );

  wrote_size = 0;
  for (let i in vlc_opts_array) {
    view_vlc_argv[i] = buffer + wrote_size;
    wrote_size += vlc_opts_array[i].length + 1;
  }

  Module._wasm_libvlc_init(vlc_opts_array.length, vlc_argv);
  media_player = new MediaPlayer(Module, "emjsfile://1");
  media_player.set_volume(80);

  Module._set_global_media_player(media_player.media_player_ptr);

  window.media_player = media_player;

  window.update_overlay = function() {
    let media_player = window.media_player;
    let position = media_player.get_position() * 100;
    let seekbar = document.getElementById('seekbar');
    seekbar.value = position;
  };

  initializeVLCControls(video);
}

function initializeVLCControls(video) {
  let vtime = null;

  document.getElementById('play')?.addEventListener("click", async function() {
    if (vtime === null) {
      let r = await fetch(video.source);
      let blob = await r.blob()
      let file = new File([blob], "Video", { type: "video/mkv" });

      window.Module['vlc_access_file'][1] = file;
      window.files = [file];

      media_player.play();
      document.getElementById("canvas").style.width = video.size.width;
      document.getElementById("canvas").style.height = video.size.height;

    } else {
      media_player.set_position(vtime);
      media_player.play();
    }
  });

  document.getElementById('pause')?.addEventListener("click",function() {
    vtime = media_player.get_position();
    media_player.pause();
  });

  let seekbar = document.getElementById('seekbar');
  seekbar?.addEventListener("click", function(e) {
    let position = (e.offsetX / seekbar.clientWidth);
    vtime = position;
    seekbar.value = position * 100;
    media_player.set_position(position);
  });

  let volume = document.getElementById('volume');
  volume?.addEventListener("click", function(e) {
    let position = (e.offsetX / volume.clientWidth) * 100;
    volume.value = position;
    media_player.set_volume(position);
  });
}

var initModule = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir ||= __filename;
  return (
      function(moduleArg = {}) {

          var Module = moduleArg;
          var readyPromiseResolve, readyPromiseReject;
          Module["ready"] = new Promise((resolve, reject) => {
              readyPromiseResolve = resolve;
              readyPromiseReject = reject
          });
          var functions = ["_malloc", "_free", "_libvlc_errmsg", "_libvlc_clearerr", "_libvlc_add_intf", "_libvlc_audio_equalizer_get_amp_at_index", "_libvlc_audio_equalizer_get_band_count", "_libvlc_audio_equalizer_get_band_frequency", "_libvlc_audio_equalizer_get_preamp", "_libvlc_audio_equalizer_get_preset_count", "_libvlc_audio_equalizer_get_preset_name", "_libvlc_audio_equalizer_new", "_libvlc_audio_equalizer_new_from_preset", "_libvlc_audio_equalizer_release", "_libvlc_audio_equalizer_set_amp_at_index", "_libvlc_audio_equalizer_set_preamp", "_libvlc_audio_output_device_get", "_libvlc_audio_output_device_enum", "_libvlc_audio_output_device_list_release", "_libvlc_audio_output_device_set", "_libvlc_audio_output_list_get", "_libvlc_audio_output_list_release", "_libvlc_audio_output_set", "_libvlc_audio_get_channel", "_libvlc_audio_get_delay", "_libvlc_audio_get_mute", "_libvlc_audio_get_track", "_libvlc_audio_get_track_count", "_libvlc_audio_get_track_description", "_libvlc_audio_get_volume", "_libvlc_audio_set_channel", "_libvlc_audio_set_delay", "_libvlc_audio_set_mute", "_libvlc_audio_set_track", "_libvlc_audio_set_volume", "_libvlc_audio_toggle_mute", "_libvlc_audio_set_format", "_libvlc_audio_set_format_callbacks", "_libvlc_audio_set_callbacks", "_libvlc_audio_set_volume_callback", "_libvlc_chapter_descriptions_release", "_libvlc_clock", "_libvlc_dialog_dismiss", "_libvlc_dialog_get_context", "_libvlc_dialog_post_action", "_libvlc_dialog_post_login", "_libvlc_dialog_set_callbacks", "_libvlc_dialog_set_context", "_libvlc_event_attach", "_libvlc_event_detach", "_libvlc_free", "_libvlc_get_changeset", "_libvlc_get_compiler", "_libvlc_get_fullscreen", "_libvlc_get_version", "_libvlc_log_get_context", "_libvlc_log_get_object", "_libvlc_log_set", "_libvlc_log_set_file", "_libvlc_log_unset", "_libvlc_media_add_option", "_libvlc_media_add_option_flag", "_libvlc_media_discoverer_is_running", "_libvlc_media_discoverer_media_list", "_libvlc_media_discoverer_new", "_libvlc_media_discoverer_release", "_libvlc_media_discoverer_list_get", "_libvlc_media_discoverer_list_release", "_libvlc_media_discoverer_start", "_libvlc_media_discoverer_stop", "_libvlc_media_duplicate", "_libvlc_media_event_manager", "_libvlc_media_get_codec_description", "_libvlc_media_get_duration", "_libvlc_media_get_filestat", "_libvlc_media_get_meta", "_libvlc_media_get_mrl", "_libvlc_media_get_stats", "_libvlc_media_get_tracklist", "_libvlc_media_get_type", "_libvlc_media_get_user_data", "_libvlc_media_is_parsed", "_libvlc_media_get_parsed_status", "_libvlc_media_thumbnail_request_by_time", "_libvlc_media_thumbnail_request_by_pos", "_libvlc_media_thumbnail_request_cancel", "_libvlc_media_thumbnail_request_destroy", "_libvlc_media_track_hold", "_libvlc_media_track_release", "_libvlc_media_tracklist_at", "_libvlc_media_tracklist_count", "_libvlc_media_tracklist_delete", "_libvlc_media_list_add_media", "_libvlc_media_list_count", "_libvlc_media_list_event_manager", "_libvlc_media_list_index_of_item", "_libvlc_media_list_insert_media", "_libvlc_media_list_is_readonly", "_libvlc_media_list_item_at_index", "_libvlc_media_list_lock", "_libvlc_media_list_media", "_libvlc_media_list_new", "_libvlc_media_list_player_event_manager", "_libvlc_media_list_player_get_media_player", "_libvlc_media_list_player_get_state", "_libvlc_media_list_player_is_playing", "_libvlc_media_list_player_new", "_libvlc_media_list_player_next", "_libvlc_media_list_player_pause", "_libvlc_media_list_player_play", "_libvlc_media_list_player_play_item", "_libvlc_media_list_player_play_item_at_index", "_libvlc_media_list_player_previous", "_libvlc_media_list_player_release", "_libvlc_media_list_player_retain", "_libvlc_media_list_player_set_media_list", "_libvlc_media_list_player_set_media_player", "_libvlc_media_list_player_set_pause", "_libvlc_media_list_player_set_playback_mode", "_libvlc_media_list_player_stop_async", "_libvlc_media_list_release", "_libvlc_media_list_remove_index", "_libvlc_media_list_retain", "_libvlc_media_list_set_media", "_libvlc_media_list_unlock", "_libvlc_media_new_callbacks", "_libvlc_media_new_fd", "_libvlc_media_new_location", "_libvlc_media_new_path", "_libvlc_media_new_as_node", "_libvlc_media_parse", "_libvlc_media_parse_async", "_libvlc_media_parse_with_options", "_libvlc_media_parse_stop", "_libvlc_media_player_add_slave", "_libvlc_media_player_can_pause", "_libvlc_media_player_program_scrambled", "_libvlc_media_player_next_frame", "_libvlc_media_player_event_manager", "_libvlc_media_player_get_chapter", "_libvlc_media_player_get_chapter_count", "_libvlc_media_player_get_chapter_count_for_title", "_libvlc_media_player_get_full_chapter_descriptions", "_libvlc_media_player_get_full_title_descriptions", "_libvlc_media_player_get_hwnd", "_libvlc_media_player_get_length", "_libvlc_media_player_get_media", "_libvlc_media_player_get_nsobject", "_libvlc_media_player_get_position", "_libvlc_media_player_get_rate", "_libvlc_media_player_get_role", "_libvlc_media_player_get_state", "_libvlc_media_player_get_time", "_libvlc_media_player_get_title", "_libvlc_media_player_get_title_count", "_libvlc_media_player_get_xwindow", "_libvlc_media_player_has_vout", "_libvlc_media_player_is_seekable", "_libvlc_media_player_is_playing", "_libvlc_media_player_new", "_libvlc_media_player_new_from_media", "_libvlc_media_player_next_chapter", "_libvlc_media_player_set_pause", "_libvlc_media_player_pause", "_libvlc_media_player_play", "_libvlc_media_player_previous_chapter", "_libvlc_media_player_release", "_libvlc_media_player_retain", "_libvlc_media_player_set_android_context", "_libvlc_media_player_set_chapter", "_libvlc_media_player_set_equalizer", "_libvlc_media_player_set_hwnd", "_libvlc_media_player_set_media", "_libvlc_media_player_set_nsobject", "_libvlc_media_player_set_position", "_libvlc_media_player_set_rate", "_libvlc_media_player_set_renderer", "_libvlc_media_player_set_role", "_libvlc_media_player_set_time", "_libvlc_media_player_set_title", "_libvlc_media_player_set_xwindow", "_libvlc_media_player_stop_async", "_libvlc_media_player_navigate", "_libvlc_media_player_set_video_title_display", "_libvlc_media_player_get_tracklist", "_libvlc_media_player_get_track_from_id", "_libvlc_media_player_get_selected_track", "_libvlc_media_player_select_track", "_libvlc_media_player_unselect_track_type", "_libvlc_media_player_select_tracks", "_libvlc_media_player_select_tracks_by_ids", "_libvlc_player_program_delete", "_libvlc_player_programlist_count", "_libvlc_player_programlist_at", "_libvlc_player_programlist_delete", "_libvlc_media_player_select_program_id", "_libvlc_media_player_get_selected_program", "_libvlc_media_player_get_program_from_id", "_libvlc_media_player_get_programlist", "_libvlc_media_release", "_libvlc_media_retain", "_libvlc_media_save_meta", "_libvlc_media_slaves_add", "_libvlc_media_slaves_clear", "_libvlc_media_slaves_get", "_libvlc_media_slaves_release", "_libvlc_media_set_meta", "_libvlc_media_set_user_data", "_libvlc_media_subitems", "_libvlc_media_tracks_get", "_libvlc_media_tracks_release", "_libvlc_new", "_libvlc_playlist_play", "_libvlc_release", "_libvlc_renderer_item_name", "_libvlc_renderer_item_type", "_libvlc_renderer_item_icon_uri", "_libvlc_renderer_item_flags", "_libvlc_renderer_item_hold", "_libvlc_renderer_item_release", "_libvlc_renderer_discoverer_event_manager", "_libvlc_renderer_discoverer_list_get", "_libvlc_renderer_discoverer_list_release", "_libvlc_renderer_discoverer_new", "_libvlc_renderer_discoverer_release", "_libvlc_renderer_discoverer_start", "_libvlc_renderer_discoverer_stop", "_libvlc_retain", "_libvlc_set_fullscreen", "_libvlc_set_user_agent", "_libvlc_set_app_id", "_libvlc_title_descriptions_release", "_libvlc_toggle_fullscreen", "_libvlc_track_description_list_release", "_libvlc_video_get_adjust_float", "_libvlc_video_get_adjust_int", "_libvlc_video_get_aspect_ratio", "_libvlc_video_get_size", "_libvlc_video_get_cursor", "_libvlc_video_get_logo_int", "_libvlc_video_get_marquee_int", "_libvlc_video_get_scale", "_libvlc_video_get_spu", "_libvlc_video_get_spu_count", "_libvlc_video_get_spu_delay", "_libvlc_video_get_spu_description", "_libvlc_video_get_spu_text_scale", "_libvlc_video_get_teletext", "_libvlc_video_get_track", "_libvlc_video_get_track_count", "_libvlc_video_get_track_description", "_libvlc_video_set_adjust_float", "_libvlc_video_set_adjust_int", "_libvlc_video_set_aspect_ratio", "_libvlc_video_set_callbacks", "_libvlc_video_set_crop_ratio", "_libvlc_video_set_crop_window", "_libvlc_video_set_crop_border", "_libvlc_video_set_deinterlace", "_libvlc_video_set_format", "_libvlc_video_set_format_callbacks", "_libvlc_video_set_output_callbacks", "_libvlc_video_set_key_input", "_libvlc_video_set_logo_int", "_libvlc_video_set_logo_string", "_libvlc_video_set_marquee_int", "_libvlc_video_set_marquee_string", "_libvlc_video_set_mouse_input", "_libvlc_video_set_scale", "_libvlc_video_set_spu", "_libvlc_video_set_spu_delay", "_libvlc_video_set_spu_text_scale", "_libvlc_video_set_teletext", "_libvlc_video_set_track", "_libvlc_video_take_snapshot", "_libvlc_video_new_viewpoint", "_libvlc_video_update_viewpoint", "_libvlc_set_exit_handler", "_libvlc_audio_filter_list_get", "_libvlc_video_filter_list_get", "_libvlc_module_description_list_release", "_libvlc_picture_retain", "_libvlc_picture_release", "_libvlc_picture_save", "_libvlc_picture_get_buffer", "_libvlc_picture_type", "_libvlc_picture_get_stride", "_libvlc_picture_get_width", "_libvlc_picture_get_height", "_libvlc_picture_get_time", "_libvlc_picture_list_at", "_libvlc_picture_list_count", "_libvlc_picture_list_destroy", "__emscripten_thread_init", "__emscripten_thread_exit", "__emscripten_thread_crashed", "__emscripten_thread_mailbox_await", "__emscripten_tls_init", "_pthread_self", "checkMailbox", "__embind_initialize_bindings", "establishStackSpace", "invokeEntryPoint", "PThread", "_set_global_media_player", "_attach_update_events", "___indirect_function_table", "_wasm_media_player_new", "_wasm_media_list_player_new", "_wasm_media_player_new_from_media", "_wasm_media_player_release", "_wasmc_media_player_retain", "_wasm_media_player_set_media", "_wasm_media_player_get_media", "_wasm_media_player_is_playing", "_wasm_media_player_play", "_wasm_media_player_set_pause", "_wasm_media_player_pause", "_wasm_media_player_stop", "_wasm_media_player_get_length", "_wasm_media_player_get_time", "_wasm_media_player_set_time", "_wasm_media_player_get_position", "_wasm_media_player_set_position", "_wasm_media_player_set_chapter", "_wasm_media_player_get_chapter", "_wasm_media_player_get_chapter_count", "_wasm_media_player_get_chapter_count_for_title", "_wasm_media_player_set_title", "_wasm_media_player_get_title", "_wasm_media_player_get_title_count", "_wasm_media_player_previous_chapter", "_wasm_media_player_next_chapter", "_wasm_media_player_get_rate", "_wasm_media_player_set_rate", "_wasm_media_player_has_vout", "_wasm_media_player_is_seekable", "_wasm_media_player_can_pause", "_wasm_media_player_program_scrambled", "_wasm_media_player_next_frame", "_wasm_video_get_size_x", "_wasm_video_get_size_y", "_wasm_video_get_cursor_x", "_wasm_video_get_cursor_y", "_wasm_audio_toggle_mute", "_wasm_audio_get_mute", "_wasm_audio_set_mute", "_wasm_audio_get_volume", "_wasm_audio_set_volume", "_wasm_audio_get_channel", "_wasm_audio_set_channel", "_wasm_audio_get_delay", "_wasm_audio_set_delay", "_wasm_media_player_get_role", "_wasm_media_player_set_role", "_wasm_libvlc_init", "_wasm_media_new_path", "_wasm_media_new_location", "_wasm_media_retain", "_wasm_media_release", "___asyncjs__init_js_file", "___asyncjs__Swap", "___asyncjs__getVoutMessagePort", "_createGlContext", "___asyncjs__bindVideoFrame", "_setupMessagePort", "_initGlConvWorker", "_closeMessagePort", "___asyncjs__CopyFrameToBuffer", "_flushMainThread", "_waitPictureFromPool", "_getPictureFromPool", "_updateVideoOutput", "_queuePicture", "_getPictureIdx", "_getVlcDecoderWorkerThread", "_releaseBlock", "_decodeBlock", "___asyncjs__probeConfig", "_initDecoderJS", "___asyncjs__initDecoderWorkerMessagePort", "___asyncjs__flushAsync", "_ff_h264_cabac_tables", "_main", "onRuntimeInitialized"];
          functions.forEach(prop => {
              if (!Object.getOwnPropertyDescriptor(Module["ready"], prop)) {
                  Object.defineProperty(Module["ready"], prop, {
                      get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
                      set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
                  })
              }
          });
          var moduleOverrides = Object.assign({}, Module);
          var arguments_ = [];
          var thisProgram = "./this.program";
          var quit_ = (status, toThrow) => {
              throw toThrow
          };
          var ENVIRONMENT_IS_WEB = typeof window == "object";
          var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
          var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
          var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
          if (Module["ENVIRONMENT"]) {
              throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)")
          }
          var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;
          var scriptDirectory = "";

          function locateFile(path) {
              if (Module["locateFile"]) {
                  return Module["locateFile"](path, scriptDirectory)
              }
              return scriptDirectory + path
          }
          var read_, readAsync, readBinary;
          if (ENVIRONMENT_IS_NODE) {
              if (typeof process == "undefined" || !process.release || process.release.name !== "node") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
              var nodeVersion = process.versions.node;
              var numericVersion = nodeVersion.split(".").slice(0, 3);
              numericVersion = numericVersion[0] * 1e4 + numericVersion[1] * 100 + numericVersion[2].split("-")[0] * 1;
              if (numericVersion < 16e4) {
                  throw new Error("This emscripten-generated code requires node v16.0.0 (detected v" + nodeVersion + ")")
              }
              var fs = require("fs");
              var nodePath = require("path");
              if (ENVIRONMENT_IS_WORKER) {
                  scriptDirectory = nodePath.dirname(scriptDirectory) + "/"
              } else {
                  scriptDirectory = __dirname + "/"
              }
              read_ = (filename, binary) => {
                  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                  return fs.readFileSync(filename, binary ? undefined : "utf8")
              };
              readBinary = filename => {
                  var ret = read_(filename, true);
                  if (!ret.buffer) {
                      ret = new Uint8Array(ret)
                  }
                  assert(ret.buffer);
                  return ret
              };
              readAsync = (filename, onload, onerror, binary = true) => {
                  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                  fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
                      if (err) onerror(err);
                      else onload(binary ? data.buffer : data)
                  })
              };
              if (!Module["thisProgram"] && process.argv.length > 1) {
                  thisProgram = process.argv[1].replace(/\\/g, "/")
              }
              arguments_ = process.argv.slice(2);
              quit_ = (status, toThrow) => {
                  process.exitCode = status;
                  throw toThrow
              };
              global.Worker = require("worker_threads").Worker
          } else if (ENVIRONMENT_IS_SHELL) {
              if (typeof process == "object" && typeof require === "function" || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
              if (typeof read != "undefined") {
                  read_ = read
              }
              readBinary = f => {
                  if (typeof readbuffer == "function") {
                      return new Uint8Array(readbuffer(f))
                  }
                  let data = read(f, "binary");
                  assert(typeof data == "object");
                  return data
              };
              readAsync = (f, onload, onerror) => {
                  setTimeout(() => onload(readBinary(f)))
              };
              if (typeof clearTimeout == "undefined") {
                  globalThis.clearTimeout = id => {}
              }
              if (typeof setTimeout == "undefined") {
                  globalThis.setTimeout = f => typeof f == "function" ? f() : abort()
              }
              if (typeof scriptArgs != "undefined") {
                  arguments_ = scriptArgs
              } else if (typeof arguments != "undefined") {
                  arguments_ = arguments
              }
              if (typeof quit == "function") {
                  quit_ = (status, toThrow) => {
                      setTimeout(() => {
                          if (!(toThrow instanceof ExitStatus)) {
                              let toLog = toThrow;
                              if (toThrow && typeof toThrow == "object" && toThrow.stack) {
                                  toLog = [toThrow, toThrow.stack]
                              }
                              err(`exiting due to exception: ${toLog}`)
                          }
                          quit(status)
                      });
                      throw toThrow
                  }
              }
              if (typeof print != "undefined") {
                  if (typeof console == "undefined") console = {};
                  console.log = print;
                  console.warn = console.error = typeof printErr != "undefined" ? printErr : print
              }
          } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
              if (ENVIRONMENT_IS_WORKER) {
                  scriptDirectory = self.location.href
              } else if (typeof document != "undefined" && document.currentScript) {
                  scriptDirectory = document.currentScript.src
              }
              if (_scriptDir) {
                  scriptDirectory = _scriptDir
              }
              if (scriptDirectory.startsWith("blob:")) {
                  scriptDirectory = ""
              } else {
                  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
              }
              if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
              if (!ENVIRONMENT_IS_NODE) {
                  read_ = url => {
                      var xhr = new XMLHttpRequest;
                      xhr.open("GET", url, false);
                      xhr.send(null);
                      return xhr.responseText
                  };
                  if (ENVIRONMENT_IS_WORKER) {
                      readBinary = url => {
                          var xhr = new XMLHttpRequest;
                          xhr.open("GET", url, false);
                          xhr.responseType = "arraybuffer";
                          xhr.send(null);
                          return new Uint8Array(xhr.response)
                      }
                  }
                  readAsync = (url, onload, onerror) => {
                      var xhr = new XMLHttpRequest;
                      xhr.open("GET", url, true);
                      xhr.responseType = "arraybuffer";
                      xhr.onload = () => {
                          if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                              onload(xhr.response);
                              return
                          }
                          onerror()
                      };
                      xhr.onerror = onerror;
                      xhr.send(null)
                  }
              }
          } else {
              throw new Error("environment detection error")
          }
          if (ENVIRONMENT_IS_NODE) {
              if (typeof performance == "undefined") {
                  global.performance = require("perf_hooks").performance
              }
          }
          var defaultPrint = console.log.bind(console);
          var defaultPrintErr = console.error.bind(console);
          if (ENVIRONMENT_IS_NODE) {
              defaultPrint = (...args) => fs.writeSync(1, args.join(" ") + "\n");
              defaultPrintErr = (...args) => fs.writeSync(2, args.join(" ") + "\n")
          }
          var out = Module["print"] || defaultPrint;
          var err = Module["printErr"] || defaultPrintErr;
          Object.assign(Module, moduleOverrides);
          moduleOverrides = null;
          checkIncomingModuleAPI();
          if (Module["arguments"]) arguments_ = Module["arguments"];
          legacyModuleProp("arguments", "arguments_");
          if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
          legacyModuleProp("thisProgram", "thisProgram");
          if (Module["quit"]) quit_ = Module["quit"];
          legacyModuleProp("quit", "quit_");
          assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");
          assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
          assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
          assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
          assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
          legacyModuleProp("asm", "wasmExports");
          legacyModuleProp("read", "read_");
          legacyModuleProp("readAsync", "readAsync");
          legacyModuleProp("readBinary", "readBinary");
          legacyModuleProp("setWindowTitle", "setWindowTitle");
          assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");
          assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
          var wasmBinary;
          if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
          legacyModuleProp("wasmBinary", "wasmBinary");
          if (typeof WebAssembly != "object") {
              abort("no native wasm support detected")
          }
          var wasmMemory;
          var wasmModule;
          var ABORT = false;
          var EXITSTATUS;

          function assert(condition, text) {
              if (!condition) {
                  abort("Assertion failed" + (text ? ": " + text : ""))
              }
          }
          var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

          function updateMemoryViews() {
              var b = wasmMemory.buffer;
              Module["HEAP8"] = HEAP8 = new Int8Array(b);
              Module["HEAP16"] = HEAP16 = new Int16Array(b);
              Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
              Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
              Module["HEAP32"] = HEAP32 = new Int32Array(b);
              Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
              Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
              Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
          }
          assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
          assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");
          var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 2147483648;
          legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");
          assert(INITIAL_MEMORY >= 65536, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 65536 + ")");
          if (ENVIRONMENT_IS_PTHREAD) {
              wasmMemory = Module["wasmMemory"]
          } else {
              if (Module["wasmMemory"]) {
                  wasmMemory = Module["wasmMemory"]
              } else {
                  wasmMemory = new WebAssembly.Memory({
                      "initial": INITIAL_MEMORY / 65536,
                      "maximum": INITIAL_MEMORY / 65536,
                      "shared": true
                  });
                  if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
                      err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
                      if (ENVIRONMENT_IS_NODE) {
                          err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)")
                      }
                      throw Error("bad memory")
                  }
              }
          }
          updateMemoryViews();
          INITIAL_MEMORY = wasmMemory.buffer.byteLength;
          assert(INITIAL_MEMORY % 65536 === 0);

          function writeStackCookie() {
              var max = _emscripten_stack_get_end();
              assert((max & 3) == 0);
              if (max == 0) {
                  max += 4
              }
              HEAPU32[max >> 2] = 34821223;
              HEAPU32[max + 4 >> 2] = 2310721022;
              HEAPU32[0 >> 2] = 1668509029
          }

          function checkStackCookie() {
              if (ABORT) return;
              var max = _emscripten_stack_get_end();
              if (max == 0) {
                  max += 4
              }
              var cookie1 = HEAPU32[max >> 2];
              var cookie2 = HEAPU32[max + 4 >> 2];
              if (cookie1 != 34821223 || cookie2 != 2310721022) {
                  abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`)
              }
              if (HEAPU32[0 >> 2] != 1668509029) {
                  abort("Runtime error: The application has corrupted its heap memory area (address zero)!")
              }
          }(function() {
              var h16 = new Int16Array(1);
              var h8 = new Int8Array(h16.buffer);
              h16[0] = 25459;
              if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"
          })();
          var __ATPRERUN__ = [];
          var __ATINIT__ = [];
          var __ATMAIN__ = [];
          var __ATEXIT__ = [];
          var __ATPOSTRUN__ = [];
          var runtimeInitialized = false;
          var runtimeExited = false;

          function preRun() {
              assert(!ENVIRONMENT_IS_PTHREAD);
              if (Module["preRun"]) {
                  if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                  while (Module["preRun"].length) {
                      addOnPreRun(Module["preRun"].shift())
                  }
              }
              callRuntimeCallbacks(__ATPRERUN__)
          }

          function initRuntime() {
              assert(!runtimeInitialized);
              runtimeInitialized = true;
              if (ENVIRONMENT_IS_PTHREAD) return;
              checkStackCookie();
              SOCKFS.root = FS.mount(SOCKFS, {}, null);
              if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
              FS.ignorePermissions = false;
              TTY.init();
              PIPEFS.root = FS.mount(PIPEFS, {}, null);
              callRuntimeCallbacks(__ATINIT__)
          }

          function preMain() {
              checkStackCookie();
              if (ENVIRONMENT_IS_PTHREAD) return;
              callRuntimeCallbacks(__ATMAIN__)
          }

          function exitRuntime() {
              assert(!runtimeExited);
              Asyncify.state = Asyncify.State.Disabled;
              checkStackCookie();
              if (ENVIRONMENT_IS_PTHREAD) return;
              ___funcs_on_exit();
              callRuntimeCallbacks(__ATEXIT__);
              FS.quit();
              TTY.shutdown();
              PThread.terminateAllThreads();
              runtimeExited = true
          }

          function postRun() {
              checkStackCookie();
              if (ENVIRONMENT_IS_PTHREAD) return;
              if (Module["postRun"]) {
                  if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                  while (Module["postRun"].length) {
                      addOnPostRun(Module["postRun"].shift())
                  }
              }
              callRuntimeCallbacks(__ATPOSTRUN__)
          }

          function addOnPreRun(cb) {
              __ATPRERUN__.unshift(cb)
          }

          function addOnInit(cb) {
              __ATINIT__.unshift(cb)
          }

          function addOnPostRun(cb) {
              __ATPOSTRUN__.unshift(cb)
          }
          assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          var runDependencies = 0;
          var runDependencyWatcher = null;
          var dependenciesFulfilled = null;
          var runDependencyTracking = {};

          function getUniqueRunDependency(id) {
              var orig = id;
              while (1) {
                  if (!runDependencyTracking[id]) return id;
                  id = orig + Math.random()
              }
          }

          function addRunDependency(id) {
              runDependencies++;
              Module["monitorRunDependencies"]?.(runDependencies);
              if (id) {
                  assert(!runDependencyTracking[id]);
                  runDependencyTracking[id] = 1;
                  if (runDependencyWatcher === null && typeof setInterval != "undefined") {
                      runDependencyWatcher = setInterval(() => {
                          if (ABORT) {
                              clearInterval(runDependencyWatcher);
                              runDependencyWatcher = null;
                              return
                          }
                          var shown = false;
                          for (var dep in runDependencyTracking) {
                              if (!shown) {
                                  shown = true;
                                  err("still waiting on run dependencies:")
                              }
                              err(`dependency: ${dep}`)
                          }
                          if (shown) {
                              err("(end of list)")
                          }
                      }, 1e4)
                  }
              } else {
                  err("warning: run dependency added without ID")
              }
          }

          function removeRunDependency(id) {
              runDependencies--;
              Module["monitorRunDependencies"]?.(runDependencies);
              if (id) {
                  assert(runDependencyTracking[id]);
                  delete runDependencyTracking[id]
              } else {
                  err("warning: run dependency removed without ID")
              }
              if (runDependencies == 0) {
                  if (runDependencyWatcher !== null) {
                      clearInterval(runDependencyWatcher);
                      runDependencyWatcher = null
                  }
                  if (dependenciesFulfilled) {
                      var callback = dependenciesFulfilled;
                      dependenciesFulfilled = null;
                      callback()
                  }
              }
          }

          function abort(what) {
              Module["onAbort"]?.(what);
              what = "Aborted(" + what + ")";
              err(what);
              ABORT = true;
              EXITSTATUS = 1;
              if (what.indexOf("RuntimeError: unreachable") >= 0) {
                  what += '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)'
              }
              var e = new WebAssembly.RuntimeError(what);
              readyPromiseReject(e);
              throw e
          }
          var dataURIPrefix = "data:application/octet-stream;base64,";
          var isDataURI = filename => filename.startsWith(dataURIPrefix);
          var isFileURI = filename => filename.startsWith("file://");

          function createExportWrapper(name) {
              return (...args) => {
                  assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
                  assert(!runtimeExited, `native function \`${name}\` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)`);
                  var f = wasmExports[name];
                  assert(f, `exported native function \`${name}\` not found`);
                  return f(...args)
              }
          }
          var wasmBinaryFile;
          wasmBinaryFile = "experimental.wasm";
          if (!isDataURI(wasmBinaryFile)) {
              wasmBinaryFile = locateFile(wasmBinaryFile)
          }

          function getBinarySync(file) {
              if (file == wasmBinaryFile && wasmBinary) {
                  return new Uint8Array(wasmBinary)
              }
              if (readBinary) {
                  return readBinary(file)
              }
              throw "both async and sync fetching of the wasm failed"
          }

          function getBinaryPromise(binaryFile) {
              if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                  if (typeof fetch == "function" && !isFileURI(binaryFile)) {
                      return fetch(binaryFile, {
                          credentials: "same-origin"
                      }).then(response => {
                          if (!response["ok"]) {
                              throw `failed to load wasm binary file at '${binaryFile}'`
                          }
                          return response["arrayBuffer"]()
                      }).catch(() => getBinarySync(binaryFile))
                  } else if (readAsync) {
                      return new Promise((resolve, reject) => {
                          readAsync(binaryFile, response => resolve(new Uint8Array(response)), reject)
                      })
                  }
              }
              return Promise.resolve().then(() => getBinarySync(binaryFile))
          }

          function instantiateArrayBuffer(binaryFile, imports, receiver) {
              return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
                  err(`failed to asynchronously prepare wasm: ${reason}`);
                  if (isFileURI(wasmBinaryFile)) {
                      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`)
                  }
                  abort(reason)
              })
          }

          function instantiateAsync(binary, binaryFile, imports, callback) {
              if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
                  return fetch(binaryFile, {
                      credentials: "same-origin"
                  }).then(response => {
                      var result = WebAssembly.instantiateStreaming(response, imports);
                      return result.then(callback, function(reason) {
                          err(`wasm streaming compile failed: ${reason}`);
                          err("falling back to ArrayBuffer instantiation");
                          return instantiateArrayBuffer(binaryFile, imports, callback)
                      })
                  })
              }
              return instantiateArrayBuffer(binaryFile, imports, callback)
          }

          function createWasm() {
              var info = {
                  "env": wasmImports,
                  "wasi_snapshot_preview1": wasmImports
              };

              function receiveInstance(instance, module) {
                  wasmExports = instance.exports;
                  wasmExports = Asyncify.instrumentWasmExports(wasmExports);
                  registerTLSInit(wasmExports["_emscripten_tls_init"]);
                  wasmTable = wasmExports["__indirect_function_table"];
                  assert(wasmTable, "table not found in wasm exports");
                  addOnInit(wasmExports["__wasm_call_ctors"]);
                  wasmModule = module;
                  removeRunDependency("wasm-instantiate");
                  return wasmExports
              }
              addRunDependency("wasm-instantiate");
              var trueModule = Module;

              function receiveInstantiationResult(result) {
                  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
                  trueModule = null;
                  receiveInstance(result["instance"], result["module"])
              }
              if (Module["instantiateWasm"]) {
                  try {
                      return Module["instantiateWasm"](info, receiveInstance)
                  } catch (e) {
                      err(`Module.instantiateWasm callback failed with error: ${e}`);
                      readyPromiseReject(e)
                  }
              }
              instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
              return {}
          }
          var tempDouble;
          var tempI64;

          function legacyModuleProp(prop, newName, incoming = true) {
              if (!Object.getOwnPropertyDescriptor(Module, prop)) {
                  Object.defineProperty(Module, prop, {
                      configurable: true,
                      get() {
                          let extra = incoming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
                          abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra)
                      }
                  })
              }
          }

          function ignoredModuleProp(prop) {
              if (Object.getOwnPropertyDescriptor(Module, prop)) {
                  abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`)
              }
          }

          function isExportedByForceFilesystem(name) {
              return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency"
          }

          function missingGlobal(sym, msg) {
              if (typeof globalThis !== "undefined") {
                  Object.defineProperty(globalThis, sym, {
                      configurable: true,
                      get() {
                          warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
                          return undefined
                      }
                  })
              }
          }
          missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");
          missingGlobal("asm", "Please use wasmExports instead");

          function missingLibrarySymbol(sym) {
              if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
                  Object.defineProperty(globalThis, sym, {
                      configurable: true,
                      get() {
                          var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
                          var librarySymbol = sym;
                          if (!librarySymbol.startsWith("_")) {
                              librarySymbol = "$" + sym
                          }
                          msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
                          if (isExportedByForceFilesystem(sym)) {
                              msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"
                          }
                          warnOnce(msg);
                          return undefined
                      }
                  })
              }
              unexportedRuntimeSymbol(sym)
          }

          function unexportedRuntimeSymbol(sym) {
              if (!Object.getOwnPropertyDescriptor(Module, sym)) {
                  Object.defineProperty(Module, sym, {
                      configurable: true,
                      get() {
                          var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
                          if (isExportedByForceFilesystem(sym)) {
                              msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"
                          }
                          abort(msg)
                      }
                  })
              }
          }

          function dbg(...args) {
              if (ENVIRONMENT_IS_NODE) {
                  fs.writeSync(2, args.join(" ") + "\n")
              } else console.warn(...args)
          }
          var ASM_CONSTS = {
              5379300: () => {
                  Module["noExitRuntime"] = true
              },
              5379329: () => {
                  const overlay = document.getElementById("overlay");
                  update_overlay(overlay)
              },
              5379410: $0 => {
                  if (Module.vlcAccess === undefined) {
                      Module.vlcAccess = {}
                  }
                  Module.vlcAccess[$0] = {
                      worker_js_file: undefined,
                      reader: undefined
                  }
              },
              5379550: $0 => {
                  const thread_id = $0;
                  let w = Module.PThread.pthreads[thread_id];

                  function handleFileRequest(e) {
                      const msg = e.data;
                      if (msg.type === "requestFile") {
                          w.removeEventListener("message", handleFileRequest);
                          if (Module.vlc_access_file === undefined) {
                              console.error("vlc_access_file property missing!");
                              w.postMessage({
                                  cmd: "customCmd",
                                  type: "ErrorVLCAccessFileUndefined"
                              });
                              return
                          }
                          if (msg.id === undefined) {
                              console.error("id property missing in requestFile message!");
                              w.postMessage({
                                  cmd: "customCmd",
                                  type: "ErrorRequestFileMessageWithoutId"
                              });
                              return
                          }
                          if (Module.vlc_access_file[msg.id] === undefined) {
                              console.error("error file missing!");
                              w.postMessage({
                                  cmd: "customCmd",
                                  type: "ErrorMissingFile"
                              });
                              return
                          }
                          w.postMessage({
                              cmd: "customCmd",
                              type: "FileResult",
                              file: Module.vlc_access_file[msg.id]
                          })
                      }
                  }
                  w.addEventListener("message", handleFileRequest)
              },
              5380433: ($0, $1, $2, $3) => {
                  const offset = $0;
                  const buffer = $1;
                  const size = $2;
                  const blob = Module.vlcAccess[$3].worker_js_file.slice(offset, offset + size);
                  HEAPU8.set(new Uint8Array(Module.vlcAccess[$3].reader.readAsArrayBuffer(blob)), buffer)
              },
              5380660: ($0, $1) => {
                  try {
                      var v = new BigUint64Array(wasmMemory.buffer, $0, 1);
                      v[0] = BigInt(Module.vlcAccess[$1].worker_js_file.size);
                      return 0
                  } catch (error) {
                      console.error("get_js_file_size error: " + error);
                      return 1
                  }
              },
              5380872: $0 => {
                  Module.vlcAccess[$0].worker_js_file = undefined;
                  Module.vlcAccess[$0].reader = undefined
              },
              5380966: ($0, $1) => {
                  let canvasName = UTF8ToString($1);

                  function onVoutMessage(msg) {
                      let data = msg["data"];
                      if (data.customCmd == "commitFrame") {
                          let bmp = data["bitmap"];
                          let ctx = document.getElementById(canvasName).getContext("bitmaprenderer");
                          ctx.transferFromImageBitmap(bmp)
                      }
                  }
                  let w = Module.PThread.pthreads[$0];
                  w.addEventListener("message", function(e) {
                      let msg = e["data"];
                      if (msg.customCmd == "getVoutMessagePort") {
                          let msgChannel = new MessageChannel;
                          msgChannel.port1.onmessage = onVoutMessage.bind(msgChannel.port1);
                          w.postMessage({
                              customCmd: "getVoutMessagePortResult",
                              msgPort: msgChannel.port2
                          }, [msgChannel.port2])
                      }
                  })
              },
              5381604: ($0, $1) => {
                  let frame = Emval.toValue($0);
                  Module.msgChannel.port2.postMessage({
                      customCmd: "displayFrame",
                      pictureId: $1,
                      frame: frame
                  })
              },
              5381736: ($0, $1) => {
                  const WEBCODEC_MAX_PICTURES = 32;
                  const picIndex = $0;
                  const poolIndex = $1;
                  const frame = Module.framePools[poolIndex][picIndex];
                  console.assert(picIndex >= 0 && picIndex < WEBCODEC_MAX_PICTURES);
                  if (frame !== undefined) frame.close();
                  Module.framePools[poolIndex][picIndex] = undefined
              },
              5382030: $0 => {
                  const WEBCODEC_MAX_PICTURES = 32;
                  const thread_id = $0;
                  let w = Module.PThread.pthreads[thread_id];
                  const connect = msg => {
                      const port = msg.port;
                      port.onmessage = e => {
                          if (e.data.customCmd !== "sendFrame") return;
                          const decoderId = e.data.decoderId;
                          const picIndex = e.data.pictureIdx;
                          console.assert(picIndex >= 0 && picIndex < WEBCODEC_MAX_PICTURES);
                          const frame = Module.framePools[decoderId][picIndex];
                          if (frame === undefined) {
                              port.postMessage({
                                  customCmd: "displayFrame",
                                  frame: undefined,
                                  pictureId: picIndex
                              });
                              return
                          }
                          port.postMessage({
                              customCmd: "displayFrame",
                              frame: frame,
                              pictureId: picIndex
                          }, [frame.clone()])
                      }
                  };
                  w.addEventListener("message", e => {
                      const LISTENERS = {
                          "connect": connect
                      };
                      const listener = LISTENERS[e.data.customCmd];
                      if (listener !== undefined) listener(e.data)
                  })
              },
              5382854: $0 => {
                  const thread_id = $0;
                  let framePool = Module.framePools[thread_id];
                  console.warn("FLUSHING");
                  for (let i = 0; i < framePool.length; ++i) {
                      if (framePool[i]) {
                          framePool[i].close();
                          framePool[i] = undefined
                      }
                  }
              },
              5383071: $0 => {
                  Module.decoder.decode(Emval.toValue($0))
              },
              5383120: $0 => {
                  const WEBCODEC_MAX_PICTURES = 32;
                  if (Module.framePools === undefined) Module.framePools = {};
                  const thread_id = $0;
                  Module.framePools[thread_id] = new Array(WEBCODEC_MAX_PICTURES);
                  let framePool = Module.framePools[thread_id];
                  let w = Module.PThread.pthreads[thread_id];
                  const newFrame = msg => {
                      const picIndex = msg.picIdx;
                      console.assert(picIndex >= 0 && picIndex < WEBCODEC_MAX_PICTURES);
                      if (framePool[picIndex] !== undefined) {
                          console.warn("Discarding dropped frame ", picIndex);
                          framePool[picIndex].close()
                      }
                      framePool[picIndex] = msg.frame
                  };
                  w.addEventListener("message", e => {
                      const LISTENERS = {
                          "newFrame": newFrame
                      };
                      const listener = LISTENERS[e.data.customCmd];
                      if (listener !== undefined) listener(e.data)
                  })
              },
              5383882: $0 => {
                  Module.decoderWorkerPort.postMessage({
                      customCmd: "decode",
                      block: $0
                  })
              },
              5383960: () => {
                  Module.decoderWorkerPort.postMessage({
                      customCmd: "close"
                  })
              }
          };

          function __asyncjs__init_js_file(p_access, id) {
              return Asyncify.handleAsync(async () => {
                  let p = new Promise((resolve, reject) => {
                      function handleFileResult(e) {
                          const msg = e["data"];
                          if (msg.type === "FileResult") {
                              self.removeEventListener("message", handleFileResult);
                              if (msg.file !== undefined) {
                                  Module.vlcAccess[p_access].worker_js_file = msg.file;
                                  Module.vlcAccess[p_access].reader = new FileReaderSync;
                                  resolve()
                              } else {
                                  reject("error: sent an undefined File object from the main thread")
                              }
                          } else if (msg.type === "ErrorVLCAccessFileUndefined") {
                              reject("error: vlc_access_file object is not defined")
                          } else if (msg.type === "ErrorRequestFileMessageWithoutId") {
                              reject("error: request file message send without an id")
                          } else if (msg.type === "ErrorMissingFile") {
                              reject("error: missing file, bad id or vlc_access_file[id] is not defined")
                          }
                      }
                      self.addEventListener("message", handleFileResult)
                  });
                  let timer = undefined;
                  let timeout = new Promise(function(resolve, reject) {
                      timer = setTimeout(resolve, 1e3, "timeout")
                  });
                  let promises = [p, timeout];
                  self.postMessage({
                      cmd: "customCmd",
                      type: "requestFile",
                      id: id
                  });
                  let return_value = 0;
                  try {
                      let value = await Promise.race(promises);
                      if (value === "timeout") {
                          console.error("vlc_access timeout: could not get file!");
                          return_value = 1
                      }
                  } catch (error) {
                      console.error("vlc_access error in init_js_file(): ", error);
                      return_value = 1
                  }
                  clearTimeout(timer);
                  return return_value
              })
          }

          function __asyncjs__Swap(gl) {
              return Asyncify.handleAsync(async () => {
                  let bitmap = Module.offscreenCanvas.transferToImageBitmap();
                  await new Promise(resolve => {
                      setTimeout(() => {
                          Module.voutMsgPort.postMessage({
                              customCmd: "commitFrame",
                              bitmap: bitmap
                          }, [bitmap]);
                          resolve()
                      })
                  })
              })
          }

          function __asyncjs__getVoutMessagePort() {
              return Asyncify.handleAsync(async () => {
                  let p = new Promise((resolve, reject) => {
                      let listener = function(e) {
                          let msg = e.data;
                          if (msg.customCmd == "getVoutMessagePortResult") {
                              Module.voutMsgPort = msg["msgPort"];
                              Module.voutMsgPort.onmessage = function(vout_msg) {
                                  if (vout_msg.data["customCmd"] == "releaseFrame") {
                                      vout_msg.data["bitmap"].close()
                                  }
                              };
                              resolve();
                              self.removeEventListener("message", listener)
                          }
                      };
                      self.addEventListener("message", listener);
                      self.postMessage({
                          customCmd: "getVoutMessagePort"
                      })
                  });
                  await p
              })
          }

          function createGlContext(width, height) {
              Module.offscreenCanvas = new OffscreenCanvas(width, height);
              Module.glCtx = Module.offscreenCanvas.getContext("webgl2");
              return GL.registerContext(Module.glCtx, {
                  antialias: false
              })
          }

          function __asyncjs__bindVideoFrame(pictureIdx, decoderId) {
              return Asyncify.handleAsync(async () => {
                  let frame = await Module.awaitFrame(pictureIdx, decoderId);
                  if (!frame) {
                      return
                  }
                  let glCtx = Module.glCtx;
                  glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, frame.displayWidth, frame.displayHeight, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, frame)
              })
          }

          function setupMessagePort(vctx) {
              function onDecoderMessage(msg) {
                  let data = msg["data"];
                  if (data.customCmd == "displayFrame") {
                      let pictureIdx = data.pictureId;
                      let frame = data["frame"];
                      Module.glConv.frameResolver(frame)
                  }
              }
              Module.msgChannel = new MessageChannel;
              Module.msgChannel.port1.onmessage = onDecoderMessage;
              self.postMessage({
                  customCmd: "connect",
                  port: Module.msgChannel.port2
              }, [Module.msgChannel.port2])
          }

          function initGlConvWorker(maxPictures) {
              Module.glConv = {};
              Module.glConv.lastFrame = {
                  pictureIdx: -1,
                  frame: undefined
              };
              Module.awaitFrame = async function(pictureIdx, decoderId) {
                  if (Module.glConv.lastFrame.pictureIdx == pictureIdx) {
                      return Module.glConv.lastFrame.frame
                  }
                  let p = new Promise((resolve, reject) => {
                      Module.glConv.frameResolver = resolve;
                      Module.msgChannel.port1.postMessage({
                          "customCmd": "sendFrame",
                          "pictureIdx": pictureIdx,
                          "decoderId": decoderId
                      })
                  });
                  let frame = await p;
                  Module.glConv.frameResolver = undefined;
                  if (Module.glConv.lastFrame.frame) Module.glConv.lastFrame.frame.close();
                  Module.glConv.lastFrame.frame = frame;
                  Module.glConv.lastFrame.pictureIdx = pictureIdx;
                  return frame
              }
          }

          function closeMessagePort() {
              if (Module.msgChannel) delete Module.msgChannel
          }

          function __asyncjs__CopyFrameToBuffer(pictureIdx, infoHandle) {
              return Asyncify.handleAsync(async () => {
                  let info = Emval.toValue(infoHandle);
                  let frame = await Module.awaitFrame(pictureIdx);
                  let copyOpts = {
                      rect: frame.codedRect,
                      layout: info.layout
                  };
                  await frame.copyTo(info.buffer, copyOpts)
              })
          }

          function __asyncjs__probeConfig(cfg) {
              return Asyncify.handleAsync(async () => {
                  var decoderCfg = Emval.toValue(cfg);
                  var res = await VideoDecoder.isConfigSupported(decoderCfg).catch(err => {
                      console.log(err);
                      return {
                          "supported": false
                      }
                  });
                  return res["supported"]
              })
          }

          function initDecoderJS(decoder, decCfgHandle) {
              async function onDecoderWorkerMessage(msg) {
                  const data = msg["data"];
                  if (data["customCmd"] == "decode") {
                      let block = data["block"];
                      _decodeBlock(block);
                      _releaseBlock(block)
                  } else if (data["customCmd"] == "flush") {
                      await Module.decoder.flush();
                      self.postMessage({
                          customCmd: "flush"
                      });
                      Module.msgChannel.port1.postMessage({
                          customCmd: "onFlushCompleted"
                      })
                  } else if (data["customCmd"] == "close") {
                      Module.decoder.close()
                  }
              }
              self.addEventListener("message", e => {
                  let msg = e["data"];
                  console.log("Received message in decoder worker");
                  console.dir(msg);
                  if (msg["customCmd"] == "getDecoderWorkerMessagePort") {
                      Module.msgChannel = new MessageChannel;
                      Module.msgChannel.port1.onmessage = onDecoderWorkerMessage;
                      self.postMessage({
                          customCmd: "transferMessagePort",
                          targetThread: msg["replyTo"],
                          transferList: [Module.msgChannel.port2]
                      }, [Module.msgChannel.port2])
                  }
              });
              Module.webCodecCtx = decoder;
              Module.framesReady = [];
              Module.onPictureReleased = [];
              let initCfg = {
                  "output": async function(frame) {
                      if (!_updateVideoOutput(Module.webCodecCtx)) {
                          frame.close();
                          return
                      }
                      let p = _waitPictureFromPool(Module.webCodecCtx);
                      if (Module.flushing || !p) {
                          frame.close();
                          return
                      }
                      let ts = frame.timestamp;
                      let picIdx = _getPictureIdx(p);
                      self.postMessage({
                          customCmd: "newFrame",
                          picIdx: picIdx,
                          frame: frame
                      }, [frame]);
                      _queuePicture(Module.webCodecCtx, p, ts)
                  },
                  "error": function(err) {
                      console.log("Error while decoding: ");
                      console.log(err)
                  }
              };
              Module.decoder = new VideoDecoder(initCfg);
              let decCfg = Emval.toValue(decCfgHandle);
              Module.decoder.configure(decCfg)
          }

          function __asyncjs__initDecoderWorkerMessagePort(dec) {
              return Asyncify.handleAsync(async () => {
                  if (Module.decoderWorkerPort !== undefined) {
                      return
                  }
                  let workerMessagePortPromise = new Promise((resolve, reject) => {
                      self.addEventListener("message", function(e) {
                          let msg = e["data"];
                          if (msg.customCmd == "transferMessagePort") {
                              let port = msg["transferList"][0];
                              if (!port) {
                                  console.log("No port provided, rejecting");
                                  reject()
                              }
                              Module.decoderWorkerPort = port;
                              resolve()
                          }
                      });
                      self.postMessage({
                          customCmd: "getDecoderWorkerMessagePort",
                          targetThread: _getVlcDecoderWorkerThread(dec),
                          replyTo: _pthread_self()
                      })
                  });
                  await workerMessagePortPromise;
                  Module.decoderWorkerPort.onmessage = e => {
                      let data = e["data"];
                      if (data["customCmd"] == "onFlushCompleted") {
                          Module.flushPromiseResolver()
                      }
                  }
              })
          }

          function __asyncjs__flushAsync() {
              return Asyncify.handleAsync(async () => {
                  let p = new Promise(r => {
                      Module.flushPromiseResolver = r;
                      Module.decoderWorkerPort.postMessage({
                          customCmd: "flush"
                      })
                  });
                  await p;
                  Module.flushPromiseResolver = undefined
              })
          }

          function ExitStatus(status) {
              this.name = "ExitStatus";
              this.message = `Program terminated with exit(${status})`;
              this.status = status
          }
          var terminateWorker = worker => {
              worker.terminate();
              worker.onmessage = e => {
                  var cmd = e["data"]["cmd"];
                  err(`received "${cmd}" command from terminated worker: ${worker.workerID}`)
              }
          };
          var killThread = pthread_ptr => {
              assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! killThread() can only ever be called from main application thread!");
              assert(pthread_ptr, "Internal Error! Null pthread_ptr in killThread!");
              var worker = PThread.pthreads[pthread_ptr];
              delete PThread.pthreads[pthread_ptr];
              terminateWorker(worker);
              __emscripten_thread_free_data(pthread_ptr);
              PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
              worker.pthread_ptr = 0
          };
          var cancelThread = pthread_ptr => {
              assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cancelThread() can only ever be called from main application thread!");
              assert(pthread_ptr, "Internal Error! Null pthread_ptr in cancelThread!");
              var worker = PThread.pthreads[pthread_ptr];
              worker.postMessage({
                  "cmd": "cancel"
              })
          };
          var cleanupThread = pthread_ptr => {
              assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cleanupThread() can only ever be called from main application thread!");
              assert(pthread_ptr, "Internal Error! Null pthread_ptr in cleanupThread!");
              var worker = PThread.pthreads[pthread_ptr];
              assert(worker);
              PThread.returnWorkerToPool(worker)
          };
          var zeroMemory = (address, size) => {
              HEAPU8.fill(0, address, address + size);
              return address
          };
          var spawnThread = threadParams => {
              assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! spawnThread() can only ever be called from main application thread!");
              assert(threadParams.pthread_ptr, "Internal error, no pthread ptr!");
              var worker = PThread.getNewWorker();
              if (!worker) {
                  return 6
              }
              assert(!worker.pthread_ptr, "Internal error!");
              PThread.runningWorkers.push(worker);
              PThread.pthreads[threadParams.pthread_ptr] = worker;
              worker.pthread_ptr = threadParams.pthread_ptr;
              var msg = {
                  "cmd": "run",
                  "start_routine": threadParams.startRoutine,
                  "arg": threadParams.arg,
                  "pthread_ptr": threadParams.pthread_ptr
              };
              msg.moduleCanvasId = threadParams.moduleCanvasId;
              msg.offscreenCanvases = threadParams.offscreenCanvases;
              if (ENVIRONMENT_IS_NODE) {
                  worker.unref()
              }
              worker.postMessage(msg, threadParams.transferList);
              return 0
          };
          var runtimeKeepaliveCounter = 0;
          var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
          var withStackSave = f => {
              var stack = stackSave();
              var ret = f();
              stackRestore(stack);
              return ret
          };
          var convertI32PairToI53Checked = (lo, hi) => {
              assert(lo == lo >>> 0 || lo == (lo | 0));
              assert(hi === (hi | 0));
              return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN
          };
          var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => withStackSave(() => {
              var serializedNumCallArgs = callArgs.length;
              var args = stackAlloc(serializedNumCallArgs * 8);
              var b = args >> 3;
              for (var i = 0; i < callArgs.length; i++) {
                  var arg = callArgs[i];
                  HEAPF64[b + i] = arg
              }
              return __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync)
          });

          function _proc_exit(code) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
              EXITSTATUS = code;
              if (!keepRuntimeAlive()) {
                  PThread.terminateAllThreads();
                  Module["onExit"]?.(code);
                  ABORT = true
              }
              quit_(code, new ExitStatus(code))
          }
          var exitJS = (status, implicit) => {
              EXITSTATUS = status;
              if (ENVIRONMENT_IS_PTHREAD) {
                  assert(!implicit);
                  exitOnMainThread(status);
                  throw "unwind"
              }
              if (!keepRuntimeAlive()) {
                  exitRuntime()
              }
              if (keepRuntimeAlive() && !implicit) {
                  var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
                  readyPromiseReject(msg);
                  err(msg)
              }
              _proc_exit(status)
          };
          var _exit = exitJS;
          var ptrToString = ptr => {
              assert(typeof ptr === "number");
              ptr >>>= 0;
              return "0x" + ptr.toString(16).padStart(8, "0")
          };
          var handleException = e => {
              if (e instanceof ExitStatus || e == "unwind") {
                  return EXITSTATUS
              }
              checkStackCookie();
              if (e instanceof WebAssembly.RuntimeError) {
                  if (_emscripten_stack_get_current() <= 0) {
                      err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)")
                  }
              }
              quit_(1, e)
          };
          var PThread = {
              unusedWorkers: [],
              runningWorkers: [],
              tlsInitFunctions: [],
              pthreads: {},
              nextWorkerID: 1,
              debugInit() {
                  function pthreadLogPrefix() {
                      var t = 0;
                      if (runtimeInitialized && typeof _pthread_self != "undefined" && !runtimeExited) {
                          t = _pthread_self()
                      }
                      return "w:" + (Module["workerID"] || 0) + ",t:" + ptrToString(t) + ": "
                  }
                  var origDbg = dbg;
                  dbg = (...args) => origDbg(pthreadLogPrefix() + args.join(" "))
              },
              init() {
                  PThread.debugInit();
                  if (ENVIRONMENT_IS_PTHREAD) {
                      PThread.initWorker()
                  } else {
                      PThread.initMainThread()
                  }
              },
              initMainThread() {
                  var pthreadPoolSize = 25;
                  while (pthreadPoolSize--) {
                      PThread.allocateUnusedWorker()
                  }
                  addOnPreRun(() => {
                      addRunDependency("loading-workers");
                      PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"))
                  })
              },
              initWorker() {
                  noExitRuntime = false
              },
              setExitStatus: status => EXITSTATUS = status,
              terminateAllThreads__deps: ["$terminateWorker"],
              terminateAllThreads: () => {
                  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! terminateAllThreads() can only ever be called from main application thread!");
                  for (var worker of PThread.runningWorkers) {
                      terminateWorker(worker)
                  }
                  for (var worker of PThread.unusedWorkers) {
                      terminateWorker(worker)
                  }
                  PThread.unusedWorkers = [];
                  PThread.runningWorkers = [];
                  PThread.pthreads = []
              },
              returnWorkerToPool: worker => {
                  var pthread_ptr = worker.pthread_ptr;
                  delete PThread.pthreads[pthread_ptr];
                  PThread.unusedWorkers.push(worker);
                  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
                  worker.pthread_ptr = 0;
                  __emscripten_thread_free_data(pthread_ptr)
              },
              receiveObjectTransfer(data) {
                  if (typeof GL != "undefined") {
                      Object.assign(GL.offscreenCanvases, data.offscreenCanvases);
                      if (!Module["canvas"] && data.moduleCanvasId && GL.offscreenCanvases[data.moduleCanvasId]) {
                          Module["canvas"] = GL.offscreenCanvases[data.moduleCanvasId].offscreenCanvas;
                          Module["canvas"].id = data.moduleCanvasId
                      }
                  }
              },
              threadInitTLS() {
                  PThread.tlsInitFunctions.forEach(f => f())
              },
              loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
                  worker.onmessage = e => {
                      var d = e["data"];
                      var cmd = d["cmd"];
                      if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
                          var targetWorker = PThread.pthreads[d["targetThread"]];
                          if (targetWorker) {
                              targetWorker.postMessage(d, d["transferList"])
                          } else {
                              err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`)
                          }
                          return
                      }
                      if (cmd === "checkMailbox") {
                          checkMailbox()
                      } else if (cmd === "spawnThread") {
                          spawnThread(d)
                      } else if (cmd === "cleanupThread") {
                          cleanupThread(d["thread"])
                      } else if (cmd === "killThread") {
                          killThread(d["thread"])
                      } else if (cmd === "cancelThread") {
                          cancelThread(d["thread"])
                      } else if (cmd === "loaded") {
                          worker.loaded = true;
                          if (ENVIRONMENT_IS_NODE && !worker.pthread_ptr) {
                              worker.unref()
                          }
                          onFinishedLoading(worker)
                      } else if (cmd === "alert") {
                          alert(`Thread ${d["threadId"]}: ${d["text"]}`)
                      } else if (d.target === "setimmediate") {
                          worker.postMessage(d)
                      } else if (cmd === "callHandler") {
                          Module[d["handler"]](...d["args"])
                      } else if (cmd) {
                          err(`worker sent an unknown command ${cmd}`)
                      }
                  };
                  worker.onerror = e => {
                      var message = "worker sent an error!";
                      if (worker.pthread_ptr) {
                          message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`
                      }
                      err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
                      throw e
                  };
                  if (ENVIRONMENT_IS_NODE) {
                      worker.on("message", data => worker.onmessage({
                          data: data
                      }));
                      worker.on("error", e => worker.onerror(e))
                  }
                  assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
                  assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
                  var handlers = [];
                  var knownHandlers = ["onExit", "onAbort", "print", "printErr"];
                  for (var handler of knownHandlers) {
                      if (Module.hasOwnProperty(handler)) {
                          handlers.push(handler)
                      }
                  }
                  worker.workerID = PThread.nextWorkerID++;
                  worker.postMessage({
                      "cmd": "load",
                      "handlers": handlers,
                      "urlOrBlob": Module["mainScriptUrlOrBlob"] || _scriptDir,
                      "wasmMemory": wasmMemory,
                      "wasmModule": wasmModule,
                      "workerID": worker.workerID
                  })
              }),
              loadWasmModuleToAllWorkers(onMaybeReady) {
                  if (ENVIRONMENT_IS_PTHREAD) {
                      return onMaybeReady()
                  }
                  let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
                  pthreadPoolReady.then(onMaybeReady)
              },
              allocateUnusedWorker() {
                  var worker;
                  var pthreadMainJs = locateFile("experimental.worker.js");
                  worker = new Worker(pthreadMainJs);
                  PThread.unusedWorkers.push(worker)
              },
              getNewWorker() {
                  if (PThread.unusedWorkers.length == 0) {
                      if (!ENVIRONMENT_IS_NODE) {
                          err("Tried to spawn a new thread, but the thread pool is exhausted.\n" + "This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" + "If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`." + "\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.")
                      }
                      PThread.allocateUnusedWorker();
                      PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0])
                  }
                  return PThread.unusedWorkers.pop()
              }
          };
          Module["PThread"] = PThread;
          var callRuntimeCallbacks = callbacks => {
              while (callbacks.length > 0) {
                  callbacks.shift()(Module)
              }
          };
          var establishStackSpace = () => {
              var pthread_ptr = _pthread_self();
              var stackHigh = HEAPU32[pthread_ptr + 52 >> 2];
              var stackSize = HEAPU32[pthread_ptr + 56 >> 2];
              var stackLow = stackHigh - stackSize;
              assert(stackHigh != 0);
              assert(stackLow != 0);
              assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
              _emscripten_stack_set_limits(stackHigh, stackLow);
              stackRestore(stackHigh);
              writeStackCookie()
          };
          Module["establishStackSpace"] = establishStackSpace;

          function exitOnMainThread(returnCode) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
              _exit(returnCode)
          }
          var invokeEntryPoint = (ptr, arg) => {
              runtimeKeepaliveCounter = 0;
              var result = (a1 => dynCall_ii(ptr, a1))(arg);
              checkStackCookie();

              function finish(result) {
                  if (keepRuntimeAlive()) {
                      PThread.setExitStatus(result)
                  } else {
                      __emscripten_thread_exit(result)
                  }
              }
              finish(result)
          };
          Module["invokeEntryPoint"] = invokeEntryPoint;
          var noExitRuntime = Module["noExitRuntime"] || false;
          var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);
          var warnOnce = text => {
              warnOnce.shown ||= {};
              if (!warnOnce.shown[text]) {
                  warnOnce.shown[text] = 1;
                  if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
                  err(text)
              }
          };
          var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
          var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
              var endIdx = idx + maxBytesToRead;
              var endPtr = idx;
              while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
              if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                  return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr))
              }
              var str = "";
              while (idx < endPtr) {
                  var u0 = heapOrArray[idx++];
                  if (!(u0 & 128)) {
                      str += String.fromCharCode(u0);
                      continue
                  }
                  var u1 = heapOrArray[idx++] & 63;
                  if ((u0 & 224) == 192) {
                      str += String.fromCharCode((u0 & 31) << 6 | u1);
                      continue
                  }
                  var u2 = heapOrArray[idx++] & 63;
                  if ((u0 & 240) == 224) {
                      u0 = (u0 & 15) << 12 | u1 << 6 | u2
                  } else {
                      if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
                      u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                  }
                  if (u0 < 65536) {
                      str += String.fromCharCode(u0)
                  } else {
                      var ch = u0 - 65536;
                      str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                  }
              }
              return str
          };
          var UTF8ToString = (ptr, maxBytesToRead) => {
              assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
              return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
          };
          var ___assert_fail = (condition, filename, line, func) => {
              abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
          };
          var ___call_sighandler = (fp, sig) => (a1 => dynCall_vi(fp, a1))(sig);
          var exceptionCaught = [];
          var exceptionLast = 0;
          var uncaughtExceptionCount = 0;
          var ___cxa_rethrow = () => {
              var info = exceptionCaught.pop();
              if (!info) {
                  abort("no exception to throw")
              }
              var ptr = info.excPtr;
              if (!info.get_rethrown()) {
                  exceptionCaught.push(info);
                  info.set_rethrown(true);
                  info.set_caught(false);
                  uncaughtExceptionCount++
              }
              exceptionLast = ptr;
              assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.")
          };
          class ExceptionInfo {
              constructor(excPtr) {
                  this.excPtr = excPtr;
                  this.ptr = excPtr - 24
              }
              set_type(type) {
                  HEAPU32[this.ptr + 4 >> 2] = type
              }
              get_type() {
                  return HEAPU32[this.ptr + 4 >> 2]
              }
              set_destructor(destructor) {
                  HEAPU32[this.ptr + 8 >> 2] = destructor
              }
              get_destructor() {
                  return HEAPU32[this.ptr + 8 >> 2]
              }
              set_caught(caught) {
                  caught = caught ? 1 : 0;
                  HEAP8[this.ptr + 12] = caught
              }
              get_caught() {
                  return HEAP8[this.ptr + 12] != 0
              }
              set_rethrown(rethrown) {
                  rethrown = rethrown ? 1 : 0;
                  HEAP8[this.ptr + 13] = rethrown
              }
              get_rethrown() {
                  return HEAP8[this.ptr + 13] != 0
              }
              init(type, destructor) {
                  this.set_adjusted_ptr(0);
                  this.set_type(type);
                  this.set_destructor(destructor)
              }
              set_adjusted_ptr(adjustedPtr) {
                  HEAPU32[this.ptr + 16 >> 2] = adjustedPtr
              }
              get_adjusted_ptr() {
                  return HEAPU32[this.ptr + 16 >> 2]
              }
              get_exception_ptr() {
                  var isPointer = ___cxa_is_pointer_type(this.get_type());
                  if (isPointer) {
                      return HEAPU32[this.excPtr >> 2]
                  }
                  var adjusted = this.get_adjusted_ptr();
                  if (adjusted !== 0) return adjusted;
                  return this.excPtr
              }
          }
          var ___cxa_throw = (ptr, type, destructor) => {
              var info = new ExceptionInfo(ptr);
              info.init(type, destructor);
              exceptionLast = ptr;
              uncaughtExceptionCount++;
              assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.")
          };
          var ___emscripten_init_main_thread_js = tb => {
              __emscripten_thread_init(tb, !ENVIRONMENT_IS_WORKER, 1, !ENVIRONMENT_IS_WEB, 65536, false);
              PThread.threadInitTLS()
          };
          var ___emscripten_thread_cleanup = thread => {
              if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
              else postMessage({
                  "cmd": "cleanupThread",
                  "thread": thread
              })
          };

          function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
              return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg)
          }
          var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
              if (typeof SharedArrayBuffer == "undefined") {
                  err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
                  return 6
              }
              var transferList = [];
              var error = 0;
              var transferredCanvasNames = attr ? HEAPU32[attr + 40 >> 2] : 0;
              if (transferredCanvasNames == 4294967295) {
                  transferredCanvasNames = "#canvas"
              } else transferredCanvasNames &&= UTF8ToString(transferredCanvasNames).trim();
              transferredCanvasNames &&= transferredCanvasNames.split(",");
              var offscreenCanvases = {};
              var moduleCanvasId = Module["canvas"] ? Module["canvas"].id : "";
              for (var i in transferredCanvasNames) {
                  var name = transferredCanvasNames[i].trim();
                  var offscreenCanvasInfo;
                  try {
                      if (name == "#canvas") {
                          if (!Module["canvas"]) {
                              err(`pthread_create: could not find canvas with ID "${name}" to transfer to thread!`);
                              error = 28;
                              break
                          }
                          name = Module["canvas"].id
                      }
                      assert(typeof GL == "object", "OFFSCREENCANVAS_SUPPORT assumes GL is in use (you can force-include it with '-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=$GL')");
                      if (GL.offscreenCanvases[name]) {
                          offscreenCanvasInfo = GL.offscreenCanvases[name];
                          GL.offscreenCanvases[name] = null;
                          if (Module["canvas"] instanceof OffscreenCanvas && name === Module["canvas"].id) Module["canvas"] = null
                      } else if (!ENVIRONMENT_IS_PTHREAD) {
                          var canvas = Module["canvas"] && Module["canvas"].id === name ? Module["canvas"] : document.querySelector(name);
                          if (!canvas) {
                              err(`pthread_create: could not find canvas with ID "${name}" to transfer to thread!`);
                              error = 28;
                              break
                          }
                          if (canvas.controlTransferredOffscreen) {
                              err(`pthread_create: cannot transfer canvas with ID "${name}" to thread, since the current thread does not have control over it!`);
                              error = 63;
                              break
                          }
                          if (canvas.transferControlToOffscreen) {
                              if (!canvas.canvasSharedPtr) {
                                  canvas.canvasSharedPtr = _malloc(12);
                                  HEAP32[canvas.canvasSharedPtr >> 2] = canvas.width;
                                  HEAP32[canvas.canvasSharedPtr + 4 >> 2] = canvas.height;
                                  HEAPU32[canvas.canvasSharedPtr + 8 >> 2] = 0
                              }
                              offscreenCanvasInfo = {
                                  offscreenCanvas: canvas.transferControlToOffscreen(),
                                  canvasSharedPtr: canvas.canvasSharedPtr,
                                  id: canvas.id
                              };
                              canvas.controlTransferredOffscreen = true
                          } else {
                              err(`pthread_create: cannot transfer control of canvas "${name}" to pthread, because current browser does not support OffscreenCanvas!`)
                          }
                      }
                      if (offscreenCanvasInfo) {
                          transferList.push(offscreenCanvasInfo.offscreenCanvas);
                          offscreenCanvases[offscreenCanvasInfo.id] = offscreenCanvasInfo
                      }
                  } catch (e) {
                      err(`pthread_create: failed to transfer control of canvas "${name}" to OffscreenCanvas! Error: ${e}`);
                      return 28
                  }
              }
              if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
                  return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg)
              }
              if (error) return error;
              for (var canvas of Object.values(offscreenCanvases)) {
                  HEAPU32[canvas.canvasSharedPtr + 8 >> 2] = pthread_ptr
              }
              var threadParams = {
                  startRoutine: startRoutine,
                  pthread_ptr: pthread_ptr,
                  arg: arg,
                  moduleCanvasId: moduleCanvasId,
                  offscreenCanvases: offscreenCanvases,
                  transferList: transferList
              };
              if (ENVIRONMENT_IS_PTHREAD) {
                  threadParams.cmd = "spawnThread";
                  postMessage(threadParams, transferList);
                  return 0
              }
              return spawnThread(threadParams)
          };
          var ___pthread_kill_js = (thread, signal) => {
              if (signal === 33) {
                  if (!ENVIRONMENT_IS_PTHREAD) cancelThread(thread);
                  else postMessage({
                      "cmd": "cancelThread",
                      "thread": thread
                  })
              } else {
                  if (!ENVIRONMENT_IS_PTHREAD) killThread(thread);
                  else postMessage({
                      "cmd": "killThread",
                      "thread": thread
                  })
              }
              return 0
          };
          var initRandomFill = () => {
              if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
                  return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), view)
              } else if (ENVIRONMENT_IS_NODE) {
                  try {
                      var crypto_module = require("crypto");
                      var randomFillSync = crypto_module["randomFillSync"];
                      if (randomFillSync) {
                          return view => crypto_module["randomFillSync"](view)
                      }
                      var randomBytes = crypto_module["randomBytes"];
                      return view => (view.set(randomBytes(view.byteLength)), view)
                  } catch (e) {}
              }
              abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")
          };
          var randomFill = view => (randomFill = initRandomFill())(view);
          var PATH = {
              isAbs: path => path.charAt(0) === "/",
              splitPath: filename => {
                  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                  return splitPathRe.exec(filename).slice(1)
              },
              normalizeArray: (parts, allowAboveRoot) => {
                  var up = 0;
                  for (var i = parts.length - 1; i >= 0; i--) {
                      var last = parts[i];
                      if (last === ".") {
                          parts.splice(i, 1)
                      } else if (last === "..") {
                          parts.splice(i, 1);
                          up++
                      } else if (up) {
                          parts.splice(i, 1);
                          up--
                      }
                  }
                  if (allowAboveRoot) {
                      for (; up; up--) {
                          parts.unshift("..")
                      }
                  }
                  return parts
              },
              normalize: path => {
                  var isAbsolute = PATH.isAbs(path),
                      trailingSlash = path.substr(-1) === "/";
                  path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
                  if (!path && !isAbsolute) {
                      path = "."
                  }
                  if (path && trailingSlash) {
                      path += "/"
                  }
                  return (isAbsolute ? "/" : "") + path
              },
              dirname: path => {
                  var result = PATH.splitPath(path),
                      root = result[0],
                      dir = result[1];
                  if (!root && !dir) {
                      return "."
                  }
                  if (dir) {
                      dir = dir.substr(0, dir.length - 1)
                  }
                  return root + dir
              },
              basename: path => {
                  if (path === "/") return "/";
                  path = PATH.normalize(path);
                  path = path.replace(/\/$/, "");
                  var lastSlash = path.lastIndexOf("/");
                  if (lastSlash === -1) return path;
                  return path.substr(lastSlash + 1)
              },
              join: (...paths) => PATH.normalize(paths.join("/")),
              join2: (l, r) => PATH.normalize(l + "/" + r)
          };
          var PATH_FS = {
              resolve: (...args) => {
                  var resolvedPath = "",
                      resolvedAbsolute = false;
                  for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                      var path = i >= 0 ? args[i] : FS.cwd();
                      if (typeof path != "string") {
                          throw new TypeError("Arguments to path.resolve must be strings")
                      } else if (!path) {
                          return ""
                      }
                      resolvedPath = path + "/" + resolvedPath;
                      resolvedAbsolute = PATH.isAbs(path)
                  }
                  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
                  return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
              },
              relative: (from, to) => {
                  from = PATH_FS.resolve(from).substr(1);
                  to = PATH_FS.resolve(to).substr(1);

                  function trim(arr) {
                      var start = 0;
                      for (; start < arr.length; start++) {
                          if (arr[start] !== "") break
                      }
                      var end = arr.length - 1;
                      for (; end >= 0; end--) {
                          if (arr[end] !== "") break
                      }
                      if (start > end) return [];
                      return arr.slice(start, end - start + 1)
                  }
                  var fromParts = trim(from.split("/"));
                  var toParts = trim(to.split("/"));
                  var length = Math.min(fromParts.length, toParts.length);
                  var samePartsLength = length;
                  for (var i = 0; i < length; i++) {
                      if (fromParts[i] !== toParts[i]) {
                          samePartsLength = i;
                          break
                      }
                  }
                  var outputParts = [];
                  for (var i = samePartsLength; i < fromParts.length; i++) {
                      outputParts.push("..")
                  }
                  outputParts = outputParts.concat(toParts.slice(samePartsLength));
                  return outputParts.join("/")
              }
          };
          var FS_stdin_getChar_buffer = [];
          var lengthBytesUTF8 = str => {
              var len = 0;
              for (var i = 0; i < str.length; ++i) {
                  var c = str.charCodeAt(i);
                  if (c <= 127) {
                      len++
                  } else if (c <= 2047) {
                      len += 2
                  } else if (c >= 55296 && c <= 57343) {
                      len += 4;
                      ++i
                  } else {
                      len += 3
                  }
              }
              return len
          };
          var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
              assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
              if (!(maxBytesToWrite > 0)) return 0;
              var startIdx = outIdx;
              var endIdx = outIdx + maxBytesToWrite - 1;
              for (var i = 0; i < str.length; ++i) {
                  var u = str.charCodeAt(i);
                  if (u >= 55296 && u <= 57343) {
                      var u1 = str.charCodeAt(++i);
                      u = 65536 + ((u & 1023) << 10) | u1 & 1023
                  }
                  if (u <= 127) {
                      if (outIdx >= endIdx) break;
                      heap[outIdx++] = u
                  } else if (u <= 2047) {
                      if (outIdx + 1 >= endIdx) break;
                      heap[outIdx++] = 192 | u >> 6;
                      heap[outIdx++] = 128 | u & 63
                  } else if (u <= 65535) {
                      if (outIdx + 2 >= endIdx) break;
                      heap[outIdx++] = 224 | u >> 12;
                      heap[outIdx++] = 128 | u >> 6 & 63;
                      heap[outIdx++] = 128 | u & 63
                  } else {
                      if (outIdx + 3 >= endIdx) break;
                      if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
                      heap[outIdx++] = 240 | u >> 18;
                      heap[outIdx++] = 128 | u >> 12 & 63;
                      heap[outIdx++] = 128 | u >> 6 & 63;
                      heap[outIdx++] = 128 | u & 63
                  }
              }
              heap[outIdx] = 0;
              return outIdx - startIdx
          };

          function intArrayFromString(stringy, dontAddNull, length) {
              var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
              var u8array = new Array(len);
              var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
              if (dontAddNull) u8array.length = numBytesWritten;
              return u8array
          }
          var FS_stdin_getChar = () => {
              if (!FS_stdin_getChar_buffer.length) {
                  var result = null;
                  if (ENVIRONMENT_IS_NODE) {
                      var BUFSIZE = 256;
                      var buf = Buffer.alloc(BUFSIZE);
                      var bytesRead = 0;
                      var fd = process.stdin.fd;
                      try {
                          bytesRead = fs.readSync(fd, buf)
                      } catch (e) {
                          if (e.toString().includes("EOF")) bytesRead = 0;
                          else throw e
                      }
                      if (bytesRead > 0) {
                          result = buf.slice(0, bytesRead).toString("utf-8")
                      } else {
                          result = null
                      }
                  } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                      result = window.prompt("Input: ");
                      if (result !== null) {
                          result += "\n"
                      }
                  } else if (typeof readline == "function") {
                      result = readline();
                      if (result !== null) {
                          result += "\n"
                      }
                  }
                  if (!result) {
                      return null
                  }
                  FS_stdin_getChar_buffer = intArrayFromString(result, true)
              }
              return FS_stdin_getChar_buffer.shift()
          };
          var TTY = {
              ttys: [],
              init() {},
              shutdown() {},
              register(dev, ops) {
                  TTY.ttys[dev] = {
                      input: [],
                      output: [],
                      ops: ops
                  };
                  FS.registerDevice(dev, TTY.stream_ops)
              },
              stream_ops: {
                  open(stream) {
                      var tty = TTY.ttys[stream.node.rdev];
                      if (!tty) {
                          throw new FS.ErrnoError(43)
                      }
                      stream.tty = tty;
                      stream.seekable = false
                  },
                  close(stream) {
                      stream.tty.ops.fsync(stream.tty)
                  },
                  fsync(stream) {
                      stream.tty.ops.fsync(stream.tty)
                  },
                  read(stream, buffer, offset, length, pos) {
                      if (!stream.tty || !stream.tty.ops.get_char) {
                          throw new FS.ErrnoError(60)
                      }
                      var bytesRead = 0;
                      for (var i = 0; i < length; i++) {
                          var result;
                          try {
                              result = stream.tty.ops.get_char(stream.tty)
                          } catch (e) {
                              throw new FS.ErrnoError(29)
                          }
                          if (result === undefined && bytesRead === 0) {
                              throw new FS.ErrnoError(6)
                          }
                          if (result === null || result === undefined) break;
                          bytesRead++;
                          buffer[offset + i] = result
                      }
                      if (bytesRead) {
                          stream.node.timestamp = Date.now()
                      }
                      return bytesRead
                  },
                  write(stream, buffer, offset, length, pos) {
                      if (!stream.tty || !stream.tty.ops.put_char) {
                          throw new FS.ErrnoError(60)
                      }
                      try {
                          for (var i = 0; i < length; i++) {
                              stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                          }
                      } catch (e) {
                          throw new FS.ErrnoError(29)
                      }
                      if (length) {
                          stream.node.timestamp = Date.now()
                      }
                      return i
                  }
              },
              default_tty_ops: {
                  get_char(tty) {
                      return FS_stdin_getChar()
                  },
                  put_char(tty, val) {
                      if (val === null || val === 10) {
                          out(UTF8ArrayToString(tty.output, 0));
                          tty.output = []
                      } else {
                          if (val != 0) tty.output.push(val)
                      }
                  },
                  fsync(tty) {
                      if (tty.output && tty.output.length > 0) {
                          out(UTF8ArrayToString(tty.output, 0));
                          tty.output = []
                      }
                  },
                  ioctl_tcgets(tty) {
                      return {
                          c_iflag: 25856,
                          c_oflag: 5,
                          c_cflag: 191,
                          c_lflag: 35387,
                          c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                      }
                  },
                  ioctl_tcsets(tty, optional_actions, data) {
                      return 0
                  },
                  ioctl_tiocgwinsz(tty) {
                      return [24, 80]
                  }
              },
              default_tty1_ops: {
                  put_char(tty, val) {
                      if (val === null || val === 10) {
                          err(UTF8ArrayToString(tty.output, 0));
                          tty.output = []
                      } else {
                          if (val != 0) tty.output.push(val)
                      }
                  },
                  fsync(tty) {
                      if (tty.output && tty.output.length > 0) {
                          err(UTF8ArrayToString(tty.output, 0));
                          tty.output = []
                      }
                  }
              }
          };
          var alignMemory = (size, alignment) => {
              assert(alignment, "alignment argument is required");
              return Math.ceil(size / alignment) * alignment
          };
          var mmapAlloc = size => {
              size = alignMemory(size, 65536);
              var ptr = _emscripten_builtin_memalign(65536, size);
              if (!ptr) return 0;
              return zeroMemory(ptr, size)
          };
          var MEMFS = {
              ops_table: null,
              mount(mount) {
                  return MEMFS.createNode(null, "/", 16384 | 511, 0)
              },
              createNode(parent, name, mode, dev) {
                  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                      throw new FS.ErrnoError(63)
                  }
                  MEMFS.ops_table ||= {
                      dir: {
                          node: {
                              getattr: MEMFS.node_ops.getattr,
                              setattr: MEMFS.node_ops.setattr,
                              lookup: MEMFS.node_ops.lookup,
                              mknod: MEMFS.node_ops.mknod,
                              rename: MEMFS.node_ops.rename,
                              unlink: MEMFS.node_ops.unlink,
                              rmdir: MEMFS.node_ops.rmdir,
                              readdir: MEMFS.node_ops.readdir,
                              symlink: MEMFS.node_ops.symlink
                          },
                          stream: {
                              llseek: MEMFS.stream_ops.llseek
                          }
                      },
                      file: {
                          node: {
                              getattr: MEMFS.node_ops.getattr,
                              setattr: MEMFS.node_ops.setattr
                          },
                          stream: {
                              llseek: MEMFS.stream_ops.llseek,
                              read: MEMFS.stream_ops.read,
                              write: MEMFS.stream_ops.write,
                              allocate: MEMFS.stream_ops.allocate,
                              mmap: MEMFS.stream_ops.mmap,
                              msync: MEMFS.stream_ops.msync
                          }
                      },
                      link: {
                          node: {
                              getattr: MEMFS.node_ops.getattr,
                              setattr: MEMFS.node_ops.setattr,
                              readlink: MEMFS.node_ops.readlink
                          },
                          stream: {}
                      },
                      chrdev: {
                          node: {
                              getattr: MEMFS.node_ops.getattr,
                              setattr: MEMFS.node_ops.setattr
                          },
                          stream: FS.chrdev_stream_ops
                      }
                  };
                  var node = FS.createNode(parent, name, mode, dev);
                  if (FS.isDir(node.mode)) {
                      node.node_ops = MEMFS.ops_table.dir.node;
                      node.stream_ops = MEMFS.ops_table.dir.stream;
                      node.contents = {}
                  } else if (FS.isFile(node.mode)) {
                      node.node_ops = MEMFS.ops_table.file.node;
                      node.stream_ops = MEMFS.ops_table.file.stream;
                      node.usedBytes = 0;
                      node.contents = null
                  } else if (FS.isLink(node.mode)) {
                      node.node_ops = MEMFS.ops_table.link.node;
                      node.stream_ops = MEMFS.ops_table.link.stream
                  } else if (FS.isChrdev(node.mode)) {
                      node.node_ops = MEMFS.ops_table.chrdev.node;
                      node.stream_ops = MEMFS.ops_table.chrdev.stream
                  }
                  node.timestamp = Date.now();
                  if (parent) {
                      parent.contents[name] = node;
                      parent.timestamp = node.timestamp
                  }
                  return node
              },
              getFileDataAsTypedArray(node) {
                  if (!node.contents) return new Uint8Array(0);
                  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
                  return new Uint8Array(node.contents)
              },
              expandFileStorage(node, newCapacity) {
                  var prevCapacity = node.contents ? node.contents.length : 0;
                  if (prevCapacity >= newCapacity) return;
                  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                  newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
                  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                  var oldContents = node.contents;
                  node.contents = new Uint8Array(newCapacity);
                  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
              },
              resizeFileStorage(node, newSize) {
                  if (node.usedBytes == newSize) return;
                  if (newSize == 0) {
                      node.contents = null;
                      node.usedBytes = 0
                  } else {
                      var oldContents = node.contents;
                      node.contents = new Uint8Array(newSize);
                      if (oldContents) {
                          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                      }
                      node.usedBytes = newSize
                  }
              },
              node_ops: {
                  getattr(node) {
                      var attr = {};
                      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                      attr.ino = node.id;
                      attr.mode = node.mode;
                      attr.nlink = 1;
                      attr.uid = 0;
                      attr.gid = 0;
                      attr.rdev = node.rdev;
                      if (FS.isDir(node.mode)) {
                          attr.size = 4096
                      } else if (FS.isFile(node.mode)) {
                          attr.size = node.usedBytes
                      } else if (FS.isLink(node.mode)) {
                          attr.size = node.link.length
                      } else {
                          attr.size = 0
                      }
                      attr.atime = new Date(node.timestamp);
                      attr.mtime = new Date(node.timestamp);
                      attr.ctime = new Date(node.timestamp);
                      attr.blksize = 4096;
                      attr.blocks = Math.ceil(attr.size / attr.blksize);
                      return attr
                  },
                  setattr(node, attr) {
                      if (attr.mode !== undefined) {
                          node.mode = attr.mode
                      }
                      if (attr.timestamp !== undefined) {
                          node.timestamp = attr.timestamp
                      }
                      if (attr.size !== undefined) {
                          MEMFS.resizeFileStorage(node, attr.size)
                      }
                  },
                  lookup(parent, name) {
                      throw FS.genericErrors[44]
                  },
                  mknod(parent, name, mode, dev) {
                      return MEMFS.createNode(parent, name, mode, dev)
                  },
                  rename(old_node, new_dir, new_name) {
                      if (FS.isDir(old_node.mode)) {
                          var new_node;
                          try {
                              new_node = FS.lookupNode(new_dir, new_name)
                          } catch (e) {}
                          if (new_node) {
                              for (var i in new_node.contents) {
                                  throw new FS.ErrnoError(55)
                              }
                          }
                      }
                      delete old_node.parent.contents[old_node.name];
                      old_node.parent.timestamp = Date.now();
                      old_node.name = new_name;
                      new_dir.contents[new_name] = old_node;
                      new_dir.timestamp = old_node.parent.timestamp;
                      old_node.parent = new_dir
                  },
                  unlink(parent, name) {
                      delete parent.contents[name];
                      parent.timestamp = Date.now()
                  },
                  rmdir(parent, name) {
                      var node = FS.lookupNode(parent, name);
                      for (var i in node.contents) {
                          throw new FS.ErrnoError(55)
                      }
                      delete parent.contents[name];
                      parent.timestamp = Date.now()
                  },
                  readdir(node) {
                      var entries = [".", ".."];
                      for (var key of Object.keys(node.contents)) {
                          entries.push(key)
                      }
                      return entries
                  },
                  symlink(parent, newname, oldpath) {
                      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                      node.link = oldpath;
                      return node
                  },
                  readlink(node) {
                      if (!FS.isLink(node.mode)) {
                          throw new FS.ErrnoError(28)
                      }
                      return node.link
                  }
              },
              stream_ops: {
                  read(stream, buffer, offset, length, position) {
                      var contents = stream.node.contents;
                      if (position >= stream.node.usedBytes) return 0;
                      var size = Math.min(stream.node.usedBytes - position, length);
                      assert(size >= 0);
                      if (size > 8 && contents.subarray) {
                          buffer.set(contents.subarray(position, position + size), offset)
                      } else {
                          for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
                      }
                      return size
                  },
                  write(stream, buffer, offset, length, position, canOwn) {
                      assert(!(buffer instanceof ArrayBuffer));
                      if (!length) return 0;
                      var node = stream.node;
                      node.timestamp = Date.now();
                      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                          if (canOwn) {
                              assert(position === 0, "canOwn must imply no weird position inside the file");
                              node.contents = buffer.subarray(offset, offset + length);
                              node.usedBytes = length;
                              return length
                          } else if (node.usedBytes === 0 && position === 0) {
                              node.contents = buffer.slice(offset, offset + length);
                              node.usedBytes = length;
                              return length
                          } else if (position + length <= node.usedBytes) {
                              node.contents.set(buffer.subarray(offset, offset + length), position);
                              return length
                          }
                      }
                      MEMFS.expandFileStorage(node, position + length);
                      if (node.contents.subarray && buffer.subarray) {
                          node.contents.set(buffer.subarray(offset, offset + length), position)
                      } else {
                          for (var i = 0; i < length; i++) {
                              node.contents[position + i] = buffer[offset + i]
                          }
                      }
                      node.usedBytes = Math.max(node.usedBytes, position + length);
                      return length
                  },
                  llseek(stream, offset, whence) {
                      var position = offset;
                      if (whence === 1) {
                          position += stream.position
                      } else if (whence === 2) {
                          if (FS.isFile(stream.node.mode)) {
                              position += stream.node.usedBytes
                          }
                      }
                      if (position < 0) {
                          throw new FS.ErrnoError(28)
                      }
                      return position
                  },
                  allocate(stream, offset, length) {
                      MEMFS.expandFileStorage(stream.node, offset + length);
                      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
                  },
                  mmap(stream, length, position, prot, flags) {
                      if (!FS.isFile(stream.node.mode)) {
                          throw new FS.ErrnoError(43)
                      }
                      var ptr;
                      var allocated;
                      var contents = stream.node.contents;
                      if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
                          allocated = false;
                          ptr = contents.byteOffset
                      } else {
                          if (position > 0 || position + length < contents.length) {
                              if (contents.subarray) {
                                  contents = contents.subarray(position, position + length)
                              } else {
                                  contents = Array.prototype.slice.call(contents, position, position + length)
                              }
                          }
                          allocated = true;
                          ptr = mmapAlloc(length);
                          if (!ptr) {
                              throw new FS.ErrnoError(48)
                          }
                          HEAP8.set(contents, ptr)
                      }
                      return {
                          ptr: ptr,
                          allocated: allocated
                      }
                  },
                  msync(stream, buffer, offset, length, mmapFlags) {
                      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                      return 0
                  }
              }
          };
          var asyncLoad = (url, onload, onerror, noRunDep) => {
              var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
              readAsync(url, arrayBuffer => {
                  assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
                  onload(new Uint8Array(arrayBuffer));
                  if (dep) removeRunDependency(dep)
              }, event => {
                  if (onerror) {
                      onerror()
                  } else {
                      throw `Loading data file "${url}" failed.`
                  }
              });
              if (dep) addRunDependency(dep)
          };
          var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
              FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn)
          };
          var preloadPlugins = Module["preloadPlugins"] || [];
          var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
              if (typeof Browser != "undefined") Browser.init();
              var handled = false;
              preloadPlugins.forEach(plugin => {
                  if (handled) return;
                  if (plugin["canHandle"](fullname)) {
                      plugin["handle"](byteArray, fullname, finish, onerror);
                      handled = true
                  }
              });
              return handled
          };
          var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
              var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
              var dep = getUniqueRunDependency(`cp ${fullname}`);

              function processData(byteArray) {
                  function finish(byteArray) {
                      preFinish?.();
                      if (!dontCreateFile) {
                          FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                      }
                      onload?.();
                      removeRunDependency(dep)
                  }
                  if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
                          onerror?.();
                          removeRunDependency(dep)
                      })) {
                      return
                  }
                  finish(byteArray)
              }
              addRunDependency(dep);
              if (typeof url == "string") {
                  asyncLoad(url, processData, onerror)
              } else {
                  processData(url)
              }
          };
          var FS_modeStringToFlags = str => {
              var flagModes = {
                  "r": 0,
                  "r+": 2,
                  "w": 512 | 64 | 1,
                  "w+": 512 | 64 | 2,
                  "a": 1024 | 64 | 1,
                  "a+": 1024 | 64 | 2
              };
              var flags = flagModes[str];
              if (typeof flags == "undefined") {
                  throw new Error(`Unknown file open mode: ${str}`)
              }
              return flags
          };
          var FS_getMode = (canRead, canWrite) => {
              var mode = 0;
              if (canRead) mode |= 292 | 73;
              if (canWrite) mode |= 146;
              return mode
          };
          var ERRNO_MESSAGES = {
              0: "Success",
              1: "Arg list too long",
              2: "Permission denied",
              3: "Address already in use",
              4: "Address not available",
              5: "Address family not supported by protocol family",
              6: "No more processes",
              7: "Socket already connected",
              8: "Bad file number",
              9: "Trying to read unreadable message",
              10: "Mount device busy",
              11: "Operation canceled",
              12: "No children",
              13: "Connection aborted",
              14: "Connection refused",
              15: "Connection reset by peer",
              16: "File locking deadlock error",
              17: "Destination address required",
              18: "Math arg out of domain of func",
              19: "Quota exceeded",
              20: "File exists",
              21: "Bad address",
              22: "File too large",
              23: "Host is unreachable",
              24: "Identifier removed",
              25: "Illegal byte sequence",
              26: "Connection already in progress",
              27: "Interrupted system call",
              28: "Invalid argument",
              29: "I/O error",
              30: "Socket is already connected",
              31: "Is a directory",
              32: "Too many symbolic links",
              33: "Too many open files",
              34: "Too many links",
              35: "Message too long",
              36: "Multihop attempted",
              37: "File or path name too long",
              38: "Network interface is not configured",
              39: "Connection reset by network",
              40: "Network is unreachable",
              41: "Too many open files in system",
              42: "No buffer space available",
              43: "No such device",
              44: "No such file or directory",
              45: "Exec format error",
              46: "No record locks available",
              47: "The link has been severed",
              48: "Not enough core",
              49: "No message of desired type",
              50: "Protocol not available",
              51: "No space left on device",
              52: "Function not implemented",
              53: "Socket is not connected",
              54: "Not a directory",
              55: "Directory not empty",
              56: "State not recoverable",
              57: "Socket operation on non-socket",
              59: "Not a typewriter",
              60: "No such device or address",
              61: "Value too large for defined data type",
              62: "Previous owner died",
              63: "Not super-user",
              64: "Broken pipe",
              65: "Protocol error",
              66: "Unknown protocol",
              67: "Protocol wrong type for socket",
              68: "Math result not representable",
              69: "Read only file system",
              70: "Illegal seek",
              71: "No such process",
              72: "Stale file handle",
              73: "Connection timed out",
              74: "Text file busy",
              75: "Cross-device link",
              100: "Device not a stream",
              101: "Bad font file fmt",
              102: "Invalid slot",
              103: "Invalid request code",
              104: "No anode",
              105: "Block device required",
              106: "Channel number out of range",
              107: "Level 3 halted",
              108: "Level 3 reset",
              109: "Link number out of range",
              110: "Protocol driver not attached",
              111: "No CSI structure available",
              112: "Level 2 halted",
              113: "Invalid exchange",
              114: "Invalid request descriptor",
              115: "Exchange full",
              116: "No data (for no delay io)",
              117: "Timer expired",
              118: "Out of streams resources",
              119: "Machine is not on the network",
              120: "Package not installed",
              121: "The object is remote",
              122: "Advertise error",
              123: "Srmount error",
              124: "Communication error on send",
              125: "Cross mount point (not really error)",
              126: "Given log. name not unique",
              127: "f.d. invalid for this operation",
              128: "Remote address changed",
              129: "Can   access a needed shared lib",
              130: "Accessing a corrupted shared lib",
              131: ".lib section in a.out corrupted",
              132: "Attempting to link in too many libs",
              133: "Attempting to exec a shared library",
              135: "Streams pipe error",
              136: "Too many users",
              137: "Socket type not supported",
              138: "Not supported",
              139: "Protocol family not supported",
              140: "Can't send after socket shutdown",
              141: "Too many references",
              142: "Host is down",
              148: "No medium (in tape drive)",
              156: "Level 2 not synchronized"
          };
          var ERRNO_CODES = {
              "EPERM": 63,
              "ENOENT": 44,
              "ESRCH": 71,
              "EINTR": 27,
              "EIO": 29,
              "ENXIO": 60,
              "E2BIG": 1,
              "ENOEXEC": 45,
              "EBADF": 8,
              "ECHILD": 12,
              "EAGAIN": 6,
              "EWOULDBLOCK": 6,
              "ENOMEM": 48,
              "EACCES": 2,
              "EFAULT": 21,
              "ENOTBLK": 105,
              "EBUSY": 10,
              "EEXIST": 20,
              "EXDEV": 75,
              "ENODEV": 43,
              "ENOTDIR": 54,
              "EISDIR": 31,
              "EINVAL": 28,
              "ENFILE": 41,
              "EMFILE": 33,
              "ENOTTY": 59,
              "ETXTBSY": 74,
              "EFBIG": 22,
              "ENOSPC": 51,
              "ESPIPE": 70,
              "EROFS": 69,
              "EMLINK": 34,
              "EPIPE": 64,
              "EDOM": 18,
              "ERANGE": 68,
              "ENOMSG": 49,
              "EIDRM": 24,
              "ECHRNG": 106,
              "EL2NSYNC": 156,
              "EL3HLT": 107,
              "EL3RST": 108,
              "ELNRNG": 109,
              "EUNATCH": 110,
              "ENOCSI": 111,
              "EL2HLT": 112,
              "EDEADLK": 16,
              "ENOLCK": 46,
              "EBADE": 113,
              "EBADR": 114,
              "EXFULL": 115,
              "ENOANO": 104,
              "EBADRQC": 103,
              "EBADSLT": 102,
              "EDEADLOCK": 16,
              "EBFONT": 101,
              "ENOSTR": 100,
              "ENODATA": 116,
              "ETIME": 117,
              "ENOSR": 118,
              "ENONET": 119,
              "ENOPKG": 120,
              "EREMOTE": 121,
              "ENOLINK": 47,
              "EADV": 122,
              "ESRMNT": 123,
              "ECOMM": 124,
              "EPROTO": 65,
              "EMULTIHOP": 36,
              "EDOTDOT": 125,
              "EBADMSG": 9,
              "ENOTUNIQ": 126,
              "EBADFD": 127,
              "EREMCHG": 128,
              "ELIBACC": 129,
              "ELIBBAD": 130,
              "ELIBSCN": 131,
              "ELIBMAX": 132,
              "ELIBEXEC": 133,
              "ENOSYS": 52,
              "ENOTEMPTY": 55,
              "ENAMETOOLONG": 37,
              "ELOOP": 32,
              "EOPNOTSUPP": 138,
              "EPFNOSUPPORT": 139,
              "ECONNRESET": 15,
              "ENOBUFS": 42,
              "EAFNOSUPPORT": 5,
              "EPROTOTYPE": 67,
              "ENOTSOCK": 57,
              "ENOPROTOOPT": 50,
              "ESHUTDOWN": 140,
              "ECONNREFUSED": 14,
              "EADDRINUSE": 3,
              "ECONNABORTED": 13,
              "ENETUNREACH": 40,
              "ENETDOWN": 38,
              "ETIMEDOUT": 73,
              "EHOSTDOWN": 142,
              "EHOSTUNREACH": 23,
              "EINPROGRESS": 26,
              "EALREADY": 7,
              "EDESTADDRREQ": 17,
              "EMSGSIZE": 35,
              "EPROTONOSUPPORT": 66,
              "ESOCKTNOSUPPORT": 137,
              "EADDRNOTAVAIL": 4,
              "ENETRESET": 39,
              "EISCONN": 30,
              "ENOTCONN": 53,
              "ETOOMANYREFS": 141,
              "EUSERS": 136,
              "EDQUOT": 19,
              "ESTALE": 72,
              "ENOTSUP": 138,
              "ENOMEDIUM": 148,
              "EILSEQ": 25,
              "EOVERFLOW": 61,
              "ECANCELED": 11,
              "ENOTRECOVERABLE": 56,
              "EOWNERDEAD": 62,
              "ESTRPIPE": 135
          };
          var FS = {
              root: null,
              mounts: [],
              devices: {},
              streams: [],
              nextInode: 1,
              nameTable: null,
              currentPath: "/",
              initialized: false,
              ignorePermissions: true,
              ErrnoError: class extends Error {
                  constructor(errno) {
                      super(ERRNO_MESSAGES[errno]);
                      this.name = "ErrnoError";
                      this.errno = errno;
                      for (var key in ERRNO_CODES) {
                          if (ERRNO_CODES[key] === errno) {
                              this.code = key;
                              break
                          }
                      }
                  }
              },
              genericErrors: {},
              filesystems: null,
              syncFSRequests: 0,
              FSStream: class {
                  constructor() {
                      this.shared = {}
                  }
                  get object() {
                      return this.node
                  }
                  set object(val) {
                      this.node = val
                  }
                  get isRead() {
                      return (this.flags & 2097155) !== 1
                  }
                  get isWrite() {
                      return (this.flags & 2097155) !== 0
                  }
                  get isAppend() {
                      return this.flags & 1024
                  }
                  get flags() {
                      return this.shared.flags
                  }
                  set flags(val) {
                      this.shared.flags = val
                  }
                  get position() {
                      return this.shared.position
                  }
                  set position(val) {
                      this.shared.position = val
                  }
              },
              FSNode: class {
                  constructor(parent, name, mode, rdev) {
                      if (!parent) {
                          parent = this
                      }
                      this.parent = parent;
                      this.mount = parent.mount;
                      this.mounted = null;
                      this.id = FS.nextInode++;
                      this.name = name;
                      this.mode = mode;
                      this.node_ops = {};
                      this.stream_ops = {};
                      this.rdev = rdev;
                      this.readMode = 292 | 73;
                      this.writeMode = 146
                  }
                  get read() {
                      return (this.mode & this.readMode) === this.readMode
                  }
                  set read(val) {
                      val ? this.mode |= this.readMode : this.mode &= ~this.readMode
                  }
                  get write() {
                      return (this.mode & this.writeMode) === this.writeMode
                  }
                  set write(val) {
                      val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
                  }
                  get isFolder() {
                      return FS.isDir(this.mode)
                  }
                  get isDevice() {
                      return FS.isChrdev(this.mode)
                  }
              },
              lookupPath(path, opts = {}) {
                  path = PATH_FS.resolve(path);
                  if (!path) return {
                      path: "",
                      node: null
                  };
                  var defaults = {
                      follow_mount: true,
                      recurse_count: 0
                  };
                  opts = Object.assign(defaults, opts);
                  if (opts.recurse_count > 8) {
                      throw new FS.ErrnoError(32)
                  }
                  var parts = path.split("/").filter(p => !!p);
                  var current = FS.root;
                  var current_path = "/";
                  for (var i = 0; i < parts.length; i++) {
                      var islast = i === parts.length - 1;
                      if (islast && opts.parent) {
                          break
                      }
                      current = FS.lookupNode(current, parts[i]);
                      current_path = PATH.join2(current_path, parts[i]);
                      if (FS.isMountpoint(current)) {
                          if (!islast || islast && opts.follow_mount) {
                              current = current.mounted.root
                          }
                      }
                      if (!islast || opts.follow) {
                          var count = 0;
                          while (FS.isLink(current.mode)) {
                              var link = FS.readlink(current_path);
                              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                              var lookup = FS.lookupPath(current_path, {
                                  recurse_count: opts.recurse_count + 1
                              });
                              current = lookup.node;
                              if (count++ > 40) {
                                  throw new FS.ErrnoError(32)
                              }
                          }
                      }
                  }
                  return {
                      path: current_path,
                      node: current
                  }
              },
              getPath(node) {
                  var path;
                  while (true) {
                      if (FS.isRoot(node)) {
                          var mount = node.mount.mountpoint;
                          if (!path) return mount;
                          return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path
                      }
                      path = path ? `${node.name}/${path}` : node.name;
                      node = node.parent
                  }
              },
              hashName(parentid, name) {
                  var hash = 0;
                  for (var i = 0; i < name.length; i++) {
                      hash = (hash << 5) - hash + name.charCodeAt(i) | 0
                  }
                  return (parentid + hash >>> 0) % FS.nameTable.length
              },
              hashAddNode(node) {
                  var hash = FS.hashName(node.parent.id, node.name);
                  node.name_next = FS.nameTable[hash];
                  FS.nameTable[hash] = node
              },
              hashRemoveNode(node) {
                  var hash = FS.hashName(node.parent.id, node.name);
                  if (FS.nameTable[hash] === node) {
                      FS.nameTable[hash] = node.name_next
                  } else {
                      var current = FS.nameTable[hash];
                      while (current) {
                          if (current.name_next === node) {
                              current.name_next = node.name_next;
                              break
                          }
                          current = current.name_next
                      }
                  }
              },
              lookupNode(parent, name) {
                  var errCode = FS.mayLookup(parent);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  var hash = FS.hashName(parent.id, name);
                  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                      var nodeName = node.name;
                      if (node.parent.id === parent.id && nodeName === name) {
                          return node
                      }
                  }
                  return FS.lookup(parent, name)
              },
              createNode(parent, name, mode, rdev) {
                  assert(typeof parent == "object");
                  var node = new FS.FSNode(parent, name, mode, rdev);
                  FS.hashAddNode(node);
                  return node
              },
              destroyNode(node) {
                  FS.hashRemoveNode(node)
              },
              isRoot(node) {
                  return node === node.parent
              },
              isMountpoint(node) {
                  return !!node.mounted
              },
              isFile(mode) {
                  return (mode & 61440) === 32768
              },
              isDir(mode) {
                  return (mode & 61440) === 16384
              },
              isLink(mode) {
                  return (mode & 61440) === 40960
              },
              isChrdev(mode) {
                  return (mode & 61440) === 8192
              },
              isBlkdev(mode) {
                  return (mode & 61440) === 24576
              },
              isFIFO(mode) {
                  return (mode & 61440) === 4096
              },
              isSocket(mode) {
                  return (mode & 49152) === 49152
              },
              flagsToPermissionString(flag) {
                  var perms = ["r", "w", "rw"][flag & 3];
                  if (flag & 512) {
                      perms += "w"
                  }
                  return perms
              },
              nodePermissions(node, perms) {
                  if (FS.ignorePermissions) {
                      return 0
                  }
                  if (perms.includes("r") && !(node.mode & 292)) {
                      return 2
                  } else if (perms.includes("w") && !(node.mode & 146)) {
                      return 2
                  } else if (perms.includes("x") && !(node.mode & 73)) {
                      return 2
                  }
                  return 0
              },
              mayLookup(dir) {
                  if (!FS.isDir(dir.mode)) return 54;
                  var errCode = FS.nodePermissions(dir, "x");
                  if (errCode) return errCode;
                  if (!dir.node_ops.lookup) return 2;
                  return 0
              },
              mayCreate(dir, name) {
                  try {
                      var node = FS.lookupNode(dir, name);
                      return 20
                  } catch (e) {}
                  return FS.nodePermissions(dir, "wx")
              },
              mayDelete(dir, name, isdir) {
                  var node;
                  try {
                      node = FS.lookupNode(dir, name)
                  } catch (e) {
                      return e.errno
                  }
                  var errCode = FS.nodePermissions(dir, "wx");
                  if (errCode) {
                      return errCode
                  }
                  if (isdir) {
                      if (!FS.isDir(node.mode)) {
                          return 54
                      }
                      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                          return 10
                      }
                  } else {
                      if (FS.isDir(node.mode)) {
                          return 31
                      }
                  }
                  return 0
              },
              mayOpen(node, flags) {
                  if (!node) {
                      return 44
                  }
                  if (FS.isLink(node.mode)) {
                      return 32
                  } else if (FS.isDir(node.mode)) {
                      if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                          return 31
                      }
                  }
                  return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
              },
              MAX_OPEN_FDS: 4096,
              nextfd() {
                  for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
                      if (!FS.streams[fd]) {
                          return fd
                      }
                  }
                  throw new FS.ErrnoError(33)
              },
              getStreamChecked(fd) {
                  var stream = FS.getStream(fd);
                  if (!stream) {
                      throw new FS.ErrnoError(8)
                  }
                  return stream
              },
              getStream: fd => FS.streams[fd],
              createStream(stream, fd = -1) {
                  stream = Object.assign(new FS.FSStream, stream);
                  if (fd == -1) {
                      fd = FS.nextfd()
                  }
                  stream.fd = fd;
                  FS.streams[fd] = stream;
                  return stream
              },
              closeStream(fd) {
                  FS.streams[fd] = null
              },
              dupStream(origStream, fd = -1) {
                  var stream = FS.createStream(origStream, fd);
                  stream.stream_ops?.dup?.(stream);
                  return stream
              },
              chrdev_stream_ops: {
                  open(stream) {
                      var device = FS.getDevice(stream.node.rdev);
                      stream.stream_ops = device.stream_ops;
                      stream.stream_ops.open?.(stream)
                  },
                  llseek() {
                      throw new FS.ErrnoError(70)
                  }
              },
              major: dev => dev >> 8,
              minor: dev => dev & 255,
              makedev: (ma, mi) => ma << 8 | mi,
              registerDevice(dev, ops) {
                  FS.devices[dev] = {
                      stream_ops: ops
                  }
              },
              getDevice: dev => FS.devices[dev],
              getMounts(mount) {
                  var mounts = [];
                  var check = [mount];
                  while (check.length) {
                      var m = check.pop();
                      mounts.push(m);
                      check.push(...m.mounts)
                  }
                  return mounts
              },
              syncfs(populate, callback) {
                  if (typeof populate == "function") {
                      callback = populate;
                      populate = false
                  }
                  FS.syncFSRequests++;
                  if (FS.syncFSRequests > 1) {
                      err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)
                  }
                  var mounts = FS.getMounts(FS.root.mount);
                  var completed = 0;

                  function doCallback(errCode) {
                      assert(FS.syncFSRequests > 0);
                      FS.syncFSRequests--;
                      return callback(errCode)
                  }

                  function done(errCode) {
                      if (errCode) {
                          if (!done.errored) {
                              done.errored = true;
                              return doCallback(errCode)
                          }
                          return
                      }
                      if (++completed >= mounts.length) {
                          doCallback(null)
                      }
                  }
                  mounts.forEach(mount => {
                      if (!mount.type.syncfs) {
                          return done(null)
                      }
                      mount.type.syncfs(mount, populate, done)
                  })
              },
              mount(type, opts, mountpoint) {
                  if (typeof type == "string") {
                      throw type
                  }
                  var root = mountpoint === "/";
                  var pseudo = !mountpoint;
                  var node;
                  if (root && FS.root) {
                      throw new FS.ErrnoError(10)
                  } else if (!root && !pseudo) {
                      var lookup = FS.lookupPath(mountpoint, {
                          follow_mount: false
                      });
                      mountpoint = lookup.path;
                      node = lookup.node;
                      if (FS.isMountpoint(node)) {
                          throw new FS.ErrnoError(10)
                      }
                      if (!FS.isDir(node.mode)) {
                          throw new FS.ErrnoError(54)
                      }
                  }
                  var mount = {
                      type: type,
                      opts: opts,
                      mountpoint: mountpoint,
                      mounts: []
                  };
                  var mountRoot = type.mount(mount);
                  mountRoot.mount = mount;
                  mount.root = mountRoot;
                  if (root) {
                      FS.root = mountRoot
                  } else if (node) {
                      node.mounted = mount;
                      if (node.mount) {
                          node.mount.mounts.push(mount)
                      }
                  }
                  return mountRoot
              },
              unmount(mountpoint) {
                  var lookup = FS.lookupPath(mountpoint, {
                      follow_mount: false
                  });
                  if (!FS.isMountpoint(lookup.node)) {
                      throw new FS.ErrnoError(28)
                  }
                  var node = lookup.node;
                  var mount = node.mounted;
                  var mounts = FS.getMounts(mount);
                  Object.keys(FS.nameTable).forEach(hash => {
                      var current = FS.nameTable[hash];
                      while (current) {
                          var next = current.name_next;
                          if (mounts.includes(current.mount)) {
                              FS.destroyNode(current)
                          }
                          current = next
                      }
                  });
                  node.mounted = null;
                  var idx = node.mount.mounts.indexOf(mount);
                  assert(idx !== -1);
                  node.mount.mounts.splice(idx, 1)
              },
              lookup(parent, name) {
                  return parent.node_ops.lookup(parent, name)
              },
              mknod(path, mode, dev) {
                  var lookup = FS.lookupPath(path, {
                      parent: true
                  });
                  var parent = lookup.node;
                  var name = PATH.basename(path);
                  if (!name || name === "." || name === "..") {
                      throw new FS.ErrnoError(28)
                  }
                  var errCode = FS.mayCreate(parent, name);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  if (!parent.node_ops.mknod) {
                      throw new FS.ErrnoError(63)
                  }
                  return parent.node_ops.mknod(parent, name, mode, dev)
              },
              create(path, mode) {
                  mode = mode !== undefined ? mode : 438;
                  mode &= 4095;
                  mode |= 32768;
                  return FS.mknod(path, mode, 0)
              },
              mkdir(path, mode) {
                  mode = mode !== undefined ? mode : 511;
                  mode &= 511 | 512;
                  mode |= 16384;
                  return FS.mknod(path, mode, 0)
              },
              mkdirTree(path, mode) {
                  var dirs = path.split("/");
                  var d = "";
                  for (var i = 0; i < dirs.length; ++i) {
                      if (!dirs[i]) continue;
                      d += "/" + dirs[i];
                      try {
                          FS.mkdir(d, mode)
                      } catch (e) {
                          if (e.errno != 20) throw e
                      }
                  }
              },
              mkdev(path, mode, dev) {
                  if (typeof dev == "undefined") {
                      dev = mode;
                      mode = 438
                  }
                  mode |= 8192;
                  return FS.mknod(path, mode, dev)
              },
              symlink(oldpath, newpath) {
                  if (!PATH_FS.resolve(oldpath)) {
                      throw new FS.ErrnoError(44)
                  }
                  var lookup = FS.lookupPath(newpath, {
                      parent: true
                  });
                  var parent = lookup.node;
                  if (!parent) {
                      throw new FS.ErrnoError(44)
                  }
                  var newname = PATH.basename(newpath);
                  var errCode = FS.mayCreate(parent, newname);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  if (!parent.node_ops.symlink) {
                      throw new FS.ErrnoError(63)
                  }
                  return parent.node_ops.symlink(parent, newname, oldpath)
              },
              rename(old_path, new_path) {
                  var old_dirname = PATH.dirname(old_path);
                  var new_dirname = PATH.dirname(new_path);
                  var old_name = PATH.basename(old_path);
                  var new_name = PATH.basename(new_path);
                  var lookup, old_dir, new_dir;
                  lookup = FS.lookupPath(old_path, {
                      parent: true
                  });
                  old_dir = lookup.node;
                  lookup = FS.lookupPath(new_path, {
                      parent: true
                  });
                  new_dir = lookup.node;
                  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                  if (old_dir.mount !== new_dir.mount) {
                      throw new FS.ErrnoError(75)
                  }
                  var old_node = FS.lookupNode(old_dir, old_name);
                  var relative = PATH_FS.relative(old_path, new_dirname);
                  if (relative.charAt(0) !== ".") {
                      throw new FS.ErrnoError(28)
                  }
                  relative = PATH_FS.relative(new_path, old_dirname);
                  if (relative.charAt(0) !== ".") {
                      throw new FS.ErrnoError(55)
                  }
                  var new_node;
                  try {
                      new_node = FS.lookupNode(new_dir, new_name)
                  } catch (e) {}
                  if (old_node === new_node) {
                      return
                  }
                  var isdir = FS.isDir(old_node.mode);
                  var errCode = FS.mayDelete(old_dir, old_name, isdir);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  if (!old_dir.node_ops.rename) {
                      throw new FS.ErrnoError(63)
                  }
                  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                      throw new FS.ErrnoError(10)
                  }
                  if (new_dir !== old_dir) {
                      errCode = FS.nodePermissions(old_dir, "w");
                      if (errCode) {
                          throw new FS.ErrnoError(errCode)
                      }
                  }
                  FS.hashRemoveNode(old_node);
                  try {
                      old_dir.node_ops.rename(old_node, new_dir, new_name)
                  } catch (e) {
                      throw e
                  } finally {
                      FS.hashAddNode(old_node)
                  }
              },
              rmdir(path) {
                  var lookup = FS.lookupPath(path, {
                      parent: true
                  });
                  var parent = lookup.node;
                  var name = PATH.basename(path);
                  var node = FS.lookupNode(parent, name);
                  var errCode = FS.mayDelete(parent, name, true);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  if (!parent.node_ops.rmdir) {
                      throw new FS.ErrnoError(63)
                  }
                  if (FS.isMountpoint(node)) {
                      throw new FS.ErrnoError(10)
                  }
                  parent.node_ops.rmdir(parent, name);
                  FS.destroyNode(node)
              },
              readdir(path) {
                  var lookup = FS.lookupPath(path, {
                      follow: true
                  });
                  var node = lookup.node;
                  if (!node.node_ops.readdir) {
                      throw new FS.ErrnoError(54)
                  }
                  return node.node_ops.readdir(node)
              },
              unlink(path) {
                  var lookup = FS.lookupPath(path, {
                      parent: true
                  });
                  var parent = lookup.node;
                  if (!parent) {
                      throw new FS.ErrnoError(44)
                  }
                  var name = PATH.basename(path);
                  var node = FS.lookupNode(parent, name);
                  var errCode = FS.mayDelete(parent, name, false);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  if (!parent.node_ops.unlink) {
                      throw new FS.ErrnoError(63)
                  }
                  if (FS.isMountpoint(node)) {
                      throw new FS.ErrnoError(10)
                  }
                  parent.node_ops.unlink(parent, name);
                  FS.destroyNode(node)
              },
              readlink(path) {
                  var lookup = FS.lookupPath(path);
                  var link = lookup.node;
                  if (!link) {
                      throw new FS.ErrnoError(44)
                  }
                  if (!link.node_ops.readlink) {
                      throw new FS.ErrnoError(28)
                  }
                  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
              },
              stat(path, dontFollow) {
                  var lookup = FS.lookupPath(path, {
                      follow: !dontFollow
                  });
                  var node = lookup.node;
                  if (!node) {
                      throw new FS.ErrnoError(44)
                  }
                  if (!node.node_ops.getattr) {
                      throw new FS.ErrnoError(63)
                  }
                  return node.node_ops.getattr(node)
              },
              lstat(path) {
                  return FS.stat(path, true)
              },
              chmod(path, mode, dontFollow) {
                  var node;
                  if (typeof path == "string") {
                      var lookup = FS.lookupPath(path, {
                          follow: !dontFollow
                      });
                      node = lookup.node
                  } else {
                      node = path
                  }
                  if (!node.node_ops.setattr) {
                      throw new FS.ErrnoError(63)
                  }
                  node.node_ops.setattr(node, {
                      mode: mode & 4095 | node.mode & ~4095,
                      timestamp: Date.now()
                  })
              },
              lchmod(path, mode) {
                  FS.chmod(path, mode, true)
              },
              fchmod(fd, mode) {
                  var stream = FS.getStreamChecked(fd);
                  FS.chmod(stream.node, mode)
              },
              chown(path, uid, gid, dontFollow) {
                  var node;
                  if (typeof path == "string") {
                      var lookup = FS.lookupPath(path, {
                          follow: !dontFollow
                      });
                      node = lookup.node
                  } else {
                      node = path
                  }
                  if (!node.node_ops.setattr) {
                      throw new FS.ErrnoError(63)
                  }
                  node.node_ops.setattr(node, {
                      timestamp: Date.now()
                  })
              },
              lchown(path, uid, gid) {
                  FS.chown(path, uid, gid, true)
              },
              fchown(fd, uid, gid) {
                  var stream = FS.getStreamChecked(fd);
                  FS.chown(stream.node, uid, gid)
              },
              truncate(path, len) {
                  if (len < 0) {
                      throw new FS.ErrnoError(28)
                  }
                  var node;
                  if (typeof path == "string") {
                      var lookup = FS.lookupPath(path, {
                          follow: true
                      });
                      node = lookup.node
                  } else {
                      node = path
                  }
                  if (!node.node_ops.setattr) {
                      throw new FS.ErrnoError(63)
                  }
                  if (FS.isDir(node.mode)) {
                      throw new FS.ErrnoError(31)
                  }
                  if (!FS.isFile(node.mode)) {
                      throw new FS.ErrnoError(28)
                  }
                  var errCode = FS.nodePermissions(node, "w");
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  node.node_ops.setattr(node, {
                      size: len,
                      timestamp: Date.now()
                  })
              },
              ftruncate(fd, len) {
                  var stream = FS.getStreamChecked(fd);
                  if ((stream.flags & 2097155) === 0) {
                      throw new FS.ErrnoError(28)
                  }
                  FS.truncate(stream.node, len)
              },
              utime(path, atime, mtime) {
                  var lookup = FS.lookupPath(path, {
                      follow: true
                  });
                  var node = lookup.node;
                  node.node_ops.setattr(node, {
                      timestamp: Math.max(atime, mtime)
                  })
              },
              open(path, flags, mode) {
                  if (path === "") {
                      throw new FS.ErrnoError(44)
                  }
                  flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
                  mode = typeof mode == "undefined" ? 438 : mode;
                  if (flags & 64) {
                      mode = mode & 4095 | 32768
                  } else {
                      mode = 0
                  }
                  var node;
                  if (typeof path == "object") {
                      node = path
                  } else {
                      path = PATH.normalize(path);
                      try {
                          var lookup = FS.lookupPath(path, {
                              follow: !(flags & 131072)
                          });
                          node = lookup.node
                      } catch (e) {}
                  }
                  var created = false;
                  if (flags & 64) {
                      if (node) {
                          if (flags & 128) {
                              throw new FS.ErrnoError(20)
                          }
                      } else {
                          node = FS.mknod(path, mode, 0);
                          created = true
                      }
                  }
                  if (!node) {
                      throw new FS.ErrnoError(44)
                  }
                  if (FS.isChrdev(node.mode)) {
                      flags &= ~512
                  }
                  if (flags & 65536 && !FS.isDir(node.mode)) {
                      throw new FS.ErrnoError(54)
                  }
                  if (!created) {
                      var errCode = FS.mayOpen(node, flags);
                      if (errCode) {
                          throw new FS.ErrnoError(errCode)
                      }
                  }
                  if (flags & 512 && !created) {
                      FS.truncate(node, 0)
                  }
                  flags &= ~(128 | 512 | 131072);
                  var stream = FS.createStream({
                      node: node,
                      path: FS.getPath(node),
                      flags: flags,
                      seekable: true,
                      position: 0,
                      stream_ops: node.stream_ops,
                      ungotten: [],
                      error: false
                  });
                  if (stream.stream_ops.open) {
                      stream.stream_ops.open(stream)
                  }
                  if (Module["logReadFiles"] && !(flags & 1)) {
                      if (!FS.readFiles) FS.readFiles = {};
                      if (!(path in FS.readFiles)) {
                          FS.readFiles[path] = 1
                      }
                  }
                  return stream
              },
              close(stream) {
                  if (FS.isClosed(stream)) {
                      throw new FS.ErrnoError(8)
                  }
                  if (stream.getdents) stream.getdents = null;
                  try {
                      if (stream.stream_ops.close) {
                          stream.stream_ops.close(stream)
                      }
                  } catch (e) {
                      throw e
                  } finally {
                      FS.closeStream(stream.fd)
                  }
                  stream.fd = null
              },
              isClosed(stream) {
                  return stream.fd === null
              },
              llseek(stream, offset, whence) {
                  if (FS.isClosed(stream)) {
                      throw new FS.ErrnoError(8)
                  }
                  if (!stream.seekable || !stream.stream_ops.llseek) {
                      throw new FS.ErrnoError(70)
                  }
                  if (whence != 0 && whence != 1 && whence != 2) {
                      throw new FS.ErrnoError(28)
                  }
                  stream.position = stream.stream_ops.llseek(stream, offset, whence);
                  stream.ungotten = [];
                  return stream.position
              },
              read(stream, buffer, offset, length, position) {
                  assert(offset >= 0);
                  if (length < 0 || position < 0) {
                      throw new FS.ErrnoError(28)
                  }
                  if (FS.isClosed(stream)) {
                      throw new FS.ErrnoError(8)
                  }
                  if ((stream.flags & 2097155) === 1) {
                      throw new FS.ErrnoError(8)
                  }
                  if (FS.isDir(stream.node.mode)) {
                      throw new FS.ErrnoError(31)
                  }
                  if (!stream.stream_ops.read) {
                      throw new FS.ErrnoError(28)
                  }
                  var seeking = typeof position != "undefined";
                  if (!seeking) {
                      position = stream.position
                  } else if (!stream.seekable) {
                      throw new FS.ErrnoError(70)
                  }
                  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
                  if (!seeking) stream.position += bytesRead;
                  return bytesRead
              },
              write(stream, buffer, offset, length, position, canOwn) {
                  assert(offset >= 0);
                  if (length < 0 || position < 0) {
                      throw new FS.ErrnoError(28)
                  }
                  if (FS.isClosed(stream)) {
                      throw new FS.ErrnoError(8)
                  }
                  if ((stream.flags & 2097155) === 0) {
                      throw new FS.ErrnoError(8)
                  }
                  if (FS.isDir(stream.node.mode)) {
                      throw new FS.ErrnoError(31)
                  }
                  if (!stream.stream_ops.write) {
                      throw new FS.ErrnoError(28)
                  }
                  if (stream.seekable && stream.flags & 1024) {
                      FS.llseek(stream, 0, 2)
                  }
                  var seeking = typeof position != "undefined";
                  if (!seeking) {
                      position = stream.position
                  } else if (!stream.seekable) {
                      throw new FS.ErrnoError(70)
                  }
                  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
                  if (!seeking) stream.position += bytesWritten;
                  return bytesWritten
              },
              allocate(stream, offset, length) {
                  if (FS.isClosed(stream)) {
                      throw new FS.ErrnoError(8)
                  }
                  if (offset < 0 || length <= 0) {
                      throw new FS.ErrnoError(28)
                  }
                  if ((stream.flags & 2097155) === 0) {
                      throw new FS.ErrnoError(8)
                  }
                  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                      throw new FS.ErrnoError(43)
                  }
                  if (!stream.stream_ops.allocate) {
                      throw new FS.ErrnoError(138)
                  }
                  stream.stream_ops.allocate(stream, offset, length)
              },
              mmap(stream, length, position, prot, flags) {
                  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                      throw new FS.ErrnoError(2)
                  }
                  if ((stream.flags & 2097155) === 1) {
                      throw new FS.ErrnoError(2)
                  }
                  if (!stream.stream_ops.mmap) {
                      throw new FS.ErrnoError(43)
                  }
                  return stream.stream_ops.mmap(stream, length, position, prot, flags)
              },
              msync(stream, buffer, offset, length, mmapFlags) {
                  assert(offset >= 0);
                  if (!stream.stream_ops.msync) {
                      return 0
                  }
                  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
              },
              ioctl(stream, cmd, arg) {
                  if (!stream.stream_ops.ioctl) {
                      throw new FS.ErrnoError(59)
                  }
                  return stream.stream_ops.ioctl(stream, cmd, arg)
              },
              readFile(path, opts = {}) {
                  opts.flags = opts.flags || 0;
                  opts.encoding = opts.encoding || "binary";
                  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                      throw new Error(`Invalid encoding type "${opts.encoding}"`)
                  }
                  var ret;
                  var stream = FS.open(path, opts.flags);
                  var stat = FS.stat(path);
                  var length = stat.size;
                  var buf = new Uint8Array(length);
                  FS.read(stream, buf, 0, length, 0);
                  if (opts.encoding === "utf8") {
                      ret = UTF8ArrayToString(buf, 0)
                  } else if (opts.encoding === "binary") {
                      ret = buf
                  }
                  FS.close(stream);
                  return ret
              },
              writeFile(path, data, opts = {}) {
                  opts.flags = opts.flags || 577;
                  var stream = FS.open(path, opts.flags, opts.mode);
                  if (typeof data == "string") {
                      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
                      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
                  } else if (ArrayBuffer.isView(data)) {
                      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
                  } else {
                      throw new Error("Unsupported data type")
                  }
                  FS.close(stream)
              },
              cwd: () => FS.currentPath,
              chdir(path) {
                  var lookup = FS.lookupPath(path, {
                      follow: true
                  });
                  if (lookup.node === null) {
                      throw new FS.ErrnoError(44)
                  }
                  if (!FS.isDir(lookup.node.mode)) {
                      throw new FS.ErrnoError(54)
                  }
                  var errCode = FS.nodePermissions(lookup.node, "x");
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
                  FS.currentPath = lookup.path
              },
              createDefaultDirectories() {
                  FS.mkdir("/tmp");
                  FS.mkdir("/home");
                  FS.mkdir("/home/web_user")
              },
              createDefaultDevices() {
                  FS.mkdir("/dev");
                  FS.registerDevice(FS.makedev(1, 3), {
                      read: () => 0,
                      write: (stream, buffer, offset, length, pos) => length
                  });
                  FS.mkdev("/dev/null", FS.makedev(1, 3));
                  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                  FS.mkdev("/dev/tty", FS.makedev(5, 0));
                  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                  var randomBuffer = new Uint8Array(1024),
                      randomLeft = 0;
                  var randomByte = () => {
                      if (randomLeft === 0) {
                          randomLeft = randomFill(randomBuffer).byteLength
                      }
                      return randomBuffer[--randomLeft]
                  };
                  FS.createDevice("/dev", "random", randomByte);
                  FS.createDevice("/dev", "urandom", randomByte);
                  FS.mkdir("/dev/shm");
                  FS.mkdir("/dev/shm/tmp")
              },
              createSpecialDirectories() {
                  FS.mkdir("/proc");
                  var proc_self = FS.mkdir("/proc/self");
                  FS.mkdir("/proc/self/fd");
                  FS.mount({
                      mount() {
                          var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                          node.node_ops = {
                              lookup(parent, name) {
                                  var fd = +name;
                                  var stream = FS.getStreamChecked(fd);
                                  var ret = {
                                      parent: null,
                                      mount: {
                                          mountpoint: "fake"
                                      },
                                      node_ops: {
                                          readlink: () => stream.path
                                      }
                                  };
                                  ret.parent = ret;
                                  return ret
                              }
                          };
                          return node
                      }
                  }, {}, "/proc/self/fd")
              },
              createStandardStreams() {
                  if (Module["stdin"]) {
                      FS.createDevice("/dev", "stdin", Module["stdin"])
                  } else {
                      FS.symlink("/dev/tty", "/dev/stdin")
                  }
                  if (Module["stdout"]) {
                      FS.createDevice("/dev", "stdout", null, Module["stdout"])
                  } else {
                      FS.symlink("/dev/tty", "/dev/stdout")
                  }
                  if (Module["stderr"]) {
                      FS.createDevice("/dev", "stderr", null, Module["stderr"])
                  } else {
                      FS.symlink("/dev/tty1", "/dev/stderr")
                  }
                  var stdin = FS.open("/dev/stdin", 0);
                  var stdout = FS.open("/dev/stdout", 1);
                  var stderr = FS.open("/dev/stderr", 1);
                  assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
                  assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
                  assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`)
              },
              staticInit() {
                  [44].forEach(code => {
                      FS.genericErrors[code] = new FS.ErrnoError(code);
                      FS.genericErrors[code].stack = "<generic error, no stack>"
                  });
                  FS.nameTable = new Array(4096);
                  FS.mount(MEMFS, {}, "/");
                  FS.createDefaultDirectories();
                  FS.createDefaultDevices();
                  FS.createSpecialDirectories();
                  FS.filesystems = {
                      "MEMFS": MEMFS
                  }
              },
              init(input, output, error) {
                  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
                  FS.init.initialized = true;
                  Module["stdin"] = input || Module["stdin"];
                  Module["stdout"] = output || Module["stdout"];
                  Module["stderr"] = error || Module["stderr"];
                  FS.createStandardStreams()
              },
              quit() {
                  FS.init.initialized = false;
                  _fflush(0);
                  for (var i = 0; i < FS.streams.length; i++) {
                      var stream = FS.streams[i];
                      if (!stream) {
                          continue
                      }
                      FS.close(stream)
                  }
              },
              findObject(path, dontResolveLastLink) {
                  var ret = FS.analyzePath(path, dontResolveLastLink);
                  if (!ret.exists) {
                      return null
                  }
                  return ret.object
              },
              analyzePath(path, dontResolveLastLink) {
                  try {
                      var lookup = FS.lookupPath(path, {
                          follow: !dontResolveLastLink
                      });
                      path = lookup.path
                  } catch (e) {}
                  var ret = {
                      isRoot: false,
                      exists: false,
                      error: 0,
                      name: null,
                      path: null,
                      object: null,
                      parentExists: false,
                      parentPath: null,
                      parentObject: null
                  };
                  try {
                      var lookup = FS.lookupPath(path, {
                          parent: true
                      });
                      ret.parentExists = true;
                      ret.parentPath = lookup.path;
                      ret.parentObject = lookup.node;
                      ret.name = PATH.basename(path);
                      lookup = FS.lookupPath(path, {
                          follow: !dontResolveLastLink
                      });
                      ret.exists = true;
                      ret.path = lookup.path;
                      ret.object = lookup.node;
                      ret.name = lookup.node.name;
                      ret.isRoot = lookup.path === "/"
                  } catch (e) {
                      ret.error = e.errno
                  }
                  return ret
              },
              createPath(parent, path, canRead, canWrite) {
                  parent = typeof parent == "string" ? parent : FS.getPath(parent);
                  var parts = path.split("/").reverse();
                  while (parts.length) {
                      var part = parts.pop();
                      if (!part) continue;
                      var current = PATH.join2(parent, part);
                      try {
                          FS.mkdir(current)
                      } catch (e) {}
                      parent = current
                  }
                  return current
              },
              createFile(parent, name, properties, canRead, canWrite) {
                  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                  var mode = FS_getMode(canRead, canWrite);
                  return FS.create(path, mode)
              },
              createDataFile(parent, name, data, canRead, canWrite, canOwn) {
                  var path = name;
                  if (parent) {
                      parent = typeof parent == "string" ? parent : FS.getPath(parent);
                      path = name ? PATH.join2(parent, name) : parent
                  }
                  var mode = FS_getMode(canRead, canWrite);
                  var node = FS.create(path, mode);
                  if (data) {
                      if (typeof data == "string") {
                          var arr = new Array(data.length);
                          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                          data = arr
                      }
                      FS.chmod(node, mode | 146);
                      var stream = FS.open(node, 577);
                      FS.write(stream, data, 0, data.length, 0, canOwn);
                      FS.close(stream);
                      FS.chmod(node, mode)
                  }
              },
              createDevice(parent, name, input, output) {
                  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                  var mode = FS_getMode(!!input, !!output);
                  if (!FS.createDevice.major) FS.createDevice.major = 64;
                  var dev = FS.makedev(FS.createDevice.major++, 0);
                  FS.registerDevice(dev, {
                      open(stream) {
                          stream.seekable = false
                      },
                      close(stream) {
                          if (output?.buffer?.length) {
                              output(10)
                          }
                      },
                      read(stream, buffer, offset, length, pos) {
                          var bytesRead = 0;
                          for (var i = 0; i < length; i++) {
                              var result;
                              try {
                                  result = input()
                              } catch (e) {
                                  throw new FS.ErrnoError(29)
                              }
                              if (result === undefined && bytesRead === 0) {
                                  throw new FS.ErrnoError(6)
                              }
                              if (result === null || result === undefined) break;
                              bytesRead++;
                              buffer[offset + i] = result
                          }
                          if (bytesRead) {
                              stream.node.timestamp = Date.now()
                          }
                          return bytesRead
                      },
                      write(stream, buffer, offset, length, pos) {
                          for (var i = 0; i < length; i++) {
                              try {
                                  output(buffer[offset + i])
                              } catch (e) {
                                  throw new FS.ErrnoError(29)
                              }
                          }
                          if (length) {
                              stream.node.timestamp = Date.now()
                          }
                          return i
                      }
                  });
                  return FS.mkdev(path, mode, dev)
              },
              forceLoadFile(obj) {
                  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
                  if (typeof XMLHttpRequest != "undefined") {
                      throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
                  } else if (read_) {
                      try {
                          obj.contents = intArrayFromString(read_(obj.url), true);
                          obj.usedBytes = obj.contents.length
                      } catch (e) {
                          throw new FS.ErrnoError(29)
                      }
                  } else {
                      throw new Error("Cannot load without read() or XMLHttpRequest.")
                  }
              },
              createLazyFile(parent, name, url, canRead, canWrite) {
                  class LazyUint8Array {
                      constructor() {
                          this.lengthKnown = false;
                          this.chunks = []
                      }
                      get(idx) {
                          if (idx > this.length - 1 || idx < 0) {
                              return undefined
                          }
                          var chunkOffset = idx % this.chunkSize;
                          var chunkNum = idx / this.chunkSize | 0;
                          return this.getter(chunkNum)[chunkOffset]
                      }
                      setDataGetter(getter) {
                          this.getter = getter
                      }
                      cacheLength() {
                          var xhr = new XMLHttpRequest;
                          xhr.open("HEAD", url, false);
                          xhr.send(null);
                          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                          var datalength = Number(xhr.getResponseHeader("Content-length"));
                          var header;
                          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                          var chunkSize = 1024 * 1024;
                          if (!hasByteServing) chunkSize = datalength;
                          var doXHR = (from, to) => {
                              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                              if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                              var xhr = new XMLHttpRequest;
                              xhr.open("GET", url, false);
                              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                              xhr.responseType = "arraybuffer";
                              if (xhr.overrideMimeType) {
                                  xhr.overrideMimeType("text/plain; charset=x-user-defined")
                              }
                              xhr.send(null);
                              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                              if (xhr.response !== undefined) {
                                  return new Uint8Array(xhr.response || [])
                              }
                              return intArrayFromString(xhr.responseText || "", true)
                          };
                          var lazyArray = this;
                          lazyArray.setDataGetter(chunkNum => {
                              var start = chunkNum * chunkSize;
                              var end = (chunkNum + 1) * chunkSize - 1;
                              end = Math.min(end, datalength - 1);
                              if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                                  lazyArray.chunks[chunkNum] = doXHR(start, end)
                              }
                              if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
                              return lazyArray.chunks[chunkNum]
                          });
                          if (usesGzip || !datalength) {
                              chunkSize = datalength = 1;
                              datalength = this.getter(0).length;
                              chunkSize = datalength;
                              out("LazyFiles on gzip forces download of the whole file when length is accessed")
                          }
                          this._length = datalength;
                          this._chunkSize = chunkSize;
                          this.lengthKnown = true
                      }
                      get length() {
                          if (!this.lengthKnown) {
                              this.cacheLength()
                          }
                          return this._length
                      }
                      get chunkSize() {
                          if (!this.lengthKnown) {
                              this.cacheLength()
                          }
                          return this._chunkSize
                      }
                  }
                  if (typeof XMLHttpRequest != "undefined") {
                      if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                      var lazyArray = new LazyUint8Array;
                      var properties = {
                          isDevice: false,
                          contents: lazyArray
                      }
                  } else {
                      var properties = {
                          isDevice: false,
                          url: url
                      }
                  }
                  var node = FS.createFile(parent, name, properties, canRead, canWrite);
                  if (properties.contents) {
                      node.contents = properties.contents
                  } else if (properties.url) {
                      node.contents = null;
                      node.url = properties.url
                  }
                  Object.defineProperties(node, {
                      usedBytes: {
                          get: function() {
                              return this.contents.length
                          }
                      }
                  });
                  var stream_ops = {};
                  var keys = Object.keys(node.stream_ops);
                  keys.forEach(key => {
                      var fn = node.stream_ops[key];
                      stream_ops[key] = (...args) => {
                          FS.forceLoadFile(node);
                          return fn(...args)
                      }
                  });

                  function writeChunks(stream, buffer, offset, length, position) {
                      var contents = stream.node.contents;
                      if (position >= contents.length) return 0;
                      var size = Math.min(contents.length - position, length);
                      assert(size >= 0);
                      if (contents.slice) {
                          for (var i = 0; i < size; i++) {
                              buffer[offset + i] = contents[position + i]
                          }
                      } else {
                          for (var i = 0; i < size; i++) {
                              buffer[offset + i] = contents.get(position + i)
                          }
                      }
                      return size
                  }
                  stream_ops.read = (stream, buffer, offset, length, position) => {
                      FS.forceLoadFile(node);
                      return writeChunks(stream, buffer, offset, length, position)
                  };
                  stream_ops.mmap = (stream, length, position, prot, flags) => {
                      FS.forceLoadFile(node);
                      var ptr = mmapAlloc(length);
                      if (!ptr) {
                          throw new FS.ErrnoError(48)
                      }
                      writeChunks(stream, HEAP8, ptr, length, position);
                      return {
                          ptr: ptr,
                          allocated: true
                      }
                  };
                  node.stream_ops = stream_ops;
                  return node
              },
              absolutePath() {
                  abort("FS.absolutePath has been removed; use PATH_FS.resolve instead")
              },
              createFolder() {
                  abort("FS.createFolder has been removed; use FS.mkdir instead")
              },
              createLink() {
                  abort("FS.createLink has been removed; use FS.symlink instead")
              },
              joinPath() {
                  abort("FS.joinPath has been removed; use PATH.join instead")
              },
              mmapAlloc() {
                  abort("FS.mmapAlloc has been replaced by the top level function mmapAlloc")
              },
              standardizePath() {
                  abort("FS.standardizePath has been removed; use PATH.normalize instead")
              }
          };
          var SOCKFS = {
              mount(mount) {
                  Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
                  Module["websocket"]._callbacks = {};
                  Module["websocket"]["on"] = function(event, callback) {
                      if ("function" === typeof callback) {
                          this._callbacks[event] = callback
                      }
                      return this
                  };
                  Module["websocket"].emit = function(event, param) {
                      if ("function" === typeof this._callbacks[event]) {
                          this._callbacks[event].call(this, param)
                      }
                  };
                  return FS.createNode(null, "/", 16384 | 511, 0)
              },
              createSocket(family, type, protocol) {
                  type &= ~526336;
                  var streaming = type == 1;
                  if (streaming && protocol && protocol != 6) {
                      throw new FS.ErrnoError(66)
                  }
                  var sock = {
                      family: family,
                      type: type,
                      protocol: protocol,
                      server: null,
                      error: null,
                      peers: {},
                      pending: [],
                      recv_queue: [],
                      sock_ops: SOCKFS.websocket_sock_ops
                  };
                  var name = SOCKFS.nextname();
                  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
                  node.sock = sock;
                  var stream = FS.createStream({
                      path: name,
                      node: node,
                      flags: 2,
                      seekable: false,
                      stream_ops: SOCKFS.stream_ops
                  });
                  sock.stream = stream;
                  return sock
              },
              getSocket(fd) {
                  var stream = FS.getStream(fd);
                  if (!stream || !FS.isSocket(stream.node.mode)) {
                      return null
                  }
                  return stream.node.sock
              },
              stream_ops: {
                  poll(stream) {
                      var sock = stream.node.sock;
                      return sock.sock_ops.poll(sock)
                  },
                  ioctl(stream, request, varargs) {
                      var sock = stream.node.sock;
                      return sock.sock_ops.ioctl(sock, request, varargs)
                  },
                  read(stream, buffer, offset, length, position) {
                      var sock = stream.node.sock;
                      var msg = sock.sock_ops.recvmsg(sock, length);
                      if (!msg) {
                          return 0
                      }
                      buffer.set(msg.buffer, offset);
                      return msg.buffer.length
                  },
                  write(stream, buffer, offset, length, position) {
                      var sock = stream.node.sock;
                      return sock.sock_ops.sendmsg(sock, buffer, offset, length)
                  },
                  close(stream) {
                      var sock = stream.node.sock;
                      sock.sock_ops.close(sock)
                  }
              },
              nextname() {
                  if (!SOCKFS.nextname.current) {
                      SOCKFS.nextname.current = 0
                  }
                  return "socket[" + SOCKFS.nextname.current++ + "]"
              },
              websocket_sock_ops: {
                  createPeer(sock, addr, port) {
                      var ws;
                      if (typeof addr == "object") {
                          ws = addr;
                          addr = null;
                          port = null
                      }
                      if (ws) {
                          if (ws._socket) {
                              addr = ws._socket.remoteAddress;
                              port = ws._socket.remotePort
                          } else {
                              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
                              if (!result) {
                                  throw new Error("WebSocket URL must be in the format ws(s)://address:port")
                              }
                              addr = result[1];
                              port = parseInt(result[2], 10)
                          }
                      } else {
                          try {
                              var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
                              var url = "ws:#".replace("#", "//");
                              if (runtimeConfig) {
                                  if ("string" === typeof Module["websocket"]["url"]) {
                                      url = Module["websocket"]["url"]
                                  }
                              }
                              if (url === "ws://" || url === "wss://") {
                                  var parts = addr.split("/");
                                  url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/")
                              }
                              var subProtocols = "binary";
                              if (runtimeConfig) {
                                  if ("string" === typeof Module["websocket"]["subprotocol"]) {
                                      subProtocols = Module["websocket"]["subprotocol"]
                                  }
                              }
                              var opts = undefined;
                              if (subProtocols !== "null") {
                                  subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
                                  opts = subProtocols
                              }
                              if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
                                  subProtocols = "null";
                                  opts = undefined
                              }
                              var WebSocketConstructor;
                              if (ENVIRONMENT_IS_NODE) {
                                  WebSocketConstructor = require("ws")
                              } else {
                                  WebSocketConstructor = WebSocket
                              }
                              ws = new WebSocketConstructor(url, opts);
                              ws.binaryType = "arraybuffer"
                          } catch (e) {
                              throw new FS.ErrnoError(23)
                          }
                      }
                      var peer = {
                          addr: addr,
                          port: port,
                          socket: ws,
                          dgram_send_queue: []
                      };
                      SOCKFS.websocket_sock_ops.addPeer(sock, peer);
                      SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
                      if (sock.type === 2 && typeof sock.sport != "undefined") {
                          peer.dgram_send_queue.push(new Uint8Array([255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255]))
                      }
                      return peer
                  },
                  getPeer(sock, addr, port) {
                      return sock.peers[addr + ":" + port]
                  },
                  addPeer(sock, peer) {
                      sock.peers[peer.addr + ":" + peer.port] = peer
                  },
                  removePeer(sock, peer) {
                      delete sock.peers[peer.addr + ":" + peer.port]
                  },
                  handlePeerEvents(sock, peer) {
                      var first = true;
                      var handleOpen = function() {
                          Module["websocket"].emit("open", sock.stream.fd);
                          try {
                              var queued = peer.dgram_send_queue.shift();
                              while (queued) {
                                  peer.socket.send(queued);
                                  queued = peer.dgram_send_queue.shift()
                              }
                          } catch (e) {
                              peer.socket.close()
                          }
                      };

                      function handleMessage(data) {
                          if (typeof data == "string") {
                              var encoder = new TextEncoder;
                              data = encoder.encode(data)
                          } else {
                              assert(data.byteLength !== undefined);
                              if (data.byteLength == 0) {
                                  return
                              }
                              data = new Uint8Array(data)
                          }
                          var wasfirst = first;
                          first = false;
                          if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
                              var newport = data[8] << 8 | data[9];
                              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
                              peer.port = newport;
                              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
                              return
                          }
                          sock.recv_queue.push({
                              addr: peer.addr,
                              port: peer.port,
                              data: data
                          });
                          Module["websocket"].emit("message", sock.stream.fd)
                      }
                      if (ENVIRONMENT_IS_NODE) {
                          peer.socket.on("open", handleOpen);
                          peer.socket.on("message", function(data, isBinary) {
                              if (!isBinary) {
                                  return
                              }
                              handleMessage(new Uint8Array(data).buffer)
                          });
                          peer.socket.on("close", function() {
                              Module["websocket"].emit("close", sock.stream.fd)
                          });
                          peer.socket.on("error", function(error) {
                              sock.error = 14;
                              Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
                          })
                      } else {
                          peer.socket.onopen = handleOpen;
                          peer.socket.onclose = function() {
                              Module["websocket"].emit("close", sock.stream.fd)
                          };
                          peer.socket.onmessage = function peer_socket_onmessage(event) {
                              handleMessage(event.data)
                          };
                          peer.socket.onerror = function(error) {
                              sock.error = 14;
                              Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
                          }
                      }
                  },
                  poll(sock) {
                      if (sock.type === 1 && sock.server) {
                          return sock.pending.length ? 64 | 1 : 0
                      }
                      var mask = 0;
                      var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
                      if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                          mask |= 64 | 1
                      }
                      if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
                          mask |= 4
                      }
                      if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                          mask |= 16
                      }
                      return mask
                  },
                  ioctl(sock, request, arg) {
                      switch (request) {
                          case 21531:
                              var bytes = 0;
                              if (sock.recv_queue.length) {
                                  bytes = sock.recv_queue[0].data.length
                              }
                              HEAP32[arg >> 2] = bytes;
                              return 0;
                          default:
                              return 28
                      }
                  },
                  close(sock) {
                      if (sock.server) {
                          try {
                              sock.server.close()
                          } catch (e) {}
                          sock.server = null
                      }
                      var peers = Object.keys(sock.peers);
                      for (var i = 0; i < peers.length; i++) {
                          var peer = sock.peers[peers[i]];
                          try {
                              peer.socket.close()
                          } catch (e) {}
                          SOCKFS.websocket_sock_ops.removePeer(sock, peer)
                      }
                      return 0
                  },
                  bind(sock, addr, port) {
                      if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
                          throw new FS.ErrnoError(28)
                      }
                      sock.saddr = addr;
                      sock.sport = port;
                      if (sock.type === 2) {
                          if (sock.server) {
                              sock.server.close();
                              sock.server = null
                          }
                          try {
                              sock.sock_ops.listen(sock, 0)
                          } catch (e) {
                              if (!(e.name === "ErrnoError")) throw e;
                              if (e.errno !== 138) throw e
                          }
                      }
                  },
                  connect(sock, addr, port) {
                      if (sock.server) {
                          throw new FS.ErrnoError(138)
                      }
                      if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
                          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                          if (dest) {
                              if (dest.socket.readyState === dest.socket.CONNECTING) {
                                  throw new FS.ErrnoError(7)
                              } else {
                                  throw new FS.ErrnoError(30)
                              }
                          }
                      }
                      var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
                      sock.daddr = peer.addr;
                      sock.dport = peer.port;
                      throw new FS.ErrnoError(26)
                  },
                  listen(sock, backlog) {
                      if (!ENVIRONMENT_IS_NODE) {
                          throw new FS.ErrnoError(138)
                      }
                      if (sock.server) {
                          throw new FS.ErrnoError(28)
                      }
                      var WebSocketServer = require("ws").Server;
                      var host = sock.saddr;
                      sock.server = new WebSocketServer({
                          host: host,
                          port: sock.sport
                      });
                      Module["websocket"].emit("listen", sock.stream.fd);
                      sock.server.on("connection", function(ws) {
                          if (sock.type === 1) {
                              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
                              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
                              newsock.daddr = peer.addr;
                              newsock.dport = peer.port;
                              sock.pending.push(newsock);
                              Module["websocket"].emit("connection", newsock.stream.fd)
                          } else {
                              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
                              Module["websocket"].emit("connection", sock.stream.fd)
                          }
                      });
                      sock.server.on("close", function() {
                          Module["websocket"].emit("close", sock.stream.fd);
                          sock.server = null
                      });
                      sock.server.on("error", function(error) {
                          sock.error = 23;
                          Module["websocket"].emit("error", [sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable"])
                      })
                  },
                  accept(listensock) {
                      if (!listensock.server || !listensock.pending.length) {
                          throw new FS.ErrnoError(28)
                      }
                      var newsock = listensock.pending.shift();
                      newsock.stream.flags = listensock.stream.flags;
                      return newsock
                  },
                  getname(sock, peer) {
                      var addr, port;
                      if (peer) {
                          if (sock.daddr === undefined || sock.dport === undefined) {
                              throw new FS.ErrnoError(53)
                          }
                          addr = sock.daddr;
                          port = sock.dport
                      } else {
                          addr = sock.saddr || 0;
                          port = sock.sport || 0
                      }
                      return {
                          addr: addr,
                          port: port
                      }
                  },
                  sendmsg(sock, buffer, offset, length, addr, port) {
                      if (sock.type === 2) {
                          if (addr === undefined || port === undefined) {
                              addr = sock.daddr;
                              port = sock.dport
                          }
                          if (addr === undefined || port === undefined) {
                              throw new FS.ErrnoError(17)
                          }
                      } else {
                          addr = sock.daddr;
                          port = sock.dport
                      }
                      var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
                      if (sock.type === 1) {
                          if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                              throw new FS.ErrnoError(53)
                          } else if (dest.socket.readyState === dest.socket.CONNECTING) {
                              throw new FS.ErrnoError(6)
                          }
                      }
                      if (ArrayBuffer.isView(buffer)) {
                          offset += buffer.byteOffset;
                          buffer = buffer.buffer
                      }
                      var data;
                      if (buffer instanceof SharedArrayBuffer) {
                          data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer
                      } else {
                          data = buffer.slice(offset, offset + length)
                      }
                      if (sock.type === 2) {
                          if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
                              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                                  dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port)
                              }
                              dest.dgram_send_queue.push(data);
                              return length
                          }
                      }
                      try {
                          dest.socket.send(data);
                          return length
                      } catch (e) {
                          throw new FS.ErrnoError(28)
                      }
                  },
                  recvmsg(sock, length) {
                      if (sock.type === 1 && sock.server) {
                          throw new FS.ErrnoError(53)
                      }
                      var queued = sock.recv_queue.shift();
                      if (!queued) {
                          if (sock.type === 1) {
                              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                              if (!dest) {
                                  throw new FS.ErrnoError(53)
                              }
                              if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                                  return null
                              }
                              throw new FS.ErrnoError(6)
                          }
                          throw new FS.ErrnoError(6)
                      }
                      var queuedLength = queued.data.byteLength || queued.data.length;
                      var queuedOffset = queued.data.byteOffset || 0;
                      var queuedBuffer = queued.data.buffer || queued.data;
                      var bytesRead = Math.min(length, queuedLength);
                      var res = {
                          buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
                          addr: queued.addr,
                          port: queued.port
                      };
                      if (sock.type === 1 && bytesRead < queuedLength) {
                          var bytesRemaining = queuedLength - bytesRead;
                          queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
                          sock.recv_queue.unshift(queued)
                      }
                      return res
                  }
              }
          };
          var getSocketFromFD = fd => {
              var socket = SOCKFS.getSocket(fd);
              if (!socket) throw new FS.ErrnoError(8);
              return socket
          };
          var inetPton4 = str => {
              var b = str.split(".");
              for (var i = 0; i < 4; i++) {
                  var tmp = Number(b[i]);
                  if (isNaN(tmp)) return null;
                  b[i] = tmp
              }
              return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0
          };
          var jstoi_q = str => parseInt(str);
          var inetPton6 = str => {
              var words;
              var w, offset, z;
              var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
              var parts = [];
              if (!valid6regx.test(str)) {
                  return null
              }
              if (str === "::") {
                  return [0, 0, 0, 0, 0, 0, 0, 0]
              }
              if (str.startsWith("::")) {
                  str = str.replace("::", "Z:")
              } else {
                  str = str.replace("::", ":Z:")
              }
              if (str.indexOf(".") > 0) {
                  str = str.replace(new RegExp("[.]", "g"), ":");
                  words = str.split(":");
                  words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
                  words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
                  words = words.slice(0, words.length - 2)
              } else {
                  words = str.split(":")
              }
              offset = 0;
              z = 0;
              for (w = 0; w < words.length; w++) {
                  if (typeof words[w] == "string") {
                      if (words[w] === "Z") {
                          for (z = 0; z < 8 - words.length + 1; z++) {
                              parts[w + z] = 0
                          }
                          offset = z - 1
                      } else {
                          parts[w + offset] = _htons(parseInt(words[w], 16))
                      }
                  } else {
                      parts[w + offset] = words[w]
                  }
              }
              return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]]
          };
          var writeSockaddr = (sa, family, addr, port, addrlen) => {
              switch (family) {
                  case 2:
                      addr = inetPton4(addr);
                      zeroMemory(sa, 16);
                      if (addrlen) {
                          HEAP32[addrlen >> 2] = 16
                      }
                      HEAP16[sa >> 1] = family;
                      HEAP32[sa + 4 >> 2] = addr;
                      HEAP16[sa + 2 >> 1] = _htons(port);
                      break;
                  case 10:
                      addr = inetPton6(addr);
                      zeroMemory(sa, 28);
                      if (addrlen) {
                          HEAP32[addrlen >> 2] = 28
                      }
                      HEAP32[sa >> 2] = family;
                      HEAP32[sa + 8 >> 2] = addr[0];
                      HEAP32[sa + 12 >> 2] = addr[1];
                      HEAP32[sa + 16 >> 2] = addr[2];
                      HEAP32[sa + 20 >> 2] = addr[3];
                      HEAP16[sa + 2 >> 1] = _htons(port);
                      break;
                  default:
                      return 5
              }
              return 0
          };
          var DNS = {
              address_map: {
                  id: 1,
                  addrs: {},
                  names: {}
              },
              lookup_name(name) {
                  var res = inetPton4(name);
                  if (res !== null) {
                      return name
                  }
                  res = inetPton6(name);
                  if (res !== null) {
                      return name
                  }
                  var addr;
                  if (DNS.address_map.addrs[name]) {
                      addr = DNS.address_map.addrs[name]
                  } else {
                      var id = DNS.address_map.id++;
                      assert(id < 65535, "exceeded max address mappings of 65535");
                      addr = "172.29." + (id & 255) + "." + (id & 65280);
                      DNS.address_map.names[addr] = name;
                      DNS.address_map.addrs[name] = addr
                  }
                  return addr
              },
              lookup_addr(addr) {
                  if (DNS.address_map.names[addr]) {
                      return DNS.address_map.names[addr]
                  }
                  return null
              }
          };

          function ___syscall_accept4(fd, addr, addrlen, flags, d1, d2) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, fd, addr, addrlen, flags, d1, d2);
              try {
                  var sock = getSocketFromFD(fd);
                  var newsock = sock.sock_ops.accept(sock);
                  if (addr) {
                      var errno = writeSockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport, addrlen);
                      assert(!errno)
                  }
                  return newsock.stream.fd
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var inetNtop4 = addr => (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255);
          var inetNtop6 = ints => {
              var str = "";
              var word = 0;
              var longest = 0;
              var lastzero = 0;
              var zstart = 0;
              var len = 0;
              var i = 0;
              var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16];
              var hasipv4 = true;
              var v4part = "";
              for (i = 0; i < 5; i++) {
                  if (parts[i] !== 0) {
                      hasipv4 = false;
                      break
                  }
              }
              if (hasipv4) {
                  v4part = inetNtop4(parts[6] | parts[7] << 16);
                  if (parts[5] === -1) {
                      str = "::ffff:";
                      str += v4part;
                      return str
                  }
                  if (parts[5] === 0) {
                      str = "::";
                      if (v4part === "0.0.0.0") v4part = "";
                      if (v4part === "0.0.0.1") v4part = "1";
                      str += v4part;
                      return str
                  }
              }
              for (word = 0; word < 8; word++) {
                  if (parts[word] === 0) {
                      if (word - lastzero > 1) {
                          len = 0
                      }
                      lastzero = word;
                      len++
                  }
                  if (len > longest) {
                      longest = len;
                      zstart = word - longest + 1
                  }
              }
              for (word = 0; word < 8; word++) {
                  if (longest > 1) {
                      if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
                          if (word === zstart) {
                              str += ":";
                              if (zstart === 0) str += ":"
                          }
                          continue
                      }
                  }
                  str += Number(_ntohs(parts[word] & 65535)).toString(16);
                  str += word < 7 ? ":" : ""
              }
              return str
          };
          var readSockaddr = (sa, salen) => {
              var family = HEAP16[sa >> 1];
              var port = _ntohs(HEAPU16[sa + 2 >> 1]);
              var addr;
              switch (family) {
                  case 2:
                      if (salen !== 16) {
                          return {
                              errno: 28
                          }
                      }
                      addr = HEAP32[sa + 4 >> 2];
                      addr = inetNtop4(addr);
                      break;
                  case 10:
                      if (salen !== 28) {
                          return {
                              errno: 28
                          }
                      }
                      addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
                      addr = inetNtop6(addr);
                      break;
                  default:
                      return {
                          errno: 5
                      }
              }
              return {
                  family: family,
                  addr: addr,
                  port: port
              }
          };
          var getSocketAddress = (addrp, addrlen, allowNull) => {
              if (allowNull && addrp === 0) return null;
              var info = readSockaddr(addrp, addrlen);
              if (info.errno) throw new FS.ErrnoError(info.errno);
              info.addr = DNS.lookup_addr(info.addr) || info.addr;
              return info
          };

          function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, fd, addr, addrlen, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  var info = getSocketAddress(addr, addrlen);
                  sock.sock_ops.bind(sock, info.addr, info.port);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, fd, addr, addrlen, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  var info = getSocketAddress(addr, addrlen);
                  sock.sock_ops.connect(sock, info.addr, info.port);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var SYSCALLS = {
              DEFAULT_POLLMASK: 5,
              calculateAt(dirfd, path, allowEmpty) {
                  if (PATH.isAbs(path)) {
                      return path
                  }
                  var dir;
                  if (dirfd === -100) {
                      dir = FS.cwd()
                  } else {
                      var dirstream = SYSCALLS.getStreamFromFD(dirfd);
                      dir = dirstream.path
                  }
                  if (path.length == 0) {
                      if (!allowEmpty) {
                          throw new FS.ErrnoError(44)
                      }
                      return dir
                  }
                  return PATH.join2(dir, path)
              },
              doStat(func, path, buf) {
                  var stat = func(path);
                  HEAP32[buf >> 2] = stat.dev;
                  HEAP32[buf + 4 >> 2] = stat.mode;
                  HEAPU32[buf + 8 >> 2] = stat.nlink;
                  HEAP32[buf + 12 >> 2] = stat.uid;
                  HEAP32[buf + 16 >> 2] = stat.gid;
                  HEAP32[buf + 20 >> 2] = stat.rdev;
                  tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
                  HEAP32[buf + 32 >> 2] = 4096;
                  HEAP32[buf + 36 >> 2] = stat.blocks;
                  var atime = stat.atime.getTime();
                  var mtime = stat.mtime.getTime();
                  var ctime = stat.ctime.getTime();
                  tempI64 = [Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
                  HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3;
                  tempI64 = [Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
                  HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3;
                  tempI64 = [Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
                  HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3;
                  tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
                  return 0
              },
              doMsync(addr, stream, len, flags, offset) {
                  if (!FS.isFile(stream.node.mode)) {
                      throw new FS.ErrnoError(43)
                  }
                  if (flags & 2) {
                      return 0
                  }
                  var buffer = HEAPU8.slice(addr, addr + len);
                  FS.msync(stream, buffer, offset, len, flags)
              },
              varargs: undefined,
              get() {
                  assert(SYSCALLS.varargs != undefined);
                  var ret = HEAP32[+SYSCALLS.varargs >> 2];
                  SYSCALLS.varargs += 4;
                  return ret
              },
              getp() {
                  return SYSCALLS.get()
              },
              getStr(ptr) {
                  var ret = UTF8ToString(ptr);
                  return ret
              },
              getStreamFromFD(fd) {
                  var stream = FS.getStreamChecked(fd);
                  return stream
              }
          };

          function ___syscall_dup(fd) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, fd);
              try {
                  var old = SYSCALLS.getStreamFromFD(fd);
                  return FS.dupStream(old).fd
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_dup3(fd, newfd, flags) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 0, 1, fd, newfd, flags);
              try {
                  var old = SYSCALLS.getStreamFromFD(fd);
                  assert(!flags);
                  if (old.fd === newfd) return -28;
                  var existing = FS.getStream(newfd);
                  if (existing) FS.close(existing);
                  return FS.dupStream(old, newfd).fd
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_faccessat(dirfd, path, amode, flags) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, dirfd, path, amode, flags);
              try {
                  path = SYSCALLS.getStr(path);
                  assert(flags === 0);
                  path = SYSCALLS.calculateAt(dirfd, path);
                  if (amode & ~7) {
                      return -28
                  }
                  var lookup = FS.lookupPath(path, {
                      follow: true
                  });
                  var node = lookup.node;
                  if (!node) {
                      return -44
                  }
                  var perms = "";
                  if (amode & 4) perms += "r";
                  if (amode & 2) perms += "w";
                  if (amode & 1) perms += "x";
                  if (perms && FS.nodePermissions(node, perms)) {
                      return -2
                  }
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_fadvise64(fd, offset, len, advice) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 0, fd, offset, len, advice);
              return 0
          }

          function ___syscall_fcntl64(fd, cmd, varargs) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, fd, cmd, varargs);
              SYSCALLS.varargs = varargs;
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  switch (cmd) {
                      case 0: {
                          var arg = SYSCALLS.get();
                          if (arg < 0) {
                              return -28
                          }
                          while (FS.streams[arg]) {
                              arg++
                          }
                          var newStream;
                          newStream = FS.dupStream(stream, arg);
                          return newStream.fd
                      }
                      case 1:
                      case 2:
                          return 0;
                      case 3:
                          return stream.flags;
                      case 4: {
                          var arg = SYSCALLS.get();
                          stream.flags |= arg;
                          return 0
                      }
                      case 12: {
                          var arg = SYSCALLS.getp();
                          var offset = 0;
                          HEAP16[arg + offset >> 1] = 2;
                          return 0
                      }
                      case 13:
                      case 14:
                          return 0
                  }
                  return -28
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_fdatasync(fd) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, fd);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_fstat64(fd, buf) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, fd, buf);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  return SYSCALLS.doStat(FS.stat, stream.path, buf)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_ftruncate64(fd, length_low, length_high) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 0, 1, fd, length_low, length_high);
              var length = convertI32PairToI53Checked(length_low, length_high);
              try {
                  if (isNaN(length)) return 61;
                  FS.ftruncate(fd, length);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
              assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
              return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
          };

          function ___syscall_getcwd(buf, size) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, buf, size);
              try {
                  if (size === 0) return -28;
                  var cwd = FS.cwd();
                  var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
                  if (size < cwdLengthInBytes) return -68;
                  stringToUTF8(cwd, buf, size);
                  return cwdLengthInBytes
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_getdents64(fd, dirp, count) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, fd, dirp, count);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  stream.getdents ||= FS.readdir(stream.path);
                  var struct_size = 280;
                  var pos = 0;
                  var off = FS.llseek(stream, 0, 1);
                  var idx = Math.floor(off / struct_size);
                  while (idx < stream.getdents.length && pos + struct_size <= count) {
                      var id;
                      var type;
                      var name = stream.getdents[idx];
                      if (name === ".") {
                          id = stream.node.id;
                          type = 4
                      } else if (name === "..") {
                          var lookup = FS.lookupPath(stream.path, {
                              parent: true
                          });
                          id = lookup.node.id;
                          type = 4
                      } else {
                          var child = FS.lookupNode(stream.node, name);
                          id = child.id;
                          type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
                      }
                      assert(id);
                      tempI64 = [id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
                      tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
                      HEAP16[dirp + pos + 16 >> 1] = 280;
                      HEAP8[dirp + pos + 18] = type;
                      stringToUTF8(name, dirp + pos + 19, 256);
                      pos += struct_size;
                      idx += 1
                  }
                  FS.llseek(stream, idx * struct_size, 0);
                  return pos
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_getpeername(fd, addr, addrlen, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 0, 1, fd, addr, addrlen, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  if (!sock.daddr) {
                      return -53
                  }
                  var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport, addrlen);
                  assert(!errno);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_getsockname(fd, addr, addrlen, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 0, 1, fd, addr, addrlen, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport, addrlen);
                  assert(!errno);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 0, 1, fd, level, optname, optval, optlen, d1);
              try {
                  var sock = getSocketFromFD(fd);
                  if (level === 1) {
                      if (optname === 4) {
                          HEAP32[optval >> 2] = sock.error;
                          HEAP32[optlen >> 2] = 4;
                          sock.error = null;
                          return 0
                      }
                  }
                  return -50
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_ioctl(fd, op, varargs) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 0, 1, fd, op, varargs);
              SYSCALLS.varargs = varargs;
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  switch (op) {
                      case 21509: {
                          if (!stream.tty) return -59;
                          return 0
                      }
                      case 21505: {
                          if (!stream.tty) return -59;
                          if (stream.tty.ops.ioctl_tcgets) {
                              var termios = stream.tty.ops.ioctl_tcgets(stream);
                              var argp = SYSCALLS.getp();
                              HEAP32[argp >> 2] = termios.c_iflag || 0;
                              HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                              HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                              HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                              for (var i = 0; i < 32; i++) {
                                  HEAP8[argp + i + 17] = termios.c_cc[i] || 0
                              }
                              return 0
                          }
                          return 0
                      }
                      case 21510:
                      case 21511:
                      case 21512: {
                          if (!stream.tty) return -59;
                          return 0
                      }
                      case 21506:
                      case 21507:
                      case 21508: {
                          if (!stream.tty) return -59;
                          if (stream.tty.ops.ioctl_tcsets) {
                              var argp = SYSCALLS.getp();
                              var c_iflag = HEAP32[argp >> 2];
                              var c_oflag = HEAP32[argp + 4 >> 2];
                              var c_cflag = HEAP32[argp + 8 >> 2];
                              var c_lflag = HEAP32[argp + 12 >> 2];
                              var c_cc = [];
                              for (var i = 0; i < 32; i++) {
                                  c_cc.push(HEAP8[argp + i + 17])
                              }
                              return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                                  c_iflag: c_iflag,
                                  c_oflag: c_oflag,
                                  c_cflag: c_cflag,
                                  c_lflag: c_lflag,
                                  c_cc: c_cc
                              })
                          }
                          return 0
                      }
                      case 21519: {
                          if (!stream.tty) return -59;
                          var argp = SYSCALLS.getp();
                          HEAP32[argp >> 2] = 0;
                          return 0
                      }
                      case 21520: {
                          if (!stream.tty) return -59;
                          return -28
                      }
                      case 21531: {
                          var argp = SYSCALLS.getp();
                          return FS.ioctl(stream, op, argp)
                      }
                      case 21523: {
                          if (!stream.tty) return -59;
                          if (stream.tty.ops.ioctl_tiocgwinsz) {
                              var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                              var argp = SYSCALLS.getp();
                              HEAP16[argp >> 1] = winsize[0];
                              HEAP16[argp + 2 >> 1] = winsize[1]
                          }
                          return 0
                      }
                      case 21524: {
                          if (!stream.tty) return -59;
                          return 0
                      }
                      case 21515: {
                          if (!stream.tty) return -59;
                          return 0
                      }
                      default:
                          return -28
                  }
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_listen(fd, backlog) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 0, 1, fd, backlog);
              try {
                  var sock = getSocketFromFD(fd);
                  sock.sock_ops.listen(sock, backlog);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_lstat64(path, buf) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 0, 1, path, buf);
              try {
                  path = SYSCALLS.getStr(path);
                  return SYSCALLS.doStat(FS.lstat, path, buf)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_mkdirat(dirfd, path, mode) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 0, 1, dirfd, path, mode);
              try {
                  path = SYSCALLS.getStr(path);
                  path = SYSCALLS.calculateAt(dirfd, path);
                  path = PATH.normalize(path);
                  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
                  FS.mkdir(path, mode, 0);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_newfstatat(dirfd, path, buf, flags) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(23, 0, 1, dirfd, path, buf, flags);
              try {
                  path = SYSCALLS.getStr(path);
                  var nofollow = flags & 256;
                  var allowEmpty = flags & 4096;
                  flags = flags & ~6400;
                  assert(!flags, `unknown flags in __syscall_newfstatat: ${flags}`);
                  path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
                  return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_openat(dirfd, path, flags, varargs) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(24, 0, 1, dirfd, path, flags, varargs);
              SYSCALLS.varargs = varargs;
              try {
                  path = SYSCALLS.getStr(path);
                  path = SYSCALLS.calculateAt(dirfd, path);
                  var mode = varargs ? SYSCALLS.get() : 0;
                  return FS.open(path, flags, mode).fd
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var PIPEFS = {
              BUCKET_BUFFER_SIZE: 8192,
              mount(mount) {
                  return FS.createNode(null, "/", 16384 | 511, 0)
              },
              createPipe() {
                  var pipe = {
                      buckets: [],
                      refcnt: 2
                  };
                  pipe.buckets.push({
                      buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
                      offset: 0,
                      roffset: 0
                  });
                  var rName = PIPEFS.nextname();
                  var wName = PIPEFS.nextname();
                  var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
                  var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
                  rNode.pipe = pipe;
                  wNode.pipe = pipe;
                  var readableStream = FS.createStream({
                      path: rName,
                      node: rNode,
                      flags: 0,
                      seekable: false,
                      stream_ops: PIPEFS.stream_ops
                  });
                  rNode.stream = readableStream;
                  var writableStream = FS.createStream({
                      path: wName,
                      node: wNode,
                      flags: 1,
                      seekable: false,
                      stream_ops: PIPEFS.stream_ops
                  });
                  wNode.stream = writableStream;
                  return {
                      readable_fd: readableStream.fd,
                      writable_fd: writableStream.fd
                  }
              },
              stream_ops: {
                  poll(stream) {
                      var pipe = stream.node.pipe;
                      if ((stream.flags & 2097155) === 1) {
                          return 256 | 4
                      }
                      if (pipe.buckets.length > 0) {
                          for (var i = 0; i < pipe.buckets.length; i++) {
                              var bucket = pipe.buckets[i];
                              if (bucket.offset - bucket.roffset > 0) {
                                  return 64 | 1
                              }
                          }
                      }
                      return 0
                  },
                  ioctl(stream, request, varargs) {
                      return 28
                  },
                  fsync(stream) {
                      return 28
                  },
                  read(stream, buffer, offset, length, position) {
                      var pipe = stream.node.pipe;
                      var currentLength = 0;
                      for (var i = 0; i < pipe.buckets.length; i++) {
                          var bucket = pipe.buckets[i];
                          currentLength += bucket.offset - bucket.roffset
                      }
                      assert(buffer instanceof ArrayBuffer || buffer instanceof SharedArrayBuffer || ArrayBuffer.isView(buffer));
                      var data = buffer.subarray(offset, offset + length);
                      if (length <= 0) {
                          return 0
                      }
                      if (currentLength == 0) {
                          throw new FS.ErrnoError(6)
                      }
                      var toRead = Math.min(currentLength, length);
                      var totalRead = toRead;
                      var toRemove = 0;
                      for (var i = 0; i < pipe.buckets.length; i++) {
                          var currBucket = pipe.buckets[i];
                          var bucketSize = currBucket.offset - currBucket.roffset;
                          if (toRead <= bucketSize) {
                              var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
                              if (toRead < bucketSize) {
                                  tmpSlice = tmpSlice.subarray(0, toRead);
                                  currBucket.roffset += toRead
                              } else {
                                  toRemove++
                              }
                              data.set(tmpSlice);
                              break
                          } else {
                              var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
                              data.set(tmpSlice);
                              data = data.subarray(tmpSlice.byteLength);
                              toRead -= tmpSlice.byteLength;
                              toRemove++
                          }
                      }
                      if (toRemove && toRemove == pipe.buckets.length) {
                          toRemove--;
                          pipe.buckets[toRemove].offset = 0;
                          pipe.buckets[toRemove].roffset = 0
                      }
                      pipe.buckets.splice(0, toRemove);
                      return totalRead
                  },
                  write(stream, buffer, offset, length, position) {
                      var pipe = stream.node.pipe;
                      assert(buffer instanceof ArrayBuffer || buffer instanceof SharedArrayBuffer || ArrayBuffer.isView(buffer));
                      var data = buffer.subarray(offset, offset + length);
                      var dataLen = data.byteLength;
                      if (dataLen <= 0) {
                          return 0
                      }
                      var currBucket = null;
                      if (pipe.buckets.length == 0) {
                          currBucket = {
                              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
                              offset: 0,
                              roffset: 0
                          };
                          pipe.buckets.push(currBucket)
                      } else {
                          currBucket = pipe.buckets[pipe.buckets.length - 1]
                      }
                      assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
                      var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
                      if (freeBytesInCurrBuffer >= dataLen) {
                          currBucket.buffer.set(data, currBucket.offset);
                          currBucket.offset += dataLen;
                          return dataLen
                      } else if (freeBytesInCurrBuffer > 0) {
                          currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
                          currBucket.offset += freeBytesInCurrBuffer;
                          data = data.subarray(freeBytesInCurrBuffer, data.byteLength)
                      }
                      var numBuckets = data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE | 0;
                      var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
                      for (var i = 0; i < numBuckets; i++) {
                          var newBucket = {
                              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
                              offset: PIPEFS.BUCKET_BUFFER_SIZE,
                              roffset: 0
                          };
                          pipe.buckets.push(newBucket);
                          newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
                          data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength)
                      }
                      if (remElements > 0) {
                          var newBucket = {
                              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
                              offset: data.byteLength,
                              roffset: 0
                          };
                          pipe.buckets.push(newBucket);
                          newBucket.buffer.set(data)
                      }
                      return dataLen
                  },
                  close(stream) {
                      var pipe = stream.node.pipe;
                      pipe.refcnt--;
                      if (pipe.refcnt === 0) {
                          pipe.buckets = null
                      }
                  }
              },
              nextname() {
                  if (!PIPEFS.nextname.current) {
                      PIPEFS.nextname.current = 0
                  }
                  return "pipe[" + PIPEFS.nextname.current++ + "]"
              }
          };

          function ___syscall_pipe(fdPtr) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(25, 0, 1, fdPtr);
              try {
                  if (fdPtr == 0) {
                      throw new FS.ErrnoError(21)
                  }
                  var res = PIPEFS.createPipe();
                  HEAP32[fdPtr >> 2] = res.readable_fd;
                  HEAP32[fdPtr + 4 >> 2] = res.writable_fd;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_poll(fds, nfds, timeout) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(26, 0, 1, fds, nfds, timeout);
              try {
                  var nonzero = 0;
                  for (var i = 0; i < nfds; i++) {
                      var pollfd = fds + 8 * i;
                      var fd = HEAP32[pollfd >> 2];
                      var events = HEAP16[pollfd + 4 >> 1];
                      var mask = 32;
                      var stream = FS.getStream(fd);
                      if (stream) {
                          mask = SYSCALLS.DEFAULT_POLLMASK;
                          if (stream.stream_ops.poll) {
                              mask = stream.stream_ops.poll(stream, -1)
                          }
                      }
                      mask &= events | 8 | 16;
                      if (mask) nonzero++;
                      HEAP16[pollfd + 6 >> 1] = mask
                  }
                  return nonzero
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(27, 0, 1, fd, buf, len, flags, addr, addrlen);
              try {
                  var sock = getSocketFromFD(fd);
                  var msg = sock.sock_ops.recvmsg(sock, len);
                  if (!msg) return 0;
                  if (addr) {
                      var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen);
                      assert(!errno)
                  }
                  HEAPU8.set(msg.buffer, buf);
                  return msg.buffer.byteLength
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_recvmsg(fd, message, flags, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(28, 0, 1, fd, message, flags, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  var iov = HEAPU32[message + 8 >> 2];
                  var num = HEAP32[message + 12 >> 2];
                  var total = 0;
                  for (var i = 0; i < num; i++) {
                      total += HEAP32[iov + (8 * i + 4) >> 2]
                  }
                  var msg = sock.sock_ops.recvmsg(sock, total);
                  if (!msg) return 0;
                  var name = HEAPU32[message >> 2];
                  if (name) {
                      var errno = writeSockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
                      assert(!errno)
                  }
                  var bytesRead = 0;
                  var bytesRemaining = msg.buffer.byteLength;
                  for (var i = 0; bytesRemaining > 0 && i < num; i++) {
                      var iovbase = HEAPU32[iov + (8 * i + 0) >> 2];
                      var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                      if (!iovlen) {
                          continue
                      }
                      var length = Math.min(iovlen, bytesRemaining);
                      var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
                      HEAPU8.set(buf, iovbase + bytesRead);
                      bytesRead += length;
                      bytesRemaining -= length
                  }
                  return bytesRead
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(29, 0, 1, olddirfd, oldpath, newdirfd, newpath);
              try {
                  oldpath = SYSCALLS.getStr(oldpath);
                  newpath = SYSCALLS.getStr(newpath);
                  oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
                  newpath = SYSCALLS.calculateAt(newdirfd, newpath);
                  FS.rename(oldpath, newpath);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_rmdir(path) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(30, 0, 1, path);
              try {
                  path = SYSCALLS.getStr(path);
                  FS.rmdir(path);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_sendmsg(fd, message, flags, d1, d2, d3) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(31, 0, 1, fd, message, flags, d1, d2, d3);
              try {
                  var sock = getSocketFromFD(fd);
                  var iov = HEAPU32[message + 8 >> 2];
                  var num = HEAP32[message + 12 >> 2];
                  var addr, port;
                  var name = HEAPU32[message >> 2];
                  var namelen = HEAP32[message + 4 >> 2];
                  if (name) {
                      var info = readSockaddr(name, namelen);
                      if (info.errno) return -info.errno;
                      port = info.port;
                      addr = DNS.lookup_addr(info.addr) || info.addr
                  }
                  var total = 0;
                  for (var i = 0; i < num; i++) {
                      total += HEAP32[iov + (8 * i + 4) >> 2]
                  }
                  var view = new Uint8Array(total);
                  var offset = 0;
                  for (var i = 0; i < num; i++) {
                      var iovbase = HEAPU32[iov + (8 * i + 0) >> 2];
                      var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                      for (var j = 0; j < iovlen; j++) {
                          view[offset++] = HEAP8[iovbase + j]
                      }
                  }
                  return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(32, 0, 1, fd, message, length, flags, addr, addr_len);
              try {
                  var sock = getSocketFromFD(fd);
                  var dest = getSocketAddress(addr, addr_len, true);
                  if (!dest) {
                      return FS.write(sock.stream, HEAP8, message, length)
                  }
                  return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_socket(domain, type, protocol) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(33, 0, 1, domain, type, protocol);
              try {
                  var sock = SOCKFS.createSocket(domain, type, protocol);
                  assert(sock.stream.fd < 64);
                  return sock.stream.fd
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_stat64(path, buf) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(34, 0, 1, path, buf);
              try {
                  path = SYSCALLS.getStr(path);
                  return SYSCALLS.doStat(FS.stat, path, buf)
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function ___syscall_unlinkat(dirfd, path, flags) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(35, 0, 1, dirfd, path, flags);
              try {
                  path = SYSCALLS.getStr(path);
                  path = SYSCALLS.calculateAt(dirfd, path);
                  if (flags === 0) {
                      FS.unlink(path)
                  } else if (flags === 512) {
                      FS.rmdir(path)
                  } else {
                      abort("Invalid flags passed to unlinkat")
                  }
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {};
          var embind_init_charCodes = () => {
              var codes = new Array(256);
              for (var i = 0; i < 256; ++i) {
                  codes[i] = String.fromCharCode(i)
              }
              embind_charCodes = codes
          };
          var embind_charCodes;
          var readLatin1String = ptr => {
              var ret = "";
              var c = ptr;
              while (HEAPU8[c]) {
                  ret += embind_charCodes[HEAPU8[c++]]
              }
              return ret
          };
          var awaitingDependencies = {};
          var registeredTypes = {};
          var typeDependencies = {};
          var BindingError;
          var throwBindingError = message => {
              throw new BindingError(message)
          };
          var InternalError;
          var throwInternalError = message => {
              throw new InternalError(message)
          };

          function sharedRegisterType(rawType, registeredInstance, options = {}) {
              var name = registeredInstance.name;
              if (!rawType) {
                  throwBindingError(`type "${name}" must have a positive integer typeid pointer`)
              }
              if (registeredTypes.hasOwnProperty(rawType)) {
                  if (options.ignoreDuplicateRegistrations) {
                      return
                  } else {
                      throwBindingError(`Cannot register type '${name}' twice`)
                  }
              }
              registeredTypes[rawType] = registeredInstance;
              delete typeDependencies[rawType];
              if (awaitingDependencies.hasOwnProperty(rawType)) {
                  var callbacks = awaitingDependencies[rawType];
                  delete awaitingDependencies[rawType];
                  callbacks.forEach(cb => cb())
              }
          }

          function registerType(rawType, registeredInstance, options = {}) {
              if (!("argPackAdvance" in registeredInstance)) {
                  throw new TypeError("registerType registeredInstance requires argPackAdvance")
              }
              return sharedRegisterType(rawType, registeredInstance, options)
          }
          var GenericWireTypeSize = 8;
          var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
              name = readLatin1String(name);
              registerType(rawType, {
                  name: name,
                  "fromWireType": function(wt) {
                      return !!wt
                  },
                  "toWireType": function(destructors, o) {
                      return o ? trueValue : falseValue
                  },
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": function(pointer) {
                      return this["fromWireType"](HEAPU8[pointer])
                  },
                  destructorFunction: null
              })
          };
          var emval_freelist = [];
          var emval_handles = [];
          var __emval_decref = handle => {
              if (handle > 9 && 0 === --emval_handles[handle + 1]) {
                  assert(emval_handles[handle] !== undefined, `Decref for unallocated handle.`);
                  emval_handles[handle] = undefined;
                  emval_freelist.push(handle)
              }
          };
          var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;
          var init_emval = () => {
              emval_handles.push(0, 1, undefined, 1, null, 1, true, 1, false, 1);
              assert(emval_handles.length === 5 * 2);
              Module["count_emval_handles"] = count_emval_handles
          };
          var Emval = {
              toValue: handle => {
                  if (!handle) {
                      throwBindingError("Cannot use deleted val. handle = " + handle)
                  }
                  assert(handle === 2 || emval_handles[handle] !== undefined && handle % 2 === 0, `invalid handle: ${handle}`);
                  return emval_handles[handle]
              },
              toHandle: value => {
                  switch (value) {
                      case undefined:
                          return 2;
                      case null:
                          return 4;
                      case true:
                          return 6;
                      case false:
                          return 8;
                      default: {
                          const handle = emval_freelist.pop() || emval_handles.length;
                          emval_handles[handle] = value;
                          emval_handles[handle + 1] = 1;
                          return handle
                      }
                  }
              }
          };

          function readPointer(pointer) {
              return this["fromWireType"](HEAPU32[pointer >> 2])
          }
          var EmValType = {
              name: "emscripten::val",
              "fromWireType": handle => {
                  var rv = Emval.toValue(handle);
                  __emval_decref(handle);
                  return rv
              },
              "toWireType": (destructors, value) => Emval.toHandle(value),
              "argPackAdvance": GenericWireTypeSize,
              "readValueFromPointer": readPointer,
              destructorFunction: null
          };
          var __embind_register_emval = rawType => registerType(rawType, EmValType);
          var embindRepr = v => {
              if (v === null) {
                  return "null"
              }
              var t = typeof v;
              if (t === "object" || t === "array" || t === "function") {
                  return v.toString()
              } else {
                  return "" + v
              }
          };
          var floatReadValueFromPointer = (name, width) => {
              switch (width) {
                  case 4:
                      return function(pointer) {
                          return this["fromWireType"](HEAPF32[pointer >> 2])
                      };
                  case 8:
                      return function(pointer) {
                          return this["fromWireType"](HEAPF64[pointer >> 3])
                      };
                  default:
                      throw new TypeError(`invalid float width (${width}): ${name}`)
              }
          };
          var __embind_register_float = (rawType, name, size) => {
              name = readLatin1String(name);
              registerType(rawType, {
                  name: name,
                  "fromWireType": value => value,
                  "toWireType": (destructors, value) => {
                      if (typeof value != "number" && typeof value != "boolean") {
                          throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`)
                      }
                      return value
                  },
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": floatReadValueFromPointer(name, size),
                  destructorFunction: null
              })
          };
          var integerReadValueFromPointer = (name, width, signed) => {
              switch (width) {
                  case 1:
                      return signed ? pointer => HEAP8[pointer] : pointer => HEAPU8[pointer];
                  case 2:
                      return signed ? pointer => HEAP16[pointer >> 1] : pointer => HEAPU16[pointer >> 1];
                  case 4:
                      return signed ? pointer => HEAP32[pointer >> 2] : pointer => HEAPU32[pointer >> 2];
                  default:
                      throw new TypeError(`invalid integer width (${width}): ${name}`)
              }
          };
          var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
              name = readLatin1String(name);
              if (maxRange === -1) {
                  maxRange = 4294967295
              }
              var fromWireType = value => value;
              if (minRange === 0) {
                  var bitshift = 32 - 8 * size;
                  fromWireType = value => value << bitshift >>> bitshift
              }
              var isUnsignedType = name.includes("unsigned");
              var checkAssertions = (value, toTypeName) => {
                  if (typeof value != "number" && typeof value != "boolean") {
                      throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`)
                  }
                  if (value < minRange || value > maxRange) {
                      throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`)
                  }
              };
              var toWireType;
              if (isUnsignedType) {
                  toWireType = function(destructors, value) {
                      checkAssertions(value, this.name);
                      return value >>> 0
                  }
              } else {
                  toWireType = function(destructors, value) {
                      checkAssertions(value, this.name);
                      return value
                  }
              }
              registerType(primitiveType, {
                  name: name,
                  "fromWireType": fromWireType,
                  "toWireType": toWireType,
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0),
                  destructorFunction: null
              })
          };
          var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
              var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
              var TA = typeMapping[dataTypeIndex];

              function decodeMemoryView(handle) {
                  var size = HEAPU32[handle >> 2];
                  var data = HEAPU32[handle + 4 >> 2];
                  return new TA(HEAP8.buffer, data, size)
              }
              name = readLatin1String(name);
              registerType(rawType, {
                  name: name,
                  "fromWireType": decodeMemoryView,
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": decodeMemoryView
              }, {
                  ignoreDuplicateRegistrations: true
              })
          };
          var __embind_register_std_string = (rawType, name) => {
              name = readLatin1String(name);
              var stdStringIsUTF8 = name === "std::string";
              registerType(rawType, {
                  name: name,
                  "fromWireType"(value) {
                      var length = HEAPU32[value >> 2];
                      var payload = value + 4;
                      var str;
                      if (stdStringIsUTF8) {
                          var decodeStartPtr = payload;
                          for (var i = 0; i <= length; ++i) {
                              var currentBytePtr = payload + i;
                              if (i == length || HEAPU8[currentBytePtr] == 0) {
                                  var maxRead = currentBytePtr - decodeStartPtr;
                                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                                  if (str === undefined) {
                                      str = stringSegment
                                  } else {
                                      str += String.fromCharCode(0);
                                      str += stringSegment
                                  }
                                  decodeStartPtr = currentBytePtr + 1
                              }
                          }
                      } else {
                          var a = new Array(length);
                          for (var i = 0; i < length; ++i) {
                              a[i] = String.fromCharCode(HEAPU8[payload + i])
                          }
                          str = a.join("")
                      }
                      _free(value);
                      return str
                  },
                  "toWireType"(destructors, value) {
                      if (value instanceof ArrayBuffer) {
                          value = new Uint8Array(value)
                      }
                      var length;
                      var valueIsOfTypeString = typeof value == "string";
                      if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                          throwBindingError("Cannot pass non-string to std::string")
                      }
                      if (stdStringIsUTF8 && valueIsOfTypeString) {
                          length = lengthBytesUTF8(value)
                      } else {
                          length = value.length
                      }
                      var base = _malloc(4 + length + 1);
                      var ptr = base + 4;
                      HEAPU32[base >> 2] = length;
                      if (stdStringIsUTF8 && valueIsOfTypeString) {
                          stringToUTF8(value, ptr, length + 1)
                      } else {
                          if (valueIsOfTypeString) {
                              for (var i = 0; i < length; ++i) {
                                  var charCode = value.charCodeAt(i);
                                  if (charCode > 255) {
                                      _free(ptr);
                                      throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                                  }
                                  HEAPU8[ptr + i] = charCode
                              }
                          } else {
                              for (var i = 0; i < length; ++i) {
                                  HEAPU8[ptr + i] = value[i]
                              }
                          }
                      }
                      if (destructors !== null) {
                          destructors.push(_free, base)
                      }
                      return base
                  },
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": readPointer,
                  destructorFunction(ptr) {
                      _free(ptr)
                  }
              })
          };
          var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;
          var UTF16ToString = (ptr, maxBytesToRead) => {
              assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
              var endPtr = ptr;
              var idx = endPtr >> 1;
              var maxIdx = idx + maxBytesToRead / 2;
              while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
              endPtr = idx << 1;
              if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(HEAPU8.slice(ptr, endPtr));
              var str = "";
              for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
                  var codeUnit = HEAP16[ptr + i * 2 >> 1];
                  if (codeUnit == 0) break;
                  str += String.fromCharCode(codeUnit)
              }
              return str
          };
          var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
              assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
              assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
              maxBytesToWrite ??= 2147483647;
              if (maxBytesToWrite < 2) return 0;
              maxBytesToWrite -= 2;
              var startPtr = outPtr;
              var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
              for (var i = 0; i < numCharsToWrite; ++i) {
                  var codeUnit = str.charCodeAt(i);
                  HEAP16[outPtr >> 1] = codeUnit;
                  outPtr += 2
              }
              HEAP16[outPtr >> 1] = 0;
              return outPtr - startPtr
          };
          var lengthBytesUTF16 = str => str.length * 2;
          var UTF32ToString = (ptr, maxBytesToRead) => {
              assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
              var i = 0;
              var str = "";
              while (!(i >= maxBytesToRead / 4)) {
                  var utf32 = HEAP32[ptr + i * 4 >> 2];
                  if (utf32 == 0) break;
                  ++i;
                  if (utf32 >= 65536) {
                      var ch = utf32 - 65536;
                      str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                  } else {
                      str += String.fromCharCode(utf32)
                  }
              }
              return str
          };
          var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
              assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
              assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
              maxBytesToWrite ??= 2147483647;
              if (maxBytesToWrite < 4) return 0;
              var startPtr = outPtr;
              var endPtr = startPtr + maxBytesToWrite - 4;
              for (var i = 0; i < str.length; ++i) {
                  var codeUnit = str.charCodeAt(i);
                  if (codeUnit >= 55296 && codeUnit <= 57343) {
                      var trailSurrogate = str.charCodeAt(++i);
                      codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023
                  }
                  HEAP32[outPtr >> 2] = codeUnit;
                  outPtr += 4;
                  if (outPtr + 4 > endPtr) break
              }
              HEAP32[outPtr >> 2] = 0;
              return outPtr - startPtr
          };
          var lengthBytesUTF32 = str => {
              var len = 0;
              for (var i = 0; i < str.length; ++i) {
                  var codeUnit = str.charCodeAt(i);
                  if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
                  len += 4
              }
              return len
          };
          var __embind_register_std_wstring = (rawType, charSize, name) => {
              name = readLatin1String(name);
              var decodeString, encodeString, readCharAt, lengthBytesUTF;
              if (charSize === 2) {
                  decodeString = UTF16ToString;
                  encodeString = stringToUTF16;
                  lengthBytesUTF = lengthBytesUTF16;
                  readCharAt = pointer => HEAPU16[pointer >> 1]
              } else if (charSize === 4) {
                  decodeString = UTF32ToString;
                  encodeString = stringToUTF32;
                  lengthBytesUTF = lengthBytesUTF32;
                  readCharAt = pointer => HEAPU32[pointer >> 2]
              }
              registerType(rawType, {
                  name: name,
                  "fromWireType": value => {
                      var length = HEAPU32[value >> 2];
                      var str;
                      var decodeStartPtr = value + 4;
                      for (var i = 0; i <= length; ++i) {
                          var currentBytePtr = value + 4 + i * charSize;
                          if (i == length || readCharAt(currentBytePtr) == 0) {
                              var maxReadBytes = currentBytePtr - decodeStartPtr;
                              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                              if (str === undefined) {
                                  str = stringSegment
                              } else {
                                  str += String.fromCharCode(0);
                                  str += stringSegment
                              }
                              decodeStartPtr = currentBytePtr + charSize
                          }
                      }
                      _free(value);
                      return str
                  },
                  "toWireType": (destructors, value) => {
                      if (!(typeof value == "string")) {
                          throwBindingError(`Cannot pass non-string to C++ string type ${name}`)
                      }
                      var length = lengthBytesUTF(value);
                      var ptr = _malloc(4 + length + charSize);
                      HEAPU32[ptr >> 2] = length / charSize;
                      encodeString(value, ptr + 4, length + charSize);
                      if (destructors !== null) {
                          destructors.push(_free, ptr)
                      }
                      return ptr
                  },
                  "argPackAdvance": GenericWireTypeSize,
                  "readValueFromPointer": readPointer,
                  destructorFunction(ptr) {
                      _free(ptr)
                  }
              })
          };
          var __embind_register_void = (rawType, name) => {
              name = readLatin1String(name);
              registerType(rawType, {
                  isVoid: true,
                  name: name,
                  "argPackAdvance": 0,
                  "fromWireType": () => undefined,
                  "toWireType": (destructors, o) => undefined
              })
          };
          var nowIsMonotonic = 1;
          var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
          var maybeExit = () => {
              if (runtimeExited) {
                  return
              }
              if (!keepRuntimeAlive()) {
                  try {
                      if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
                      else _exit(EXITSTATUS)
                  } catch (e) {
                      handleException(e)
                  }
              }
          };
          var callUserCallback = func => {
              if (runtimeExited || ABORT) {
                  err("user callback triggered after runtime exited or application aborted.  Ignoring.");
                  return
              }
              try {
                  func();
                  maybeExit()
              } catch (e) {
                  handleException(e)
              }
          };
          var __emscripten_thread_mailbox_await = pthread_ptr => {
              if (typeof Atomics.waitAsync === "function") {
                  var wait = Atomics.waitAsync(HEAP32, pthread_ptr >> 2, pthread_ptr);
                  assert(wait.async);
                  wait.value.then(checkMailbox);
                  var waitingAsync = pthread_ptr + 128;
                  Atomics.store(HEAP32, waitingAsync >> 2, 1)
              }
          };
          Module["__emscripten_thread_mailbox_await"] = __emscripten_thread_mailbox_await;
          var checkMailbox = () => {
              var pthread_ptr = _pthread_self();
              if (pthread_ptr) {
                  __emscripten_thread_mailbox_await(pthread_ptr);
                  callUserCallback(__emscripten_check_mailbox)
              }
          };
          Module["checkMailbox"] = checkMailbox;
          var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
              if (targetThreadId == currThreadId) {
                  setTimeout(checkMailbox)
              } else if (ENVIRONMENT_IS_PTHREAD) {
                  postMessage({
                      "targetThread": targetThreadId,
                      "cmd": "checkMailbox"
                  })
              } else {
                  var worker = PThread.pthreads[targetThreadId];
                  if (!worker) {
                      err(`Cannot send message to thread with ID ${targetThreadId}, unknown thread ID!`);
                      return
                  }
                  worker.postMessage({
                      "cmd": "checkMailbox"
                  })
              }
          };
          var webgl_enable_ANGLE_instanced_arrays = ctx => {
              var ext = ctx.getExtension("ANGLE_instanced_arrays");
              if (ext) {
                  ctx["vertexAttribDivisor"] = (index, divisor) => ext["vertexAttribDivisorANGLE"](index, divisor);
                  ctx["drawArraysInstanced"] = (mode, first, count, primcount) => ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
                  ctx["drawElementsInstanced"] = (mode, count, type, indices, primcount) => ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
                  return 1
              }
          };
          var webgl_enable_OES_vertex_array_object = ctx => {
              var ext = ctx.getExtension("OES_vertex_array_object");
              if (ext) {
                  ctx["createVertexArray"] = () => ext["createVertexArrayOES"]();
                  ctx["deleteVertexArray"] = vao => ext["deleteVertexArrayOES"](vao);
                  ctx["bindVertexArray"] = vao => ext["bindVertexArrayOES"](vao);
                  ctx["isVertexArray"] = vao => ext["isVertexArrayOES"](vao);
                  return 1
              }
          };
          var webgl_enable_WEBGL_draw_buffers = ctx => {
              var ext = ctx.getExtension("WEBGL_draw_buffers");
              if (ext) {
                  ctx["drawBuffers"] = (n, bufs) => ext["drawBuffersWEBGL"](n, bufs);
                  return 1
              }
          };
          var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));
          var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));
          var webgl_enable_WEBGL_multi_draw = ctx => !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
          var getEmscriptenSupportedExtensions = ctx => {
              var supportedExtensions = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw"];
              return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext))
          };
          var GL = {
              counter: 1,
              buffers: [],
              programs: [],
              framebuffers: [],
              renderbuffers: [],
              textures: [],
              shaders: [],
              vaos: [],
              contexts: {},
              offscreenCanvases: {},
              queries: [],
              samplers: [],
              transformFeedbacks: [],
              syncs: [],
              stringCache: {},
              stringiCache: {},
              unpackAlignment: 4,
              recordError: errorCode => {
                  if (!GL.lastError) {
                      GL.lastError = errorCode
                  }
              },
              getNewId: table => {
                  var ret = GL.counter++;
                  for (var i = table.length; i < ret; i++) {
                      table[i] = null
                  }
                  return ret
              },
              genObject: (n, buffers, createFunction, objectTable) => {
                  for (var i = 0; i < n; i++) {
                      var buffer = GLctx[createFunction]();
                      var id = buffer && GL.getNewId(objectTable);
                      if (buffer) {
                          buffer.name = id;
                          objectTable[id] = buffer
                      } else {
                          GL.recordError(1282)
                      }
                      HEAP32[buffers + i * 4 >> 2] = id
                  }
              },
              getSource: (shader, count, string, length) => {
                  var source = "";
                  for (var i = 0; i < count; ++i) {
                      var len = length ? HEAPU32[length + i * 4 >> 2] : undefined;
                      source += UTF8ToString(HEAPU32[string + i * 4 >> 2], len)
                  }
                  return source
              },
              createContext: (canvas, webGLContextAttributes) => {
                  if (webGLContextAttributes.renderViaOffscreenBackBuffer) webGLContextAttributes["preserveDrawingBuffer"] = true;
                  if (!canvas.getContextSafariWebGL2Fixed) {
                      canvas.getContextSafariWebGL2Fixed = canvas.getContext;

                      function fixedGetContext(ver, attrs) {
                          var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
                          return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null
                      }
                      canvas.getContext = fixedGetContext
                  }
                  var ctx = webGLContextAttributes.majorVersion > 1 ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes);
                  if (!ctx) return 0;
                  var handle = GL.registerContext(ctx, webGLContextAttributes);
                  return handle
              },
              enableOffscreenFramebufferAttributes: webGLContextAttributes => {
                  webGLContextAttributes.renderViaOffscreenBackBuffer = true;
                  webGLContextAttributes.preserveDrawingBuffer = true
              },
              createOffscreenFramebuffer: context => {
                  var gl = context.GLctx;
                  var fbo = gl.createFramebuffer();
                  gl.bindFramebuffer(36160, fbo);
                  context.defaultFbo = fbo;
                  context.defaultFboForbidBlitFramebuffer = false;
                  if (gl.getContextAttributes().antialias) {
                      context.defaultFboForbidBlitFramebuffer = true
                  }
                  context.defaultColorTarget = gl.createTexture();
                  context.defaultDepthTarget = gl.createRenderbuffer();
                  GL.resizeOffscreenFramebuffer(context);
                  gl.bindTexture(3553, context.defaultColorTarget);
                  gl.texParameteri(3553, 10241, 9728);
                  gl.texParameteri(3553, 10240, 9728);
                  gl.texParameteri(3553, 10242, 33071);
                  gl.texParameteri(3553, 10243, 33071);
                  gl.texImage2D(3553, 0, 6408, gl.canvas.width, gl.canvas.height, 0, 6408, 5121, null);
                  gl.framebufferTexture2D(36160, 36064, 3553, context.defaultColorTarget, 0);
                  gl.bindTexture(3553, null);
                  var depthTarget = gl.createRenderbuffer();
                  gl.bindRenderbuffer(36161, context.defaultDepthTarget);
                  gl.renderbufferStorage(36161, 33189, gl.canvas.width, gl.canvas.height);
                  gl.framebufferRenderbuffer(36160, 36096, 36161, context.defaultDepthTarget);
                  gl.bindRenderbuffer(36161, null);
                  var vertices = [-1, -1, -1, 1, 1, -1, 1, 1];
                  var vb = gl.createBuffer();
                  gl.bindBuffer(34962, vb);
                  gl.bufferData(34962, new Float32Array(vertices), 35044);
                  gl.bindBuffer(34962, null);
                  context.blitVB = vb;
                  var vsCode = "attribute vec2 pos;" + "varying lowp vec2 tex;" + "void main() { tex = pos * 0.5 + vec2(0.5,0.5); gl_Position = vec4(pos, 0.0, 1.0); }";
                  var vs = gl.createShader(35633);
                  gl.shaderSource(vs, vsCode);
                  gl.compileShader(vs);
                  var fsCode = "varying lowp vec2 tex;" + "uniform sampler2D sampler;" + "void main() { gl_FragColor = texture2D(sampler, tex); }";
                  var fs = gl.createShader(35632);
                  gl.shaderSource(fs, fsCode);
                  gl.compileShader(fs);
                  var blitProgram = gl.createProgram();
                  gl.attachShader(blitProgram, vs);
                  gl.attachShader(blitProgram, fs);
                  gl.linkProgram(blitProgram);
                  context.blitProgram = blitProgram;
                  context.blitPosLoc = gl.getAttribLocation(blitProgram, "pos");
                  gl.useProgram(blitProgram);
                  gl.uniform1i(gl.getUniformLocation(blitProgram, "sampler"), 0);
                  gl.useProgram(null);
                  context.defaultVao = undefined;
                  if (gl.createVertexArray) {
                      context.defaultVao = gl.createVertexArray();
                      gl.bindVertexArray(context.defaultVao);
                      gl.enableVertexAttribArray(context.blitPosLoc);
                      gl.bindVertexArray(null)
                  }
              },
              resizeOffscreenFramebuffer: context => {
                  var gl = context.GLctx;
                  if (context.defaultColorTarget) {
                      var prevTextureBinding = gl.getParameter(32873);
                      gl.bindTexture(3553, context.defaultColorTarget);
                      gl.texImage2D(3553, 0, 6408, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, 6408, 5121, null);
                      gl.bindTexture(3553, prevTextureBinding)
                  }
                  if (context.defaultDepthTarget) {
                      var prevRenderBufferBinding = gl.getParameter(36007);
                      gl.bindRenderbuffer(36161, context.defaultDepthTarget);
                      gl.renderbufferStorage(36161, 33189, gl.drawingBufferWidth, gl.drawingBufferHeight);
                      gl.bindRenderbuffer(36161, prevRenderBufferBinding)
                  }
              },
              blitOffscreenFramebuffer: context => {
                  var gl = context.GLctx;
                  var prevScissorTest = gl.getParameter(3089);
                  if (prevScissorTest) gl.disable(3089);
                  var prevFbo = gl.getParameter(36006);
                  if (gl.blitFramebuffer && !context.defaultFboForbidBlitFramebuffer) {
                      gl.bindFramebuffer(36008, context.defaultFbo);
                      gl.bindFramebuffer(36009, null);
                      gl.blitFramebuffer(0, 0, gl.canvas.width, gl.canvas.height, 0, 0, gl.canvas.width, gl.canvas.height, 16384, 9728)
                  } else {
                      gl.bindFramebuffer(36160, null);
                      var prevProgram = gl.getParameter(35725);
                      gl.useProgram(context.blitProgram);
                      var prevVB = gl.getParameter(34964);
                      gl.bindBuffer(34962, context.blitVB);
                      var prevActiveTexture = gl.getParameter(34016);
                      gl.activeTexture(33984);
                      var prevTextureBinding = gl.getParameter(32873);
                      gl.bindTexture(3553, context.defaultColorTarget);
                      var prevBlend = gl.getParameter(3042);
                      if (prevBlend) gl.disable(3042);
                      var prevCullFace = gl.getParameter(2884);
                      if (prevCullFace) gl.disable(2884);
                      var prevDepthTest = gl.getParameter(2929);
                      if (prevDepthTest) gl.disable(2929);
                      var prevStencilTest = gl.getParameter(2960);
                      if (prevStencilTest) gl.disable(2960);

                      function draw() {
                          gl.vertexAttribPointer(context.blitPosLoc, 2, 5126, false, 0, 0);
                          gl.drawArrays(5, 0, 4)
                      }
                      if (context.defaultVao) {
                          var prevVAO = gl.getParameter(34229);
                          gl.bindVertexArray(context.defaultVao);
                          draw();
                          gl.bindVertexArray(prevVAO)
                      } else {
                          var prevVertexAttribPointer = {
                              buffer: gl.getVertexAttrib(context.blitPosLoc, 34975),
                              size: gl.getVertexAttrib(context.blitPosLoc, 34339),
                              stride: gl.getVertexAttrib(context.blitPosLoc, 34340),
                              type: gl.getVertexAttrib(context.blitPosLoc, 34341),
                              normalized: gl.getVertexAttrib(context.blitPosLoc, 34922),
                              pointer: gl.getVertexAttribOffset(context.blitPosLoc, 34373)
                          };
                          var maxVertexAttribs = gl.getParameter(34921);
                          var prevVertexAttribEnables = [];
                          for (var i = 0; i < maxVertexAttribs; ++i) {
                              var prevEnabled = gl.getVertexAttrib(i, 34338);
                              var wantEnabled = i == context.blitPosLoc;
                              if (prevEnabled && !wantEnabled) {
                                  gl.disableVertexAttribArray(i)
                              }
                              if (!prevEnabled && wantEnabled) {
                                  gl.enableVertexAttribArray(i)
                              }
                              prevVertexAttribEnables[i] = prevEnabled
                          }
                          draw();
                          for (var i = 0; i < maxVertexAttribs; ++i) {
                              var prevEnabled = prevVertexAttribEnables[i];
                              var nowEnabled = i == context.blitPosLoc;
                              if (prevEnabled && !nowEnabled) {
                                  gl.enableVertexAttribArray(i)
                              }
                              if (!prevEnabled && nowEnabled) {
                                  gl.disableVertexAttribArray(i)
                              }
                          }
                          gl.bindBuffer(34962, prevVertexAttribPointer.buffer);
                          gl.vertexAttribPointer(context.blitPosLoc, prevVertexAttribPointer.size, prevVertexAttribPointer.type, prevVertexAttribPointer.normalized, prevVertexAttribPointer.stride, prevVertexAttribPointer.offset)
                      }
                      if (prevStencilTest) gl.enable(2960);
                      if (prevDepthTest) gl.enable(2929);
                      if (prevCullFace) gl.enable(2884);
                      if (prevBlend) gl.enable(3042);
                      gl.bindTexture(3553, prevTextureBinding);
                      gl.activeTexture(prevActiveTexture);
                      gl.bindBuffer(34962, prevVB);
                      gl.useProgram(prevProgram)
                  }
                  gl.bindFramebuffer(36160, prevFbo);
                  if (prevScissorTest) gl.enable(3089)
              },
              registerContext: (ctx, webGLContextAttributes) => {
                  var handle = _malloc(8);
                  HEAPU32[handle + 4 >> 2] = _pthread_self();
                  var context = {
                      handle: handle,
                      attributes: webGLContextAttributes,
                      version: webGLContextAttributes.majorVersion,
                      GLctx: ctx
                  };
                  if (ctx.canvas) ctx.canvas.GLctxObject = context;
                  GL.contexts[handle] = context;
                  if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
                      GL.initExtensions(context)
                  }
                  if (webGLContextAttributes.renderViaOffscreenBackBuffer) GL.createOffscreenFramebuffer(context);
                  return handle
              },
              makeContextCurrent: contextHandle => {
                  GL.currentContext = GL.contexts[contextHandle];
                  Module.ctx = GLctx = GL.currentContext?.GLctx;
                  return !(contextHandle && !GLctx)
              },
              getContext: contextHandle => GL.contexts[contextHandle],
              deleteContext: contextHandle => {
                  if (GL.currentContext === GL.contexts[contextHandle]) {
                      GL.currentContext = null
                  }
                  if (typeof JSEvents == "object") {
                      JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas)
                  }
                  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
                      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined
                  }
                  _free(GL.contexts[contextHandle].handle);
                  GL.contexts[contextHandle] = null
              },
              initExtensions: context => {
                  context ||= GL.currentContext;
                  if (context.initExtensionsDone) return;
                  context.initExtensionsDone = true;
                  var GLctx = context.GLctx;
                  webgl_enable_ANGLE_instanced_arrays(GLctx);
                  webgl_enable_OES_vertex_array_object(GLctx);
                  webgl_enable_WEBGL_draw_buffers(GLctx);
                  webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
                  webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
                  if (context.version >= 2) {
                      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2")
                  }
                  if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
                      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query")
                  }
                  webgl_enable_WEBGL_multi_draw(GLctx);
                  getEmscriptenSupportedExtensions(GLctx).forEach(ext => {
                      if (!ext.includes("lose_context") && !ext.includes("debug")) {
                          GLctx.getExtension(ext)
                      }
                  })
              }
          };
          var __emscripten_proxied_gl_context_activated_from_main_browser_thread = contextHandle => {
              GLctx = Module.ctx = GL.currentContext = contextHandle;
              GL.currentContextIsProxied = true
          };
          var proxiedJSCallArgs = [];
          var __emscripten_receive_on_main_thread_js = (funcIndex, emAsmAddr, callingThread, numCallArgs, args) => {
              proxiedJSCallArgs.length = numCallArgs;
              var b = args >> 3;
              for (var i = 0; i < numCallArgs; i++) {
                  proxiedJSCallArgs[i] = HEAPF64[b + i]
              }
              var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
              assert(!(funcIndex && emAsmAddr));
              assert(func.length == numCallArgs, "Call args mismatch in _emscripten_receive_on_main_thread_js");
              PThread.currentProxiedOperationCallerThread = callingThread;
              var rtn = func(...proxiedJSCallArgs);
              PThread.currentProxiedOperationCallerThread = 0;
              assert(typeof rtn != "bigint");
              return rtn
          };

          function __emscripten_runtime_keepalive_clear() {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(36, 0, 1);
              noExitRuntime = false;
              runtimeKeepaliveCounter = 0
          }
          var __emscripten_thread_set_strongref = thread => {
              if (ENVIRONMENT_IS_NODE) {
                  PThread.pthreads[thread].ref()
              }
          };
          var __emscripten_throw_longjmp = () => {
              throw Infinity
          };
          var getTypeName = type => {
              var ptr = ___getTypeName(type);
              var rv = readLatin1String(ptr);
              _free(ptr);
              return rv
          };
          var requireRegisteredType = (rawType, humanName) => {
              var impl = registeredTypes[rawType];
              if (undefined === impl) {
                  throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`)
              }
              return impl
          };
          var emval_returnValue = (returnType, destructorsRef, handle) => {
              var destructors = [];
              var result = returnType["toWireType"](destructors, handle);
              if (destructors.length) {
                  HEAPU32[destructorsRef >> 2] = Emval.toHandle(destructors)
              }
              return result
          };
          var __emval_as = (handle, returnType, destructorsRef) => {
              handle = Emval.toValue(handle);
              returnType = requireRegisteredType(returnType, "emval::as");
              return emval_returnValue(returnType, destructorsRef, handle)
          };
          var emval_methodCallers = [];
          var __emval_call = (caller, handle, destructorsRef, args) => {
              caller = emval_methodCallers[caller];
              handle = Emval.toValue(handle);
              return caller(null, handle, destructorsRef, args)
          };
          var emval_symbols = {};
          var getStringOrSymbol = address => {
              var symbol = emval_symbols[address];
              if (symbol === undefined) {
                  return readLatin1String(address)
              }
              return symbol
          };
          var __emval_call_method = (caller, objHandle, methodName, destructorsRef, args) => {
              caller = emval_methodCallers[caller];
              objHandle = Emval.toValue(objHandle);
              methodName = getStringOrSymbol(methodName);
              return caller(objHandle, objHandle[methodName], destructorsRef, args)
          };
          var emval_get_global = () => {
              if (typeof globalThis == "object") {
                  return globalThis
              }
              return function() {
                  return Function
              }()("return this")()
          };
          var __emval_get_global = name => {
              if (name === 0) {
                  return Emval.toHandle(emval_get_global())
              } else {
                  name = getStringOrSymbol(name);
                  return Emval.toHandle(emval_get_global()[name])
              }
          };
          var emval_addMethodCaller = caller => {
              var id = emval_methodCallers.length;
              emval_methodCallers.push(caller);
              return id
          };
          var emval_lookupTypes = (argCount, argTypes) => {
              var a = new Array(argCount);
              for (var i = 0; i < argCount; ++i) {
                  a[i] = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i)
              }
              return a
          };
          var createNamedFunction = (name, body) => Object.defineProperty(body, "name", {
              value: name
          });
          var reflectConstruct = Reflect.construct;

          function newFunc(constructor, argumentList) {
              if (!(constructor instanceof Function)) {
                  throw new TypeError(`new_ called with constructor type ${typeof constructor} which is not a function`)
              }
              var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {});
              dummy.prototype = constructor.prototype;
              var obj = new dummy;
              var r = constructor.apply(obj, argumentList);
              return r instanceof Object ? r : obj
          }
          var __emval_get_method_caller = (argCount, argTypes, kind) => {
              var types = emval_lookupTypes(argCount, argTypes);
              var retType = types.shift();
              argCount--;
              var functionBody = `return function (obj, func, destructorsRef, args) {\n`;
              var offset = 0;
              var argsList = [];
              if (kind === 0) {
                  argsList.push("obj")
              }
              var params = ["retType"];
              var args = [retType];
              for (var i = 0; i < argCount; ++i) {
                  argsList.push("arg" + i);
                  params.push("argType" + i);
                  args.push(types[i]);
                  functionBody += `  var arg${i} = argType${i}.readValueFromPointer(args${offset?"+"+offset:""});\n`;
                  offset += types[i]["argPackAdvance"]
              }
              var invoker = kind === 1 ? "new func" : "func.call";
              functionBody += `  var rv = ${invoker}(${argsList.join(", ")});\n`;
              if (!retType.isVoid) {
                  params.push("emval_returnValue");
                  args.push(emval_returnValue);
                  functionBody += "  return emval_returnValue(retType, destructorsRef, rv);\n"
              }
              functionBody += "};\n";
              params.push(functionBody);
              var invokerFunction = newFunc(Function, params)(...args);
              var functionName = `methodCaller<(${types.map(t=>t.name).join(", ")}) => ${retType.name}>`;
              return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction))
          };
          var __emval_get_property = (handle, key) => {
              handle = Emval.toValue(handle);
              key = Emval.toValue(key);
              return Emval.toHandle(handle[key])
          };
          var __emval_incref = handle => {
              if (handle > 9) {
                  emval_handles[handle + 1] += 1
              }
          };
          var __emval_new_array = () => Emval.toHandle([]);
          var __emval_new_cstring = v => Emval.toHandle(getStringOrSymbol(v));
          var __emval_new_object = () => Emval.toHandle({});
          var runDestructors = destructors => {
              while (destructors.length) {
                  var ptr = destructors.pop();
                  var del = destructors.pop();
                  del(ptr)
              }
          };
          var __emval_run_destructors = handle => {
              var destructors = Emval.toValue(handle);
              runDestructors(destructors);
              __emval_decref(handle)
          };
          var __emval_set_property = (handle, key, value) => {
              handle = Emval.toValue(handle);
              key = Emval.toValue(key);
              value = Emval.toValue(value);
              handle[key] = value
          };
          var __emval_take_value = (type, arg) => {
              type = requireRegisteredType(type, "_emval_take_value");
              var v = type["readValueFromPointer"](arg);
              return Emval.toHandle(v)
          };

          function __gmtime_js(time_low, time_high, tmPtr) {
              var time = convertI32PairToI53Checked(time_low, time_high);
              var date = new Date(time * 1e3);
              HEAP32[tmPtr >> 2] = date.getUTCSeconds();
              HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
              HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
              HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
              HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
              HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
              HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
              var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
              var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
              HEAP32[tmPtr + 28 >> 2] = yday
          }
          var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
          var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
          var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
          var ydayFromDate = date => {
              var leap = isLeapYear(date.getFullYear());
              var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
              var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
              return yday
          };

          function __localtime_js(time_low, time_high, tmPtr) {
              var time = convertI32PairToI53Checked(time_low, time_high);
              var date = new Date(time * 1e3);
              HEAP32[tmPtr >> 2] = date.getSeconds();
              HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
              HEAP32[tmPtr + 8 >> 2] = date.getHours();
              HEAP32[tmPtr + 12 >> 2] = date.getDate();
              HEAP32[tmPtr + 16 >> 2] = date.getMonth();
              HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
              HEAP32[tmPtr + 24 >> 2] = date.getDay();
              var yday = ydayFromDate(date) | 0;
              HEAP32[tmPtr + 28 >> 2] = yday;
              HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
              var start = new Date(date.getFullYear(), 0, 1);
              var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
              var winterOffset = start.getTimezoneOffset();
              var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
              HEAP32[tmPtr + 32 >> 2] = dst
          }
          var __mktime_js = function(tmPtr) {
              var ret = (() => {
                  var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
                  var dst = HEAP32[tmPtr + 32 >> 2];
                  var guessedOffset = date.getTimezoneOffset();
                  var start = new Date(date.getFullYear(), 0, 1);
                  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                  var winterOffset = start.getTimezoneOffset();
                  var dstOffset = Math.min(winterOffset, summerOffset);
                  if (dst < 0) {
                      HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
                  } else if (dst > 0 != (dstOffset == guessedOffset)) {
                      var nonDstOffset = Math.max(winterOffset, summerOffset);
                      var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
                      date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
                  }
                  HEAP32[tmPtr + 24 >> 2] = date.getDay();
                  var yday = ydayFromDate(date) | 0;
                  HEAP32[tmPtr + 28 >> 2] = yday;
                  HEAP32[tmPtr >> 2] = date.getSeconds();
                  HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                  HEAP32[tmPtr + 8 >> 2] = date.getHours();
                  HEAP32[tmPtr + 12 >> 2] = date.getDate();
                  HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                  HEAP32[tmPtr + 20 >> 2] = date.getYear();
                  var timeMs = date.getTime();
                  if (isNaN(timeMs)) {
                      return -1
                  }
                  return timeMs / 1e3
              })();
              return setTempRet0((tempDouble = ret, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)), ret >>> 0
          };

          function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(37, 0, 1, len, prot, flags, fd, offset_low, offset_high, allocated, addr);
              var offset = convertI32PairToI53Checked(offset_low, offset_high);
              try {
                  if (isNaN(offset)) return 61;
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  var res = FS.mmap(stream, len, offset, prot, flags);
                  var ptr = res.ptr;
                  HEAP32[allocated >> 2] = res.allocated;
                  HEAPU32[addr >> 2] = ptr;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }

          function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(38, 0, 1, addr, len, prot, flags, fd, offset_low, offset_high);
              var offset = convertI32PairToI53Checked(offset_low, offset_high);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  if (prot & 2) {
                      SYSCALLS.doMsync(addr, stream, len, flags, offset)
                  }
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return -e.errno
              }
          }
          var __timegm_js = function(tmPtr) {
              var ret = (() => {
                  var time = Date.UTC(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
                  var date = new Date(time);
                  HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
                  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
                  var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
                  HEAP32[tmPtr + 28 >> 2] = yday;
                  return date.getTime() / 1e3
              })();
              return setTempRet0((tempDouble = ret, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)), ret >>> 0
          };
          var __tzset_js = (timezone, daylight, std_name, dst_name) => {
              var currentYear = (new Date).getFullYear();
              var winter = new Date(currentYear, 0, 1);
              var summer = new Date(currentYear, 6, 1);
              var winterOffset = winter.getTimezoneOffset();
              var summerOffset = summer.getTimezoneOffset();
              var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
              HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
              HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

              function extractZone(date) {
                  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                  return match ? match[1] : "GMT"
              }
              var winterName = extractZone(winter);
              var summerName = extractZone(summer);
              if (summerOffset < winterOffset) {
                  stringToUTF8(winterName, std_name, 7);
                  stringToUTF8(summerName, dst_name, 7)
              } else {
                  stringToUTF8(winterName, dst_name, 7);
                  stringToUTF8(summerName, std_name, 7)
              }
          };
          var _abort = () => {
              abort("native code called abort()")
          };
          var runtimeKeepalivePush = () => {
              runtimeKeepaliveCounter += 1
          };
          var _emscripten_set_main_loop_timing = (mode, value) => {
              Browser.mainLoop.timingMode = mode;
              Browser.mainLoop.timingValue = value;
              if (!Browser.mainLoop.func) {
                  err("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
                  return 1
              }
              if (!Browser.mainLoop.running) {
                  runtimeKeepalivePush();
                  Browser.mainLoop.running = true
              }
              if (mode == 0) {
                  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
                      var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
                      setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
                  };
                  Browser.mainLoop.method = "timeout"
              } else if (mode == 1) {
                  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
                      Browser.requestAnimationFrame(Browser.mainLoop.runner)
                  };
                  Browser.mainLoop.method = "rAF"
              } else if (mode == 2) {
                  if (typeof Browser.setImmediate == "undefined") {
                      if (typeof setImmediate == "undefined") {
                          var setImmediates = [];
                          var emscriptenMainLoopMessageId = "setimmediate";
                          var Browser_setImmediate_messageHandler = event => {
                              if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                                  event.stopPropagation();
                                  setImmediates.shift()()
                              }
                          };
                          addEventListener("message", Browser_setImmediate_messageHandler, true);
                          Browser.setImmediate = function Browser_emulated_setImmediate(func) {
                              setImmediates.push(func);
                              if (ENVIRONMENT_IS_WORKER) {
                                  if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
                                  Module["setImmediates"].push(func);
                                  postMessage({
                                      target: emscriptenMainLoopMessageId
                                  })
                              } else postMessage(emscriptenMainLoopMessageId, "*")
                          }
                      } else {
                          Browser.setImmediate = setImmediate
                      }
                  }
                  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
                      Browser.setImmediate(Browser.mainLoop.runner)
                  };
                  Browser.mainLoop.method = "immediate"
              }
              return 0
          };
          var _emscripten_get_now;
          _emscripten_get_now = () => performance.timeOrigin + performance.now();
          var runtimeKeepalivePop = () => {
              assert(runtimeKeepaliveCounter > 0);
              runtimeKeepaliveCounter -= 1
          };
          var setMainLoop = (browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
              assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
              Browser.mainLoop.func = browserIterationFunc;
              Browser.mainLoop.arg = arg;
              var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;

              function checkIsRunning() {
                  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
                      runtimeKeepalivePop();
                      maybeExit();
                      return false
                  }
                  return true
              }
              Browser.mainLoop.running = false;
              Browser.mainLoop.runner = function Browser_mainLoop_runner() {
                  if (ABORT) return;
                  if (Browser.mainLoop.queue.length > 0) {
                      var start = Date.now();
                      var blocker = Browser.mainLoop.queue.shift();
                      blocker.func(blocker.arg);
                      if (Browser.mainLoop.remainingBlockers) {
                          var remaining = Browser.mainLoop.remainingBlockers;
                          var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                          if (blocker.counted) {
                              Browser.mainLoop.remainingBlockers = next
                          } else {
                              next = next + .5;
                              Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                          }
                      }
                      Browser.mainLoop.updateStatus();
                      if (!checkIsRunning()) return;
                      setTimeout(Browser.mainLoop.runner, 0);
                      return
                  }
                  if (!checkIsRunning()) return;
                  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
                  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
                      Browser.mainLoop.scheduler();
                      return
                  } else if (Browser.mainLoop.timingMode == 0) {
                      Browser.mainLoop.tickStartTime = _emscripten_get_now()
                  }
                  if (typeof GL != "undefined" && GL.currentContext && !GL.currentContextIsProxied && !GL.currentContext.attributes.explicitSwapControl && GL.currentContext.GLctx.commit) {
                      GL.currentContext.GLctx.commit()
                  }
                  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
                      warnOnce("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
                      Browser.mainLoop.method = ""
                  }
                  Browser.mainLoop.runIter(browserIterationFunc);
                  checkStackCookie();
                  if (!checkIsRunning()) return;
                  if (typeof SDL == "object") SDL.audio?.queueNewAudioData?.();
                  Browser.mainLoop.scheduler()
              };
              if (!noSetTiming) {
                  if (fps && fps > 0) {
                      _emscripten_set_main_loop_timing(0, 1e3 / fps)
                  } else {
                      _emscripten_set_main_loop_timing(1, 1)
                  }
                  Browser.mainLoop.scheduler()
              }
              if (simulateInfiniteLoop) {
                  throw "unwind"
              }
          };
          var safeSetTimeout = (func, timeout) => {
              runtimeKeepalivePush();
              return setTimeout(() => {
                  runtimeKeepalivePop();
                  callUserCallback(func)
              }, timeout)
          };
          var Browser = {
              mainLoop: {
                  running: false,
                  scheduler: null,
                  method: "",
                  currentlyRunningMainloop: 0,
                  func: null,
                  arg: 0,
                  timingMode: 0,
                  timingValue: 0,
                  currentFrameNumber: 0,
                  queue: [],
                  pause() {
                      Browser.mainLoop.scheduler = null;
                      Browser.mainLoop.currentlyRunningMainloop++
                  },
                  resume() {
                      Browser.mainLoop.currentlyRunningMainloop++;
                      var timingMode = Browser.mainLoop.timingMode;
                      var timingValue = Browser.mainLoop.timingValue;
                      var func = Browser.mainLoop.func;
                      Browser.mainLoop.func = null;
                      setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
                      _emscripten_set_main_loop_timing(timingMode, timingValue);
                      Browser.mainLoop.scheduler()
                  },
                  updateStatus() {
                      if (Module["setStatus"]) {
                          var message = Module["statusMessage"] || "Please wait...";
                          var remaining = Browser.mainLoop.remainingBlockers;
                          var expected = Browser.mainLoop.expectedBlockers;
                          if (remaining) {
                              if (remaining < expected) {
                                  Module["setStatus"](`{message} ({expected - remaining}/{expected})`)
                              } else {
                                  Module["setStatus"](message)
                              }
                          } else {
                              Module["setStatus"]("")
                          }
                      }
                  },
                  runIter(func) {
                      if (ABORT) return;
                      if (Module["preMainLoop"]) {
                          var preRet = Module["preMainLoop"]();
                          if (preRet === false) {
                              return
                          }
                      }
                      callUserCallback(func);
                      Module["postMainLoop"]?.()
                  }
              },
              isFullscreen: false,
              pointerLock: false,
              moduleContextCreatedCallbacks: [],
              workers: [],
              init() {
                  if (Browser.initted) return;
                  Browser.initted = true;
                  var imagePlugin = {};
                  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
                      return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
                  };
                  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
                      var b = new Blob([byteArray], {
                          type: Browser.getMimetype(name)
                      });
                      if (b.size !== byteArray.length) {
                          b = new Blob([new Uint8Array(byteArray).buffer], {
                              type: Browser.getMimetype(name)
                          })
                      }
                      var url = URL.createObjectURL(b);
                      assert(typeof url == "string", "createObjectURL must return a url as a string");
                      var img = new Image;
                      img.onload = () => {
                          assert(img.complete, `Image ${name} could not be decoded`);
                          var canvas = document.createElement("canvas");
                          canvas.width = img.width;
                          canvas.height = img.height;
                          var ctx = canvas.getContext("2d");
                          ctx.drawImage(img, 0, 0);
                          preloadedImages[name] = canvas;
                          URL.revokeObjectURL(url);
                          onload?.(byteArray)
                      };
                      img.onerror = event => {
                          err(`Image ${url} could not be decoded`);
                          onerror?.()
                      };
                      img.src = url
                  };
                  preloadPlugins.push(imagePlugin);
                  var audioPlugin = {};
                  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
                      return !Module.noAudioDecoding && name.substr(-4) in {
                          ".ogg": 1,
                          ".wav": 1,
                          ".mp3": 1
                      }
                  };
                  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
                      var done = false;

                      function finish(audio) {
                          if (done) return;
                          done = true;
                          preloadedAudios[name] = audio;
                          onload?.(byteArray)
                      }
                      var b = new Blob([byteArray], {
                          type: Browser.getMimetype(name)
                      });
                      var url = URL.createObjectURL(b);
                      assert(typeof url == "string", "createObjectURL must return a url as a string");
                      var audio = new Audio;
                      audio.addEventListener("canplaythrough", () => finish(audio), false);
                      audio.onerror = function audio_onerror(event) {
                          if (done) return;
                          err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);

                          function encode64(data) {
                              var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                              var PAD = "=";
                              var ret = "";
                              var leftchar = 0;
                              var leftbits = 0;
                              for (var i = 0; i < data.length; i++) {
                                  leftchar = leftchar << 8 | data[i];
                                  leftbits += 8;
                                  while (leftbits >= 6) {
                                      var curr = leftchar >> leftbits - 6 & 63;
                                      leftbits -= 6;
                                      ret += BASE[curr]
                                  }
                              }
                              if (leftbits == 2) {
                                  ret += BASE[(leftchar & 3) << 4];
                                  ret += PAD + PAD
                              } else if (leftbits == 4) {
                                  ret += BASE[(leftchar & 15) << 2];
                                  ret += PAD
                              }
                              return ret
                          }
                          audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                          finish(audio)
                      };
                      audio.src = url;
                      safeSetTimeout(() => {
                          finish(audio)
                      }, 1e4)
                  };
                  preloadPlugins.push(audioPlugin);

                  function pointerLockChange() {
                      Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"]
                  }
                  var canvas = Module["canvas"];
                  if (canvas) {
                      canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (() => {});
                      canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (() => {});
                      canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
                      document.addEventListener("pointerlockchange", pointerLockChange, false);
                      document.addEventListener("mozpointerlockchange", pointerLockChange, false);
                      document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
                      document.addEventListener("mspointerlockchange", pointerLockChange, false);
                      if (Module["elementPointerLock"]) {
                          canvas.addEventListener("click", ev => {
                              if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                                  Module["canvas"].requestPointerLock();
                                  ev.preventDefault()
                              }
                          }, false)
                      }
                  }
              },
              createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
                  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
                  var ctx;
                  var contextHandle;
                  if (useWebGL) {
                      var contextAttributes = {
                          antialias: false,
                          alpha: false,
                          majorVersion: typeof WebGL2RenderingContext != "undefined" ? 2 : 1
                      };
                      if (webGLContextAttributes) {
                          for (var attribute in webGLContextAttributes) {
                              contextAttributes[attribute] = webGLContextAttributes[attribute]
                          }
                      }
                      if (typeof GL != "undefined") {
                          contextHandle = GL.createContext(canvas, contextAttributes);
                          if (contextHandle) {
                              ctx = GL.getContext(contextHandle).GLctx
                          }
                      }
                  } else {
                      ctx = canvas.getContext("2d")
                  }
                  if (!ctx) return null;
                  if (setInModule) {
                      if (!useWebGL) assert(typeof GLctx == "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
                      Module.ctx = ctx;
                      if (useWebGL) GL.makeContextCurrent(contextHandle);
                      Module.useWebGL = useWebGL;
                      Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
                      Browser.init()
                  }
                  return ctx
              },
              destroyContext(canvas, useWebGL, setInModule) {},
              fullscreenHandlersInstalled: false,
              lockPointer: undefined,
              resizeCanvas: undefined,
              requestFullscreen(lockPointer, resizeCanvas) {
                  Browser.lockPointer = lockPointer;
                  Browser.resizeCanvas = resizeCanvas;
                  if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
                  if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
                  var canvas = Module["canvas"];

                  function fullscreenChange() {
                      Browser.isFullscreen = false;
                      var canvasContainer = canvas.parentNode;
                      if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                          canvas.exitFullscreen = Browser.exitFullscreen;
                          if (Browser.lockPointer) canvas.requestPointerLock();
                          Browser.isFullscreen = true;
                          if (Browser.resizeCanvas) {
                              Browser.setFullscreenCanvasSize()
                          } else {
                              Browser.updateCanvasDimensions(canvas)
                          }
                      } else {
                          canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                          canvasContainer.parentNode.removeChild(canvasContainer);
                          if (Browser.resizeCanvas) {
                              Browser.setWindowedCanvasSize()
                          } else {
                              Browser.updateCanvasDimensions(canvas)
                          }
                      }
                      Module["onFullScreen"]?.(Browser.isFullscreen);
                      Module["onFullscreen"]?.(Browser.isFullscreen)
                  }
                  if (!Browser.fullscreenHandlersInstalled) {
                      Browser.fullscreenHandlersInstalled = true;
                      document.addEventListener("fullscreenchange", fullscreenChange, false);
                      document.addEventListener("mozfullscreenchange", fullscreenChange, false);
                      document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
                      document.addEventListener("MSFullscreenChange", fullscreenChange, false)
                  }
                  var canvasContainer = document.createElement("div");
                  canvas.parentNode.insertBefore(canvasContainer, canvas);
                  canvasContainer.appendChild(canvas);
                  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
                  canvasContainer.requestFullscreen()
              },
              requestFullScreen() {
                  abort("Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)")
              },
              exitFullscreen() {
                  if (!Browser.isFullscreen) {
                      return false
                  }
                  var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => {});
                  CFS.apply(document, []);
                  return true
              },
              nextRAF: 0,
              fakeRequestAnimationFrame(func) {
                  var now = Date.now();
                  if (Browser.nextRAF === 0) {
                      Browser.nextRAF = now + 1e3 / 60
                  } else {
                      while (now + 2 >= Browser.nextRAF) {
                          Browser.nextRAF += 1e3 / 60
                      }
                  }
                  var delay = Math.max(Browser.nextRAF - now, 0);
                  setTimeout(func, delay)
              },
              requestAnimationFrame(func) {
                  if (typeof requestAnimationFrame == "function") {
                      requestAnimationFrame(func);
                      return
                  }
                  var RAF = Browser.fakeRequestAnimationFrame;
                  RAF(func)
              },
              safeSetTimeout(func, timeout) {
                  return safeSetTimeout(func, timeout)
              },
              safeRequestAnimationFrame(func) {
                  runtimeKeepalivePush();
                  return Browser.requestAnimationFrame(() => {
                      runtimeKeepalivePop();
                      callUserCallback(func)
                  })
              },
              getMimetype(name) {
                  return {
                      "jpg": "image/jpeg",
                      "jpeg": "image/jpeg",
                      "png": "image/png",
                      "bmp": "image/bmp",
                      "ogg": "audio/ogg",
                      "wav": "audio/wav",
                      "mp3": "audio/mpeg"
                  } [name.substr(name.lastIndexOf(".") + 1)]
              },
              getUserMedia(func) {
                  window.getUserMedia ||= navigator["getUserMedia"] || navigator["mozGetUserMedia"];
                  window.getUserMedia(func)
              },
              getMovementX(event) {
                  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
              },
              getMovementY(event) {
                  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
              },
              getMouseWheelDelta(event) {
                  var delta = 0;
                  switch (event.type) {
                      case "DOMMouseScroll":
                          delta = event.detail / 3;
                          break;
                      case "mousewheel":
                          delta = event.wheelDelta / 120;
                          break;
                      case "wheel":
                          delta = event.deltaY;
                          switch (event.deltaMode) {
                              case 0:
                                  delta /= 100;
                                  break;
                              case 1:
                                  delta /= 3;
                                  break;
                              case 2:
                                  delta *= 80;
                                  break;
                              default:
                                  throw "unrecognized mouse wheel delta mode: " + event.deltaMode
                          }
                          break;
                      default:
                          throw "unrecognized mouse wheel event: " + event.type
                  }
                  return delta
              },
              mouseX: 0,
              mouseY: 0,
              mouseMovementX: 0,
              mouseMovementY: 0,
              touches: {},
              lastTouches: {},
              calculateMouseCoords(pageX, pageY) {
                  var rect = Module["canvas"].getBoundingClientRect();
                  var cw = Module["canvas"].width;
                  var ch = Module["canvas"].height;
                  var scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
                  var scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
                  assert(typeof scrollX != "undefined" && typeof scrollY != "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
                  var adjustedX = pageX - (scrollX + rect.left);
                  var adjustedY = pageY - (scrollY + rect.top);
                  adjustedX = adjustedX * (cw / rect.width);
                  adjustedY = adjustedY * (ch / rect.height);
                  return {
                      x: adjustedX,
                      y: adjustedY
                  }
              },
              setMouseCoords(pageX, pageY) {
                  const {
                      x: x,
                      y: y
                  } = Browser.calculateMouseCoords(pageX, pageY);
                  Browser.mouseMovementX = x - Browser.mouseX;
                  Browser.mouseMovementY = y - Browser.mouseY;
                  Browser.mouseX = x;
                  Browser.mouseY = y
              },
              calculateMouseEvent(event) {
                  if (Browser.pointerLock) {
                      if (event.type != "mousemove" && "mozMovementX" in event) {
                          Browser.mouseMovementX = Browser.mouseMovementY = 0
                      } else {
                          Browser.mouseMovementX = Browser.getMovementX(event);
                          Browser.mouseMovementY = Browser.getMovementY(event)
                      }
                      if (typeof SDL != "undefined") {
                          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
                      } else {
                          Browser.mouseX += Browser.mouseMovementX;
                          Browser.mouseY += Browser.mouseMovementY
                      }
                  } else {
                      if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                          var touch = event.touch;
                          if (touch === undefined) {
                              return
                          }
                          var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
                          if (event.type === "touchstart") {
                              Browser.lastTouches[touch.identifier] = coords;
                              Browser.touches[touch.identifier] = coords
                          } else if (event.type === "touchend" || event.type === "touchmove") {
                              var last = Browser.touches[touch.identifier];
                              last ||= coords;
                              Browser.lastTouches[touch.identifier] = last;
                              Browser.touches[touch.identifier] = coords
                          }
                          return
                      }
                      Browser.setMouseCoords(event.pageX, event.pageY)
                  }
              },
              resizeListeners: [],
              updateResizeListeners() {
                  var canvas = Module["canvas"];
                  Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height))
              },
              setCanvasSize(width, height, noUpdates) {
                  var canvas = Module["canvas"];
                  Browser.updateCanvasDimensions(canvas, width, height);
                  if (!noUpdates) Browser.updateResizeListeners()
              },
              windowedWidth: 0,
              windowedHeight: 0,
              setFullscreenCanvasSize() {
                  if (typeof SDL != "undefined") {
                      var flags = HEAPU32[SDL.screen >> 2];
                      flags = flags | 8388608;
                      HEAP32[SDL.screen >> 2] = flags
                  }
                  Browser.updateCanvasDimensions(Module["canvas"]);
                  Browser.updateResizeListeners()
              },
              setWindowedCanvasSize() {
                  if (typeof SDL != "undefined") {
                      var flags = HEAPU32[SDL.screen >> 2];
                      flags = flags & ~8388608;
                      HEAP32[SDL.screen >> 2] = flags
                  }
                  Browser.updateCanvasDimensions(Module["canvas"]);
                  Browser.updateResizeListeners()
              },
              updateCanvasDimensions(canvas, wNative, hNative) {
                  if (wNative && hNative) {
                      canvas.widthNative = wNative;
                      canvas.heightNative = hNative
                  } else {
                      wNative = canvas.widthNative;
                      hNative = canvas.heightNative
                  }
                  var w = wNative;
                  var h = hNative;
                  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
                      if (w / h < Module["forcedAspectRatio"]) {
                          w = Math.round(h * Module["forcedAspectRatio"])
                      } else {
                          h = Math.round(w / Module["forcedAspectRatio"])
                      }
                  }
                  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
                      var factor = Math.min(screen.width / w, screen.height / h);
                      w = Math.round(w * factor);
                      h = Math.round(h * factor)
                  }
                  if (Browser.resizeCanvas) {
                      if (canvas.width != w) canvas.width = w;
                      if (canvas.height != h) canvas.height = h;
                      if (typeof canvas.style != "undefined") {
                          canvas.style.removeProperty("width");
                          canvas.style.removeProperty("height")
                      }
                  } else {
                      if (canvas.width != wNative) canvas.width = wNative;
                      if (canvas.height != hNative) canvas.height = hNative;
                      if (typeof canvas.style != "undefined") {
                          if (w != wNative || h != hNative) {
                              canvas.style.setProperty("width", w + "px", "important");
                              canvas.style.setProperty("height", h + "px", "important")
                          } else {
                              canvas.style.removeProperty("width");
                              canvas.style.removeProperty("height")
                          }
                      }
                  }
              }
          };
          var EGL = {
              errorCode: 12288,
              defaultDisplayInitialized: false,
              currentContext: 0,
              currentReadSurface: 0,
              currentDrawSurface: 0,
              contextAttributes: {
                  alpha: false,
                  depth: false,
                  stencil: false,
                  antialias: false
              },
              stringCache: {},
              setErrorCode(code) {
                  EGL.errorCode = code
              },
              chooseConfig(display, attribList, config, config_size, numConfigs) {
                  if (display != 62e3) {
                      EGL.setErrorCode(12296);
                      return 0
                  }
                  if (attribList) {
                      for (;;) {
                          var param = HEAP32[attribList >> 2];
                          if (param == 12321) {
                              var alphaSize = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.alpha = alphaSize > 0
                          } else if (param == 12325) {
                              var depthSize = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.depth = depthSize > 0
                          } else if (param == 12326) {
                              var stencilSize = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.stencil = stencilSize > 0
                          } else if (param == 12337) {
                              var samples = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.antialias = samples > 0
                          } else if (param == 12338) {
                              var samples = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.antialias = samples == 1
                          } else if (param == 12544) {
                              var requestedPriority = HEAP32[attribList + 4 >> 2];
                              EGL.contextAttributes.lowLatency = requestedPriority != 12547
                          } else if (param == 12344) {
                              break
                          }
                          attribList += 8
                      }
                  }
                  if ((!config || !config_size) && !numConfigs) {
                      EGL.setErrorCode(12300);
                      return 0
                  }
                  if (numConfigs) {
                      HEAP32[numConfigs >> 2] = 1
                  }
                  if (config && config_size > 0) {
                      HEAPU32[config >> 2] = 62002
                  }
                  EGL.setErrorCode(12288);
                  return 1
              }
          };

          function _eglGetDisplay(nativeDisplayType) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(39, 0, 1, nativeDisplayType);
              EGL.setErrorCode(12288);
              if (nativeDisplayType != 0 && nativeDisplayType != 1) {
                  return 0
              }
              return 62e3
          }
          var readEmAsmArgsArray = [];
          var readEmAsmArgs = (sigPtr, buf) => {
              assert(Array.isArray(readEmAsmArgsArray));
              assert(buf % 16 == 0);
              readEmAsmArgsArray.length = 0;
              var ch;
              while (ch = HEAPU8[sigPtr++]) {
                  var chr = String.fromCharCode(ch);
                  var validChars = ["d", "f", "i", "p"];
                  assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
                  var wide = ch != 105;
                  wide &= ch != 112;
                  buf += wide && buf % 8 ? 4 : 0;
                  readEmAsmArgsArray.push(ch == 112 ? HEAPU32[buf >> 2] : ch == 105 ? HEAP32[buf >> 2] : HEAPF64[buf >> 3]);
                  buf += wide ? 8 : 4
              }
              return readEmAsmArgsArray
          };
          var runMainThreadEmAsm = (emAsmAddr, sigPtr, argbuf, sync) => {
              var args = readEmAsmArgs(sigPtr, argbuf);
              if (ENVIRONMENT_IS_PTHREAD) {
                  return proxyToMainThread(0, emAsmAddr, sync, ...args)
              }
              assert(ASM_CONSTS.hasOwnProperty(emAsmAddr), `No EM_ASM constant found at address ${emAsmAddr}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
              return ASM_CONSTS[emAsmAddr](...args)
          };
          var _emscripten_asm_const_async_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 0);
          var runEmAsmFunction = (code, sigPtr, argbuf) => {
              var args = readEmAsmArgs(sigPtr, argbuf);
              assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
              return ASM_CONSTS[code](...args)
          };
          var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
          var _emscripten_asm_const_int_sync_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);
          var _emscripten_cancel_main_loop = () => {
              Browser.mainLoop.pause();
              Browser.mainLoop.func = null
          };
          var _emscripten_check_blocking_allowed = () => {
              if (ENVIRONMENT_IS_NODE) return;
              if (ENVIRONMENT_IS_WORKER) return;
              warnOnce("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread")
          };
          var _emscripten_date_now = () => Date.now();
          var _emscripten_err = str => err(UTF8ToString(str));
          var _emscripten_exit_with_live_runtime = () => {
              runtimeKeepalivePush();
              throw "unwind"
          };
          var getHeapMax = () => HEAPU8.length;
          var _emscripten_get_heap_max = () => getHeapMax();
          var _emscripten_get_now_res = () => {
              if (ENVIRONMENT_IS_NODE) {
                  return 1
              }
              return 1e3
          };
          var _glActiveTexture = x0 => GLctx.activeTexture(x0);
          var _emscripten_glActiveTexture = _glActiveTexture;
          var _glAttachShader = (program, shader) => {
              GLctx.attachShader(GL.programs[program], GL.shaders[shader])
          };
          var _emscripten_glAttachShader = _glAttachShader;
          var _glBeginQuery = (target, id) => {
              GLctx.beginQuery(target, GL.queries[id])
          };
          var _emscripten_glBeginQuery = _glBeginQuery;
          var _glBeginQueryEXT = (target, id) => {
              GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id])
          };
          var _emscripten_glBeginQueryEXT = _glBeginQueryEXT;
          var _glBeginTransformFeedback = x0 => GLctx.beginTransformFeedback(x0);
          var _emscripten_glBeginTransformFeedback = _glBeginTransformFeedback;
          var _glBindAttribLocation = (program, index, name) => {
              GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
          };
          var _emscripten_glBindAttribLocation = _glBindAttribLocation;
          var _glBindBuffer = (target, buffer) => {
              if (target == 35051) {
                  GLctx.currentPixelPackBufferBinding = buffer
              } else if (target == 35052) {
                  GLctx.currentPixelUnpackBufferBinding = buffer
              }
              GLctx.bindBuffer(target, GL.buffers[buffer])
          };
          var _emscripten_glBindBuffer = _glBindBuffer;
          var _glBindBufferBase = (target, index, buffer) => {
              GLctx.bindBufferBase(target, index, GL.buffers[buffer])
          };
          var _emscripten_glBindBufferBase = _glBindBufferBase;
          var _glBindBufferRange = (target, index, buffer, offset, ptrsize) => {
              GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize)
          };
          var _emscripten_glBindBufferRange = _glBindBufferRange;
          var _glBindFramebuffer = (target, framebuffer) => {
              GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : GL.currentContext.defaultFbo)
          };
          var _emscripten_glBindFramebuffer = _glBindFramebuffer;
          var _glBindRenderbuffer = (target, renderbuffer) => {
              GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer])
          };
          var _emscripten_glBindRenderbuffer = _glBindRenderbuffer;
          var _glBindSampler = (unit, sampler) => {
              GLctx.bindSampler(unit, GL.samplers[sampler])
          };
          var _emscripten_glBindSampler = _glBindSampler;
          var _glBindTexture = (target, texture) => {
              GLctx.bindTexture(target, GL.textures[texture])
          };
          var _emscripten_glBindTexture = _glBindTexture;
          var _glBindTransformFeedback = (target, id) => {
              GLctx.bindTransformFeedback(target, GL.transformFeedbacks[id])
          };
          var _emscripten_glBindTransformFeedback = _glBindTransformFeedback;
          var _glBindVertexArray = vao => {
              GLctx.bindVertexArray(GL.vaos[vao])
          };
          var _emscripten_glBindVertexArray = _glBindVertexArray;
          var _glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);
          var _emscripten_glBlendColor = _glBlendColor;
          var _glBlendEquation = x0 => GLctx.blendEquation(x0);
          var _emscripten_glBlendEquation = _glBlendEquation;
          var _glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);
          var _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate;
          var _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);
          var _emscripten_glBlendFunc = _glBlendFunc;
          var _glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);
          var _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate;
          var _glBlitFramebuffer = (x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) => GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
          var _emscripten_glBlitFramebuffer = _glBlitFramebuffer;
          var _glBufferData = (target, size, data, usage) => {
              if (GL.currentContext.version >= 2) {
                  if (data && size) {
                      GLctx.bufferData(target, HEAPU8, usage, data, size)
                  } else {
                      GLctx.bufferData(target, size, usage)
                  }
                  return
              }
              GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage)
          };
          var _emscripten_glBufferData = _glBufferData;
          var _glBufferSubData = (target, offset, size, data) => {
              if (GL.currentContext.version >= 2) {
                  size && GLctx.bufferSubData(target, offset, HEAPU8, data, size);
                  return
              }
              GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size))
          };
          var _emscripten_glBufferSubData = _glBufferSubData;
          var _glCheckFramebufferStatus = x0 => GLctx.checkFramebufferStatus(x0);
          var _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus;
          var _glClear = x0 => GLctx.clear(x0);
          var _emscripten_glClear = _glClear;
          var _glClearBufferfi = (x0, x1, x2, x3) => GLctx.clearBufferfi(x0, x1, x2, x3);
          var _emscripten_glClearBufferfi = _glClearBufferfi;
          var _glClearBufferfv = (buffer, drawbuffer, value) => {
              GLctx.clearBufferfv(buffer, drawbuffer, HEAPF32, value >> 2)
          };
          var _emscripten_glClearBufferfv = _glClearBufferfv;
          var _glClearBufferiv = (buffer, drawbuffer, value) => {
              GLctx.clearBufferiv(buffer, drawbuffer, HEAP32, value >> 2)
          };
          var _emscripten_glClearBufferiv = _glClearBufferiv;
          var _glClearBufferuiv = (buffer, drawbuffer, value) => {
              GLctx.clearBufferuiv(buffer, drawbuffer, HEAPU32, value >> 2)
          };
          var _emscripten_glClearBufferuiv = _glClearBufferuiv;
          var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);
          var _emscripten_glClearColor = _glClearColor;
          var _glClearDepthf = x0 => GLctx.clearDepth(x0);
          var _emscripten_glClearDepthf = _glClearDepthf;
          var _glClearStencil = x0 => GLctx.clearStencil(x0);
          var _emscripten_glClearStencil = _glClearStencil;
          var convertI32PairToI53 = (lo, hi) => {
              assert(hi === (hi | 0));
              return (lo >>> 0) + hi * 4294967296
          };
          var _glClientWaitSync = (sync, flags, timeout_low, timeout_high) => {
              var timeout = convertI32PairToI53(timeout_low, timeout_high);
              return GLctx.clientWaitSync(GL.syncs[sync], flags, timeout)
          };
          var _emscripten_glClientWaitSync = _glClientWaitSync;
          var _glColorMask = (red, green, blue, alpha) => {
              GLctx.colorMask(!!red, !!green, !!blue, !!alpha)
          };
          var _emscripten_glColorMask = _glColorMask;
          var _glCompileShader = shader => {
              GLctx.compileShader(GL.shaders[shader])
          };
          var _emscripten_glCompileShader = _glCompileShader;
          var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
              if (GL.currentContext.version >= 2) {
                  if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
                      GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data)
                  } else {
                      GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, HEAPU8, data, imageSize)
                  }
                  return
              }
              GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null)
          };
          var _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D;
          var _glCompressedTexImage3D = (target, level, internalFormat, width, height, depth, border, imageSize, data) => {
              if (GLctx.currentPixelUnpackBufferBinding) {
                  GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data)
              } else {
                  GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, HEAPU8, data, imageSize)
              }
          };
          var _emscripten_glCompressedTexImage3D = _glCompressedTexImage3D;
          var _glCompressedTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, imageSize, data) => {
              if (GL.currentContext.version >= 2) {
                  if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
                      GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data)
                  } else {
                      GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, HEAPU8, data, imageSize)
                  }
                  return
              }
              GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null)
          };
          var _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D;
          var _glCompressedTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) => {
              if (GLctx.currentPixelUnpackBufferBinding) {
                  GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data)
              } else {
                  GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, HEAPU8, data, imageSize)
              }
          };
          var _emscripten_glCompressedTexSubImage3D = _glCompressedTexSubImage3D;
          var _glCopyBufferSubData = (x0, x1, x2, x3, x4) => GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
          var _emscripten_glCopyBufferSubData = _glCopyBufferSubData;
          var _glCopyTexImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
          var _emscripten_glCopyTexImage2D = _glCopyTexImage2D;
          var _glCopyTexSubImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
          var _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D;
          var _glCopyTexSubImage3D = (x0, x1, x2, x3, x4, x5, x6, x7, x8) => GLctx.copyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8);
          var _emscripten_glCopyTexSubImage3D = _glCopyTexSubImage3D;
          var _glCreateProgram = () => {
              var id = GL.getNewId(GL.programs);
              var program = GLctx.createProgram();
              program.name = id;
              program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
              program.uniformIdCounter = 1;
              GL.programs[id] = program;
              return id
          };
          var _emscripten_glCreateProgram = _glCreateProgram;
          var _glCreateShader = shaderType => {
              var id = GL.getNewId(GL.shaders);
              GL.shaders[id] = GLctx.createShader(shaderType);
              return id
          };
          var _emscripten_glCreateShader = _glCreateShader;
          var _glCullFace = x0 => GLctx.cullFace(x0);
          var _emscripten_glCullFace = _glCullFace;
          var _glDeleteBuffers = (n, buffers) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[buffers + i * 4 >> 2];
                  var buffer = GL.buffers[id];
                  if (!buffer) continue;
                  GLctx.deleteBuffer(buffer);
                  buffer.name = 0;
                  GL.buffers[id] = null;
                  if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
                  if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0
              }
          };
          var _emscripten_glDeleteBuffers = _glDeleteBuffers;
          var _glDeleteFramebuffers = (n, framebuffers) => {
              for (var i = 0; i < n; ++i) {
                  var id = HEAP32[framebuffers + i * 4 >> 2];
                  var framebuffer = GL.framebuffers[id];
                  if (!framebuffer) continue;
                  GLctx.deleteFramebuffer(framebuffer);
                  framebuffer.name = 0;
                  GL.framebuffers[id] = null
              }
          };
          var _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers;
          var _glDeleteProgram = id => {
              if (!id) return;
              var program = GL.programs[id];
              if (!program) {
                  GL.recordError(1281);
                  return
              }
              GLctx.deleteProgram(program);
              program.name = 0;
              GL.programs[id] = null
          };
          var _emscripten_glDeleteProgram = _glDeleteProgram;
          var _glDeleteQueries = (n, ids) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[ids + i * 4 >> 2];
                  var query = GL.queries[id];
                  if (!query) continue;
                  GLctx.deleteQuery(query);
                  GL.queries[id] = null
              }
          };
          var _emscripten_glDeleteQueries = _glDeleteQueries;
          var _glDeleteQueriesEXT = (n, ids) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[ids + i * 4 >> 2];
                  var query = GL.queries[id];
                  if (!query) continue;
                  GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
                  GL.queries[id] = null
              }
          };
          var _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT;
          var _glDeleteRenderbuffers = (n, renderbuffers) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[renderbuffers + i * 4 >> 2];
                  var renderbuffer = GL.renderbuffers[id];
                  if (!renderbuffer) continue;
                  GLctx.deleteRenderbuffer(renderbuffer);
                  renderbuffer.name = 0;
                  GL.renderbuffers[id] = null
              }
          };
          var _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers;
          var _glDeleteSamplers = (n, samplers) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[samplers + i * 4 >> 2];
                  var sampler = GL.samplers[id];
                  if (!sampler) continue;
                  GLctx.deleteSampler(sampler);
                  sampler.name = 0;
                  GL.samplers[id] = null
              }
          };
          var _emscripten_glDeleteSamplers = _glDeleteSamplers;
          var _glDeleteShader = id => {
              if (!id) return;
              var shader = GL.shaders[id];
              if (!shader) {
                  GL.recordError(1281);
                  return
              }
              GLctx.deleteShader(shader);
              GL.shaders[id] = null
          };
          var _emscripten_glDeleteShader = _glDeleteShader;
          var _glDeleteSync = id => {
              if (!id) return;
              var sync = GL.syncs[id];
              if (!sync) {
                  GL.recordError(1281);
                  return
              }
              GLctx.deleteSync(sync);
              sync.name = 0;
              GL.syncs[id] = null
          };
          var _emscripten_glDeleteSync = _glDeleteSync;
          var _glDeleteTextures = (n, textures) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[textures + i * 4 >> 2];
                  var texture = GL.textures[id];
                  if (!texture) continue;
                  GLctx.deleteTexture(texture);
                  texture.name = 0;
                  GL.textures[id] = null
              }
          };
          var _emscripten_glDeleteTextures = _glDeleteTextures;
          var _glDeleteTransformFeedbacks = (n, ids) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[ids + i * 4 >> 2];
                  var transformFeedback = GL.transformFeedbacks[id];
                  if (!transformFeedback) continue;
                  GLctx.deleteTransformFeedback(transformFeedback);
                  transformFeedback.name = 0;
                  GL.transformFeedbacks[id] = null
              }
          };
          var _emscripten_glDeleteTransformFeedbacks = _glDeleteTransformFeedbacks;
          var _glDeleteVertexArrays = (n, vaos) => {
              for (var i = 0; i < n; i++) {
                  var id = HEAP32[vaos + i * 4 >> 2];
                  GLctx.deleteVertexArray(GL.vaos[id]);
                  GL.vaos[id] = null
              }
          };
          var _emscripten_glDeleteVertexArrays = _glDeleteVertexArrays;
          var _glDepthFunc = x0 => GLctx.depthFunc(x0);
          var _emscripten_glDepthFunc = _glDepthFunc;
          var _glDepthMask = flag => {
              GLctx.depthMask(!!flag)
          };
          var _emscripten_glDepthMask = _glDepthMask;
          var _glDepthRangef = (x0, x1) => GLctx.depthRange(x0, x1);
          var _emscripten_glDepthRangef = _glDepthRangef;
          var _glDetachShader = (program, shader) => {
              GLctx.detachShader(GL.programs[program], GL.shaders[shader])
          };
          var _emscripten_glDetachShader = _glDetachShader;
          var _glDisable = x0 => GLctx.disable(x0);
          var _emscripten_glDisable = _glDisable;
          var _glDisableVertexAttribArray = index => {
              GLctx.disableVertexAttribArray(index)
          };
          var _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray;
          var _glDrawArrays = (mode, first, count) => {
              GLctx.drawArrays(mode, first, count)
          };
          var _emscripten_glDrawArrays = _glDrawArrays;
          var _glDrawArraysInstanced = (mode, first, count, primcount) => {
              GLctx.drawArraysInstanced(mode, first, count, primcount)
          };
          var _emscripten_glDrawArraysInstanced = _glDrawArraysInstanced;
          var tempFixedLengthArray = [];
          var _glDrawBuffers = (n, bufs) => {
              var bufArray = tempFixedLengthArray[n];
              for (var i = 0; i < n; i++) {
                  bufArray[i] = HEAP32[bufs + i * 4 >> 2]
              }
              GLctx.drawBuffers(bufArray)
          };
          var _emscripten_glDrawBuffers = _glDrawBuffers;
          var _glDrawElements = (mode, count, type, indices) => {
              GLctx.drawElements(mode, count, type, indices)
          };
          var _emscripten_glDrawElements = _glDrawElements;
          var _glDrawElementsInstanced = (mode, count, type, indices, primcount) => {
              GLctx.drawElementsInstanced(mode, count, type, indices, primcount)
          };
          var _emscripten_glDrawElementsInstanced = _glDrawElementsInstanced;
          var _glDrawRangeElements = (mode, start, end, count, type, indices) => {
              _glDrawElements(mode, count, type, indices)
          };
          var _emscripten_glDrawRangeElements = _glDrawRangeElements;
          var _glEnable = x0 => GLctx.enable(x0);
          var _emscripten_glEnable = _glEnable;
          var _glEnableVertexAttribArray = index => {
              GLctx.enableVertexAttribArray(index)
          };
          var _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray;
          var _glEndQuery = x0 => GLctx.endQuery(x0);
          var _emscripten_glEndQuery = _glEndQuery;
          var _glEndQueryEXT = target => {
              GLctx.disjointTimerQueryExt["endQueryEXT"](target)
          };
          var _emscripten_glEndQueryEXT = _glEndQueryEXT;
          var _glEndTransformFeedback = () => GLctx.endTransformFeedback();
          var _emscripten_glEndTransformFeedback = _glEndTransformFeedback;
          var _glFenceSync = (condition, flags) => {
              var sync = GLctx.fenceSync(condition, flags);
              if (sync) {
                  var id = GL.getNewId(GL.syncs);
                  sync.name = id;
                  GL.syncs[id] = sync;
                  return id
              }
              return 0
          };
          var _emscripten_glFenceSync = _glFenceSync;
          var _glFinish = () => GLctx.finish();
          var _emscripten_glFinish = _glFinish;
          var _glFlush = () => GLctx.flush();
          var _emscripten_glFlush = _glFlush;
          var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
              GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer])
          };
          var _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer;
          var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
              GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level)
          };
          var _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D;
          var _glFramebufferTextureLayer = (target, attachment, texture, level, layer) => {
              GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer)
          };
          var _emscripten_glFramebufferTextureLayer = _glFramebufferTextureLayer;
          var _glFrontFace = x0 => GLctx.frontFace(x0);
          var _emscripten_glFrontFace = _glFrontFace;
          var _glGenBuffers = (n, buffers) => {
              GL.genObject(n, buffers, "createBuffer", GL.buffers)
          };
          var _emscripten_glGenBuffers = _glGenBuffers;
          var _glGenFramebuffers = (n, ids) => {
              GL.genObject(n, ids, "createFramebuffer", GL.framebuffers)
          };
          var _emscripten_glGenFramebuffers = _glGenFramebuffers;
          var _glGenQueries = (n, ids) => {
              GL.genObject(n, ids, "createQuery", GL.queries)
          };
          var _emscripten_glGenQueries = _glGenQueries;
          var _glGenQueriesEXT = (n, ids) => {
              for (var i = 0; i < n; i++) {
                  var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
                  if (!query) {
                      GL.recordError(1282);
                      while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
                      return
                  }
                  var id = GL.getNewId(GL.queries);
                  query.name = id;
                  GL.queries[id] = query;
                  HEAP32[ids + i * 4 >> 2] = id
              }
          };
          var _emscripten_glGenQueriesEXT = _glGenQueriesEXT;
          var _glGenRenderbuffers = (n, renderbuffers) => {
              GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers)
          };
          var _emscripten_glGenRenderbuffers = _glGenRenderbuffers;
          var _glGenSamplers = (n, samplers) => {
              GL.genObject(n, samplers, "createSampler", GL.samplers)
          };
          var _emscripten_glGenSamplers = _glGenSamplers;
          var _glGenTextures = (n, textures) => {
              GL.genObject(n, textures, "createTexture", GL.textures)
          };
          var _emscripten_glGenTextures = _glGenTextures;
          var _glGenTransformFeedbacks = (n, ids) => {
              GL.genObject(n, ids, "createTransformFeedback", GL.transformFeedbacks)
          };
          var _emscripten_glGenTransformFeedbacks = _glGenTransformFeedbacks;
          var _glGenVertexArrays = (n, arrays) => {
              GL.genObject(n, arrays, "createVertexArray", GL.vaos)
          };
          var _emscripten_glGenVertexArrays = _glGenVertexArrays;
          var _glGenerateMipmap = x0 => GLctx.generateMipmap(x0);
          var _emscripten_glGenerateMipmap = _glGenerateMipmap;
          var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
              program = GL.programs[program];
              var info = GLctx[funcName](program, index);
              if (info) {
                  var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
                  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
                  if (size) HEAP32[size >> 2] = info.size;
                  if (type) HEAP32[type >> 2] = info.type
              }
          };
          var _glGetActiveAttrib = (program, index, bufSize, length, size, type, name) => {
              __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name)
          };
          var _emscripten_glGetActiveAttrib = _glGetActiveAttrib;
          var _glGetActiveUniform = (program, index, bufSize, length, size, type, name) => {
              __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name)
          };
          var _emscripten_glGetActiveUniform = _glGetActiveUniform;
          var _glGetActiveUniformBlockName = (program, uniformBlockIndex, bufSize, length, uniformBlockName) => {
              program = GL.programs[program];
              var result = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
              if (!result) return;
              if (uniformBlockName && bufSize > 0) {
                  var numBytesWrittenExclNull = stringToUTF8(result, uniformBlockName, bufSize);
                  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
              } else {
                  if (length) HEAP32[length >> 2] = 0
              }
          };
          var _emscripten_glGetActiveUniformBlockName = _glGetActiveUniformBlockName;
          var _glGetActiveUniformBlockiv = (program, uniformBlockIndex, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              program = GL.programs[program];
              if (pname == 35393) {
                  var name = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
                  HEAP32[params >> 2] = name.length + 1;
                  return
              }
              var result = GLctx.getActiveUniformBlockParameter(program, uniformBlockIndex, pname);
              if (result === null) return;
              if (pname == 35395) {
                  for (var i = 0; i < result.length; i++) {
                      HEAP32[params + i * 4 >> 2] = result[i]
                  }
              } else {
                  HEAP32[params >> 2] = result
              }
          };
          var _emscripten_glGetActiveUniformBlockiv = _glGetActiveUniformBlockiv;
          var _glGetActiveUniformsiv = (program, uniformCount, uniformIndices, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              if (uniformCount > 0 && uniformIndices == 0) {
                  GL.recordError(1281);
                  return
              }
              program = GL.programs[program];
              var ids = [];
              for (var i = 0; i < uniformCount; i++) {
                  ids.push(HEAP32[uniformIndices + i * 4 >> 2])
              }
              var result = GLctx.getActiveUniforms(program, ids, pname);
              if (!result) return;
              var len = result.length;
              for (var i = 0; i < len; i++) {
                  HEAP32[params + i * 4 >> 2] = result[i]
              }
          };
          var _emscripten_glGetActiveUniformsiv = _glGetActiveUniformsiv;
          var _glGetAttachedShaders = (program, maxCount, count, shaders) => {
              var result = GLctx.getAttachedShaders(GL.programs[program]);
              var len = result.length;
              if (len > maxCount) {
                  len = maxCount
              }
              HEAP32[count >> 2] = len;
              for (var i = 0; i < len; ++i) {
                  var id = GL.shaders.indexOf(result[i]);
                  HEAP32[shaders + i * 4 >> 2] = id
              }
          };
          var _emscripten_glGetAttachedShaders = _glGetAttachedShaders;
          var _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
          var _emscripten_glGetAttribLocation = _glGetAttribLocation;
          var readI53FromI64 = ptr => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
          var readI53FromU64 = ptr => HEAPU32[ptr >> 2] + HEAPU32[ptr + 4 >> 2] * 4294967296;
          var writeI53ToI64 = (ptr, num) => {
              HEAPU32[ptr >> 2] = num;
              var lower = HEAPU32[ptr >> 2];
              HEAPU32[ptr + 4 >> 2] = (num - lower) / 4294967296;
              var deserialized = num >= 0 ? readI53FromU64(ptr) : readI53FromI64(ptr);
              var offset = ptr >> 2;
              if (deserialized != num) warnOnce(`writeI53ToI64() out of range: serialized JS Number ${num} to Wasm heap as bytes lo=${ptrToString(HEAPU32[offset])}, hi=${ptrToString(HEAPU32[offset+1])}, which deserializes back to ${deserialized} instead!`)
          };
          var webglGetExtensions = function $webglGetExtensions() {
              var exts = getEmscriptenSupportedExtensions(GLctx);
              exts = exts.concat(exts.map(e => "GL_" + e));
              return exts
          };
          var emscriptenWebGLGet = (name_, p, type) => {
              if (!p) {
                  GL.recordError(1281);
                  return
              }
              var ret = undefined;
              switch (name_) {
                  case 36346:
                      ret = 1;
                      break;
                  case 36344:
                      if (type != 0 && type != 1) {
                          GL.recordError(1280)
                      }
                      return;
                  case 34814:
                  case 36345:
                      ret = 0;
                      break;
                  case 34466:
                      var formats = GLctx.getParameter(34467);
                      ret = formats ? formats.length : 0;
                      break;
                  case 33309:
                      if (GL.currentContext.version < 2) {
                          GL.recordError(1282);
                          return
                      }
                      ret = webglGetExtensions().length;
                      break;
                  case 33307:
                  case 33308:
                      if (GL.currentContext.version < 2) {
                          GL.recordError(1280);
                          return
                      }
                      ret = name_ == 33307 ? 3 : 0;
                      break
              }
              if (ret === undefined) {
                  var result = GLctx.getParameter(name_);
                  switch (typeof result) {
                      case "number":
                          ret = result;
                          break;
                      case "boolean":
                          ret = result ? 1 : 0;
                          break;
                      case "string":
                          GL.recordError(1280);
                          return;
                      case "object":
                          if (result === null) {
                              switch (name_) {
                                  case 34964:
                                  case 35725:
                                  case 34965:
                                  case 36006:
                                  case 36007:
                                  case 32873:
                                  case 34229:
                                  case 36662:
                                  case 36663:
                                  case 35053:
                                  case 35055:
                                  case 36010:
                                  case 35097:
                                  case 35869:
                                  case 32874:
                                  case 36389:
                                  case 35983:
                                  case 35368:
                                  case 34068: {
                                      ret = 0;
                                      break
                                  }
                                  default: {
                                      GL.recordError(1280);
                                      return
                                  }
                              }
                          } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                              for (var i = 0; i < result.length; ++i) {
                                  switch (type) {
                                      case 0:
                                          HEAP32[p + i * 4 >> 2] = result[i];
                                          break;
                                      case 2:
                                          HEAPF32[p + i * 4 >> 2] = result[i];
                                          break;
                                      case 4:
                                          HEAP8[p + i] = result[i] ? 1 : 0;
                                          break
                                  }
                              }
                              return
                          } else {
                              try {
                                  ret = result.name | 0
                              } catch (e) {
                                  GL.recordError(1280);
                                  err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
                                  return
                              }
                          }
                          break;
                      default:
                          GL.recordError(1280);
                          err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof result}!`);
                          return
                  }
              }
              switch (type) {
                  case 1:
                      writeI53ToI64(p, ret);
                      break;
                  case 0:
                      HEAP32[p >> 2] = ret;
                      break;
                  case 2:
                      HEAPF32[p >> 2] = ret;
                      break;
                  case 4:
                      HEAP8[p] = ret ? 1 : 0;
                      break
              }
          };
          var _glGetBooleanv = (name_, p) => emscriptenWebGLGet(name_, p, 4);
          var _emscripten_glGetBooleanv = _glGetBooleanv;
          var _glGetBufferParameteri64v = (target, value, data) => {
              if (!data) {
                  GL.recordError(1281);
                  return
              }
              writeI53ToI64(data, GLctx.getBufferParameter(target, value))
          };
          var _emscripten_glGetBufferParameteri64v = _glGetBufferParameteri64v;
          var _glGetBufferParameteriv = (target, value, data) => {
              if (!data) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[data >> 2] = GLctx.getBufferParameter(target, value)
          };
          var _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv;
          var _glGetError = () => {
              var error = GLctx.getError() || GL.lastError;
              GL.lastError = 0;
              return error
          };
          var _emscripten_glGetError = _glGetError;
          var _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);
          var _emscripten_glGetFloatv = _glGetFloatv;
          var _glGetFragDataLocation = (program, name) => GLctx.getFragDataLocation(GL.programs[program], UTF8ToString(name));
          var _emscripten_glGetFragDataLocation = _glGetFragDataLocation;
          var _glGetFramebufferAttachmentParameteriv = (target, attachment, pname, params) => {
              var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
              if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
                  result = result.name | 0
              }
              HEAP32[params >> 2] = result
          };
          var _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv;
          var emscriptenWebGLGetIndexed = (target, index, data, type) => {
              if (!data) {
                  GL.recordError(1281);
                  return
              }
              var result = GLctx.getIndexedParameter(target, index);
              var ret;
              switch (typeof result) {
                  case "boolean":
                      ret = result ? 1 : 0;
                      break;
                  case "number":
                      ret = result;
                      break;
                  case "object":
                      if (result === null) {
                          switch (target) {
                              case 35983:
                              case 35368:
                                  ret = 0;
                                  break;
                              default: {
                                  GL.recordError(1280);
                                  return
                              }
                          }
                      } else if (result instanceof WebGLBuffer) {
                          ret = result.name | 0
                      } else {
                          GL.recordError(1280);
                          return
                      }
                      break;
                  default:
                      GL.recordError(1280);
                      return
              }
              switch (type) {
                  case 1:
                      writeI53ToI64(data, ret);
                      break;
                  case 0:
                      HEAP32[data >> 2] = ret;
                      break;
                  case 2:
                      HEAPF32[data >> 2] = ret;
                      break;
                  case 4:
                      HEAP8[data] = ret ? 1 : 0;
                      break;
                  default:
                      throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type
              }
          };
          var _glGetInteger64i_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 1);
          var _emscripten_glGetInteger64i_v = _glGetInteger64i_v;
          var _glGetInteger64v = (name_, p) => {
              emscriptenWebGLGet(name_, p, 1)
          };
          var _emscripten_glGetInteger64v = _glGetInteger64v;
          var _glGetIntegeri_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 0);
          var _emscripten_glGetIntegeri_v = _glGetIntegeri_v;
          var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);
          var _emscripten_glGetIntegerv = _glGetIntegerv;
          var _glGetInternalformativ = (target, internalformat, pname, bufSize, params) => {
              if (bufSize < 0) {
                  GL.recordError(1281);
                  return
              }
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              var ret = GLctx.getInternalformatParameter(target, internalformat, pname);
              if (ret === null) return;
              for (var i = 0; i < ret.length && i < bufSize; ++i) {
                  HEAP32[params + i * 4 >> 2] = ret[i]
              }
          };
          var _emscripten_glGetInternalformativ = _glGetInternalformativ;
          var _glGetProgramBinary = (program, bufSize, length, binaryFormat, binary) => {
              GL.recordError(1282)
          };
          var _emscripten_glGetProgramBinary = _glGetProgramBinary;
          var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
              var log = GLctx.getProgramInfoLog(GL.programs[program]);
              if (log === null) log = "(unknown error)";
              var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
              if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
          };
          var _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog;
          var _glGetProgramiv = (program, pname, p) => {
              if (!p) {
                  GL.recordError(1281);
                  return
              }
              if (program >= GL.counter) {
                  GL.recordError(1281);
                  return
              }
              program = GL.programs[program];
              if (pname == 35716) {
                  var log = GLctx.getProgramInfoLog(program);
                  if (log === null) log = "(unknown error)";
                  HEAP32[p >> 2] = log.length + 1
              } else if (pname == 35719) {
                  if (!program.maxUniformLength) {
                      for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                          program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1)
                      }
                  }
                  HEAP32[p >> 2] = program.maxUniformLength
              } else if (pname == 35722) {
                  if (!program.maxAttributeLength) {
                      for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
                          program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1)
                      }
                  }
                  HEAP32[p >> 2] = program.maxAttributeLength
              } else if (pname == 35381) {
                  if (!program.maxUniformBlockNameLength) {
                      for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
                          program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1)
                      }
                  }
                  HEAP32[p >> 2] = program.maxUniformBlockNameLength
              } else {
                  HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname)
              }
          };
          var _emscripten_glGetProgramiv = _glGetProgramiv;
          var _glGetQueryObjecti64vEXT = (id, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              var query = GL.queries[id];
              var param;
              if (GL.currentContext.version < 2) {
                  param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname)
              } else {
                  param = GLctx.getQueryParameter(query, pname)
              }
              var ret;
              if (typeof param == "boolean") {
                  ret = param ? 1 : 0
              } else {
                  ret = param
              }
              writeI53ToI64(params, ret)
          };
          var _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT;
          var _glGetQueryObjectivEXT = (id, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              var query = GL.queries[id];
              var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
              var ret;
              if (typeof param == "boolean") {
                  ret = param ? 1 : 0
              } else {
                  ret = param
              }
              HEAP32[params >> 2] = ret
          };
          var _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT;
          var _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT;
          var _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT;
          var _glGetQueryObjectuiv = (id, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              var query = GL.queries[id];
              var param = GLctx.getQueryParameter(query, pname);
              var ret;
              if (typeof param == "boolean") {
                  ret = param ? 1 : 0
              } else {
                  ret = param
              }
              HEAP32[params >> 2] = ret
          };
          var _emscripten_glGetQueryObjectuiv = _glGetQueryObjectuiv;
          var _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT;
          var _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT;
          var _glGetQueryiv = (target, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[params >> 2] = GLctx.getQuery(target, pname)
          };
          var _emscripten_glGetQueryiv = _glGetQueryiv;
          var _glGetQueryivEXT = (target, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname)
          };
          var _emscripten_glGetQueryivEXT = _glGetQueryivEXT;
          var _glGetRenderbufferParameteriv = (target, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname)
          };
          var _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv;
          var _glGetSamplerParameterfv = (sampler, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAPF32[params >> 2] = GLctx.getSamplerParameter(GL.samplers[sampler], pname)
          };
          var _emscripten_glGetSamplerParameterfv = _glGetSamplerParameterfv;
          var _glGetSamplerParameteriv = (sampler, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[params >> 2] = GLctx.getSamplerParameter(GL.samplers[sampler], pname)
          };
          var _emscripten_glGetSamplerParameteriv = _glGetSamplerParameteriv;
          var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
              var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
              if (log === null) log = "(unknown error)";
              var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
              if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
          };
          var _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog;
          var _glGetShaderPrecisionFormat = (shaderType, precisionType, range, precision) => {
              var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
              HEAP32[range >> 2] = result.rangeMin;
              HEAP32[range + 4 >> 2] = result.rangeMax;
              HEAP32[precision >> 2] = result.precision
          };
          var _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat;
          var _glGetShaderSource = (shader, bufSize, length, source) => {
              var result = GLctx.getShaderSource(GL.shaders[shader]);
              if (!result) return;
              var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
              if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
          };
          var _emscripten_glGetShaderSource = _glGetShaderSource;
          var _glGetShaderiv = (shader, pname, p) => {
              if (!p) {
                  GL.recordError(1281);
                  return
              }
              if (pname == 35716) {
                  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
                  if (log === null) log = "(unknown error)";
                  var logLength = log ? log.length + 1 : 0;
                  HEAP32[p >> 2] = logLength
              } else if (pname == 35720) {
                  var source = GLctx.getShaderSource(GL.shaders[shader]);
                  var sourceLength = source ? source.length + 1 : 0;
                  HEAP32[p >> 2] = sourceLength
              } else {
                  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
              }
          };
          var _emscripten_glGetShaderiv = _glGetShaderiv;
          var stringToNewUTF8 = str => {
              var size = lengthBytesUTF8(str) + 1;
              var ret = _malloc(size);
              if (ret) stringToUTF8(str, ret, size);
              return ret
          };
          var _glGetString = name_ => {
              var ret = GL.stringCache[name_];
              if (!ret) {
                  switch (name_) {
                      case 7939:
                          ret = stringToNewUTF8(webglGetExtensions().join(" "));
                          break;
                      case 7936:
                      case 7937:
                      case 37445:
                      case 37446:
                          var s = GLctx.getParameter(name_);
                          if (!s) {
                              GL.recordError(1280)
                          }
                          ret = s ? stringToNewUTF8(s) : 0;
                          break;
                      case 7938:
                          var glVersion = GLctx.getParameter(7938);
                          if (GL.currentContext.version >= 2) glVersion = `OpenGL ES 3.0 (${glVersion})`;
                          else {
                              glVersion = `OpenGL ES 2.0 (${glVersion})`
                          }
                          ret = stringToNewUTF8(glVersion);
                          break;
                      case 35724:
                          var glslVersion = GLctx.getParameter(35724);
                          var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
                          var ver_num = glslVersion.match(ver_re);
                          if (ver_num !== null) {
                              if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
                              glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`
                          }
                          ret = stringToNewUTF8(glslVersion);
                          break;
                      default:
                          GL.recordError(1280)
                  }
                  GL.stringCache[name_] = ret
              }
              return ret
          };
          var _emscripten_glGetString = _glGetString;
          var _glGetStringi = (name, index) => {
              if (GL.currentContext.version < 2) {
                  GL.recordError(1282);
                  return 0
              }
              var stringiCache = GL.stringiCache[name];
              if (stringiCache) {
                  if (index < 0 || index >= stringiCache.length) {
                      GL.recordError(1281);
                      return 0
                  }
                  return stringiCache[index]
              }
              switch (name) {
                  case 7939:
                      var exts = webglGetExtensions().map(stringToNewUTF8);
                      stringiCache = GL.stringiCache[name] = exts;
                      if (index < 0 || index >= stringiCache.length) {
                          GL.recordError(1281);
                          return 0
                      }
                      return stringiCache[index];
                  default:
                      GL.recordError(1280);
                      return 0
              }
          };
          var _emscripten_glGetStringi = _glGetStringi;
          var _glGetSynciv = (sync, pname, bufSize, length, values) => {
              if (bufSize < 0) {
                  GL.recordError(1281);
                  return
              }
              if (!values) {
                  GL.recordError(1281);
                  return
              }
              var ret = GLctx.getSyncParameter(GL.syncs[sync], pname);
              if (ret !== null) {
                  HEAP32[values >> 2] = ret;
                  if (length) HEAP32[length >> 2] = 1
              }
          };
          var _emscripten_glGetSynciv = _glGetSynciv;
          var _glGetTexParameterfv = (target, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname)
          };
          var _emscripten_glGetTexParameterfv = _glGetTexParameterfv;
          var _glGetTexParameteriv = (target, pname, params) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[params >> 2] = GLctx.getTexParameter(target, pname)
          };
          var _emscripten_glGetTexParameteriv = _glGetTexParameteriv;
          var _glGetTransformFeedbackVarying = (program, index, bufSize, length, size, type, name) => {
              program = GL.programs[program];
              var info = GLctx.getTransformFeedbackVarying(program, index);
              if (!info) return;
              if (name && bufSize > 0) {
                  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
                  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
              } else {
                  if (length) HEAP32[length >> 2] = 0
              }
              if (size) HEAP32[size >> 2] = info.size;
              if (type) HEAP32[type >> 2] = info.type
          };
          var _emscripten_glGetTransformFeedbackVarying = _glGetTransformFeedbackVarying;
          var _glGetUniformBlockIndex = (program, uniformBlockName) => GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));
          var _emscripten_glGetUniformBlockIndex = _glGetUniformBlockIndex;
          var _glGetUniformIndices = (program, uniformCount, uniformNames, uniformIndices) => {
              if (!uniformIndices) {
                  GL.recordError(1281);
                  return
              }
              if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
                  GL.recordError(1281);
                  return
              }
              program = GL.programs[program];
              var names = [];
              for (var i = 0; i < uniformCount; i++) names.push(UTF8ToString(HEAP32[uniformNames + i * 4 >> 2]));
              var result = GLctx.getUniformIndices(program, names);
              if (!result) return;
              var len = result.length;
              for (var i = 0; i < len; i++) {
                  HEAP32[uniformIndices + i * 4 >> 2] = result[i]
              }
          };
          var _emscripten_glGetUniformIndices = _glGetUniformIndices;
          var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");
          var webglPrepareUniformLocationsBeforeFirstUse = program => {
              var uniformLocsById = program.uniformLocsById,
                  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,
                  i, j;
              if (!uniformLocsById) {
                  program.uniformLocsById = uniformLocsById = {};
                  program.uniformArrayNamesById = {};
                  for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                      var u = GLctx.getActiveUniform(program, i);
                      var nm = u.name;
                      var sz = u.size;
                      var lb = webglGetLeftBracePos(nm);
                      var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
                      var id = program.uniformIdCounter;
                      program.uniformIdCounter += sz;
                      uniformSizeAndIdsByName[arrayName] = [sz, id];
                      for (j = 0; j < sz; ++j) {
                          uniformLocsById[id] = j;
                          program.uniformArrayNamesById[id++] = arrayName
                      }
                  }
              }
          };
          var _glGetUniformLocation = (program, name) => {
              name = UTF8ToString(name);
              if (program = GL.programs[program]) {
                  webglPrepareUniformLocationsBeforeFirstUse(program);
                  var uniformLocsById = program.uniformLocsById;
                  var arrayIndex = 0;
                  var uniformBaseName = name;
                  var leftBrace = webglGetLeftBracePos(name);
                  if (leftBrace > 0) {
                      arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
                      uniformBaseName = name.slice(0, leftBrace)
                  }
                  var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
                  if (sizeAndId && arrayIndex < sizeAndId[0]) {
                      arrayIndex += sizeAndId[1];
                      if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
                          return arrayIndex
                      }
                  }
              } else {
                  GL.recordError(1281)
              }
              return -1
          };
          var _emscripten_glGetUniformLocation = _glGetUniformLocation;
          var webglGetUniformLocation = location => {
              var p = GLctx.currentProgram;
              if (p) {
                  var webglLoc = p.uniformLocsById[location];
                  if (typeof webglLoc == "number") {
                      p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""))
                  }
                  return webglLoc
              } else {
                  GL.recordError(1282)
              }
          };
          var emscriptenWebGLGetUniform = (program, location, params, type) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              program = GL.programs[program];
              webglPrepareUniformLocationsBeforeFirstUse(program);
              var data = GLctx.getUniform(program, webglGetUniformLocation(location));
              if (typeof data == "number" || typeof data == "boolean") {
                  switch (type) {
                      case 0:
                          HEAP32[params >> 2] = data;
                          break;
                      case 2:
                          HEAPF32[params >> 2] = data;
                          break
                  }
              } else {
                  for (var i = 0; i < data.length; i++) {
                      switch (type) {
                          case 0:
                              HEAP32[params + i * 4 >> 2] = data[i];
                              break;
                          case 2:
                              HEAPF32[params + i * 4 >> 2] = data[i];
                              break
                      }
                  }
              }
          };
          var _glGetUniformfv = (program, location, params) => {
              emscriptenWebGLGetUniform(program, location, params, 2)
          };
          var _emscripten_glGetUniformfv = _glGetUniformfv;
          var _glGetUniformiv = (program, location, params) => {
              emscriptenWebGLGetUniform(program, location, params, 0)
          };
          var _emscripten_glGetUniformiv = _glGetUniformiv;
          var _glGetUniformuiv = (program, location, params) => emscriptenWebGLGetUniform(program, location, params, 0);
          var _emscripten_glGetUniformuiv = _glGetUniformuiv;
          var emscriptenWebGLGetVertexAttrib = (index, pname, params, type) => {
              if (!params) {
                  GL.recordError(1281);
                  return
              }
              var data = GLctx.getVertexAttrib(index, pname);
              if (pname == 34975) {
                  HEAP32[params >> 2] = data && data["name"]
              } else if (typeof data == "number" || typeof data == "boolean") {
                  switch (type) {
                      case 0:
                          HEAP32[params >> 2] = data;
                          break;
                      case 2:
                          HEAPF32[params >> 2] = data;
                          break;
                      case 5:
                          HEAP32[params >> 2] = Math.fround(data);
                          break
                  }
              } else {
                  for (var i = 0; i < data.length; i++) {
                      switch (type) {
                          case 0:
                              HEAP32[params + i * 4 >> 2] = data[i];
                              break;
                          case 2:
                              HEAPF32[params + i * 4 >> 2] = data[i];
                              break;
                          case 5:
                              HEAP32[params + i * 4 >> 2] = Math.fround(data[i]);
                              break
                      }
                  }
              }
          };
          var _glGetVertexAttribIiv = (index, pname, params) => {
              emscriptenWebGLGetVertexAttrib(index, pname, params, 0)
          };
          var _emscripten_glGetVertexAttribIiv = _glGetVertexAttribIiv;
          var _glGetVertexAttribIuiv = _glGetVertexAttribIiv;
          var _emscripten_glGetVertexAttribIuiv = _glGetVertexAttribIuiv;
          var _glGetVertexAttribPointerv = (index, pname, pointer) => {
              if (!pointer) {
                  GL.recordError(1281);
                  return
              }
              HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname)
          };
          var _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv;
          var _glGetVertexAttribfv = (index, pname, params) => {
              emscriptenWebGLGetVertexAttrib(index, pname, params, 2)
          };
          var _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv;
          var _glGetVertexAttribiv = (index, pname, params) => {
              emscriptenWebGLGetVertexAttrib(index, pname, params, 5)
          };
          var _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv;
          var _glHint = (x0, x1) => GLctx.hint(x0, x1);
          var _emscripten_glHint = _glHint;
          var _glInvalidateFramebuffer = (target, numAttachments, attachments) => {
              var list = tempFixedLengthArray[numAttachments];
              for (var i = 0; i < numAttachments; i++) {
                  list[i] = HEAP32[attachments + i * 4 >> 2]
              }
              GLctx.invalidateFramebuffer(target, list)
          };
          var _emscripten_glInvalidateFramebuffer = _glInvalidateFramebuffer;
          var _glInvalidateSubFramebuffer = (target, numAttachments, attachments, x, y, width, height) => {
              var list = tempFixedLengthArray[numAttachments];
              for (var i = 0; i < numAttachments; i++) {
                  list[i] = HEAP32[attachments + i * 4 >> 2]
              }
              GLctx.invalidateSubFramebuffer(target, list, x, y, width, height)
          };
          var _emscripten_glInvalidateSubFramebuffer = _glInvalidateSubFramebuffer;
          var _glIsBuffer = buffer => {
              var b = GL.buffers[buffer];
              if (!b) return 0;
              return GLctx.isBuffer(b)
          };
          var _emscripten_glIsBuffer = _glIsBuffer;
          var _glIsEnabled = x0 => GLctx.isEnabled(x0);
          var _emscripten_glIsEnabled = _glIsEnabled;
          var _glIsFramebuffer = framebuffer => {
              var fb = GL.framebuffers[framebuffer];
              if (!fb) return 0;
              return GLctx.isFramebuffer(fb)
          };
          var _emscripten_glIsFramebuffer = _glIsFramebuffer;
          var _glIsProgram = program => {
              program = GL.programs[program];
              if (!program) return 0;
              return GLctx.isProgram(program)
          };
          var _emscripten_glIsProgram = _glIsProgram;
          var _glIsQuery = id => {
              var query = GL.queries[id];
              if (!query) return 0;
              return GLctx.isQuery(query)
          };
          var _emscripten_glIsQuery = _glIsQuery;
          var _glIsQueryEXT = id => {
              var query = GL.queries[id];
              if (!query) return 0;
              return GLctx.disjointTimerQueryExt["isQueryEXT"](query)
          };
          var _emscripten_glIsQueryEXT = _glIsQueryEXT;
          var _glIsRenderbuffer = renderbuffer => {
              var rb = GL.renderbuffers[renderbuffer];
              if (!rb) return 0;
              return GLctx.isRenderbuffer(rb)
          };
          var _emscripten_glIsRenderbuffer = _glIsRenderbuffer;
          var _glIsSampler = id => {
              var sampler = GL.samplers[id];
              if (!sampler) return 0;
              return GLctx.isSampler(sampler)
          };
          var _emscripten_glIsSampler = _glIsSampler;
          var _glIsShader = shader => {
              var s = GL.shaders[shader];
              if (!s) return 0;
              return GLctx.isShader(s)
          };
          var _emscripten_glIsShader = _glIsShader;
          var _glIsSync = sync => GLctx.isSync(GL.syncs[sync]);
          var _emscripten_glIsSync = _glIsSync;
          var _glIsTexture = id => {
              var texture = GL.textures[id];
              if (!texture) return 0;
              return GLctx.isTexture(texture)
          };
          var _emscripten_glIsTexture = _glIsTexture;
          var _glIsTransformFeedback = id => GLctx.isTransformFeedback(GL.transformFeedbacks[id]);
          var _emscripten_glIsTransformFeedback = _glIsTransformFeedback;
          var _glIsVertexArray = array => {
              var vao = GL.vaos[array];
              if (!vao) return 0;
              return GLctx.isVertexArray(vao)
          };
          var _emscripten_glIsVertexArray = _glIsVertexArray;
          var _glLineWidth = x0 => GLctx.lineWidth(x0);
          var _emscripten_glLineWidth = _glLineWidth;
          var _glLinkProgram = program => {
              program = GL.programs[program];
              GLctx.linkProgram(program);
              program.uniformLocsById = 0;
              program.uniformSizeAndIdsByName = {}
          };
          var _emscripten_glLinkProgram = _glLinkProgram;
          var _glPauseTransformFeedback = () => GLctx.pauseTransformFeedback();
          var _emscripten_glPauseTransformFeedback = _glPauseTransformFeedback;
          var _glPixelStorei = (pname, param) => {
              if (pname == 3317) {
                  GL.unpackAlignment = param
              }
              GLctx.pixelStorei(pname, param)
          };
          var _emscripten_glPixelStorei = _glPixelStorei;
          var _glPolygonOffset = (x0, x1) => GLctx.polygonOffset(x0, x1);
          var _emscripten_glPolygonOffset = _glPolygonOffset;
          var _glProgramBinary = (program, binaryFormat, binary, length) => {
              GL.recordError(1280)
          };
          var _emscripten_glProgramBinary = _glProgramBinary;
          var _glProgramParameteri = (program, pname, value) => {
              GL.recordError(1280)
          };
          var _emscripten_glProgramParameteri = _glProgramParameteri;
          var _glQueryCounterEXT = (id, target) => {
              GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target)
          };
          var _emscripten_glQueryCounterEXT = _glQueryCounterEXT;
          var _glReadBuffer = x0 => GLctx.readBuffer(x0);
          var _emscripten_glReadBuffer = _glReadBuffer;
          var computeUnpackAlignedImageSize = (width, height, sizePerPixel, alignment) => {
              function roundedToNextMultipleOf(x, y) {
                  return x + y - 1 & -y
              }
              var plainRowSize = width * sizePerPixel;
              var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
              return height * alignedRowSize
          };
          var colorChannelsInGlTextureFormat = format => {
              var colorChannels = {
                  5: 3,
                  6: 4,
                  8: 2,
                  29502: 3,
                  29504: 4,
                  26917: 2,
                  26918: 2,
                  29846: 3,
                  29847: 4
              };
              return colorChannels[format - 6402] || 1
          };
          var heapObjectForWebGLType = type => {
              type -= 5120;
              if (type == 0) return HEAP8;
              if (type == 1) return HEAPU8;
              if (type == 2) return HEAP16;
              if (type == 4) return HEAP32;
              if (type == 6) return HEAPF32;
              if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return HEAPU32;
              return HEAPU16
          };
          var toTypedArrayIndex = (pointer, heap) => pointer >>> 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
          var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
              var heap = heapObjectForWebGLType(type);
              var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
              var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
              return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap))
          };
          var _glReadPixels = (x, y, width, height, format, type, pixels) => {
              if (GL.currentContext.version >= 2) {
                  if (GLctx.currentPixelPackBufferBinding) {
                      GLctx.readPixels(x, y, width, height, format, type, pixels)
                  } else {
                      var heap = heapObjectForWebGLType(type);
                      var target = toTypedArrayIndex(pixels, heap);
                      GLctx.readPixels(x, y, width, height, format, type, heap, target)
                  }
                  return
              }
              var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
              if (!pixelData) {
                  GL.recordError(1280);
                  return
              }
              GLctx.readPixels(x, y, width, height, format, type, pixelData)
          };
          var _emscripten_glReadPixels = _glReadPixels;
          var _glReleaseShaderCompiler = () => {};
          var _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler;
          var _glRenderbufferStorage = (x0, x1, x2, x3) => GLctx.renderbufferStorage(x0, x1, x2, x3);
          var _emscripten_glRenderbufferStorage = _glRenderbufferStorage;
          var _glRenderbufferStorageMultisample = (x0, x1, x2, x3, x4) => GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);
          var _emscripten_glRenderbufferStorageMultisample = _glRenderbufferStorageMultisample;
          var _glResumeTransformFeedback = () => GLctx.resumeTransformFeedback();
          var _emscripten_glResumeTransformFeedback = _glResumeTransformFeedback;
          var _glSampleCoverage = (value, invert) => {
              GLctx.sampleCoverage(value, !!invert)
          };
          var _emscripten_glSampleCoverage = _glSampleCoverage;
          var _glSamplerParameterf = (sampler, pname, param) => {
              GLctx.samplerParameterf(GL.samplers[sampler], pname, param)
          };
          var _emscripten_glSamplerParameterf = _glSamplerParameterf;
          var _glSamplerParameterfv = (sampler, pname, params) => {
              var param = HEAPF32[params >> 2];
              GLctx.samplerParameterf(GL.samplers[sampler], pname, param)
          };
          var _emscripten_glSamplerParameterfv = _glSamplerParameterfv;
          var _glSamplerParameteri = (sampler, pname, param) => {
              GLctx.samplerParameteri(GL.samplers[sampler], pname, param)
          };
          var _emscripten_glSamplerParameteri = _glSamplerParameteri;
          var _glSamplerParameteriv = (sampler, pname, params) => {
              var param = HEAP32[params >> 2];
              GLctx.samplerParameteri(GL.samplers[sampler], pname, param)
          };
          var _emscripten_glSamplerParameteriv = _glSamplerParameteriv;
          var _glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);
          var _emscripten_glScissor = _glScissor;
          var _glShaderBinary = (count, shaders, binaryformat, binary, length) => {
              GL.recordError(1280)
          };
          var _emscripten_glShaderBinary = _glShaderBinary;
          var _glShaderSource = (shader, count, string, length) => {
              var source = GL.getSource(shader, count, string, length);
              GLctx.shaderSource(GL.shaders[shader], source)
          };
          var _emscripten_glShaderSource = _glShaderSource;
          var _glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);
          var _emscripten_glStencilFunc = _glStencilFunc;
          var _glStencilFuncSeparate = (x0, x1, x2, x3) => GLctx.stencilFuncSeparate(x0, x1, x2, x3);
          var _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate;
          var _glStencilMask = x0 => GLctx.stencilMask(x0);
          var _emscripten_glStencilMask = _glStencilMask;
          var _glStencilMaskSeparate = (x0, x1) => GLctx.stencilMaskSeparate(x0, x1);
          var _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate;
          var _glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);
          var _emscripten_glStencilOp = _glStencilOp;
          var _glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);
          var _emscripten_glStencilOpSeparate = _glStencilOpSeparate;
          var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
              if (GL.currentContext.version >= 2) {
                  if (GLctx.currentPixelUnpackBufferBinding) {
                      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels)
                  } else if (pixels) {
                      var heap = heapObjectForWebGLType(type);
                      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, toTypedArrayIndex(pixels, heap))
                  } else {
                      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null)
                  }
                  return
              }
              GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null)
          };
          var _emscripten_glTexImage2D = _glTexImage2D;
          var _glTexImage3D = (target, level, internalFormat, width, height, depth, border, format, type, pixels) => {
              if (GLctx.currentPixelUnpackBufferBinding) {
                  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels)
              } else if (pixels) {
                  var heap = heapObjectForWebGLType(type);
                  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, heap, toTypedArrayIndex(pixels, heap))
              } else {
                  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, null)
              }
          };
          var _emscripten_glTexImage3D = _glTexImage3D;
          var _glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);
          var _emscripten_glTexParameterf = _glTexParameterf;
          var _glTexParameterfv = (target, pname, params) => {
              var param = HEAPF32[params >> 2];
              GLctx.texParameterf(target, pname, param)
          };
          var _emscripten_glTexParameterfv = _glTexParameterfv;
          var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);
          var _emscripten_glTexParameteri = _glTexParameteri;
          var _glTexParameteriv = (target, pname, params) => {
              var param = HEAP32[params >> 2];
              GLctx.texParameteri(target, pname, param)
          };
          var _emscripten_glTexParameteriv = _glTexParameteriv;
          var _glTexStorage2D = (x0, x1, x2, x3, x4) => GLctx.texStorage2D(x0, x1, x2, x3, x4);
          var _emscripten_glTexStorage2D = _glTexStorage2D;
          var _glTexStorage3D = (x0, x1, x2, x3, x4, x5) => GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);
          var _emscripten_glTexStorage3D = _glTexStorage3D;
          var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
              if (GL.currentContext.version >= 2) {
                  if (GLctx.currentPixelUnpackBufferBinding) {
                      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels)
                  } else if (pixels) {
                      var heap = heapObjectForWebGLType(type);
                      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, toTypedArrayIndex(pixels, heap));
                      return
                  }
              }
              var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null;
              GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData)
          };
          var _emscripten_glTexSubImage2D = _glTexSubImage2D;
          var _glTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) => {
              if (GLctx.currentPixelUnpackBufferBinding) {
                  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels)
              } else if (pixels) {
                  var heap = heapObjectForWebGLType(type);
                  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, toTypedArrayIndex(pixels, heap))
              } else {
                  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null)
              }
          };
          var _emscripten_glTexSubImage3D = _glTexSubImage3D;
          var _glTransformFeedbackVaryings = (program, count, varyings, bufferMode) => {
              program = GL.programs[program];
              var vars = [];
              for (var i = 0; i < count; i++) vars.push(UTF8ToString(HEAP32[varyings + i * 4 >> 2]));
              GLctx.transformFeedbackVaryings(program, vars, bufferMode)
          };
          var _emscripten_glTransformFeedbackVaryings = _glTransformFeedbackVaryings;
          var _glUniform1f = (location, v0) => {
              GLctx.uniform1f(webglGetUniformLocation(location), v0)
          };
          var _emscripten_glUniform1f = _glUniform1f;
          var miniTempWebGLFloatBuffers = [];
          var _glUniform1fv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count);
                  return
              }
              if (count <= 288) {
                  var view = miniTempWebGLFloatBuffers[count - 1];
                  for (var i = 0; i < count; ++i) {
                      view[i] = HEAPF32[value + 4 * i >> 2]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2)
              }
              GLctx.uniform1fv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform1fv = _glUniform1fv;
          var _glUniform1i = (location, v0) => {
              GLctx.uniform1i(webglGetUniformLocation(location), v0)
          };
          var _emscripten_glUniform1i = _glUniform1i;
          var miniTempWebGLIntBuffers = [];
          var _glUniform1iv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, value >> 2, count);
                  return
              }
              if (count <= 288) {
                  var view = miniTempWebGLIntBuffers[count - 1];
                  for (var i = 0; i < count; ++i) {
                      view[i] = HEAP32[value + 4 * i >> 2]
                  }
              } else {
                  var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2)
              }
              GLctx.uniform1iv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform1iv = _glUniform1iv;
          var _glUniform1ui = (location, v0) => {
              GLctx.uniform1ui(webglGetUniformLocation(location), v0)
          };
          var _emscripten_glUniform1ui = _glUniform1ui;
          var _glUniform1uiv = (location, count, value) => {
              count && GLctx.uniform1uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count)
          };
          var _emscripten_glUniform1uiv = _glUniform1uiv;
          var _glUniform2f = (location, v0, v1) => {
              GLctx.uniform2f(webglGetUniformLocation(location), v0, v1)
          };
          var _emscripten_glUniform2f = _glUniform2f;
          var _glUniform2fv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 2);
                  return
              }
              if (count <= 144) {
                  var view = miniTempWebGLFloatBuffers[2 * count - 1];
                  for (var i = 0; i < 2 * count; i += 2) {
                      view[i] = HEAPF32[value + 4 * i >> 2];
                      view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2)
              }
              GLctx.uniform2fv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform2fv = _glUniform2fv;
          var _glUniform2i = (location, v0, v1) => {
              GLctx.uniform2i(webglGetUniformLocation(location), v0, v1)
          };
          var _emscripten_glUniform2i = _glUniform2i;
          var _glUniform2iv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 2);
                  return
              }
              if (count <= 144) {
                  var view = miniTempWebGLIntBuffers[2 * count - 1];
                  for (var i = 0; i < 2 * count; i += 2) {
                      view[i] = HEAP32[value + 4 * i >> 2];
                      view[i + 1] = HEAP32[value + (4 * i + 4) >> 2]
                  }
              } else {
                  var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2)
              }
              GLctx.uniform2iv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform2iv = _glUniform2iv;
          var _glUniform2ui = (location, v0, v1) => {
              GLctx.uniform2ui(webglGetUniformLocation(location), v0, v1)
          };
          var _emscripten_glUniform2ui = _glUniform2ui;
          var _glUniform2uiv = (location, count, value) => {
              count && GLctx.uniform2uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 2)
          };
          var _emscripten_glUniform2uiv = _glUniform2uiv;
          var _glUniform3f = (location, v0, v1, v2) => {
              GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2)
          };
          var _emscripten_glUniform3f = _glUniform3f;
          var _glUniform3fv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 3);
                  return
              }
              if (count <= 96) {
                  var view = miniTempWebGLFloatBuffers[3 * count - 1];
                  for (var i = 0; i < 3 * count; i += 3) {
                      view[i] = HEAPF32[value + 4 * i >> 2];
                      view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                      view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2)
              }
              GLctx.uniform3fv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform3fv = _glUniform3fv;
          var _glUniform3i = (location, v0, v1, v2) => {
              GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2)
          };
          var _emscripten_glUniform3i = _glUniform3i;
          var _glUniform3iv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform3iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 3);
                  return
              }
              if (count <= 96) {
                  var view = miniTempWebGLIntBuffers[3 * count - 1];
                  for (var i = 0; i < 3 * count; i += 3) {
                      view[i] = HEAP32[value + 4 * i >> 2];
                      view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
                      view[i + 2] = HEAP32[value + (4 * i + 8) >> 2]
                  }
              } else {
                  var view = HEAP32.subarray(value >> 2, value + count * 12 >> 2)
              }
              GLctx.uniform3iv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform3iv = _glUniform3iv;
          var _glUniform3ui = (location, v0, v1, v2) => {
              GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2)
          };
          var _emscripten_glUniform3ui = _glUniform3ui;
          var _glUniform3uiv = (location, count, value) => {
              count && GLctx.uniform3uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 3)
          };
          var _emscripten_glUniform3uiv = _glUniform3uiv;
          var _glUniform4f = (location, v0, v1, v2, v3) => {
              GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3)
          };
          var _emscripten_glUniform4f = _glUniform4f;
          var _glUniform4fv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 4);
                  return
              }
              if (count <= 72) {
                  var view = miniTempWebGLFloatBuffers[4 * count - 1];
                  var heap = HEAPF32;
                  value = value >> 2;
                  for (var i = 0; i < 4 * count; i += 4) {
                      var dst = value + i;
                      view[i] = heap[dst];
                      view[i + 1] = heap[dst + 1];
                      view[i + 2] = heap[dst + 2];
                      view[i + 3] = heap[dst + 3]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
              }
              GLctx.uniform4fv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform4fv = _glUniform4fv;
          var _glUniform4i = (location, v0, v1, v2, v3) => {
              GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3)
          };
          var _emscripten_glUniform4i = _glUniform4i;
          var _glUniform4iv = (location, count, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniform4iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 4);
                  return
              }
              if (count <= 72) {
                  var view = miniTempWebGLIntBuffers[4 * count - 1];
                  for (var i = 0; i < 4 * count; i += 4) {
                      view[i] = HEAP32[value + 4 * i >> 2];
                      view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
                      view[i + 2] = HEAP32[value + (4 * i + 8) >> 2];
                      view[i + 3] = HEAP32[value + (4 * i + 12) >> 2]
                  }
              } else {
                  var view = HEAP32.subarray(value >> 2, value + count * 16 >> 2)
              }
              GLctx.uniform4iv(webglGetUniformLocation(location), view)
          };
          var _emscripten_glUniform4iv = _glUniform4iv;
          var _glUniform4ui = (location, v0, v1, v2, v3) => {
              GLctx.uniform4ui(webglGetUniformLocation(location), v0, v1, v2, v3)
          };
          var _emscripten_glUniform4ui = _glUniform4ui;
          var _glUniform4uiv = (location, count, value) => {
              count && GLctx.uniform4uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 4)
          };
          var _emscripten_glUniform4uiv = _glUniform4uiv;
          var _glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
              program = GL.programs[program];
              GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding)
          };
          var _emscripten_glUniformBlockBinding = _glUniformBlockBinding;
          var _glUniformMatrix2fv = (location, count, transpose, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 4);
                  return
              }
              if (count <= 72) {
                  var view = miniTempWebGLFloatBuffers[4 * count - 1];
                  for (var i = 0; i < 4 * count; i += 4) {
                      view[i] = HEAPF32[value + 4 * i >> 2];
                      view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                      view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
                      view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
              }
              GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, view)
          };
          var _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv;
          var _glUniformMatrix2x3fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix2x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6)
          };
          var _emscripten_glUniformMatrix2x3fv = _glUniformMatrix2x3fv;
          var _glUniformMatrix2x4fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix2x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8)
          };
          var _emscripten_glUniformMatrix2x4fv = _glUniformMatrix2x4fv;
          var _glUniformMatrix3fv = (location, count, transpose, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 9);
                  return
              }
              if (count <= 32) {
                  var view = miniTempWebGLFloatBuffers[9 * count - 1];
                  for (var i = 0; i < 9 * count; i += 9) {
                      view[i] = HEAPF32[value + 4 * i >> 2];
                      view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                      view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
                      view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
                      view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
                      view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
                      view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
                      view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
                      view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2)
              }
              GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view)
          };
          var _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv;
          var _glUniformMatrix3x2fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix3x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6)
          };
          var _emscripten_glUniformMatrix3x2fv = _glUniformMatrix3x2fv;
          var _glUniformMatrix3x4fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix3x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12)
          };
          var _emscripten_glUniformMatrix3x4fv = _glUniformMatrix3x4fv;
          var _glUniformMatrix4fv = (location, count, transpose, value) => {
              if (GL.currentContext.version >= 2) {
                  count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 16);
                  return
              }
              if (count <= 18) {
                  var view = miniTempWebGLFloatBuffers[16 * count - 1];
                  var heap = HEAPF32;
                  value = value >> 2;
                  for (var i = 0; i < 16 * count; i += 16) {
                      var dst = value + i;
                      view[i] = heap[dst];
                      view[i + 1] = heap[dst + 1];
                      view[i + 2] = heap[dst + 2];
                      view[i + 3] = heap[dst + 3];
                      view[i + 4] = heap[dst + 4];
                      view[i + 5] = heap[dst + 5];
                      view[i + 6] = heap[dst + 6];
                      view[i + 7] = heap[dst + 7];
                      view[i + 8] = heap[dst + 8];
                      view[i + 9] = heap[dst + 9];
                      view[i + 10] = heap[dst + 10];
                      view[i + 11] = heap[dst + 11];
                      view[i + 12] = heap[dst + 12];
                      view[i + 13] = heap[dst + 13];
                      view[i + 14] = heap[dst + 14];
                      view[i + 15] = heap[dst + 15]
                  }
              } else {
                  var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2)
              }
              GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view)
          };
          var _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv;
          var _glUniformMatrix4x2fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix4x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8)
          };
          var _emscripten_glUniformMatrix4x2fv = _glUniformMatrix4x2fv;
          var _glUniformMatrix4x3fv = (location, count, transpose, value) => {
              count && GLctx.uniformMatrix4x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12)
          };
          var _emscripten_glUniformMatrix4x3fv = _glUniformMatrix4x3fv;
          var _glUseProgram = program => {
              program = GL.programs[program];
              GLctx.useProgram(program);
              GLctx.currentProgram = program
          };
          var _emscripten_glUseProgram = _glUseProgram;
          var _glValidateProgram = program => {
              GLctx.validateProgram(GL.programs[program])
          };
          var _emscripten_glValidateProgram = _glValidateProgram;
          var _glVertexAttrib1f = (x0, x1) => GLctx.vertexAttrib1f(x0, x1);
          var _emscripten_glVertexAttrib1f = _glVertexAttrib1f;
          var _glVertexAttrib1fv = (index, v) => {
              GLctx.vertexAttrib1f(index, HEAPF32[v >> 2])
          };
          var _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv;
          var _glVertexAttrib2f = (x0, x1, x2) => GLctx.vertexAttrib2f(x0, x1, x2);
          var _emscripten_glVertexAttrib2f = _glVertexAttrib2f;
          var _glVertexAttrib2fv = (index, v) => {
              GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2])
          };
          var _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv;
          var _glVertexAttrib3f = (x0, x1, x2, x3) => GLctx.vertexAttrib3f(x0, x1, x2, x3);
          var _emscripten_glVertexAttrib3f = _glVertexAttrib3f;
          var _glVertexAttrib3fv = (index, v) => {
              GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2])
          };
          var _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv;
          var _glVertexAttrib4f = (x0, x1, x2, x3, x4) => GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
          var _emscripten_glVertexAttrib4f = _glVertexAttrib4f;
          var _glVertexAttrib4fv = (index, v) => {
              GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2])
          };
          var _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv;
          var _glVertexAttribDivisor = (index, divisor) => {
              GLctx.vertexAttribDivisor(index, divisor)
          };
          var _emscripten_glVertexAttribDivisor = _glVertexAttribDivisor;
          var _glVertexAttribI4i = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4i(x0, x1, x2, x3, x4);
          var _emscripten_glVertexAttribI4i = _glVertexAttribI4i;
          var _glVertexAttribI4iv = (index, v) => {
              GLctx.vertexAttribI4i(index, HEAP32[v >> 2], HEAP32[v + 4 >> 2], HEAP32[v + 8 >> 2], HEAP32[v + 12 >> 2])
          };
          var _emscripten_glVertexAttribI4iv = _glVertexAttribI4iv;
          var _glVertexAttribI4ui = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4ui(x0, x1, x2, x3, x4);
          var _emscripten_glVertexAttribI4ui = _glVertexAttribI4ui;
          var _glVertexAttribI4uiv = (index, v) => {
              GLctx.vertexAttribI4ui(index, HEAPU32[v >> 2], HEAPU32[v + 4 >> 2], HEAPU32[v + 8 >> 2], HEAPU32[v + 12 >> 2])
          };
          var _emscripten_glVertexAttribI4uiv = _glVertexAttribI4uiv;
          var _glVertexAttribIPointer = (index, size, type, stride, ptr) => {
              GLctx.vertexAttribIPointer(index, size, type, stride, ptr)
          };
          var _emscripten_glVertexAttribIPointer = _glVertexAttribIPointer;
          var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
              GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
          };
          var _emscripten_glVertexAttribPointer = _glVertexAttribPointer;
          var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);
          var _emscripten_glViewport = _glViewport;
          var _glWaitSync = (sync, flags, timeout_low, timeout_high) => {
              var timeout = convertI32PairToI53(timeout_low, timeout_high);
              GLctx.waitSync(GL.syncs[sync], flags, timeout)
          };
          var _emscripten_glWaitSync = _glWaitSync;
          var reallyNegative = x => x < 0 || x === 0 && 1 / x === -Infinity;
          var convertU32PairToI53 = (lo, hi) => (lo >>> 0) + (hi >>> 0) * 4294967296;
          var reSign = (value, bits) => {
              if (value <= 0) {
                  return value
              }
              var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
              if (value >= half && (bits <= 32 || value > half)) {
                  value = -2 * half + value
              }
              return value
          };
          var unSign = (value, bits) => {
              if (value >= 0) {
                  return value
              }
              return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value
          };
          var strLen = ptr => {
              var end = ptr;
              while (HEAPU8[end]) ++end;
              return end - ptr
          };
          var formatString = (format, varargs) => {
              assert((varargs & 3) === 0);
              var textIndex = format;
              var argIndex = varargs;

              function prepVararg(ptr, type) {
                  if (type === "double" || type === "i64") {
                      if (ptr & 7) {
                          assert((ptr & 7) === 4);
                          ptr += 4
                      }
                  } else {
                      assert((ptr & 3) === 0)
                  }
                  return ptr
              }

              function getNextArg(type) {
                  var ret;
                  argIndex = prepVararg(argIndex, type);
                  if (type === "double") {
                      ret = HEAPF64[argIndex >> 3];
                      argIndex += 8
                  } else if (type == "i64") {
                      ret = [HEAP32[argIndex >> 2], HEAP32[argIndex + 4 >> 2]];
                      argIndex += 8
                  } else {
                      assert((argIndex & 3) === 0);
                      type = "i32";
                      ret = HEAP32[argIndex >> 2];
                      argIndex += 4
                  }
                  return ret
              }
              var ret = [];
              var curr, next, currArg;
              while (1) {
                  var startTextIndex = textIndex;
                  curr = HEAP8[textIndex];
                  if (curr === 0) break;
                  next = HEAP8[textIndex + 1];
                  if (curr == 37) {
                      var flagAlwaysSigned = false;
                      var flagLeftAlign = false;
                      var flagAlternative = false;
                      var flagZeroPad = false;
                      var flagPadSign = false;
                      flagsLoop: while (1) {
                          switch (next) {
                              case 43:
                                  flagAlwaysSigned = true;
                                  break;
                              case 45:
                                  flagLeftAlign = true;
                                  break;
                              case 35:
                                  flagAlternative = true;
                                  break;
                              case 48:
                                  if (flagZeroPad) {
                                      break flagsLoop
                                  } else {
                                      flagZeroPad = true;
                                      break
                                  }
                              case 32:
                                  flagPadSign = true;
                                  break;
                              default:
                                  break flagsLoop
                          }
                          textIndex++;
                          next = HEAP8[textIndex + 1]
                      }
                      var width = 0;
                      if (next == 42) {
                          width = getNextArg("i32");
                          textIndex++;
                          next = HEAP8[textIndex + 1]
                      } else {
                          while (next >= 48 && next <= 57) {
                              width = width * 10 + (next - 48);
                              textIndex++;
                              next = HEAP8[textIndex + 1]
                          }
                      }
                      var precisionSet = false,
                          precision = -1;
                      if (next == 46) {
                          precision = 0;
                          precisionSet = true;
                          textIndex++;
                          next = HEAP8[textIndex + 1];
                          if (next == 42) {
                              precision = getNextArg("i32");
                              textIndex++
                          } else {
                              while (1) {
                                  var precisionChr = HEAP8[textIndex + 1];
                                  if (precisionChr < 48 || precisionChr > 57) break;
                                  precision = precision * 10 + (precisionChr - 48);
                                  textIndex++
                              }
                          }
                          next = HEAP8[textIndex + 1]
                      }
                      if (precision < 0) {
                          precision = 6;
                          precisionSet = false
                      }
                      var argSize;
                      switch (String.fromCharCode(next)) {
                          case "h":
                              var nextNext = HEAP8[textIndex + 2];
                              if (nextNext == 104) {
                                  textIndex++;
                                  argSize = 1
                              } else {
                                  argSize = 2
                              }
                              break;
                          case "l":
                              var nextNext = HEAP8[textIndex + 2];
                              if (nextNext == 108) {
                                  textIndex++;
                                  argSize = 8
                              } else {
                                  argSize = 4
                              }
                              break;
                          case "L":
                          case "q":
                          case "j":
                              argSize = 8;
                              break;
                          case "z":
                          case "t":
                          case "I":
                              argSize = 4;
                              break;
                          default:
                              argSize = null
                      }
                      if (argSize) textIndex++;
                      next = HEAP8[textIndex + 1];
                      switch (String.fromCharCode(next)) {
                          case "d":
                          case "i":
                          case "u":
                          case "o":
                          case "x":
                          case "X":
                          case "p": {
                              var signed = next == 100 || next == 105;
                              argSize = argSize || 4;
                              currArg = getNextArg("i" + argSize * 8);
                              var argText;
                              if (argSize == 8) {
                                  currArg = next == 117 ? convertU32PairToI53(currArg[0], currArg[1]) : convertI32PairToI53(currArg[0], currArg[1])
                              }
                              if (argSize <= 4) {
                                  var limit = Math.pow(256, argSize) - 1;
                                  currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8)
                              }
                              var currAbsArg = Math.abs(currArg);
                              var prefix = "";
                              if (next == 100 || next == 105) {
                                  argText = reSign(currArg, 8 * argSize).toString(10)
                              } else if (next == 117) {
                                  argText = unSign(currArg, 8 * argSize).toString(10);
                                  currArg = Math.abs(currArg)
                              } else if (next == 111) {
                                  argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8)
                              } else if (next == 120 || next == 88) {
                                  prefix = flagAlternative && currArg != 0 ? "0x" : "";
                                  if (currArg < 0) {
                                      currArg = -currArg;
                                      argText = (currAbsArg - 1).toString(16);
                                      var buffer = [];
                                      for (var i = 0; i < argText.length; i++) {
                                          buffer.push((15 - parseInt(argText[i], 16)).toString(16))
                                      }
                                      argText = buffer.join("");
                                      while (argText.length < argSize * 2) argText = "f" + argText
                                  } else {
                                      argText = currAbsArg.toString(16)
                                  }
                                  if (next == 88) {
                                      prefix = prefix.toUpperCase();
                                      argText = argText.toUpperCase()
                                  }
                              } else if (next == 112) {
                                  if (currAbsArg === 0) {
                                      argText = "(nil)"
                                  } else {
                                      prefix = "0x";
                                      argText = currAbsArg.toString(16)
                                  }
                              }
                              if (precisionSet) {
                                  while (argText.length < precision) {
                                      argText = "0" + argText
                                  }
                              }
                              if (currArg >= 0) {
                                  if (flagAlwaysSigned) {
                                      prefix = "+" + prefix
                                  } else if (flagPadSign) {
                                      prefix = " " + prefix
                                  }
                              }
                              if (argText.charAt(0) == "-") {
                                  prefix = "-" + prefix;
                                  argText = argText.substr(1)
                              }
                              while (prefix.length + argText.length < width) {
                                  if (flagLeftAlign) {
                                      argText += " "
                                  } else {
                                      if (flagZeroPad) {
                                          argText = "0" + argText
                                      } else {
                                          prefix = " " + prefix
                                      }
                                  }
                              }
                              argText = prefix + argText;
                              argText.split("").forEach(function(chr) {
                                  ret.push(chr.charCodeAt(0))
                              });
                              break
                          }
                          case "f":
                          case "F":
                          case "e":
                          case "E":
                          case "g":
                          case "G": {
                              currArg = getNextArg("double");
                              var argText;
                              if (isNaN(currArg)) {
                                  argText = "nan";
                                  flagZeroPad = false
                              } else if (!isFinite(currArg)) {
                                  argText = (currArg < 0 ? "-" : "") + "inf";
                                  flagZeroPad = false
                              } else {
                                  var isGeneral = false;
                                  var effectivePrecision = Math.min(precision, 20);
                                  if (next == 103 || next == 71) {
                                      isGeneral = true;
                                      precision = precision || 1;
                                      var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
                                      if (precision > exponent && exponent >= -4) {
                                          next = (next == 103 ? "f" : "F").charCodeAt(0);
                                          precision -= exponent + 1
                                      } else {
                                          next = (next == 103 ? "e" : "E").charCodeAt(0);
                                          precision--
                                      }
                                      effectivePrecision = Math.min(precision, 20)
                                  }
                                  if (next == 101 || next == 69) {
                                      argText = currArg.toExponential(effectivePrecision);
                                      if (/[eE][-+]\d$/.test(argText)) {
                                          argText = argText.slice(0, -1) + "0" + argText.slice(-1)
                                      }
                                  } else if (next == 102 || next == 70) {
                                      argText = currArg.toFixed(effectivePrecision);
                                      if (currArg === 0 && reallyNegative(currArg)) {
                                          argText = "-" + argText
                                      }
                                  }
                                  var parts = argText.split("e");
                                  if (isGeneral && !flagAlternative) {
                                      while (parts[0].length > 1 && parts[0].includes(".") && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
                                          parts[0] = parts[0].slice(0, -1)
                                      }
                                  } else {
                                      if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
                                      while (precision > effectivePrecision++) parts[0] += "0"
                                  }
                                  argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
                                  if (next == 69) argText = argText.toUpperCase();
                                  if (currArg >= 0) {
                                      if (flagAlwaysSigned) {
                                          argText = "+" + argText
                                      } else if (flagPadSign) {
                                          argText = " " + argText
                                      }
                                  }
                              }
                              while (argText.length < width) {
                                  if (flagLeftAlign) {
                                      argText += " "
                                  } else {
                                      if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
                                          argText = argText[0] + "0" + argText.slice(1)
                                      } else {
                                          argText = (flagZeroPad ? "0" : " ") + argText
                                      }
                                  }
                              }
                              if (next < 97) argText = argText.toUpperCase();
                              argText.split("").forEach(function(chr) {
                                  ret.push(chr.charCodeAt(0))
                              });
                              break
                          }
                          case "s": {
                              var arg = getNextArg("i8*");
                              var argLength = arg ? strLen(arg) : "(null)".length;
                              if (precisionSet) argLength = Math.min(argLength, precision);
                              if (!flagLeftAlign) {
                                  while (argLength < width--) {
                                      ret.push(32)
                                  }
                              }
                              if (arg) {
                                  for (var i = 0; i < argLength; i++) {
                                      ret.push(HEAPU8[arg++])
                                  }
                              } else {
                                  ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true))
                              }
                              if (flagLeftAlign) {
                                  while (argLength < width--) {
                                      ret.push(32)
                                  }
                              }
                              break
                          }
                          case "c": {
                              if (flagLeftAlign) ret.push(getNextArg("i8"));
                              while (--width > 0) {
                                  ret.push(32)
                              }
                              if (!flagLeftAlign) ret.push(getNextArg("i8"));
                              break
                          }
                          case "n": {
                              var ptr = getNextArg("i32*");
                              HEAP32[ptr >> 2] = ret.length;
                              break
                          }
                          case "%": {
                              ret.push(curr);
                              break
                          }
                          default: {
                              for (var i = startTextIndex; i < textIndex + 2; i++) {
                                  ret.push(HEAP8[i])
                              }
                          }
                      }
                      textIndex += 2
                  } else {
                      ret.push(curr);
                      textIndex += 1
                  }
              }
              return ret
          };

          function jsStackTrace() {
              return (new Error).stack.toString()
          }

          function getCallstack(flags) {
              var callstack = jsStackTrace();
              var iThisFunc = callstack.lastIndexOf("_emscripten_log");
              var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
              var iNextLine = callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
              callstack = callstack.slice(iNextLine);
              if (flags & 8 && typeof emscripten_source_map == "undefined") {
                  warnOnce('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.');
                  flags ^= 8;
                  flags |= 16
              }
              var lines = callstack.split("\n");
              callstack = "";
              var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
              var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
              var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
              for (var l in lines) {
                  var line = lines[l];
                  var symbolName = "";
                  var file = "";
                  var lineno = 0;
                  var column = 0;
                  var parts = chromeRe.exec(line);
                  if (parts && parts.length == 5) {
                      symbolName = parts[1];
                      file = parts[2];
                      lineno = parts[3];
                      column = parts[4]
                  } else {
                      parts = newFirefoxRe.exec(line);
                      if (!parts) parts = firefoxRe.exec(line);
                      if (parts && parts.length >= 4) {
                          symbolName = parts[1];
                          file = parts[2];
                          lineno = parts[3];
                          column = parts[4] | 0
                      } else {
                          callstack += line + "\n";
                          continue
                      }
                  }
                  var haveSourceMap = false;
                  if (flags & 8) {
                      var orig = emscripten_source_map.originalPositionFor({
                          line: lineno,
                          column: column
                      });
                      haveSourceMap = orig?.source;
                      if (haveSourceMap) {
                          if (flags & 64) {
                              orig.source = orig.source.substring(orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1)
                          }
                          callstack += `    at ${symbolName} (${orig.source}:${orig.line}:${orig.column})\n`
                      }
                  }
                  if (flags & 16 || !haveSourceMap) {
                      if (flags & 64) {
                          file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1)
                      }
                      callstack += (haveSourceMap ? `     = ${symbolName}` : `    at ${symbolName}`) + ` (${file}:${lineno}:${column})\n`
                  }
              }
              callstack = callstack.replace(/\s+$/, "");
              return callstack
          }
          var emscriptenLog = (flags, str) => {
              if (flags & 24) {
                  str = str.replace(/\s+$/, "");
                  str += (str.length > 0 ? "\n" : "") + getCallstack(flags)
              }
              if (flags & 1) {
                  if (flags & 4) {
                      console.error(str)
                  } else if (flags & 2) {
                      console.warn(str)
                  } else if (flags & 512) {
                      console.info(str)
                  } else if (flags & 256) {
                      console.debug(str)
                  } else {
                      console.log(str)
                  }
              } else if (flags & 6) {
                  err(str)
              } else {
                  out(str)
              }
          };
          var _emscripten_log = (flags, format, varargs) => {
              var result = formatString(format, varargs);
              var str = UTF8ArrayToString(result, 0);
              emscriptenLog(flags, str)
          };
          var _emscripten_num_logical_cores = () => ENVIRONMENT_IS_NODE ? require("os").cpus().length : navigator["hardwareConcurrency"];
          var abortOnCannotGrowMemory = requestedSize => {
              abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`)
          };
          var _emscripten_resize_heap = requestedSize => {
              var oldSize = HEAPU8.length;
              requestedSize >>>= 0;
              abortOnCannotGrowMemory(requestedSize)
          };
          var _emscripten_set_main_loop = (func, fps, simulateInfiniteLoop) => {
              var browserIterationFunc = () => dynCall_v(func);
              setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop)
          };
          var _emscripten_set_main_loop_arg = (func, arg, fps, simulateInfiniteLoop) => {
              var browserIterationFunc = () => (a1 => dynCall_vi(func, a1))(arg);
              setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg)
          };
          var _emscripten_unwind_to_js_event_loop = () => {
              throw "unwind"
          };
          var _emscripten_webgl_do_commit_frame = () => {
              if (!GL.currentContext || !GL.currentContext.GLctx) {
                  return -3
              }
              if (GL.currentContext.defaultFbo) {
                  GL.blitOffscreenFramebuffer(GL.currentContext);
                  return 0
              }
              if (!GL.currentContext.attributes.explicitSwapControl) {
                  return -3
              }
              return 0
          };
          var _emscripten_webgl_make_context_current_calling_thread = contextHandle => {
              var success = GL.makeContextCurrent(contextHandle);
              if (success) GL.currentContextIsProxied = false;
              return success ? 0 : -5
          };
          var ENV = {};
          var getExecutableName = () => thisProgram || "./this.program";
          var getEnvStrings = () => {
              if (!getEnvStrings.strings) {
                  var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
                  var env = {
                      "USER": "web_user",
                      "LOGNAME": "web_user",
                      "PATH": "/",
                      "PWD": "/",
                      "HOME": "/home/web_user",
                      "LANG": lang,
                      "_": getExecutableName()
                  };
                  for (var x in ENV) {
                      if (ENV[x] === undefined) delete env[x];
                      else env[x] = ENV[x]
                  }
                  var strings = [];
                  for (var x in env) {
                      strings.push(`${x}=${env[x]}`)
                  }
                  getEnvStrings.strings = strings
              }
              return getEnvStrings.strings
          };
          var stringToAscii = (str, buffer) => {
              for (var i = 0; i < str.length; ++i) {
                  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
                  HEAP8[buffer++] = str.charCodeAt(i)
              }
              HEAP8[buffer] = 0
          };
          var _environ_get = function(__environ, environ_buf) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(40, 0, 1, __environ, environ_buf);
              var bufSize = 0;
              getEnvStrings().forEach((string, i) => {
                  var ptr = environ_buf + bufSize;
                  HEAPU32[__environ + i * 4 >> 2] = ptr;
                  stringToAscii(string, ptr);
                  bufSize += string.length + 1
              });
              return 0
          };
          var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(41, 0, 1, penviron_count, penviron_buf_size);
              var strings = getEnvStrings();
              HEAPU32[penviron_count >> 2] = strings.length;
              var bufSize = 0;
              strings.forEach(string => bufSize += string.length + 1);
              HEAPU32[penviron_buf_size >> 2] = bufSize;
              return 0
          };

          function _fd_close(fd) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(42, 0, 1, fd);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  FS.close(stream);
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }

          function _fd_fdstat_get(fd, pbuf) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(43, 0, 1, fd, pbuf);
              try {
                  var rightsBase = 0;
                  var rightsInheriting = 0;
                  var flags = 0;
                  {
                      var stream = SYSCALLS.getStreamFromFD(fd);
                      var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4
                  }
                  HEAP8[pbuf] = type;
                  HEAP16[pbuf + 2 >> 1] = flags;
                  tempI64 = [rightsBase >>> 0, (tempDouble = rightsBase, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 8 >> 2] = tempI64[0], HEAP32[pbuf + 12 >> 2] = tempI64[1];
                  tempI64 = [rightsInheriting >>> 0, (tempDouble = rightsInheriting, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 16 >> 2] = tempI64[0], HEAP32[pbuf + 20 >> 2] = tempI64[1];
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }
          var doReadv = (stream, iov, iovcnt, offset) => {
              var ret = 0;
              for (var i = 0; i < iovcnt; i++) {
                  var ptr = HEAPU32[iov >> 2];
                  var len = HEAPU32[iov + 4 >> 2];
                  iov += 8;
                  var curr = FS.read(stream, HEAP8, ptr, len, offset);
                  if (curr < 0) return -1;
                  ret += curr;
                  if (curr < len) break;
                  if (typeof offset !== "undefined") {
                      offset += curr
                  }
              }
              return ret
          };

          function _fd_pread(fd, iov, iovcnt, offset_low, offset_high, pnum) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(44, 0, 1, fd, iov, iovcnt, offset_low, offset_high, pnum);
              var offset = convertI32PairToI53Checked(offset_low, offset_high);
              try {
                  if (isNaN(offset)) return 61;
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  var num = doReadv(stream, iov, iovcnt, offset);
                  HEAPU32[pnum >> 2] = num;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }

          function _fd_read(fd, iov, iovcnt, pnum) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(45, 0, 1, fd, iov, iovcnt, pnum);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  var num = doReadv(stream, iov, iovcnt);
                  HEAPU32[pnum >> 2] = num;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }

          function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(46, 0, 1, fd, offset_low, offset_high, whence, newOffset);
              var offset = convertI32PairToI53Checked(offset_low, offset_high);
              try {
                  if (isNaN(offset)) return 61;
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  FS.llseek(stream, offset, whence);
                  tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
                  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }
          var _fd_sync = function(fd) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(47, 0, 1, fd);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  return Asyncify.handleSleep(wakeUp => {
                      var mount = stream.node.mount;
                      if (!mount.type.syncfs) {
                          wakeUp(0);
                          return
                      }
                      mount.type.syncfs(mount, false, err => {
                          if (err) {
                              wakeUp(29);
                              return
                          }
                          wakeUp(0)
                      })
                  })
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          };
          _fd_sync.isAsync = true;
          var doWritev = (stream, iov, iovcnt, offset) => {
              var ret = 0;
              for (var i = 0; i < iovcnt; i++) {
                  var ptr = HEAPU32[iov >> 2];
                  var len = HEAPU32[iov + 4 >> 2];
                  iov += 8;
                  var curr = FS.write(stream, HEAP8, ptr, len, offset);
                  if (curr < 0) return -1;
                  ret += curr;
                  if (typeof offset !== "undefined") {
                      offset += curr
                  }
              }
              return ret
          };

          function _fd_write(fd, iov, iovcnt, pnum) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(48, 0, 1, fd, iov, iovcnt, pnum);
              try {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  var num = doWritev(stream, iov, iovcnt);
                  HEAPU32[pnum >> 2] = num;
                  return 0
              } catch (e) {
                  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                  return e.errno
              }
          }

          function _getaddrinfo(node, service, hint, out) {
              if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(49, 0, 1, node, service, hint, out);
              var addr = 0;
              var port = 0;
              var flags = 0;
              var family = 0;
              var type = 0;
              var proto = 0;
              var ai;

              function allocaddrinfo(family, type, proto, canon, addr, port) {
                  var sa, salen, ai;
                  var errno;
                  salen = family === 10 ? 28 : 16;
                  addr = family === 10 ? inetNtop6(addr) : inetNtop4(addr);
                  sa = _malloc(salen);
                  errno = writeSockaddr(sa, family, addr, port);
                  assert(!errno);
                  ai = _malloc(32);
                  HEAP32[ai + 4 >> 2] = family;
                  HEAP32[ai + 8 >> 2] = type;
                  HEAP32[ai + 12 >> 2] = proto;
                  HEAPU32[ai + 24 >> 2] = canon;
                  HEAPU32[ai + 20 >> 2] = sa;
                  if (family === 10) {
                      HEAP32[ai + 16 >> 2] = 28
                  } else {
                      HEAP32[ai + 16 >> 2] = 16
                  }
                  HEAP32[ai + 28 >> 2] = 0;
                  return ai
              }
              if (hint) {
                  flags = HEAP32[hint >> 2];
                  family = HEAP32[hint + 4 >> 2];
                  type = HEAP32[hint + 8 >> 2];
                  proto = HEAP32[hint + 12 >> 2]
              }
              if (type && !proto) {
                  proto = type === 2 ? 17 : 6
              }
              if (!type && proto) {
                  type = proto === 17 ? 2 : 1
              }
              if (proto === 0) {
                  proto = 6
              }
              if (type === 0) {
                  type = 1
              }
              if (!node && !service) {
                  return -2
              }
              if (flags & ~(1 | 2 | 4 | 1024 | 8 | 16 | 32)) {
                  return -1
              }
              if (hint !== 0 && HEAP32[hint >> 2] & 2 && !node) {
                  return -1
              }
              if (flags & 32) {
                  return -2
              }
              if (type !== 0 && type !== 1 && type !== 2) {
                  return -7
              }
              if (family !== 0 && family !== 2 && family !== 10) {
                  return -6
              }
              if (service) {
                  service = UTF8ToString(service);
                  port = parseInt(service, 10);
                  if (isNaN(port)) {
                      if (flags & 1024) {
                          return -2
                      }
                      return -8
                  }
              }
              if (!node) {
                  if (family === 0) {
                      family = 2
                  }
                  if ((flags & 1) === 0) {
                      if (family === 2) {
                          addr = _htonl(2130706433)
                      } else {
                          addr = [0, 0, 0, 1]
                      }
                  }
                  ai = allocaddrinfo(family, type, proto, null, addr, port);
                  HEAPU32[out >> 2] = ai;
                  return 0
              }
              node = UTF8ToString(node);
              addr = inetPton4(node);
              if (addr !== null) {
                  if (family === 0 || family === 2) {
                      family = 2
                  } else if (family === 10 && flags & 8) {
                      addr = [0, 0, _htonl(65535), addr];
                      family = 10
                  } else {
                      return -2
                  }
              } else {
                  addr = inetPton6(node);
                  if (addr !== null) {
                      if (family === 0 || family === 10) {
                          family = 10
                      } else {
                          return -2
                      }
                  }
              }
              if (addr != null) {
                  ai = allocaddrinfo(family, type, proto, node, addr, port);
                  HEAPU32[out >> 2] = ai;
                  return 0
              }
              if (flags & 4) {
                  return -2
              }
              node = DNS.lookup_name(node);
              addr = inetPton4(node);
              if (family === 0) {
                  family = 2
              } else if (family === 10) {
                  addr = [0, 0, _htonl(65535), addr]
              }
              ai = allocaddrinfo(family, type, proto, null, addr, port);
              HEAPU32[out >> 2] = ai;
              return 0
          }
          var _getnameinfo = (sa, salen, node, nodelen, serv, servlen, flags) => {
              var info = readSockaddr(sa, salen);
              if (info.errno) {
                  return -6
              }
              var port = info.port;
              var addr = info.addr;
              var overflowed = false;
              if (node && nodelen) {
                  var lookup;
                  if (flags & 1 || !(lookup = DNS.lookup_addr(addr))) {
                      if (flags & 8) {
                          return -2
                      }
                  } else {
                      addr = lookup
                  }
                  var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
                  if (numBytesWrittenExclNull + 1 >= nodelen) {
                      overflowed = true
                  }
              }
              if (serv && servlen) {
                  port = "" + port;
                  var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
                  if (numBytesWrittenExclNull + 1 >= servlen) {
                      overflowed = true
                  }
              }
              if (overflowed) {
                  return -12
              }
              return 0
          };
          var arraySum = (array, index) => {
              var sum = 0;
              for (var i = 0; i <= index; sum += array[i++]) {}
              return sum
          };
          var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          var addDays = (date, days) => {
              var newDate = new Date(date.getTime());
              while (days > 0) {
                  var leap = isLeapYear(newDate.getFullYear());
                  var currentMonth = newDate.getMonth();
                  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
                  if (days > daysInCurrentMonth - newDate.getDate()) {
                      days -= daysInCurrentMonth - newDate.getDate() + 1;
                      newDate.setDate(1);
                      if (currentMonth < 11) {
                          newDate.setMonth(currentMonth + 1)
                      } else {
                          newDate.setMonth(0);
                          newDate.setFullYear(newDate.getFullYear() + 1)
                      }
                  } else {
                      newDate.setDate(newDate.getDate() + days);
                      return newDate
                  }
              }
              return newDate
          };
          var writeArrayToMemory = (array, buffer) => {
              assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
              HEAP8.set(array, buffer)
          };
          var _strftime = (s, maxsize, format, tm) => {
              var tm_zone = HEAPU32[tm + 40 >> 2];
              var date = {
                  tm_sec: HEAP32[tm >> 2],
                  tm_min: HEAP32[tm + 4 >> 2],
                  tm_hour: HEAP32[tm + 8 >> 2],
                  tm_mday: HEAP32[tm + 12 >> 2],
                  tm_mon: HEAP32[tm + 16 >> 2],
                  tm_year: HEAP32[tm + 20 >> 2],
                  tm_wday: HEAP32[tm + 24 >> 2],
                  tm_yday: HEAP32[tm + 28 >> 2],
                  tm_isdst: HEAP32[tm + 32 >> 2],
                  tm_gmtoff: HEAP32[tm + 36 >> 2],
                  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
              };
              var pattern = UTF8ToString(format);
              var EXPANSION_RULES_1 = {
                  "%c": "%a %b %d %H:%M:%S %Y",
                  "%D": "%m/%d/%y",
                  "%F": "%Y-%m-%d",
                  "%h": "%b",
                  "%r": "%I:%M:%S %p",
                  "%R": "%H:%M",
                  "%T": "%H:%M:%S",
                  "%x": "%m/%d/%y",
                  "%X": "%H:%M:%S",
                  "%Ec": "%c",
                  "%EC": "%C",
                  "%Ex": "%m/%d/%y",
                  "%EX": "%H:%M:%S",
                  "%Ey": "%y",
                  "%EY": "%Y",
                  "%Od": "%d",
                  "%Oe": "%e",
                  "%OH": "%H",
                  "%OI": "%I",
                  "%Om": "%m",
                  "%OM": "%M",
                  "%OS": "%S",
                  "%Ou": "%u",
                  "%OU": "%U",
                  "%OV": "%V",
                  "%Ow": "%w",
                  "%OW": "%W",
                  "%Oy": "%y"
              };
              for (var rule in EXPANSION_RULES_1) {
                  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
              }
              var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

              function leadingSomething(value, digits, character) {
                  var str = typeof value == "number" ? value.toString() : value || "";
                  while (str.length < digits) {
                      str = character[0] + str
                  }
                  return str
              }

              function leadingNulls(value, digits) {
                  return leadingSomething(value, digits, "0")
              }

              function compareByDay(date1, date2) {
                  function sgn(value) {
                      return value < 0 ? -1 : value > 0 ? 1 : 0
                  }
                  var compare;
                  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
                      if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                          compare = sgn(date1.getDate() - date2.getDate())
                      }
                  }
                  return compare
              }

              function getFirstWeekStartDate(janFourth) {
                  switch (janFourth.getDay()) {
                      case 0:
                          return new Date(janFourth.getFullYear() - 1, 11, 29);
                      case 1:
                          return janFourth;
                      case 2:
                          return new Date(janFourth.getFullYear(), 0, 3);
                      case 3:
                          return new Date(janFourth.getFullYear(), 0, 2);
                      case 4:
                          return new Date(janFourth.getFullYear(), 0, 1);
                      case 5:
                          return new Date(janFourth.getFullYear() - 1, 11, 31);
                      case 6:
                          return new Date(janFourth.getFullYear() - 1, 11, 30)
                  }
              }

              function getWeekBasedYear(date) {
                  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
                  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
                  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
                  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
                  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
                  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
                      if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                          return thisDate.getFullYear() + 1
                      }
                      return thisDate.getFullYear()
                  }
                  return thisDate.getFullYear() - 1
              }
              var EXPANSION_RULES_2 = {
                  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
                  "%A": date => WEEKDAYS[date.tm_wday],
                  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
                  "%B": date => MONTHS[date.tm_mon],
                  "%C": date => {
                      var year = date.tm_year + 1900;
                      return leadingNulls(year / 100 | 0, 2)
                  },
                  "%d": date => leadingNulls(date.tm_mday, 2),
                  "%e": date => leadingSomething(date.tm_mday, 2, " "),
                  "%g": date => getWeekBasedYear(date).toString().substring(2),
                  "%G": getWeekBasedYear,
                  "%H": date => leadingNulls(date.tm_hour, 2),
                  "%I": date => {
                      var twelveHour = date.tm_hour;
                      if (twelveHour == 0) twelveHour = 12;
                      else if (twelveHour > 12) twelveHour -= 12;
                      return leadingNulls(twelveHour, 2)
                  },
                  "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
                  "%m": date => leadingNulls(date.tm_mon + 1, 2),
                  "%M": date => leadingNulls(date.tm_min, 2),
                  "%n": () => "\n",
                  "%p": date => {
                      if (date.tm_hour >= 0 && date.tm_hour < 12) {
                          return "AM"
                      }
                      return "PM"
                  },
                  "%S": date => leadingNulls(date.tm_sec, 2),
                  "%t": () => "\t",
                  "%u": date => date.tm_wday || 7,
                  "%U": date => {
                      var days = date.tm_yday + 7 - date.tm_wday;
                      return leadingNulls(Math.floor(days / 7), 2)
                  },
                  "%V": date => {
                      var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
                      if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
                          val++
                      }
                      if (!val) {
                          val = 52;
                          var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
                          if (dec31 == 4 || dec31 == 5 && isLeapYear(date.tm_year % 400 - 1)) {
                              val++
                          }
                      } else if (val == 53) {
                          var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
                          if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1
                      }
                      return leadingNulls(val, 2)
                  },
                  "%w": date => date.tm_wday,
                  "%W": date => {
                      var days = date.tm_yday + 7 - (date.tm_wday + 6) % 7;
                      return leadingNulls(Math.floor(days / 7), 2)
                  },
                  "%y": date => (date.tm_year + 1900).toString().substring(2),
                  "%Y": date => date.tm_year + 1900,
                  "%z": date => {
                      var off = date.tm_gmtoff;
                      var ahead = off >= 0;
                      off = Math.abs(off) / 60;
                      off = off / 60 * 100 + off % 60;
                      return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
                  },
                  "%Z": date => date.tm_zone,
                  "%%": () => "%"
              };
              pattern = pattern.replace(/%%/g, "\0\0");
              for (var rule in EXPANSION_RULES_2) {
                  if (pattern.includes(rule)) {
                      pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
                  }
              }
              pattern = pattern.replace(/\0\0/g, "%");
              var bytes = intArrayFromString(pattern, false);
              if (bytes.length > maxsize) {
                  return 0
              }
              writeArrayToMemory(bytes, s);
              return bytes.length - 1
          };
          var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);

          function _webaudio_getChannels() {
              if (Module.webaudioContext === undefined) return 0;
              return Module.webaudioContext.destination.channelCount
          }

          function _webaudio_getSampleRate() {
              if (Module.webaudioContext === undefined) return 0;
              return Module.webaudioContext.sampleRate
          }
          async function _webaudio_init(rate, channels, webaudio_buffer, latency) {
              const STORAGE_SIZE = 1024 * 1024;
              if (latency === 0) {
                  latency = "playback"
              } else if (latency === 1) {
                  latency = "interactive"
              } else if (latency === 2) {
                  latency = "balanced"
              } else {
                  console.error("error: bad latency setting!");
                  return
              }
              var audioCtx = new AudioContext({
                  latencyHint: latency,
                  sampleRate: rate
              });
              audioCtx.suspend();
              Module.webaudioContext = audioCtx;
              var msg = {};
              msg["type"] = "recv-audio-queue";
              msg["is_paused"] = new Int32Array(wasmMemory.buffer, webaudio_buffer, 1);
              msg["is_paused"][0] = 0;
              webaudio_buffer += 4;
              msg["head"] = new Int32Array(wasmMemory.buffer, webaudio_buffer, 1);
              webaudio_buffer += 4;
              msg["tail"] = new Int32Array(wasmMemory.buffer, webaudio_buffer, 1);
              webaudio_buffer += 4;
              msg["can_write"] = new Int32Array(wasmMemory.buffer, webaudio_buffer, 1);
              msg["can_write"][0] = 1;
              webaudio_buffer += 4;
              msg["storage"] = new Float32Array(wasmMemory.buffer, webaudio_buffer, STORAGE_SIZE / 4);
              if (audioCtx.sampleRate != rate) {
                  console.error("desired rate unsupported by the browser, actual sample rate is: " + audioCtx.sampleRate)
              }
              if (audioCtx.destination.maxChannelCount < channels) {
                  console.error("Max number of channels of the browser is ", audioCtx.destination.maxChannelCount);
                  channels = audioCtx.destination.maxChannelCount
              }
              try {
                  await audioCtx.audioWorklet.addModule("./lib/vlc/audio-worklet-processor.js")
              } catch (error) {
                  console.error("could not add worklet module error: " + error);
                  return
              }
              const node = new AudioWorkletNode(audioCtx, "worklet-processor", {
                  numberOfInputs: 0,
                  numberOfOutputs: 1,
                  outputChannelCount: [channels]
              });
              var p = new Promise(function(resolve, reject) {
                  node["port"].onmessage = function(e) {
                      console.log("successfully constructed AudioWorkletProcessor");
                      if (e.data === "ready") {
                          resolve()
                      } else if (e.data === "error") {
                          reject();
                          return
                      }
                  }
              });
              node["port"].postMessage(msg);
              await p;
              node.connect(audioCtx.destination);
              audioCtx.resume()
          }
          _webaudio_init.isAsync = true;
          var wasmTableMirror = [];
          var wasmTable;
          var runAndAbortIfError = func => {
              try {
                  return func()
              } catch (e) {
                  abort(e)
              }
          };
          var Asyncify = {
              instrumentWasmImports(imports) {
                  var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
                  for (let [x, original] of Object.entries(imports)) {
                      let sig = original.sig;
                      if (typeof original == "function") {
                          let isAsyncifyImport = original.isAsync || importPattern.test(x);
                          imports[x] = (...args) => {
                              var originalAsyncifyState = Asyncify.state;
                              try {
                                  return original(...args)
                              } finally {
                                  var changedToDisabled = originalAsyncifyState === Asyncify.State.Normal && Asyncify.state === Asyncify.State.Disabled;
                                  var ignoredInvoke = x.startsWith("invoke_") && true;
                                  if (Asyncify.state !== originalAsyncifyState && !isAsyncifyImport && !changedToDisabled && !ignoredInvoke) {
                                      throw new Error(`import ${x} was not in ASYNCIFY_IMPORTS, but changed the state`)
                                  }
                              }
                          }
                      }
                  }
              },
              instrumentWasmExports(exports) {
                  var ret = {};
                  for (let [x, original] of Object.entries(exports)) {
                      if (typeof original == "function") {
                          ret[x] = (...args) => {
                              Asyncify.exportCallStack.push(x);
                              try {
                                  return original(...args)
                              } finally {
                                  if (!ABORT) {
                                      var y = Asyncify.exportCallStack.pop();
                                      assert(y === x);
                                      Asyncify.maybeStopUnwind()
                                  }
                              }
                          }
                      } else {
                          ret[x] = original
                      }
                  }
                  return ret
              },
              State: {
                  Normal: 0,
                  Unwinding: 1,
                  Rewinding: 2,
                  Disabled: 3
              },
              state: 0,
              StackSize: 4096,
              currData: null,
              handleSleepReturnValue: 0,
              exportCallStack: [],
              callStackNameToId: {},
              callStackIdToName: {},
              callStackId: 0,
              asyncPromiseHandlers: null,
              sleepCallbacks: [],
              getCallStackId(funcName) {
                  var id = Asyncify.callStackNameToId[funcName];
                  if (id === undefined) {
                      id = Asyncify.callStackId++;
                      Asyncify.callStackNameToId[funcName] = id;
                      Asyncify.callStackIdToName[id] = funcName
                  }
                  return id
              },
              maybeStopUnwind() {
                  if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
                      Asyncify.state = Asyncify.State.Normal;
                      runtimeKeepalivePush();
                      runAndAbortIfError(_asyncify_stop_unwind);
                      if (typeof Fibers != "undefined") {
                          Fibers.trampoline()
                      }
                  }
              },
              whenDone() {
                  assert(Asyncify.currData, "Tried to wait for an async operation when none is in progress.");
                  assert(!Asyncify.asyncPromiseHandlers, "Cannot have multiple async operations in flight at once");
                  return new Promise((resolve, reject) => {
                      Asyncify.asyncPromiseHandlers = {
                          resolve: resolve,
                          reject: reject
                      }
                  })
              },
              allocateData() {
                  var ptr = _malloc(12 + Asyncify.StackSize);
                  Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
                  Asyncify.setDataRewindFunc(ptr);
                  return ptr
              },
              setDataHeader(ptr, stack, stackSize) {
                  HEAPU32[ptr >> 2] = stack;
                  HEAPU32[ptr + 4 >> 2] = stack + stackSize
              },
              setDataRewindFunc(ptr) {
                  var bottomOfCallStack = Asyncify.exportCallStack[0];
                  var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
                  HEAP32[ptr + 8 >> 2] = rewindId
              },
              getDataRewindFunc(ptr) {
                  var id = HEAP32[ptr + 8 >> 2];
                  var name = Asyncify.callStackIdToName[id];
                  var func = wasmExports[name];
                  return func
              },
              doRewind(ptr) {
                  var start = Asyncify.getDataRewindFunc(ptr);
                  runtimeKeepalivePop();
                  return start()
              },
              handleSleep(startAsync) {
                  assert(Asyncify.state !== Asyncify.State.Disabled, "Asyncify cannot be done during or after the runtime exits");
                  if (ABORT) return;
                  if (Asyncify.state === Asyncify.State.Normal) {
                      var reachedCallback = false;
                      var reachedAfterCallback = false;
                      startAsync((handleSleepReturnValue = 0) => {
                          assert(!handleSleepReturnValue || typeof handleSleepReturnValue == "number" || typeof handleSleepReturnValue == "boolean");
                          if (ABORT) return;
                          Asyncify.handleSleepReturnValue = handleSleepReturnValue;
                          reachedCallback = true;
                          if (!reachedAfterCallback) {
                              return
                          }
                          assert(!Asyncify.exportCallStack.length, "Waking up (starting to rewind) must be done from JS, without compiled code on the stack.");
                          Asyncify.state = Asyncify.State.Rewinding;
                          runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
                          if (typeof Browser != "undefined" && Browser.mainLoop.func) {
                              Browser.mainLoop.resume()
                          }
                          var asyncWasmReturnValue, isError = false;
                          try {
                              asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData)
                          } catch (err) {
                              asyncWasmReturnValue = err;
                              isError = true
                          }
                          var handled = false;
                          if (!Asyncify.currData) {
                              var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
                              if (asyncPromiseHandlers) {
                                  Asyncify.asyncPromiseHandlers = null;
                                  (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
                                  handled = true
                              }
                          }
                          if (isError && !handled) {
                              throw asyncWasmReturnValue
                          }
                      });
                      reachedAfterCallback = true;
                      if (!reachedCallback) {
                          Asyncify.state = Asyncify.State.Unwinding;
                          Asyncify.currData = Asyncify.allocateData();
                          if (typeof Browser != "undefined" && Browser.mainLoop.func) {
                              Browser.mainLoop.pause()
                          }
                          runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData))
                      }
                  } else if (Asyncify.state === Asyncify.State.Rewinding) {
                      Asyncify.state = Asyncify.State.Normal;
                      runAndAbortIfError(_asyncify_stop_rewind);
                      _free(Asyncify.currData);
                      Asyncify.currData = null;
                      Asyncify.sleepCallbacks.forEach(callUserCallback)
                  } else {
                      abort(`invalid state: ${Asyncify.state}`)
                  }
                  return Asyncify.handleSleepReturnValue
              },
              handleAsync(startAsync) {
                  return Asyncify.handleSleep(wakeUp => {
                      startAsync().then(wakeUp)
                  })
              }
          };
          var allocateUTF8 = stringToNewUTF8;
          var writeAsciiToMemory = (str, buffer, dontAddNull) => {
              for (var i = 0; i < str.length; ++i) {
                  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
                  HEAP8[buffer++] = str.charCodeAt(i)
              }
              if (!dontAddNull) HEAP8[buffer] = 0
          };
          PThread.init();
          FS.createPreloadedFile = FS_createPreloadedFile;
          FS.staticInit();
          embind_init_charCodes();
          BindingError = Module["BindingError"] = class BindingError extends Error {
              constructor(message) {
                  super(message);
                  this.name = "BindingError"
              }
          };
          InternalError = Module["InternalError"] = class InternalError extends Error {
              constructor(message) {
                  super(message);
                  this.name = "InternalError"
              }
          };
          init_emval();
          var GLctx;
          Module["requestFullscreen"] = Browser.requestFullscreen;
          Module["requestFullScreen"] = Browser.requestFullScreen;
          Module["requestAnimationFrame"] = Browser.requestAnimationFrame;
          Module["setCanvasSize"] = Browser.setCanvasSize;
          Module["pauseMainLoop"] = Browser.mainLoop.pause;
          Module["resumeMainLoop"] = Browser.mainLoop.resume;
          Module["getUserMedia"] = Browser.getUserMedia;
          Module["createContext"] = Browser.createContext;
          var preloadedImages = {};
          var preloadedAudios = {};
          for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));
          var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
          for (var i = 0; i < 288; ++i) {
              miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1)
          }
          var miniTempWebGLIntBuffersStorage = new Int32Array(288);
          for (var i = 0; i < 288; ++i) {
              miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i + 1)
          }
          var proxiedFunctionTable = [_proc_exit, exitOnMainThread, pthreadCreateProxied, ___syscall_accept4, ___syscall_bind, ___syscall_connect, ___syscall_dup, ___syscall_dup3, ___syscall_faccessat, ___syscall_fadvise64, ___syscall_fcntl64, ___syscall_fdatasync, ___syscall_fstat64, ___syscall_ftruncate64, ___syscall_getcwd, ___syscall_getdents64, ___syscall_getpeername, ___syscall_getsockname, ___syscall_getsockopt, ___syscall_ioctl, ___syscall_listen, ___syscall_lstat64, ___syscall_mkdirat, ___syscall_newfstatat, ___syscall_openat, ___syscall_pipe, ___syscall_poll, ___syscall_recvfrom, ___syscall_recvmsg, ___syscall_renameat, ___syscall_rmdir, ___syscall_sendmsg, ___syscall_sendto, ___syscall_socket, ___syscall_stat64, ___syscall_unlinkat, __emscripten_runtime_keepalive_clear, __mmap_js, __munmap_js, _eglGetDisplay, _environ_get, _environ_sizes_get, _fd_close, _fd_fdstat_get, _fd_pread, _fd_read, _fd_seek, _fd_sync, _fd_write, _getaddrinfo];

          function checkIncomingModuleAPI() {
              ignoredModuleProp("fetchSettings")
          }
          var wasmImports = {
              __assert_fail: ___assert_fail,
              __asyncjs__CopyFrameToBuffer: __asyncjs__CopyFrameToBuffer,
              __asyncjs__Swap: __asyncjs__Swap,
              __asyncjs__bindVideoFrame: __asyncjs__bindVideoFrame,
              __asyncjs__flushAsync: __asyncjs__flushAsync,
              __asyncjs__getVoutMessagePort: __asyncjs__getVoutMessagePort,
              __asyncjs__initDecoderWorkerMessagePort: __asyncjs__initDecoderWorkerMessagePort,
              __asyncjs__init_js_file: __asyncjs__init_js_file,
              __asyncjs__probeConfig: __asyncjs__probeConfig,
              __call_sighandler: ___call_sighandler,
              __cxa_rethrow: ___cxa_rethrow,
              __cxa_throw: ___cxa_throw,
              __emscripten_init_main_thread_js: ___emscripten_init_main_thread_js,
              __emscripten_thread_cleanup: ___emscripten_thread_cleanup,
              __pthread_create_js: ___pthread_create_js,
              __pthread_kill_js: ___pthread_kill_js,
              __syscall_accept4: ___syscall_accept4,
              __syscall_bind: ___syscall_bind,
              __syscall_connect: ___syscall_connect,
              __syscall_dup: ___syscall_dup,
              __syscall_dup3: ___syscall_dup3,
              __syscall_faccessat: ___syscall_faccessat,
              __syscall_fadvise64: ___syscall_fadvise64,
              __syscall_fcntl64: ___syscall_fcntl64,
              __syscall_fdatasync: ___syscall_fdatasync,
              __syscall_fstat64: ___syscall_fstat64,
              __syscall_ftruncate64: ___syscall_ftruncate64,
              __syscall_getcwd: ___syscall_getcwd,
              __syscall_getdents64: ___syscall_getdents64,
              __syscall_getpeername: ___syscall_getpeername,
              __syscall_getsockname: ___syscall_getsockname,
              __syscall_getsockopt: ___syscall_getsockopt,
              __syscall_ioctl: ___syscall_ioctl,
              __syscall_listen: ___syscall_listen,
              __syscall_lstat64: ___syscall_lstat64,
              __syscall_mkdirat: ___syscall_mkdirat,
              __syscall_newfstatat: ___syscall_newfstatat,
              __syscall_openat: ___syscall_openat,
              __syscall_pipe: ___syscall_pipe,
              __syscall_poll: ___syscall_poll,
              __syscall_recvfrom: ___syscall_recvfrom,
              __syscall_recvmsg: ___syscall_recvmsg,
              __syscall_renameat: ___syscall_renameat,
              __syscall_rmdir: ___syscall_rmdir,
              __syscall_sendmsg: ___syscall_sendmsg,
              __syscall_sendto: ___syscall_sendto,
              __syscall_socket: ___syscall_socket,
              __syscall_stat64: ___syscall_stat64,
              __syscall_unlinkat: ___syscall_unlinkat,
              _embind_register_bigint: __embind_register_bigint,
              _embind_register_bool: __embind_register_bool,
              _embind_register_emval: __embind_register_emval,
              _embind_register_float: __embind_register_float,
              _embind_register_integer: __embind_register_integer,
              _embind_register_memory_view: __embind_register_memory_view,
              _embind_register_std_string: __embind_register_std_string,
              _embind_register_std_wstring: __embind_register_std_wstring,
              _embind_register_void: __embind_register_void,
              _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
              _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
              _emscripten_proxied_gl_context_activated_from_main_browser_thread: __emscripten_proxied_gl_context_activated_from_main_browser_thread,
              _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
              _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear,
              _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
              _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
              _emscripten_throw_longjmp: __emscripten_throw_longjmp,
              _emval_as: __emval_as,
              _emval_call: __emval_call,
              _emval_call_method: __emval_call_method,
              _emval_decref: __emval_decref,
              _emval_get_global: __emval_get_global,
              _emval_get_method_caller: __emval_get_method_caller,
              _emval_get_property: __emval_get_property,
              _emval_incref: __emval_incref,
              _emval_new_array: __emval_new_array,
              _emval_new_cstring: __emval_new_cstring,
              _emval_new_object: __emval_new_object,
              _emval_run_destructors: __emval_run_destructors,
              _emval_set_property: __emval_set_property,
              _emval_take_value: __emval_take_value,
              _gmtime_js: __gmtime_js,
              _localtime_js: __localtime_js,
              _mktime_js: __mktime_js,
              _mmap_js: __mmap_js,
              _munmap_js: __munmap_js,
              _timegm_js: __timegm_js,
              _tzset_js: __tzset_js,
              abort: _abort,
              closeMessagePort: closeMessagePort,
              createGlContext: createGlContext,
              eglGetDisplay: _eglGetDisplay,
              emscripten_asm_const_async_on_main_thread: _emscripten_asm_const_async_on_main_thread,
              emscripten_asm_const_int: _emscripten_asm_const_int,
              emscripten_asm_const_int_sync_on_main_thread: _emscripten_asm_const_int_sync_on_main_thread,
              emscripten_cancel_main_loop: _emscripten_cancel_main_loop,
              emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
              emscripten_date_now: _emscripten_date_now,
              emscripten_err: _emscripten_err,
              emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
              emscripten_get_heap_max: _emscripten_get_heap_max,
              emscripten_get_now: _emscripten_get_now,
              emscripten_get_now_res: _emscripten_get_now_res,
              emscripten_glActiveTexture: _emscripten_glActiveTexture,
              emscripten_glAttachShader: _emscripten_glAttachShader,
              emscripten_glBeginQuery: _emscripten_glBeginQuery,
              emscripten_glBeginQueryEXT: _emscripten_glBeginQueryEXT,
              emscripten_glBeginTransformFeedback: _emscripten_glBeginTransformFeedback,
              emscripten_glBindAttribLocation: _emscripten_glBindAttribLocation,
              emscripten_glBindBuffer: _emscripten_glBindBuffer,
              emscripten_glBindBufferBase: _emscripten_glBindBufferBase,
              emscripten_glBindBufferRange: _emscripten_glBindBufferRange,
              emscripten_glBindFramebuffer: _emscripten_glBindFramebuffer,
              emscripten_glBindRenderbuffer: _emscripten_glBindRenderbuffer,
              emscripten_glBindSampler: _emscripten_glBindSampler,
              emscripten_glBindTexture: _emscripten_glBindTexture,
              emscripten_glBindTransformFeedback: _emscripten_glBindTransformFeedback,
              emscripten_glBindVertexArray: _emscripten_glBindVertexArray,
              emscripten_glBlendColor: _emscripten_glBlendColor,
              emscripten_glBlendEquation: _emscripten_glBlendEquation,
              emscripten_glBlendEquationSeparate: _emscripten_glBlendEquationSeparate,
              emscripten_glBlendFunc: _emscripten_glBlendFunc,
              emscripten_glBlendFuncSeparate: _emscripten_glBlendFuncSeparate,
              emscripten_glBlitFramebuffer: _emscripten_glBlitFramebuffer,
              emscripten_glBufferData: _emscripten_glBufferData,
              emscripten_glBufferSubData: _emscripten_glBufferSubData,
              emscripten_glCheckFramebufferStatus: _emscripten_glCheckFramebufferStatus,
              emscripten_glClear: _emscripten_glClear,
              emscripten_glClearBufferfi: _emscripten_glClearBufferfi,
              emscripten_glClearBufferfv: _emscripten_glClearBufferfv,
              emscripten_glClearBufferiv: _emscripten_glClearBufferiv,
              emscripten_glClearBufferuiv: _emscripten_glClearBufferuiv,
              emscripten_glClearColor: _emscripten_glClearColor,
              emscripten_glClearDepthf: _emscripten_glClearDepthf,
              emscripten_glClearStencil: _emscripten_glClearStencil,
              emscripten_glClientWaitSync: _emscripten_glClientWaitSync,
              emscripten_glColorMask: _emscripten_glColorMask,
              emscripten_glCompileShader: _emscripten_glCompileShader,
              emscripten_glCompressedTexImage2D: _emscripten_glCompressedTexImage2D,
              emscripten_glCompressedTexImage3D: _emscripten_glCompressedTexImage3D,
              emscripten_glCompressedTexSubImage2D: _emscripten_glCompressedTexSubImage2D,
              emscripten_glCompressedTexSubImage3D: _emscripten_glCompressedTexSubImage3D,
              emscripten_glCopyBufferSubData: _emscripten_glCopyBufferSubData,
              emscripten_glCopyTexImage2D: _emscripten_glCopyTexImage2D,
              emscripten_glCopyTexSubImage2D: _emscripten_glCopyTexSubImage2D,
              emscripten_glCopyTexSubImage3D: _emscripten_glCopyTexSubImage3D,
              emscripten_glCreateProgram: _emscripten_glCreateProgram,
              emscripten_glCreateShader: _emscripten_glCreateShader,
              emscripten_glCullFace: _emscripten_glCullFace,
              emscripten_glDeleteBuffers: _emscripten_glDeleteBuffers,
              emscripten_glDeleteFramebuffers: _emscripten_glDeleteFramebuffers,
              emscripten_glDeleteProgram: _emscripten_glDeleteProgram,
              emscripten_glDeleteQueries: _emscripten_glDeleteQueries,
              emscripten_glDeleteQueriesEXT: _emscripten_glDeleteQueriesEXT,
              emscripten_glDeleteRenderbuffers: _emscripten_glDeleteRenderbuffers,
              emscripten_glDeleteSamplers: _emscripten_glDeleteSamplers,
              emscripten_glDeleteShader: _emscripten_glDeleteShader,
              emscripten_glDeleteSync: _emscripten_glDeleteSync,
              emscripten_glDeleteTextures: _emscripten_glDeleteTextures,
              emscripten_glDeleteTransformFeedbacks: _emscripten_glDeleteTransformFeedbacks,
              emscripten_glDeleteVertexArrays: _emscripten_glDeleteVertexArrays,
              emscripten_glDepthFunc: _emscripten_glDepthFunc,
              emscripten_glDepthMask: _emscripten_glDepthMask,
              emscripten_glDepthRangef: _emscripten_glDepthRangef,
              emscripten_glDetachShader: _emscripten_glDetachShader,
              emscripten_glDisable: _emscripten_glDisable,
              emscripten_glDisableVertexAttribArray: _emscripten_glDisableVertexAttribArray,
              emscripten_glDrawArrays: _emscripten_glDrawArrays,
              emscripten_glDrawArraysInstanced: _emscripten_glDrawArraysInstanced,
              emscripten_glDrawBuffers: _emscripten_glDrawBuffers,
              emscripten_glDrawElements: _emscripten_glDrawElements,
              emscripten_glDrawElementsInstanced: _emscripten_glDrawElementsInstanced,
              emscripten_glDrawRangeElements: _emscripten_glDrawRangeElements,
              emscripten_glEnable: _emscripten_glEnable,
              emscripten_glEnableVertexAttribArray: _emscripten_glEnableVertexAttribArray,
              emscripten_glEndQuery: _emscripten_glEndQuery,
              emscripten_glEndQueryEXT: _emscripten_glEndQueryEXT,
              emscripten_glEndTransformFeedback: _emscripten_glEndTransformFeedback,
              emscripten_glFenceSync: _emscripten_glFenceSync,
              emscripten_glFinish: _emscripten_glFinish,
              emscripten_glFlush: _emscripten_glFlush,
              emscripten_glFramebufferRenderbuffer: _emscripten_glFramebufferRenderbuffer,
              emscripten_glFramebufferTexture2D: _emscripten_glFramebufferTexture2D,
              emscripten_glFramebufferTextureLayer: _emscripten_glFramebufferTextureLayer,
              emscripten_glFrontFace: _emscripten_glFrontFace,
              emscripten_glGenBuffers: _emscripten_glGenBuffers,
              emscripten_glGenFramebuffers: _emscripten_glGenFramebuffers,
              emscripten_glGenQueries: _emscripten_glGenQueries,
              emscripten_glGenQueriesEXT: _emscripten_glGenQueriesEXT,
              emscripten_glGenRenderbuffers: _emscripten_glGenRenderbuffers,
              emscripten_glGenSamplers: _emscripten_glGenSamplers,
              emscripten_glGenTextures: _emscripten_glGenTextures,
              emscripten_glGenTransformFeedbacks: _emscripten_glGenTransformFeedbacks,
              emscripten_glGenVertexArrays: _emscripten_glGenVertexArrays,
              emscripten_glGenerateMipmap: _emscripten_glGenerateMipmap,
              emscripten_glGetActiveAttrib: _emscripten_glGetActiveAttrib,
              emscripten_glGetActiveUniform: _emscripten_glGetActiveUniform,
              emscripten_glGetActiveUniformBlockName: _emscripten_glGetActiveUniformBlockName,
              emscripten_glGetActiveUniformBlockiv: _emscripten_glGetActiveUniformBlockiv,
              emscripten_glGetActiveUniformsiv: _emscripten_glGetActiveUniformsiv,
              emscripten_glGetAttachedShaders: _emscripten_glGetAttachedShaders,
              emscripten_glGetAttribLocation: _emscripten_glGetAttribLocation,
              emscripten_glGetBooleanv: _emscripten_glGetBooleanv,
              emscripten_glGetBufferParameteri64v: _emscripten_glGetBufferParameteri64v,
              emscripten_glGetBufferParameteriv: _emscripten_glGetBufferParameteriv,
              emscripten_glGetError: _emscripten_glGetError,
              emscripten_glGetFloatv: _emscripten_glGetFloatv,
              emscripten_glGetFragDataLocation: _emscripten_glGetFragDataLocation,
              emscripten_glGetFramebufferAttachmentParameteriv: _emscripten_glGetFramebufferAttachmentParameteriv,
              emscripten_glGetInteger64i_v: _emscripten_glGetInteger64i_v,
              emscripten_glGetInteger64v: _emscripten_glGetInteger64v,
              emscripten_glGetIntegeri_v: _emscripten_glGetIntegeri_v,
              emscripten_glGetIntegerv: _emscripten_glGetIntegerv,
              emscripten_glGetInternalformativ: _emscripten_glGetInternalformativ,
              emscripten_glGetProgramBinary: _emscripten_glGetProgramBinary,
              emscripten_glGetProgramInfoLog: _emscripten_glGetProgramInfoLog,
              emscripten_glGetProgramiv: _emscripten_glGetProgramiv,
              emscripten_glGetQueryObjecti64vEXT: _emscripten_glGetQueryObjecti64vEXT,
              emscripten_glGetQueryObjectivEXT: _emscripten_glGetQueryObjectivEXT,
              emscripten_glGetQueryObjectui64vEXT: _emscripten_glGetQueryObjectui64vEXT,
              emscripten_glGetQueryObjectuiv: _emscripten_glGetQueryObjectuiv,
              emscripten_glGetQueryObjectuivEXT: _emscripten_glGetQueryObjectuivEXT,
              emscripten_glGetQueryiv: _emscripten_glGetQueryiv,
              emscripten_glGetQueryivEXT: _emscripten_glGetQueryivEXT,
              emscripten_glGetRenderbufferParameteriv: _emscripten_glGetRenderbufferParameteriv,
              emscripten_glGetSamplerParameterfv: _emscripten_glGetSamplerParameterfv,
              emscripten_glGetSamplerParameteriv: _emscripten_glGetSamplerParameteriv,
              emscripten_glGetShaderInfoLog: _emscripten_glGetShaderInfoLog,
              emscripten_glGetShaderPrecisionFormat: _emscripten_glGetShaderPrecisionFormat,
              emscripten_glGetShaderSource: _emscripten_glGetShaderSource,
              emscripten_glGetShaderiv: _emscripten_glGetShaderiv,
              emscripten_glGetString: _emscripten_glGetString,
              emscripten_glGetStringi: _emscripten_glGetStringi,
              emscripten_glGetSynciv: _emscripten_glGetSynciv,
              emscripten_glGetTexParameterfv: _emscripten_glGetTexParameterfv,
              emscripten_glGetTexParameteriv: _emscripten_glGetTexParameteriv,
              emscripten_glGetTransformFeedbackVarying: _emscripten_glGetTransformFeedbackVarying,
              emscripten_glGetUniformBlockIndex: _emscripten_glGetUniformBlockIndex,
              emscripten_glGetUniformIndices: _emscripten_glGetUniformIndices,
              emscripten_glGetUniformLocation: _emscripten_glGetUniformLocation,
              emscripten_glGetUniformfv: _emscripten_glGetUniformfv,
              emscripten_glGetUniformiv: _emscripten_glGetUniformiv,
              emscripten_glGetUniformuiv: _emscripten_glGetUniformuiv,
              emscripten_glGetVertexAttribIiv: _emscripten_glGetVertexAttribIiv,
              emscripten_glGetVertexAttribIuiv: _emscripten_glGetVertexAttribIuiv,
              emscripten_glGetVertexAttribPointerv: _emscripten_glGetVertexAttribPointerv,
              emscripten_glGetVertexAttribfv: _emscripten_glGetVertexAttribfv,
              emscripten_glGetVertexAttribiv: _emscripten_glGetVertexAttribiv,
              emscripten_glHint: _emscripten_glHint,
              emscripten_glInvalidateFramebuffer: _emscripten_glInvalidateFramebuffer,
              emscripten_glInvalidateSubFramebuffer: _emscripten_glInvalidateSubFramebuffer,
              emscripten_glIsBuffer: _emscripten_glIsBuffer,
              emscripten_glIsEnabled: _emscripten_glIsEnabled,
              emscripten_glIsFramebuffer: _emscripten_glIsFramebuffer,
              emscripten_glIsProgram: _emscripten_glIsProgram,
              emscripten_glIsQuery: _emscripten_glIsQuery,
              emscripten_glIsQueryEXT: _emscripten_glIsQueryEXT,
              emscripten_glIsRenderbuffer: _emscripten_glIsRenderbuffer,
              emscripten_glIsSampler: _emscripten_glIsSampler,
              emscripten_glIsShader: _emscripten_glIsShader,
              emscripten_glIsSync: _emscripten_glIsSync,
              emscripten_glIsTexture: _emscripten_glIsTexture,
              emscripten_glIsTransformFeedback: _emscripten_glIsTransformFeedback,
              emscripten_glIsVertexArray: _emscripten_glIsVertexArray,
              emscripten_glLineWidth: _emscripten_glLineWidth,
              emscripten_glLinkProgram: _emscripten_glLinkProgram,
              emscripten_glPauseTransformFeedback: _emscripten_glPauseTransformFeedback,
              emscripten_glPixelStorei: _emscripten_glPixelStorei,
              emscripten_glPolygonOffset: _emscripten_glPolygonOffset,
              emscripten_glProgramBinary: _emscripten_glProgramBinary,
              emscripten_glProgramParameteri: _emscripten_glProgramParameteri,
              emscripten_glQueryCounterEXT: _emscripten_glQueryCounterEXT,
              emscripten_glReadBuffer: _emscripten_glReadBuffer,
              emscripten_glReadPixels: _emscripten_glReadPixels,
              emscripten_glReleaseShaderCompiler: _emscripten_glReleaseShaderCompiler,
              emscripten_glRenderbufferStorage: _emscripten_glRenderbufferStorage,
              emscripten_glRenderbufferStorageMultisample: _emscripten_glRenderbufferStorageMultisample,
              emscripten_glResumeTransformFeedback: _emscripten_glResumeTransformFeedback,
              emscripten_glSampleCoverage: _emscripten_glSampleCoverage,
              emscripten_glSamplerParameterf: _emscripten_glSamplerParameterf,
              emscripten_glSamplerParameterfv: _emscripten_glSamplerParameterfv,
              emscripten_glSamplerParameteri: _emscripten_glSamplerParameteri,
              emscripten_glSamplerParameteriv: _emscripten_glSamplerParameteriv,
              emscripten_glScissor: _emscripten_glScissor,
              emscripten_glShaderBinary: _emscripten_glShaderBinary,
              emscripten_glShaderSource: _emscripten_glShaderSource,
              emscripten_glStencilFunc: _emscripten_glStencilFunc,
              emscripten_glStencilFuncSeparate: _emscripten_glStencilFuncSeparate,
              emscripten_glStencilMask: _emscripten_glStencilMask,
              emscripten_glStencilMaskSeparate: _emscripten_glStencilMaskSeparate,
              emscripten_glStencilOp: _emscripten_glStencilOp,
              emscripten_glStencilOpSeparate: _emscripten_glStencilOpSeparate,
              emscripten_glTexImage2D: _emscripten_glTexImage2D,
              emscripten_glTexImage3D: _emscripten_glTexImage3D,
              emscripten_glTexParameterf: _emscripten_glTexParameterf,
              emscripten_glTexParameterfv: _emscripten_glTexParameterfv,
              emscripten_glTexParameteri: _emscripten_glTexParameteri,
              emscripten_glTexParameteriv: _emscripten_glTexParameteriv,
              emscripten_glTexStorage2D: _emscripten_glTexStorage2D,
              emscripten_glTexStorage3D: _emscripten_glTexStorage3D,
              emscripten_glTexSubImage2D: _emscripten_glTexSubImage2D,
              emscripten_glTexSubImage3D: _emscripten_glTexSubImage3D,
              emscripten_glTransformFeedbackVaryings: _emscripten_glTransformFeedbackVaryings,
              emscripten_glUniform1f: _emscripten_glUniform1f,
              emscripten_glUniform1fv: _emscripten_glUniform1fv,
              emscripten_glUniform1i: _emscripten_glUniform1i,
              emscripten_glUniform1iv: _emscripten_glUniform1iv,
              emscripten_glUniform1ui: _emscripten_glUniform1ui,
              emscripten_glUniform1uiv: _emscripten_glUniform1uiv,
              emscripten_glUniform2f: _emscripten_glUniform2f,
              emscripten_glUniform2fv: _emscripten_glUniform2fv,
              emscripten_glUniform2i: _emscripten_glUniform2i,
              emscripten_glUniform2iv: _emscripten_glUniform2iv,
              emscripten_glUniform2ui: _emscripten_glUniform2ui,
              emscripten_glUniform2uiv: _emscripten_glUniform2uiv,
              emscripten_glUniform3f: _emscripten_glUniform3f,
              emscripten_glUniform3fv: _emscripten_glUniform3fv,
              emscripten_glUniform3i: _emscripten_glUniform3i,
              emscripten_glUniform3iv: _emscripten_glUniform3iv,
              emscripten_glUniform3ui: _emscripten_glUniform3ui,
              emscripten_glUniform3uiv: _emscripten_glUniform3uiv,
              emscripten_glUniform4f: _emscripten_glUniform4f,
              emscripten_glUniform4fv: _emscripten_glUniform4fv,
              emscripten_glUniform4i: _emscripten_glUniform4i,
              emscripten_glUniform4iv: _emscripten_glUniform4iv,
              emscripten_glUniform4ui: _emscripten_glUniform4ui,
              emscripten_glUniform4uiv: _emscripten_glUniform4uiv,
              emscripten_glUniformBlockBinding: _emscripten_glUniformBlockBinding,
              emscripten_glUniformMatrix2fv: _emscripten_glUniformMatrix2fv,
              emscripten_glUniformMatrix2x3fv: _emscripten_glUniformMatrix2x3fv,
              emscripten_glUniformMatrix2x4fv: _emscripten_glUniformMatrix2x4fv,
              emscripten_glUniformMatrix3fv: _emscripten_glUniformMatrix3fv,
              emscripten_glUniformMatrix3x2fv: _emscripten_glUniformMatrix3x2fv,
              emscripten_glUniformMatrix3x4fv: _emscripten_glUniformMatrix3x4fv,
              emscripten_glUniformMatrix4fv: _emscripten_glUniformMatrix4fv,
              emscripten_glUniformMatrix4x2fv: _emscripten_glUniformMatrix4x2fv,
              emscripten_glUniformMatrix4x3fv: _emscripten_glUniformMatrix4x3fv,
              emscripten_glUseProgram: _emscripten_glUseProgram,
              emscripten_glValidateProgram: _emscripten_glValidateProgram,
              emscripten_glVertexAttrib1f: _emscripten_glVertexAttrib1f,
              emscripten_glVertexAttrib1fv: _emscripten_glVertexAttrib1fv,
              emscripten_glVertexAttrib2f: _emscripten_glVertexAttrib2f,
              emscripten_glVertexAttrib2fv: _emscripten_glVertexAttrib2fv,
              emscripten_glVertexAttrib3f: _emscripten_glVertexAttrib3f,
              emscripten_glVertexAttrib3fv: _emscripten_glVertexAttrib3fv,
              emscripten_glVertexAttrib4f: _emscripten_glVertexAttrib4f,
              emscripten_glVertexAttrib4fv: _emscripten_glVertexAttrib4fv,
              emscripten_glVertexAttribDivisor: _emscripten_glVertexAttribDivisor,
              emscripten_glVertexAttribI4i: _emscripten_glVertexAttribI4i,
              emscripten_glVertexAttribI4iv: _emscripten_glVertexAttribI4iv,
              emscripten_glVertexAttribI4ui: _emscripten_glVertexAttribI4ui,
              emscripten_glVertexAttribI4uiv: _emscripten_glVertexAttribI4uiv,
              emscripten_glVertexAttribIPointer: _emscripten_glVertexAttribIPointer,
              emscripten_glVertexAttribPointer: _emscripten_glVertexAttribPointer,
              emscripten_glViewport: _emscripten_glViewport,
              emscripten_glWaitSync: _emscripten_glWaitSync,
              emscripten_log: _emscripten_log,
              emscripten_num_logical_cores: _emscripten_num_logical_cores,
              emscripten_resize_heap: _emscripten_resize_heap,
              emscripten_set_main_loop: _emscripten_set_main_loop,
              emscripten_set_main_loop_arg: _emscripten_set_main_loop_arg,
              emscripten_unwind_to_js_event_loop: _emscripten_unwind_to_js_event_loop,
              emscripten_webgl_do_commit_frame: _emscripten_webgl_do_commit_frame,
              emscripten_webgl_make_context_current_calling_thread: _emscripten_webgl_make_context_current_calling_thread,
              environ_get: _environ_get,
              environ_sizes_get: _environ_sizes_get,
              exit: _exit,
              fd_close: _fd_close,
              fd_fdstat_get: _fd_fdstat_get,
              fd_pread: _fd_pread,
              fd_read: _fd_read,
              fd_seek: _fd_seek,
              fd_sync: _fd_sync,
              fd_write: _fd_write,
              getaddrinfo: _getaddrinfo,
              getnameinfo: _getnameinfo,
              initDecoderJS: initDecoderJS,
              initGlConvWorker: initGlConvWorker,
              invoke_ii: invoke_ii,
              invoke_iii: invoke_iii,
              invoke_iiii: invoke_iiii,
              invoke_iiiii: invoke_iiiii,
              invoke_iiiiiiiiii: invoke_iiiiiiiiii,
              invoke_v: invoke_v,
              invoke_vi: invoke_vi,
              invoke_vii: invoke_vii,
              invoke_viid: invoke_viid,
              invoke_viii: invoke_viii,
              invoke_viiii: invoke_viiii,
              invoke_viiiii: invoke_viiiii,
              invoke_viiiiiiiii: invoke_viiiiiiiii,
              memory: wasmMemory || Module["wasmMemory"],
              proc_exit: _proc_exit,
              setupMessagePort: setupMessagePort,
              strftime: _strftime,
              strftime_l: _strftime_l,
              webaudio_getChannels: _webaudio_getChannels,
              webaudio_getSampleRate: _webaudio_getSampleRate,
              webaudio_init: _webaudio_init
          };
          Asyncify.instrumentWasmImports(wasmImports);
          var wasmExports = createWasm();
          var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors");
          var _set_global_media_player = Module["_set_global_media_player"] = createExportWrapper("set_global_media_player");
          var _attach_update_events = Module["_attach_update_events"] = createExportWrapper("attach_update_events");
          var _libvlc_media_player_event_manager = Module["_libvlc_media_player_event_manager"] = createExportWrapper("libvlc_media_player_event_manager");
          var _libvlc_event_attach = Module["_libvlc_event_attach"] = createExportWrapper("libvlc_event_attach");
          var _libvlc_media_player_get_time = Module["_libvlc_media_player_get_time"] = createExportWrapper("libvlc_media_player_get_time");
          var _main = Module["_main"] = createExportWrapper("main");
          var _wasm_media_player_new = Module["_wasm_media_player_new"] = createExportWrapper("wasm_media_player_new");
          var _libvlc_media_player_new = Module["_libvlc_media_player_new"] = createExportWrapper("libvlc_media_player_new");
          var _wasm_media_list_player_new = Module["_wasm_media_list_player_new"] = createExportWrapper("wasm_media_list_player_new");
          var _libvlc_media_list_player_new = Module["_libvlc_media_list_player_new"] = createExportWrapper("libvlc_media_list_player_new");
          var _wasm_media_player_new_from_media = Module["_wasm_media_player_new_from_media"] = createExportWrapper("wasm_media_player_new_from_media");
          var _libvlc_media_player_new_from_media = Module["_libvlc_media_player_new_from_media"] = createExportWrapper("libvlc_media_player_new_from_media");
          var _wasm_media_player_release = Module["_wasm_media_player_release"] = createExportWrapper("wasm_media_player_release");
          var _libvlc_media_player_release = Module["_libvlc_media_player_release"] = createExportWrapper("libvlc_media_player_release");
          var _wasmc_media_player_retain = Module["_wasmc_media_player_retain"] = createExportWrapper("wasmc_media_player_retain");
          var _libvlc_media_player_retain = Module["_libvlc_media_player_retain"] = createExportWrapper("libvlc_media_player_retain");
          var _wasm_media_player_set_media = Module["_wasm_media_player_set_media"] = createExportWrapper("wasm_media_player_set_media");
          var _libvlc_media_player_set_media = Module["_libvlc_media_player_set_media"] = createExportWrapper("libvlc_media_player_set_media");
          var _wasm_media_player_get_media = Module["_wasm_media_player_get_media"] = createExportWrapper("wasm_media_player_get_media");
          var _libvlc_media_player_get_media = Module["_libvlc_media_player_get_media"] = createExportWrapper("libvlc_media_player_get_media");
          var _wasm_media_player_is_playing = Module["_wasm_media_player_is_playing"] = createExportWrapper("wasm_media_player_is_playing");
          var _libvlc_media_player_is_playing = Module["_libvlc_media_player_is_playing"] = createExportWrapper("libvlc_media_player_is_playing");
          var _wasm_media_player_play = Module["_wasm_media_player_play"] = createExportWrapper("wasm_media_player_play");
          var _libvlc_media_player_play = Module["_libvlc_media_player_play"] = createExportWrapper("libvlc_media_player_play");
          var _wasm_media_player_set_pause = Module["_wasm_media_player_set_pause"] = createExportWrapper("wasm_media_player_set_pause");
          var _libvlc_media_player_set_pause = Module["_libvlc_media_player_set_pause"] = createExportWrapper("libvlc_media_player_set_pause");
          var _wasm_media_player_pause = Module["_wasm_media_player_pause"] = createExportWrapper("wasm_media_player_pause");
          var _libvlc_media_player_pause = Module["_libvlc_media_player_pause"] = createExportWrapper("libvlc_media_player_pause");
          var _wasm_media_player_stop = Module["_wasm_media_player_stop"] = createExportWrapper("wasm_media_player_stop");
          var _libvlc_media_player_stop_async = Module["_libvlc_media_player_stop_async"] = createExportWrapper("libvlc_media_player_stop_async");
          var _wasm_media_player_get_length = Module["_wasm_media_player_get_length"] = createExportWrapper("wasm_media_player_get_length");
          var _libvlc_media_player_get_length = Module["_libvlc_media_player_get_length"] = createExportWrapper("libvlc_media_player_get_length");
          var _wasm_media_player_get_time = Module["_wasm_media_player_get_time"] = createExportWrapper("wasm_media_player_get_time");
          var _wasm_media_player_set_time = Module["_wasm_media_player_set_time"] = createExportWrapper("wasm_media_player_set_time");
          var _libvlc_media_player_set_time = Module["_libvlc_media_player_set_time"] = createExportWrapper("libvlc_media_player_set_time");
          var _wasm_media_player_get_position = Module["_wasm_media_player_get_position"] = createExportWrapper("wasm_media_player_get_position");
          var _libvlc_media_player_get_position = Module["_libvlc_media_player_get_position"] = createExportWrapper("libvlc_media_player_get_position");
          var _wasm_media_player_set_position = Module["_wasm_media_player_set_position"] = createExportWrapper("wasm_media_player_set_position");
          var _libvlc_media_player_set_position = Module["_libvlc_media_player_set_position"] = createExportWrapper("libvlc_media_player_set_position");
          var _wasm_media_player_set_chapter = Module["_wasm_media_player_set_chapter"] = createExportWrapper("wasm_media_player_set_chapter");
          var _libvlc_media_player_set_chapter = Module["_libvlc_media_player_set_chapter"] = createExportWrapper("libvlc_media_player_set_chapter");
          var _wasm_media_player_get_chapter = Module["_wasm_media_player_get_chapter"] = createExportWrapper("wasm_media_player_get_chapter");
          var _libvlc_media_player_get_chapter = Module["_libvlc_media_player_get_chapter"] = createExportWrapper("libvlc_media_player_get_chapter");
          var _wasm_media_player_get_chapter_count = Module["_wasm_media_player_get_chapter_count"] = createExportWrapper("wasm_media_player_get_chapter_count");
          var _libvlc_media_player_get_chapter_count = Module["_libvlc_media_player_get_chapter_count"] = createExportWrapper("libvlc_media_player_get_chapter_count");
          var _wasm_media_player_get_chapter_count_for_title = Module["_wasm_media_player_get_chapter_count_for_title"] = createExportWrapper("wasm_media_player_get_chapter_count_for_title");
          var _libvlc_media_player_get_chapter_count_for_title = Module["_libvlc_media_player_get_chapter_count_for_title"] = createExportWrapper("libvlc_media_player_get_chapter_count_for_title");
          var _wasm_media_player_set_title = Module["_wasm_media_player_set_title"] = createExportWrapper("wasm_media_player_set_title");
          var _libvlc_media_player_set_title = Module["_libvlc_media_player_set_title"] = createExportWrapper("libvlc_media_player_set_title");
          var _wasm_media_player_get_title = Module["_wasm_media_player_get_title"] = createExportWrapper("wasm_media_player_get_title");
          var _libvlc_media_player_get_title = Module["_libvlc_media_player_get_title"] = createExportWrapper("libvlc_media_player_get_title");
          var _wasm_media_player_get_title_count = Module["_wasm_media_player_get_title_count"] = createExportWrapper("wasm_media_player_get_title_count");
          var _libvlc_media_player_get_title_count = Module["_libvlc_media_player_get_title_count"] = createExportWrapper("libvlc_media_player_get_title_count");
          var _wasm_media_player_previous_chapter = Module["_wasm_media_player_previous_chapter"] = createExportWrapper("wasm_media_player_previous_chapter");
          var _libvlc_media_player_previous_chapter = Module["_libvlc_media_player_previous_chapter"] = createExportWrapper("libvlc_media_player_previous_chapter");
          var _wasm_media_player_next_chapter = Module["_wasm_media_player_next_chapter"] = createExportWrapper("wasm_media_player_next_chapter");
          var _libvlc_media_player_next_chapter = Module["_libvlc_media_player_next_chapter"] = createExportWrapper("libvlc_media_player_next_chapter");
          var _wasm_media_player_get_rate = Module["_wasm_media_player_get_rate"] = createExportWrapper("wasm_media_player_get_rate");
          var _libvlc_media_player_get_rate = Module["_libvlc_media_player_get_rate"] = createExportWrapper("libvlc_media_player_get_rate");
          var _wasm_media_player_set_rate = Module["_wasm_media_player_set_rate"] = createExportWrapper("wasm_media_player_set_rate");
          var _libvlc_media_player_set_rate = Module["_libvlc_media_player_set_rate"] = createExportWrapper("libvlc_media_player_set_rate");
          var _wasm_media_player_has_vout = Module["_wasm_media_player_has_vout"] = createExportWrapper("wasm_media_player_has_vout");
          var _libvlc_media_player_has_vout = Module["_libvlc_media_player_has_vout"] = createExportWrapper("libvlc_media_player_has_vout");
          var _wasm_media_player_is_seekable = Module["_wasm_media_player_is_seekable"] = createExportWrapper("wasm_media_player_is_seekable");
          var _libvlc_media_player_is_seekable = Module["_libvlc_media_player_is_seekable"] = createExportWrapper("libvlc_media_player_is_seekable");
          var _wasm_media_player_can_pause = Module["_wasm_media_player_can_pause"] = createExportWrapper("wasm_media_player_can_pause");
          var _libvlc_media_player_can_pause = Module["_libvlc_media_player_can_pause"] = createExportWrapper("libvlc_media_player_can_pause");
          var _wasm_media_player_program_scrambled = Module["_wasm_media_player_program_scrambled"] = createExportWrapper("wasm_media_player_program_scrambled");
          var _libvlc_media_player_program_scrambled = Module["_libvlc_media_player_program_scrambled"] = createExportWrapper("libvlc_media_player_program_scrambled");
          var _wasm_media_player_next_frame = Module["_wasm_media_player_next_frame"] = createExportWrapper("wasm_media_player_next_frame");
          var _libvlc_media_player_next_frame = Module["_libvlc_media_player_next_frame"] = createExportWrapper("libvlc_media_player_next_frame");
          var _wasm_video_get_size_x = Module["_wasm_video_get_size_x"] = createExportWrapper("wasm_video_get_size_x");
          var _libvlc_video_get_size = Module["_libvlc_video_get_size"] = createExportWrapper("libvlc_video_get_size");
          var _wasm_video_get_size_y = Module["_wasm_video_get_size_y"] = createExportWrapper("wasm_video_get_size_y");
          var _wasm_video_get_cursor_x = Module["_wasm_video_get_cursor_x"] = createExportWrapper("wasm_video_get_cursor_x");
          var _libvlc_video_get_cursor = Module["_libvlc_video_get_cursor"] = createExportWrapper("libvlc_video_get_cursor");
          var _wasm_video_get_cursor_y = Module["_wasm_video_get_cursor_y"] = createExportWrapper("wasm_video_get_cursor_y");
          var _wasm_audio_toggle_mute = Module["_wasm_audio_toggle_mute"] = createExportWrapper("wasm_audio_toggle_mute");
          var _libvlc_audio_toggle_mute = Module["_libvlc_audio_toggle_mute"] = createExportWrapper("libvlc_audio_toggle_mute");
          var _wasm_audio_get_mute = Module["_wasm_audio_get_mute"] = createExportWrapper("wasm_audio_get_mute");
          var _libvlc_audio_get_mute = Module["_libvlc_audio_get_mute"] = createExportWrapper("libvlc_audio_get_mute");
          var _wasm_audio_set_mute = Module["_wasm_audio_set_mute"] = createExportWrapper("wasm_audio_set_mute");
          var _libvlc_audio_set_mute = Module["_libvlc_audio_set_mute"] = createExportWrapper("libvlc_audio_set_mute");
          var _wasm_audio_get_volume = Module["_wasm_audio_get_volume"] = createExportWrapper("wasm_audio_get_volume");
          var _libvlc_audio_get_volume = Module["_libvlc_audio_get_volume"] = createExportWrapper("libvlc_audio_get_volume");
          var _wasm_audio_set_volume = Module["_wasm_audio_set_volume"] = createExportWrapper("wasm_audio_set_volume");
          var _libvlc_audio_set_volume = Module["_libvlc_audio_set_volume"] = createExportWrapper("libvlc_audio_set_volume");
          var _wasm_audio_get_channel = Module["_wasm_audio_get_channel"] = createExportWrapper("wasm_audio_get_channel");
          var _libvlc_audio_get_channel = Module["_libvlc_audio_get_channel"] = createExportWrapper("libvlc_audio_get_channel");
          var _wasm_audio_set_channel = Module["_wasm_audio_set_channel"] = createExportWrapper("wasm_audio_set_channel");
          var _libvlc_audio_set_channel = Module["_libvlc_audio_set_channel"] = createExportWrapper("libvlc_audio_set_channel");
          var _wasm_audio_get_delay = Module["_wasm_audio_get_delay"] = createExportWrapper("wasm_audio_get_delay");
          var _libvlc_audio_get_delay = Module["_libvlc_audio_get_delay"] = createExportWrapper("libvlc_audio_get_delay");
          var _wasm_audio_set_delay = Module["_wasm_audio_set_delay"] = createExportWrapper("wasm_audio_set_delay");
          var _libvlc_audio_set_delay = Module["_libvlc_audio_set_delay"] = createExportWrapper("libvlc_audio_set_delay");
          var _wasm_media_player_get_role = Module["_wasm_media_player_get_role"] = createExportWrapper("wasm_media_player_get_role");
          var _libvlc_media_player_get_role = Module["_libvlc_media_player_get_role"] = createExportWrapper("libvlc_media_player_get_role");
          var _wasm_media_player_set_role = Module["_wasm_media_player_set_role"] = createExportWrapper("wasm_media_player_set_role");
          var _libvlc_media_player_set_role = Module["_libvlc_media_player_set_role"] = createExportWrapper("libvlc_media_player_set_role");
          var _wasm_libvlc_init = Module["_wasm_libvlc_init"] = createExportWrapper("wasm_libvlc_init");
          var _libvlc_new = Module["_libvlc_new"] = createExportWrapper("libvlc_new");
          var _wasm_media_new_path = Module["_wasm_media_new_path"] = createExportWrapper("wasm_media_new_path");
          var _libvlc_media_new_path = Module["_libvlc_media_new_path"] = createExportWrapper("libvlc_media_new_path");
          var _wasm_media_new_location = Module["_wasm_media_new_location"] = createExportWrapper("wasm_media_new_location");
          var _libvlc_media_new_location = Module["_libvlc_media_new_location"] = createExportWrapper("libvlc_media_new_location");
          var _wasm_media_retain = Module["_wasm_media_retain"] = createExportWrapper("wasm_media_retain");
          var _libvlc_media_retain = Module["_libvlc_media_retain"] = createExportWrapper("libvlc_media_retain");
          var _wasm_media_release = Module["_wasm_media_release"] = createExportWrapper("wasm_media_release");
          var _libvlc_media_release = Module["_libvlc_media_release"] = createExportWrapper("libvlc_media_release");
          var _malloc = Module["_malloc"] = createExportWrapper("malloc");
          var _free = Module["_free"] = createExportWrapper("free");
          var _libvlc_retain = Module["_libvlc_retain"] = createExportWrapper("libvlc_retain");
          var _libvlc_release = Module["_libvlc_release"] = createExportWrapper("libvlc_release");
          var _libvlc_set_exit_handler = Module["_libvlc_set_exit_handler"] = createExportWrapper("libvlc_set_exit_handler");
          var _libvlc_set_user_agent = Module["_libvlc_set_user_agent"] = createExportWrapper("libvlc_set_user_agent");
          var _libvlc_set_app_id = Module["_libvlc_set_app_id"] = createExportWrapper("libvlc_set_app_id");
          var _libvlc_get_version = Module["_libvlc_get_version"] = createExportWrapper("libvlc_get_version");
          var _libvlc_get_compiler = Module["_libvlc_get_compiler"] = createExportWrapper("libvlc_get_compiler");
          var _libvlc_get_changeset = Module["_libvlc_get_changeset"] = createExportWrapper("libvlc_get_changeset");
          var _libvlc_free = Module["_libvlc_free"] = createExportWrapper("libvlc_free");
          var _libvlc_module_description_list_release = Module["_libvlc_module_description_list_release"] = createExportWrapper("libvlc_module_description_list_release");
          var _libvlc_audio_filter_list_get = Module["_libvlc_audio_filter_list_get"] = createExportWrapper("libvlc_audio_filter_list_get");
          var _libvlc_video_filter_list_get = Module["_libvlc_video_filter_list_get"] = createExportWrapper("libvlc_video_filter_list_get");
          var _libvlc_clock = Module["_libvlc_clock"] = createExportWrapper("libvlc_clock");
          var _libvlc_dialog_set_callbacks = Module["_libvlc_dialog_set_callbacks"] = createExportWrapper("libvlc_dialog_set_callbacks");
          var _libvlc_dialog_set_context = Module["_libvlc_dialog_set_context"] = createExportWrapper("libvlc_dialog_set_context");
          var _libvlc_dialog_get_context = Module["_libvlc_dialog_get_context"] = createExportWrapper("libvlc_dialog_get_context");
          var _libvlc_dialog_post_login = Module["_libvlc_dialog_post_login"] = createExportWrapper("libvlc_dialog_post_login");
          var _libvlc_dialog_post_action = Module["_libvlc_dialog_post_action"] = createExportWrapper("libvlc_dialog_post_action");
          var _libvlc_dialog_dismiss = Module["_libvlc_dialog_dismiss"] = createExportWrapper("libvlc_dialog_dismiss");
          var _libvlc_renderer_item_hold = Module["_libvlc_renderer_item_hold"] = createExportWrapper("libvlc_renderer_item_hold");
          var _libvlc_renderer_item_release = Module["_libvlc_renderer_item_release"] = createExportWrapper("libvlc_renderer_item_release");
          var _libvlc_renderer_item_name = Module["_libvlc_renderer_item_name"] = createExportWrapper("libvlc_renderer_item_name");
          var _libvlc_renderer_item_type = Module["_libvlc_renderer_item_type"] = createExportWrapper("libvlc_renderer_item_type");
          var _libvlc_renderer_item_icon_uri = Module["_libvlc_renderer_item_icon_uri"] = createExportWrapper("libvlc_renderer_item_icon_uri");
          var _libvlc_renderer_item_flags = Module["_libvlc_renderer_item_flags"] = createExportWrapper("libvlc_renderer_item_flags");
          var _libvlc_renderer_discoverer_new = Module["_libvlc_renderer_discoverer_new"] = createExportWrapper("libvlc_renderer_discoverer_new");
          var _libvlc_renderer_discoverer_release = Module["_libvlc_renderer_discoverer_release"] = createExportWrapper("libvlc_renderer_discoverer_release");
          var _libvlc_renderer_discoverer_stop = Module["_libvlc_renderer_discoverer_stop"] = createExportWrapper("libvlc_renderer_discoverer_stop");
          var _libvlc_renderer_discoverer_start = Module["_libvlc_renderer_discoverer_start"] = createExportWrapper("libvlc_renderer_discoverer_start");
          var _libvlc_renderer_discoverer_event_manager = Module["_libvlc_renderer_discoverer_event_manager"] = createExportWrapper("libvlc_renderer_discoverer_event_manager");
          var _libvlc_renderer_discoverer_list_release = Module["_libvlc_renderer_discoverer_list_release"] = createExportWrapper("libvlc_renderer_discoverer_list_release");
          var _libvlc_renderer_discoverer_list_get = Module["_libvlc_renderer_discoverer_list_get"] = createExportWrapper("libvlc_renderer_discoverer_list_get");
          var _libvlc_errmsg = Module["_libvlc_errmsg"] = createExportWrapper("libvlc_errmsg");
          var _libvlc_clearerr = Module["_libvlc_clearerr"] = createExportWrapper("libvlc_clearerr");
          var _libvlc_log_get_context = Module["_libvlc_log_get_context"] = createExportWrapper("libvlc_log_get_context");
          var _libvlc_log_get_object = Module["_libvlc_log_get_object"] = createExportWrapper("libvlc_log_get_object");
          var _libvlc_log_unset = Module["_libvlc_log_unset"] = createExportWrapper("libvlc_log_unset");
          var _libvlc_log_set = Module["_libvlc_log_set"] = createExportWrapper("libvlc_log_set");
          var _libvlc_log_set_file = Module["_libvlc_log_set_file"] = createExportWrapper("libvlc_log_set_file");
          var _libvlc_playlist_play = Module["_libvlc_playlist_play"] = createExportWrapper("libvlc_playlist_play");
          var _libvlc_add_intf = Module["_libvlc_add_intf"] = createExportWrapper("libvlc_add_intf");
          var _libvlc_set_fullscreen = Module["_libvlc_set_fullscreen"] = createExportWrapper("libvlc_set_fullscreen");
          var _libvlc_get_fullscreen = Module["_libvlc_get_fullscreen"] = createExportWrapper("libvlc_get_fullscreen");
          var _libvlc_toggle_fullscreen = Module["_libvlc_toggle_fullscreen"] = createExportWrapper("libvlc_toggle_fullscreen");
          var _libvlc_video_set_key_input = Module["_libvlc_video_set_key_input"] = createExportWrapper("libvlc_video_set_key_input");
          var _libvlc_video_set_mouse_input = Module["_libvlc_video_set_mouse_input"] = createExportWrapper("libvlc_video_set_mouse_input");
          var _libvlc_video_take_snapshot = Module["_libvlc_video_take_snapshot"] = createExportWrapper("libvlc_video_take_snapshot");
          var _libvlc_media_player_get_selected_track = Module["_libvlc_media_player_get_selected_track"] = createExportWrapper("libvlc_media_player_get_selected_track");
          var _libvlc_media_track_release = Module["_libvlc_media_track_release"] = createExportWrapper("libvlc_media_track_release");
          var _libvlc_video_get_scale = Module["_libvlc_video_get_scale"] = createExportWrapper("libvlc_video_get_scale");
          var _libvlc_video_set_scale = Module["_libvlc_video_set_scale"] = createExportWrapper("libvlc_video_set_scale");
          var _libvlc_video_get_aspect_ratio = Module["_libvlc_video_get_aspect_ratio"] = createExportWrapper("libvlc_video_get_aspect_ratio");
          var _libvlc_video_set_aspect_ratio = Module["_libvlc_video_set_aspect_ratio"] = createExportWrapper("libvlc_video_set_aspect_ratio");
          var _libvlc_video_new_viewpoint = Module["_libvlc_video_new_viewpoint"] = createExportWrapper("libvlc_video_new_viewpoint");
          var _libvlc_video_update_viewpoint = Module["_libvlc_video_update_viewpoint"] = createExportWrapper("libvlc_video_update_viewpoint");
          var _libvlc_video_get_spu = Module["_libvlc_video_get_spu"] = createExportWrapper("libvlc_video_get_spu");
          var _libvlc_video_get_spu_count = Module["_libvlc_video_get_spu_count"] = createExportWrapper("libvlc_video_get_spu_count");
          var _libvlc_video_get_spu_description = Module["_libvlc_video_get_spu_description"] = createExportWrapper("libvlc_video_get_spu_description");
          var _libvlc_video_set_spu = Module["_libvlc_video_set_spu"] = createExportWrapper("libvlc_video_set_spu");
          var _libvlc_video_get_spu_delay = Module["_libvlc_video_get_spu_delay"] = createExportWrapper("libvlc_video_get_spu_delay");
          var _libvlc_video_set_spu_delay = Module["_libvlc_video_set_spu_delay"] = createExportWrapper("libvlc_video_set_spu_delay");
          var _libvlc_video_get_spu_text_scale = Module["_libvlc_video_get_spu_text_scale"] = createExportWrapper("libvlc_video_get_spu_text_scale");
          var _libvlc_video_set_spu_text_scale = Module["_libvlc_video_set_spu_text_scale"] = createExportWrapper("libvlc_video_set_spu_text_scale");
          var _libvlc_video_set_crop_ratio = Module["_libvlc_video_set_crop_ratio"] = createExportWrapper("libvlc_video_set_crop_ratio");
          var _libvlc_video_set_crop_window = Module["_libvlc_video_set_crop_window"] = createExportWrapper("libvlc_video_set_crop_window");
          var _libvlc_video_set_crop_border = Module["_libvlc_video_set_crop_border"] = createExportWrapper("libvlc_video_set_crop_border");
          var _libvlc_video_get_teletext = Module["_libvlc_video_get_teletext"] = createExportWrapper("libvlc_video_get_teletext");
          var _libvlc_video_set_teletext = Module["_libvlc_video_set_teletext"] = createExportWrapper("libvlc_video_set_teletext");
          var _libvlc_video_get_track_count = Module["_libvlc_video_get_track_count"] = createExportWrapper("libvlc_video_get_track_count");
          var _libvlc_video_get_track_description = Module["_libvlc_video_get_track_description"] = createExportWrapper("libvlc_video_get_track_description");
          var _libvlc_video_get_track = Module["_libvlc_video_get_track"] = createExportWrapper("libvlc_video_get_track");
          var _libvlc_video_set_track = Module["_libvlc_video_set_track"] = createExportWrapper("libvlc_video_set_track");
          var _libvlc_video_set_deinterlace = Module["_libvlc_video_set_deinterlace"] = createExportWrapper("libvlc_video_set_deinterlace");
          var _libvlc_video_get_marquee_int = Module["_libvlc_video_get_marquee_int"] = createExportWrapper("libvlc_video_get_marquee_int");
          var _libvlc_video_set_marquee_int = Module["_libvlc_video_set_marquee_int"] = createExportWrapper("libvlc_video_set_marquee_int");
          var _libvlc_video_set_marquee_string = Module["_libvlc_video_set_marquee_string"] = createExportWrapper("libvlc_video_set_marquee_string");
          var _libvlc_video_set_logo_string = Module["_libvlc_video_set_logo_string"] = createExportWrapper("libvlc_video_set_logo_string");
          var _libvlc_video_set_logo_int = Module["_libvlc_video_set_logo_int"] = createExportWrapper("libvlc_video_set_logo_int");
          var _libvlc_video_get_logo_int = Module["_libvlc_video_get_logo_int"] = createExportWrapper("libvlc_video_get_logo_int");
          var _libvlc_video_set_adjust_int = Module["_libvlc_video_set_adjust_int"] = createExportWrapper("libvlc_video_set_adjust_int");
          var _libvlc_video_get_adjust_int = Module["_libvlc_video_get_adjust_int"] = createExportWrapper("libvlc_video_get_adjust_int");
          var _libvlc_video_set_adjust_float = Module["_libvlc_video_set_adjust_float"] = createExportWrapper("libvlc_video_set_adjust_float");
          var _libvlc_video_get_adjust_float = Module["_libvlc_video_get_adjust_float"] = createExportWrapper("libvlc_video_get_adjust_float");
          var _libvlc_audio_output_list_get = Module["_libvlc_audio_output_list_get"] = createExportWrapper("libvlc_audio_output_list_get");
          var _libvlc_audio_output_list_release = Module["_libvlc_audio_output_list_release"] = createExportWrapper("libvlc_audio_output_list_release");
          var _libvlc_audio_output_set = Module["_libvlc_audio_output_set"] = createExportWrapper("libvlc_audio_output_set");
          var _libvlc_audio_output_device_enum = Module["_libvlc_audio_output_device_enum"] = createExportWrapper("libvlc_audio_output_device_enum");
          var _libvlc_audio_output_device_list_release = Module["_libvlc_audio_output_device_list_release"] = createExportWrapper("libvlc_audio_output_device_list_release");
          var _libvlc_audio_output_device_set = Module["_libvlc_audio_output_device_set"] = createExportWrapper("libvlc_audio_output_device_set");
          var _libvlc_audio_output_device_get = Module["_libvlc_audio_output_device_get"] = createExportWrapper("libvlc_audio_output_device_get");
          var _libvlc_audio_get_track_count = Module["_libvlc_audio_get_track_count"] = createExportWrapper("libvlc_audio_get_track_count");
          var _libvlc_audio_get_track_description = Module["_libvlc_audio_get_track_description"] = createExportWrapper("libvlc_audio_get_track_description");
          var _libvlc_audio_get_track = Module["_libvlc_audio_get_track"] = createExportWrapper("libvlc_audio_get_track");
          var _libvlc_audio_set_track = Module["_libvlc_audio_set_track"] = createExportWrapper("libvlc_audio_set_track");
          var _libvlc_audio_equalizer_get_preset_count = Module["_libvlc_audio_equalizer_get_preset_count"] = createExportWrapper("libvlc_audio_equalizer_get_preset_count");
          var _libvlc_audio_equalizer_get_preset_name = Module["_libvlc_audio_equalizer_get_preset_name"] = createExportWrapper("libvlc_audio_equalizer_get_preset_name");
          var _libvlc_audio_equalizer_get_band_count = Module["_libvlc_audio_equalizer_get_band_count"] = createExportWrapper("libvlc_audio_equalizer_get_band_count");
          var _libvlc_audio_equalizer_get_band_frequency = Module["_libvlc_audio_equalizer_get_band_frequency"] = createExportWrapper("libvlc_audio_equalizer_get_band_frequency");
          var _libvlc_audio_equalizer_new = Module["_libvlc_audio_equalizer_new"] = createExportWrapper("libvlc_audio_equalizer_new");
          var _libvlc_audio_equalizer_new_from_preset = Module["_libvlc_audio_equalizer_new_from_preset"] = createExportWrapper("libvlc_audio_equalizer_new_from_preset");
          var _libvlc_audio_equalizer_release = Module["_libvlc_audio_equalizer_release"] = createExportWrapper("libvlc_audio_equalizer_release");
          var _libvlc_audio_equalizer_set_preamp = Module["_libvlc_audio_equalizer_set_preamp"] = createExportWrapper("libvlc_audio_equalizer_set_preamp");
          var _libvlc_audio_equalizer_get_preamp = Module["_libvlc_audio_equalizer_get_preamp"] = createExportWrapper("libvlc_audio_equalizer_get_preamp");
          var _libvlc_audio_equalizer_set_amp_at_index = Module["_libvlc_audio_equalizer_set_amp_at_index"] = createExportWrapper("libvlc_audio_equalizer_set_amp_at_index");
          var _libvlc_audio_equalizer_get_amp_at_index = Module["_libvlc_audio_equalizer_get_amp_at_index"] = createExportWrapper("libvlc_audio_equalizer_get_amp_at_index");
          var _libvlc_event_detach = Module["_libvlc_event_detach"] = createExportWrapper("libvlc_event_detach");
          var _libvlc_media_list_new = Module["_libvlc_media_list_new"] = createExportWrapper("libvlc_media_list_new");
          var _libvlc_media_list_lock = Module["_libvlc_media_list_lock"] = createExportWrapper("libvlc_media_list_lock");
          var _libvlc_media_list_unlock = Module["_libvlc_media_list_unlock"] = createExportWrapper("libvlc_media_list_unlock");
          var _libvlc_media_new_fd = Module["_libvlc_media_new_fd"] = createExportWrapper("libvlc_media_new_fd");
          var _libvlc_media_new_callbacks = Module["_libvlc_media_new_callbacks"] = createExportWrapper("libvlc_media_new_callbacks");
          var _libvlc_media_new_as_node = Module["_libvlc_media_new_as_node"] = createExportWrapper("libvlc_media_new_as_node");
          var _libvlc_media_list_release = Module["_libvlc_media_list_release"] = createExportWrapper("libvlc_media_list_release");
          var _libvlc_media_add_option = Module["_libvlc_media_add_option"] = createExportWrapper("libvlc_media_add_option");
          var _libvlc_media_add_option_flag = Module["_libvlc_media_add_option_flag"] = createExportWrapper("libvlc_media_add_option_flag");
          var _libvlc_media_duplicate = Module["_libvlc_media_duplicate"] = createExportWrapper("libvlc_media_duplicate");
          var _libvlc_media_get_mrl = Module["_libvlc_media_get_mrl"] = createExportWrapper("libvlc_media_get_mrl");
          var _libvlc_media_get_meta = Module["_libvlc_media_get_meta"] = createExportWrapper("libvlc_media_get_meta");
          var _libvlc_media_set_meta = Module["_libvlc_media_set_meta"] = createExportWrapper("libvlc_media_set_meta");
          var _libvlc_media_save_meta = Module["_libvlc_media_save_meta"] = createExportWrapper("libvlc_media_save_meta");
          var _libvlc_media_subitems = Module["_libvlc_media_subitems"] = createExportWrapper("libvlc_media_subitems");
          var _libvlc_media_list_retain = Module["_libvlc_media_list_retain"] = createExportWrapper("libvlc_media_list_retain");
          var _libvlc_media_get_stats = Module["_libvlc_media_get_stats"] = createExportWrapper("libvlc_media_get_stats");
          var _libvlc_media_event_manager = Module["_libvlc_media_event_manager"] = createExportWrapper("libvlc_media_event_manager");
          var _libvlc_media_get_duration = Module["_libvlc_media_get_duration"] = createExportWrapper("libvlc_media_get_duration");
          var _libvlc_media_get_filestat = Module["_libvlc_media_get_filestat"] = createExportWrapper("libvlc_media_get_filestat");
          var _libvlc_media_parse = Module["_libvlc_media_parse"] = createExportWrapper("libvlc_media_parse");
          var _libvlc_media_parse_async = Module["_libvlc_media_parse_async"] = createExportWrapper("libvlc_media_parse_async");
          var _libvlc_media_parse_with_options = Module["_libvlc_media_parse_with_options"] = createExportWrapper("libvlc_media_parse_with_options");
          var _libvlc_media_parse_stop = Module["_libvlc_media_parse_stop"] = createExportWrapper("libvlc_media_parse_stop");
          var _libvlc_media_is_parsed = Module["_libvlc_media_is_parsed"] = createExportWrapper("libvlc_media_is_parsed");
          var _libvlc_media_get_parsed_status = Module["_libvlc_media_get_parsed_status"] = createExportWrapper("libvlc_media_get_parsed_status");
          var _libvlc_media_set_user_data = Module["_libvlc_media_set_user_data"] = createExportWrapper("libvlc_media_set_user_data");
          var _libvlc_media_get_user_data = Module["_libvlc_media_get_user_data"] = createExportWrapper("libvlc_media_get_user_data");
          var _libvlc_media_tracks_get = Module["_libvlc_media_tracks_get"] = createExportWrapper("libvlc_media_tracks_get");
          var _libvlc_media_tracks_release = Module["_libvlc_media_tracks_release"] = createExportWrapper("libvlc_media_tracks_release");
          var _libvlc_media_get_tracklist = Module["_libvlc_media_get_tracklist"] = createExportWrapper("libvlc_media_get_tracklist");
          var _libvlc_media_get_codec_description = Module["_libvlc_media_get_codec_description"] = createExportWrapper("libvlc_media_get_codec_description");
          var _libvlc_media_get_type = Module["_libvlc_media_get_type"] = createExportWrapper("libvlc_media_get_type");
          var _libvlc_media_thumbnail_request_by_time = Module["_libvlc_media_thumbnail_request_by_time"] = createExportWrapper("libvlc_media_thumbnail_request_by_time");
          var _libvlc_picture_release = Module["_libvlc_picture_release"] = createExportWrapper("libvlc_picture_release");
          var _libvlc_media_thumbnail_request_by_pos = Module["_libvlc_media_thumbnail_request_by_pos"] = createExportWrapper("libvlc_media_thumbnail_request_by_pos");
          var _libvlc_media_thumbnail_request_cancel = Module["_libvlc_media_thumbnail_request_cancel"] = createExportWrapper("libvlc_media_thumbnail_request_cancel");
          var _libvlc_media_thumbnail_request_destroy = Module["_libvlc_media_thumbnail_request_destroy"] = createExportWrapper("libvlc_media_thumbnail_request_destroy");
          var _libvlc_media_slaves_add = Module["_libvlc_media_slaves_add"] = createExportWrapper("libvlc_media_slaves_add");
          var _libvlc_media_slaves_clear = Module["_libvlc_media_slaves_clear"] = createExportWrapper("libvlc_media_slaves_clear");
          var _libvlc_media_slaves_get = Module["_libvlc_media_slaves_get"] = createExportWrapper("libvlc_media_slaves_get");
          var _libvlc_media_slaves_release = Module["_libvlc_media_slaves_release"] = createExportWrapper("libvlc_media_slaves_release");
          var _libvlc_picture_list_count = Module["_libvlc_picture_list_count"] = createExportWrapper("libvlc_picture_list_count");
          var _libvlc_picture_list_destroy = Module["_libvlc_picture_list_destroy"] = createExportWrapper("libvlc_picture_list_destroy");
          var _libvlc_media_track_hold = Module["_libvlc_media_track_hold"] = createExportWrapper("libvlc_media_track_hold");
          var _libvlc_media_tracklist_delete = Module["_libvlc_media_tracklist_delete"] = createExportWrapper("libvlc_media_tracklist_delete");
          var _libvlc_media_tracklist_count = Module["_libvlc_media_tracklist_count"] = createExportWrapper("libvlc_media_tracklist_count");
          var _libvlc_media_tracklist_at = Module["_libvlc_media_tracklist_at"] = createExportWrapper("libvlc_media_tracklist_at");
          var _libvlc_media_player_set_renderer = Module["_libvlc_media_player_set_renderer"] = createExportWrapper("libvlc_media_player_set_renderer");
          var _libvlc_video_set_callbacks = Module["_libvlc_video_set_callbacks"] = createExportWrapper("libvlc_video_set_callbacks");
          var _libvlc_video_set_format_callbacks = Module["_libvlc_video_set_format_callbacks"] = createExportWrapper("libvlc_video_set_format_callbacks");
          var _libvlc_video_set_format = Module["_libvlc_video_set_format"] = createExportWrapper("libvlc_video_set_format");
          var _libvlc_video_set_output_callbacks = Module["_libvlc_video_set_output_callbacks"] = createExportWrapper("libvlc_video_set_output_callbacks");
          var _libvlc_media_player_set_nsobject = Module["_libvlc_media_player_set_nsobject"] = createExportWrapper("libvlc_media_player_set_nsobject");
          var _libvlc_media_player_get_nsobject = Module["_libvlc_media_player_get_nsobject"] = createExportWrapper("libvlc_media_player_get_nsobject");
          var _libvlc_media_player_set_xwindow = Module["_libvlc_media_player_set_xwindow"] = createExportWrapper("libvlc_media_player_set_xwindow");
          var _libvlc_media_player_get_xwindow = Module["_libvlc_media_player_get_xwindow"] = createExportWrapper("libvlc_media_player_get_xwindow");
          var _libvlc_media_player_set_hwnd = Module["_libvlc_media_player_set_hwnd"] = createExportWrapper("libvlc_media_player_set_hwnd");
          var _libvlc_media_player_get_hwnd = Module["_libvlc_media_player_get_hwnd"] = createExportWrapper("libvlc_media_player_get_hwnd");
          var _libvlc_media_player_set_android_context = Module["_libvlc_media_player_set_android_context"] = createExportWrapper("libvlc_media_player_set_android_context");
          var _libvlc_audio_set_callbacks = Module["_libvlc_audio_set_callbacks"] = createExportWrapper("libvlc_audio_set_callbacks");
          var _libvlc_audio_set_volume_callback = Module["_libvlc_audio_set_volume_callback"] = createExportWrapper("libvlc_audio_set_volume_callback");
          var _libvlc_audio_set_format_callbacks = Module["_libvlc_audio_set_format_callbacks"] = createExportWrapper("libvlc_audio_set_format_callbacks");
          var _libvlc_audio_set_format = Module["_libvlc_audio_set_format"] = createExportWrapper("libvlc_audio_set_format");
          var _libvlc_media_player_get_full_title_descriptions = Module["_libvlc_media_player_get_full_title_descriptions"] = createExportWrapper("libvlc_media_player_get_full_title_descriptions");
          var _libvlc_title_descriptions_release = Module["_libvlc_title_descriptions_release"] = createExportWrapper("libvlc_title_descriptions_release");
          var _libvlc_media_player_get_full_chapter_descriptions = Module["_libvlc_media_player_get_full_chapter_descriptions"] = createExportWrapper("libvlc_media_player_get_full_chapter_descriptions");
          var _libvlc_chapter_descriptions_release = Module["_libvlc_chapter_descriptions_release"] = createExportWrapper("libvlc_chapter_descriptions_release");
          var _libvlc_media_player_get_state = Module["_libvlc_media_player_get_state"] = createExportWrapper("libvlc_media_player_get_state");
          var _libvlc_media_player_navigate = Module["_libvlc_media_player_navigate"] = createExportWrapper("libvlc_media_player_navigate");
          var _libvlc_track_description_list_release = Module["_libvlc_track_description_list_release"] = createExportWrapper("libvlc_track_description_list_release");
          var _libvlc_media_player_set_video_title_display = Module["_libvlc_media_player_set_video_title_display"] = createExportWrapper("libvlc_media_player_set_video_title_display");
          var _libvlc_media_player_get_tracklist = Module["_libvlc_media_player_get_tracklist"] = createExportWrapper("libvlc_media_player_get_tracklist");
          var _libvlc_media_player_get_track_from_id = Module["_libvlc_media_player_get_track_from_id"] = createExportWrapper("libvlc_media_player_get_track_from_id");
          var _libvlc_media_player_select_track = Module["_libvlc_media_player_select_track"] = createExportWrapper("libvlc_media_player_select_track");
          var _libvlc_media_player_unselect_track_type = Module["_libvlc_media_player_unselect_track_type"] = createExportWrapper("libvlc_media_player_unselect_track_type");
          var _libvlc_media_player_select_tracks = Module["_libvlc_media_player_select_tracks"] = createExportWrapper("libvlc_media_player_select_tracks");
          var _libvlc_media_player_select_tracks_by_ids = Module["_libvlc_media_player_select_tracks_by_ids"] = createExportWrapper("libvlc_media_player_select_tracks_by_ids");
          var _libvlc_media_player_add_slave = Module["_libvlc_media_player_add_slave"] = createExportWrapper("libvlc_media_player_add_slave");
          var _libvlc_media_player_set_equalizer = Module["_libvlc_media_player_set_equalizer"] = createExportWrapper("libvlc_media_player_set_equalizer");
          var _libvlc_player_program_delete = Module["_libvlc_player_program_delete"] = createExportWrapper("libvlc_player_program_delete");
          var _libvlc_media_player_select_program_id = Module["_libvlc_media_player_select_program_id"] = createExportWrapper("libvlc_media_player_select_program_id");
          var _libvlc_media_player_get_selected_program = Module["_libvlc_media_player_get_selected_program"] = createExportWrapper("libvlc_media_player_get_selected_program");
          var _libvlc_media_player_get_program_from_id = Module["_libvlc_media_player_get_program_from_id"] = createExportWrapper("libvlc_media_player_get_program_from_id");
          var _libvlc_player_programlist_count = Module["_libvlc_player_programlist_count"] = createExportWrapper("libvlc_player_programlist_count");
          var _libvlc_player_programlist_at = Module["_libvlc_player_programlist_at"] = createExportWrapper("libvlc_player_programlist_at");
          var _libvlc_player_programlist_delete = Module["_libvlc_player_programlist_delete"] = createExportWrapper("libvlc_player_programlist_delete");
          var _libvlc_media_player_get_programlist = Module["_libvlc_media_player_get_programlist"] = createExportWrapper("libvlc_media_player_get_programlist");
          var _libvlc_media_list_set_media = Module["_libvlc_media_list_set_media"] = createExportWrapper("libvlc_media_list_set_media");
          var _libvlc_media_list_media = Module["_libvlc_media_list_media"] = createExportWrapper("libvlc_media_list_media");
          var _libvlc_media_list_count = Module["_libvlc_media_list_count"] = createExportWrapper("libvlc_media_list_count");
          var _libvlc_media_list_add_media = Module["_libvlc_media_list_add_media"] = createExportWrapper("libvlc_media_list_add_media");
          var _libvlc_media_list_insert_media = Module["_libvlc_media_list_insert_media"] = createExportWrapper("libvlc_media_list_insert_media");
          var _libvlc_media_list_remove_index = Module["_libvlc_media_list_remove_index"] = createExportWrapper("libvlc_media_list_remove_index");
          var _libvlc_media_list_item_at_index = Module["_libvlc_media_list_item_at_index"] = createExportWrapper("libvlc_media_list_item_at_index");
          var _libvlc_media_list_index_of_item = Module["_libvlc_media_list_index_of_item"] = createExportWrapper("libvlc_media_list_index_of_item");
          var _libvlc_media_list_is_readonly = Module["_libvlc_media_list_is_readonly"] = createExportWrapper("libvlc_media_list_is_readonly");
          var _libvlc_media_list_event_manager = Module["_libvlc_media_list_event_manager"] = createExportWrapper("libvlc_media_list_event_manager");
          var _libvlc_media_list_player_release = Module["_libvlc_media_list_player_release"] = createExportWrapper("libvlc_media_list_player_release");
          var _libvlc_media_list_player_retain = Module["_libvlc_media_list_player_retain"] = createExportWrapper("libvlc_media_list_player_retain");
          var _libvlc_media_list_player_event_manager = Module["_libvlc_media_list_player_event_manager"] = createExportWrapper("libvlc_media_list_player_event_manager");
          var _libvlc_media_list_player_set_media_player = Module["_libvlc_media_list_player_set_media_player"] = createExportWrapper("libvlc_media_list_player_set_media_player");
          var _libvlc_media_list_player_get_media_player = Module["_libvlc_media_list_player_get_media_player"] = createExportWrapper("libvlc_media_list_player_get_media_player");
          var _libvlc_media_list_player_set_media_list = Module["_libvlc_media_list_player_set_media_list"] = createExportWrapper("libvlc_media_list_player_set_media_list");
          var _libvlc_media_list_player_play = Module["_libvlc_media_list_player_play"] = createExportWrapper("libvlc_media_list_player_play");
          var _libvlc_media_list_player_pause = Module["_libvlc_media_list_player_pause"] = createExportWrapper("libvlc_media_list_player_pause");
          var _libvlc_media_list_player_set_pause = Module["_libvlc_media_list_player_set_pause"] = createExportWrapper("libvlc_media_list_player_set_pause");
          var _libvlc_media_list_player_is_playing = Module["_libvlc_media_list_player_is_playing"] = createExportWrapper("libvlc_media_list_player_is_playing");
          var _libvlc_media_list_player_get_state = Module["_libvlc_media_list_player_get_state"] = createExportWrapper("libvlc_media_list_player_get_state");
          var _libvlc_media_list_player_play_item_at_index = Module["_libvlc_media_list_player_play_item_at_index"] = createExportWrapper("libvlc_media_list_player_play_item_at_index");
          var _libvlc_media_list_player_play_item = Module["_libvlc_media_list_player_play_item"] = createExportWrapper("libvlc_media_list_player_play_item");
          var _libvlc_media_list_player_stop_async = Module["_libvlc_media_list_player_stop_async"] = createExportWrapper("libvlc_media_list_player_stop_async");
          var _libvlc_media_list_player_next = Module["_libvlc_media_list_player_next"] = createExportWrapper("libvlc_media_list_player_next");
          var _libvlc_media_list_player_previous = Module["_libvlc_media_list_player_previous"] = createExportWrapper("libvlc_media_list_player_previous");
          var _libvlc_media_list_player_set_playback_mode = Module["_libvlc_media_list_player_set_playback_mode"] = createExportWrapper("libvlc_media_list_player_set_playback_mode");
          var _libvlc_media_discoverer_new = Module["_libvlc_media_discoverer_new"] = createExportWrapper("libvlc_media_discoverer_new");
          var _libvlc_media_discoverer_start = Module["_libvlc_media_discoverer_start"] = createExportWrapper("libvlc_media_discoverer_start");
          var _libvlc_media_discoverer_stop = Module["_libvlc_media_discoverer_stop"] = createExportWrapper("libvlc_media_discoverer_stop");
          var _libvlc_media_discoverer_release = Module["_libvlc_media_discoverer_release"] = createExportWrapper("libvlc_media_discoverer_release");
          var _libvlc_media_discoverer_media_list = Module["_libvlc_media_discoverer_media_list"] = createExportWrapper("libvlc_media_discoverer_media_list");
          var _libvlc_media_discoverer_is_running = Module["_libvlc_media_discoverer_is_running"] = createExportWrapper("libvlc_media_discoverer_is_running");
          var _libvlc_media_discoverer_list_release = Module["_libvlc_media_discoverer_list_release"] = createExportWrapper("libvlc_media_discoverer_list_release");
          var _libvlc_media_discoverer_list_get = Module["_libvlc_media_discoverer_list_get"] = createExportWrapper("libvlc_media_discoverer_list_get");
          var _libvlc_picture_retain = Module["_libvlc_picture_retain"] = createExportWrapper("libvlc_picture_retain");
          var _libvlc_picture_save = Module["_libvlc_picture_save"] = createExportWrapper("libvlc_picture_save");
          var _libvlc_picture_get_buffer = Module["_libvlc_picture_get_buffer"] = createExportWrapper("libvlc_picture_get_buffer");
          var _libvlc_picture_type = Module["_libvlc_picture_type"] = createExportWrapper("libvlc_picture_type");
          var _libvlc_picture_get_stride = Module["_libvlc_picture_get_stride"] = createExportWrapper("libvlc_picture_get_stride");
          var _libvlc_picture_get_width = Module["_libvlc_picture_get_width"] = createExportWrapper("libvlc_picture_get_width");
          var _libvlc_picture_get_height = Module["_libvlc_picture_get_height"] = createExportWrapper("libvlc_picture_get_height");
          var _libvlc_picture_get_time = Module["_libvlc_picture_get_time"] = createExportWrapper("libvlc_picture_get_time");
          var _libvlc_picture_list_at = Module["_libvlc_picture_list_at"] = createExportWrapper("libvlc_picture_list_at");
          var _fflush = createExportWrapper("fflush");
          var _htons = createExportWrapper("htons");
          var _htonl = createExportWrapper("htonl");
          var _pthread_self = Module["_pthread_self"] = () => (_pthread_self = Module["_pthread_self"] = wasmExports["pthread_self"])();
          var _emscripten_main_runtime_thread_id = createExportWrapper("emscripten_main_runtime_thread_id");
          var setTempRet0 = createExportWrapper("setTempRet0");
          var _flushMainThread = Module["_flushMainThread"] = createExportWrapper("flushMainThread");
          var _waitPictureFromPool = Module["_waitPictureFromPool"] = createExportWrapper("waitPictureFromPool");
          var _getPictureFromPool = Module["_getPictureFromPool"] = createExportWrapper("getPictureFromPool");
          var _updateVideoOutput = Module["_updateVideoOutput"] = createExportWrapper("updateVideoOutput");
          var _queuePicture = Module["_queuePicture"] = createExportWrapper("queuePicture");
          var _getPictureIdx = Module["_getPictureIdx"] = createExportWrapper("getPictureIdx");
          var _getVlcDecoderWorkerThread = Module["_getVlcDecoderWorkerThread"] = createExportWrapper("getVlcDecoderWorkerThread");
          var _releaseBlock = Module["_releaseBlock"] = createExportWrapper("releaseBlock");
          var _decodeBlock = Module["_decodeBlock"] = createExportWrapper("decodeBlock");
          var __emscripten_tls_init = Module["__emscripten_tls_init"] = createExportWrapper("_emscripten_tls_init");
          var _emscripten_builtin_memalign = createExportWrapper("emscripten_builtin_memalign");
          var ___getTypeName = createExportWrapper("__getTypeName");
          var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");
          var _emscripten_webgl_commit_frame = createExportWrapper("emscripten_webgl_commit_frame");
          var __emscripten_run_callback_on_thread = createExportWrapper("_emscripten_run_callback_on_thread");
          var ___funcs_on_exit = createExportWrapper("__funcs_on_exit");
          var __emscripten_thread_init = Module["__emscripten_thread_init"] = createExportWrapper("_emscripten_thread_init");
          var __emscripten_thread_crashed = Module["__emscripten_thread_crashed"] = createExportWrapper("_emscripten_thread_crashed");
          var _emscripten_main_thread_process_queued_calls = createExportWrapper("emscripten_main_thread_process_queued_calls");
          var _ntohs = createExportWrapper("ntohs");
          var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();
          var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();
          var __emscripten_run_on_main_thread_js = createExportWrapper("_emscripten_run_on_main_thread_js");
          var __emscripten_thread_free_data = createExportWrapper("_emscripten_thread_free_data");
          var __emscripten_thread_exit = Module["__emscripten_thread_exit"] = createExportWrapper("_emscripten_thread_exit");
          var __emscripten_check_mailbox = createExportWrapper("_emscripten_check_mailbox");
          var _setThrew = createExportWrapper("setThrew");
          var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();
          var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);
          var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();
          var stackSave = createExportWrapper("stackSave");
          var stackRestore = createExportWrapper("stackRestore");
          var stackAlloc = createExportWrapper("stackAlloc");
          var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();
          var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type");
          var dynCall_v = Module["dynCall_v"] = createExportWrapper("dynCall_v");
          var dynCall_vii = Module["dynCall_vii"] = createExportWrapper("dynCall_vii");
          var dynCall_vi = Module["dynCall_vi"] = createExportWrapper("dynCall_vi");
          var dynCall_viii = Module["dynCall_viii"] = createExportWrapper("dynCall_viii");
          var dynCall_iiiiii = Module["dynCall_iiiiii"] = createExportWrapper("dynCall_iiiiii");
          var dynCall_vifi = Module["dynCall_vifi"] = createExportWrapper("dynCall_vifi");
          var dynCall_viiii = Module["dynCall_viiii"] = createExportWrapper("dynCall_viiii");
          var dynCall_vijfi = Module["dynCall_vijfi"] = createExportWrapper("dynCall_vijfi");
          var dynCall_viji = Module["dynCall_viji"] = createExportWrapper("dynCall_viji");
          var dynCall_viiiiii = Module["dynCall_viiiiii"] = createExportWrapper("dynCall_viiiiii");
          var dynCall_ii = Module["dynCall_ii"] = createExportWrapper("dynCall_ii");
          var dynCall_iii = Module["dynCall_iii"] = createExportWrapper("dynCall_iii");
          var dynCall_iiii = Module["dynCall_iiii"] = createExportWrapper("dynCall_iiii");
          var dynCall_iij = Module["dynCall_iij"] = createExportWrapper("dynCall_iij");
          var dynCall_vij = Module["dynCall_vij"] = createExportWrapper("dynCall_vij");
          var dynCall_jij = Module["dynCall_jij"] = createExportWrapper("dynCall_jij");
          var dynCall_viiiii = Module["dynCall_viiiii"] = createExportWrapper("dynCall_viiiii");
          var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
          var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji");
          var dynCall_iijii = Module["dynCall_iijii"] = createExportWrapper("dynCall_iijii");
          var dynCall_jii = Module["dynCall_jii"] = createExportWrapper("dynCall_jii");
          var dynCall_iijdi = Module["dynCall_iijdi"] = createExportWrapper("dynCall_iijdi");
          var dynCall_iiiii = Module["dynCall_iiiii"] = createExportWrapper("dynCall_iiiii");
          var dynCall_viiijj = Module["dynCall_viiijj"] = createExportWrapper("dynCall_viiijj");
          var dynCall_iiji = Module["dynCall_iiji"] = createExportWrapper("dynCall_iiji");
          var dynCall_iiiij = Module["dynCall_iiiij"] = createExportWrapper("dynCall_iiiij");
          var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = createExportWrapper("dynCall_iiiiiii");
          var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = createExportWrapper("dynCall_iiiiiiii");
          var dynCall_viij = Module["dynCall_viij"] = createExportWrapper("dynCall_viij");
          var dynCall_iif = Module["dynCall_iif"] = createExportWrapper("dynCall_iif");
          var dynCall_jiiji = Module["dynCall_jiiji"] = createExportWrapper("dynCall_jiiji");
          var dynCall_jiij = Module["dynCall_jiij"] = createExportWrapper("dynCall_jiij");
          var dynCall_viiij = Module["dynCall_viiij"] = createExportWrapper("dynCall_viiij");
          var dynCall_iiiiiij = Module["dynCall_iiiiiij"] = createExportWrapper("dynCall_iiiiiij");
          var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = createExportWrapper("dynCall_viiiiiiii");
          var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");
          var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiii");
          var dynCall_viif = Module["dynCall_viif"] = createExportWrapper("dynCall_viif");
          var dynCall_i = Module["dynCall_i"] = createExportWrapper("dynCall_i");
          var dynCall_jiii = Module["dynCall_jiii"] = createExportWrapper("dynCall_jiii");
          var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = createExportWrapper("dynCall_viiiiiii");
          var dynCall_jiiii = Module["dynCall_jiiii"] = createExportWrapper("dynCall_jiiii");
          var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiii");
          var dynCall_viid = Module["dynCall_viid"] = createExportWrapper("dynCall_viid");
          var dynCall_viiiiiifi = Module["dynCall_viiiiiifi"] = createExportWrapper("dynCall_viiiiiifi");
          var dynCall_ijiii = Module["dynCall_ijiii"] = createExportWrapper("dynCall_ijiii");
          var dynCall_viiiifii = Module["dynCall_viiiifii"] = createExportWrapper("dynCall_viiiifii");
          var dynCall_viiiffi = Module["dynCall_viiiffi"] = createExportWrapper("dynCall_viiiffi");
          var dynCall_fiii = Module["dynCall_fiii"] = createExportWrapper("dynCall_fiii");
          var dynCall_viiiff = Module["dynCall_viiiff"] = createExportWrapper("dynCall_viiiff");
          var dynCall_viiiffiii = Module["dynCall_viiiffiii"] = createExportWrapper("dynCall_viiiffiii");
          var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiii");
          var dynCall_viiiiiiiiiif = Module["dynCall_viiiiiiiiiif"] = createExportWrapper("dynCall_viiiiiiiiiif");
          var dynCall_viifi = Module["dynCall_viifi"] = createExportWrapper("dynCall_viifi");
          var dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiii");
          var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiii");
          var dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiii");
          var dynCall_jji = Module["dynCall_jji"] = createExportWrapper("dynCall_jji");
          var dynCall_iji = Module["dynCall_iji"] = createExportWrapper("dynCall_iji");
          var dynCall_viiiiifi = Module["dynCall_viiiiifi"] = createExportWrapper("dynCall_viiiiifi");
          var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiii");
          var dynCall_fii = Module["dynCall_fii"] = createExportWrapper("dynCall_fii");
          var dynCall_viiiiiiif = Module["dynCall_viiiiiiif"] = createExportWrapper("dynCall_viiiiiiif");
          var dynCall_iiiji = Module["dynCall_iiiji"] = createExportWrapper("dynCall_iiiji");
          var dynCall_iiijjji = Module["dynCall_iiijjji"] = createExportWrapper("dynCall_iiijjji");
          var dynCall_jiiij = Module["dynCall_jiiij"] = createExportWrapper("dynCall_jiiij");
          var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
          var dynCall_dd = Module["dynCall_dd"] = createExportWrapper("dynCall_dd");
          var dynCall_viidi = Module["dynCall_viidi"] = createExportWrapper("dynCall_viidi");
          var dynCall_viiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiii");
          var dynCall_vid = Module["dynCall_vid"] = createExportWrapper("dynCall_vid");
          var dynCall_fi = Module["dynCall_fi"] = createExportWrapper("dynCall_fi");
          var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiii");
          var dynCall_jijjd = Module["dynCall_jijjd"] = createExportWrapper("dynCall_jijjd");
          var dynCall_jijjdii = Module["dynCall_jijjdii"] = createExportWrapper("dynCall_jijjdii");
          var dynCall_jijj = Module["dynCall_jijj"] = createExportWrapper("dynCall_jijj");
          var dynCall_vjjdiii = Module["dynCall_vjjdiii"] = createExportWrapper("dynCall_vjjdiii");
          var dynCall_vif = Module["dynCall_vif"] = createExportWrapper("dynCall_vif");
          var dynCall_vffff = Module["dynCall_vffff"] = createExportWrapper("dynCall_vffff");
          var dynCall_vf = Module["dynCall_vf"] = createExportWrapper("dynCall_vf");
          var dynCall_vff = Module["dynCall_vff"] = createExportWrapper("dynCall_vff");
          var dynCall_vfi = Module["dynCall_vfi"] = createExportWrapper("dynCall_vfi");
          var dynCall_viff = Module["dynCall_viff"] = createExportWrapper("dynCall_viff");
          var dynCall_vifff = Module["dynCall_vifff"] = createExportWrapper("dynCall_vifff");
          var dynCall_viffff = Module["dynCall_viffff"] = createExportWrapper("dynCall_viffff");
          var dynCall_iiij = Module["dynCall_iiij"] = createExportWrapper("dynCall_iiij");
          var dynCall_iidiiii = Module["dynCall_iidiiii"] = createExportWrapper("dynCall_iidiiii");
          var dynCall_iiiiid = Module["dynCall_iiiiid"] = createExportWrapper("dynCall_iiiiid");
          var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");
          var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");
          var _asyncify_start_unwind = createExportWrapper("asyncify_start_unwind");
          var _asyncify_stop_unwind = createExportWrapper("asyncify_stop_unwind");
          var _asyncify_start_rewind = createExportWrapper("asyncify_start_rewind");
          var _asyncify_stop_rewind = createExportWrapper("asyncify_stop_rewind");
          var _ff_h264_cabac_tables = Module["_ff_h264_cabac_tables"] = 1457676;
          var ___start_em_js = Module["___start_em_js"] = 5384026;
          var ___stop_em_js = Module["___stop_em_js"] = 5391317;

          function invoke_vi(index, a1) {
              var sp = stackSave();
              try {
                  dynCall_vi(index, a1)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_iiiii(index, a1, a2, a3, a4) {
              var sp = stackSave();
              try {
                  return dynCall_iiiii(index, a1, a2, a3, a4)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_ii(index, a1) {
              var sp = stackSave();
              try {
                  return dynCall_ii(index, a1)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_viii(index, a1, a2, a3) {
              var sp = stackSave();
              try {
                  dynCall_viii(index, a1, a2, a3)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_iiii(index, a1, a2, a3) {
              var sp = stackSave();
              try {
                  return dynCall_iiii(index, a1, a2, a3)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_viiii(index, a1, a2, a3, a4) {
              var sp = stackSave();
              try {
                  dynCall_viiii(index, a1, a2, a3, a4)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_vii(index, a1, a2) {
              var sp = stackSave();
              try {
                  dynCall_vii(index, a1, a2)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
              var sp = stackSave();
              try {
                  return dynCall_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_viid(index, a1, a2, a3) {
              var sp = stackSave();
              try {
                  dynCall_viid(index, a1, a2, a3)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
              var sp = stackSave();
              try {
                  dynCall_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_iii(index, a1, a2) {
              var sp = stackSave();
              try {
                  return dynCall_iii(index, a1, a2)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_viiiii(index, a1, a2, a3, a4, a5) {
              var sp = stackSave();
              try {
                  dynCall_viiiii(index, a1, a2, a3, a4, a5)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }

          function invoke_v(index) {
              var sp = stackSave();
              try {
                  dynCall_v(index)
              } catch (e) {
                  stackRestore(sp);
                  if (e !== e + 0) throw e;
                  _setThrew(1, 0)
              }
          }
          Module["wasmMemory"] = wasmMemory;
          Module["keepRuntimeAlive"] = keepRuntimeAlive;
          Module["ExitStatus"] = ExitStatus;
          Module["writeAsciiToMemory"] = writeAsciiToMemory;
          Module["allocateUTF8"] = allocateUTF8;
          Module["PThread"] = PThread;
          var missingLibrarySymbols = ["writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "growMemory", "convertPCtoSourceLocation", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "asmjsMangle", "HandleAllocator", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "getCFunc", "ccall", "cwrap", "uleb128Encode", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "intArrayToString", "AsciiToString", "stringToUTF8OnStack", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSizeCallingThread", "setOffscreenCanvasSizeOnTargetThread", "setCanvasElementSizeMainThread", "setCanvasElementSize", "getCanvasSizeCallingThread", "getCanvasSizeMainThread", "getCanvasElementSize", "stackTrace", "checkWasiClock", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "FS_unlink", "FS_mkdirTree", "_setNetworkCallback", "writeGLArray", "emscripten_webgl_destroy_context_before_on_calling_thread", "registerWebGlEventCallback", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "setErrNo", "demangle", "getFunctionName", "getFunctionArgsName", "heap32VectorToArray", "usesDestructorStack", "createJsInvokerSignature", "createJsInvoker", "init_embind", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "getBasestPointer", "registerInheritedInstance", "unregisterInheritedInstance", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "enumReadValueFromPointer", "craftInvokerFunction", "embind__requireFunction", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "throwInstanceAlreadyDeleted", "flushPendingDeletes", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "char_0", "char_9", "makeLegalFunctionName"];
          missingLibrarySymbols.forEach(missingLibrarySymbol);
          var unexportedSymbols = ["run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "FS_createFolder", "FS_createPath", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_readFile", "out", "err", "callMain", "abort", "wasmExports", "stackAlloc", "stackSave", "stackRestore", "getTempRet0", "setTempRet0", "writeStackCookie", "checkStackCookie", "writeI53ToI64", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "ptrToString", "zeroMemory", "exitJS", "getHeapMax", "abortOnCannotGrowMemory", "ENV", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "ydayFromDate", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "DNS", "Protocols", "Sockets", "initRandomFill", "randomFill", "timers", "warnOnce", "getCallstack", "emscriptenLog", "UNWIND_CACHE", "readEmAsmArgsArray", "readEmAsmArgs", "runEmAsmFunction", "runMainThreadEmAsm", "jstoi_q", "jstoi_s", "getExecutableName", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "asyncLoad", "alignMemory", "mmapAlloc", "wasmTable", "noExitRuntime", "sigToWasmTypes", "freeTableIndexes", "functionsInTableMap", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "stringToNewUTF8", "writeArrayToMemory", "JSEvents", "specialHTMLTargets", "currentFullscreenStrategy", "restoreOldWindowedStyle", "jsStackTrace", "getEnvStrings", "doReadv", "doWritev", "safeSetTimeout", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "setMainLoop", "getPreloadedImageData__data", "wget", "SYSCALLS", "getSocketFromFD", "getSocketAddress", "preloadPlugins", "FS_createPreloadedFile", "FS_modeStringToFlags", "FS_getMode", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "FS", "FS_createDataFile", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "runAndAbortIfError", "Asyncify", "Fibers", "SDL", "SDL_gfx", "emscriptenWebGLGetIndexed", "webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance", "webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance", "allocateUTF8OnStack", "terminateWorker", "killThread", "cleanupThread", "registerTLSInit", "cancelThread", "spawnThread", "exitOnMainThread", "proxyToMainThread", "proxiedJSCallArgs", "invokeEntryPoint", "checkMailbox", "InternalError", "BindingError", "throwInternalError", "throwBindingError", "registeredTypes", "awaitingDependencies", "typeDependencies", "tupleRegistrations", "structRegistrations", "sharedRegisterType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "requireRegisteredType", "UnboundTypeError", "PureVirtualError", "GenericWireTypeSize", "EmValType", "createNamedFunction", "embindRepr", "registeredInstances", "registeredPointers", "registerType", "integerReadValueFromPointer", "floatReadValueFromPointer", "readPointer", "runDestructors", "newFunc", "finalizationRegistry", "detachFinalizer_deps", "deletionQueue", "delayFunction", "emval_freelist", "emval_handles", "emval_symbols", "init_emval", "count_emval_handles", "getStringOrSymbol", "Emval", "emval_get_global", "emval_returnValue", "emval_lookupTypes", "emval_methodCallers", "emval_addMethodCaller", "reflectConstruct"];
          unexportedSymbols.forEach(unexportedRuntimeSymbol);
          var calledRun;
          dependenciesFulfilled = function runCaller() {
              if (!calledRun) run();
              if (!calledRun) dependenciesFulfilled = runCaller
          };

          function callMain() {
              assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
              assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
              var entryFunction = _main;
              var argc = 0;
              var argv = 0;
              try {
                  var ret = entryFunction(argc, argv);
                  exitJS(ret, true);
                  return ret
              } catch (e) {
                  return handleException(e)
              }
          }

          function stackCheckInit() {
              assert(!ENVIRONMENT_IS_PTHREAD);
              _emscripten_stack_init();
              writeStackCookie()
          }

          function run() {
              if (runDependencies > 0) {
                  return
              }
              if (!ENVIRONMENT_IS_PTHREAD) stackCheckInit();
              if (ENVIRONMENT_IS_PTHREAD) {
                  readyPromiseResolve(Module);
                  initRuntime();
                  startWorker(Module);
                  return
              }
              preRun();
              if (runDependencies > 0) {
                  return
              }

              function doRun() {
                  if (calledRun) return;
                  calledRun = true;
                  Module["calledRun"] = true;
                  if (ABORT) return;
                  initRuntime();
                  preMain();
                  readyPromiseResolve(Module);
                  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                  if (shouldRunNow) callMain();
                  postRun()
              }
              if (Module["setStatus"]) {
                  Module["setStatus"]("Running...");
                  setTimeout(function() {
                      setTimeout(function() {
                          Module["setStatus"]("")
                      }, 1);
                      doRun()
                  }, 1)
              } else {
                  doRun()
              }
              checkStackCookie()
          }
          if (Module["preInit"]) {
              if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
              while (Module["preInit"].length > 0) {
                  Module["preInit"].pop()()
              }
          }
          var shouldRunNow = true;
          if (Module["noInitialRun"]) shouldRunNow = false;
          run();


          return moduleArg.ready
      }
  );
})();

// export default initModule;

if (typeof exports === 'object' && typeof module === 'object')
  module.exports = initModule;
else if (typeof define === 'function' && define['amd'])
  define([], () => initModule);

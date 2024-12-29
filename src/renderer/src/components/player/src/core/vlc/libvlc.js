// Encapsulate functions exported from exports_*.c

// Encapsulates libvlc_media_player_t
export class MediaPlayer {
  constructor(module, path) {
    this.module = module;
    this.media_player_ptr = module._wasm_media_player_new();
    module._attach_update_events(this.media_player_ptr);

    if (path != null) {
      let media = new Media(module, path);
      this.set_media(media);
      media.release();
    }
  }

  release() {
    this.module._wasm_media_player_release(this.media_player_ptr);
    this.media_player_ptr = 0;
  }

  set_media(media) {
    // TODO - assert typeof
    this.module._wasm_media_player_set_media(this.media_player_ptr, media.media_ptr);
  }

  get_media() {
    let media_ptr = this.module._wasm_media_player_get_media(this.media_player_ptr);
    this.module._wasm_media_retain(media_ptr);
    // Build from raw ptr
    return new Media(this.module, null, media_ptr);
  }

  toggle_play() {
    if (!this.is_playing()) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  is_playing() {
    return this.module._wasm_media_player_is_playing(this.media_player_ptr);
  }

  stop() {
    return this.module._wasm_media_player_stop(this.media_player_ptr);
  }
  play() {
    return this.module._wasm_media_player_play(this.media_player_ptr);
  }

  set_pause(do_pause) {
    return this.module._wasm_media_player_set_pause(this.media_player_ptr, do_pause);
  }

  pause() {
    return this.module._wasm_media_player_pause(this.media_player_ptr);
  }

  get_length() {
    return this.module._wasm_media_player_get_length(this.media_player_ptr);
  }

  get_time() {
    return this.module._wasm_media_player_get_time(this.media_player_ptr);
  }

  set_time(time, fast = false) {
    // TODO - what does "fast" argument do?
    return this.module._wasm_media_player_set_time(this.media_player_ptr, time, fast);
  }

  get_position() {
    return this.module._wasm_media_player_get_position(this.media_player_ptr);
  }

  set_position(position, fast = false) {
    // TODO - what does "fast" argument do?
    return this.module._wasm_media_player_set_position(this.media_player_ptr, position, fast);
  }

  set_chapter(chapter) {
    this.module._wasm_media_player_set_chapter(this.media_player_ptr, chapter);
  }

  get_chapter() {
    return this.module._wasm_media_player_get_chapter(this.media_player_ptr);
  }

  get_chapter_count() {
    return this.module._wasm_media_player_get_chapter_count(this.media_player_ptr);
  }

  get_chapter_count_for_title(title) {
    return this.module._wasm_media_player_get_chapter_count_for_title(this.media_player_ptr, title);
  }

  set_title(title) {
    this.module._wasm_media_player_set_title(this.media_player_ptr, title);
  }

  get_title() {
    return this.module._wasm_media_player_get_title(this.media_player_ptr);
  }

  get_title_count() {
    return this.module._wasm_media_player_get_title_count(this.media_player_ptr);
  }

  previous_chapter() {
    return this.module._wasm_media_player_previous_chapter(this.media_player_ptr);
  }

  next_chapter() {
    return this.module._wasm_media_player_next_chapter(this.media_player_ptr);
  }

  get_rate() {
    return this.module._wasm_media_player_get_rate(this.media_player_ptr);
  }

  set_rate(rate) {
    return this.module._wasm_media_player_set_rate(this.media_player_ptr, rate);
  }

  has_vout() {
    return this.module._wasm_media_player_has_vout(this.media_player_ptr);
  }

  is_seekable() {
    return this.module._wasm_media_player_is_seekable(this.media_player_ptr);
  }

  can_pause() {
    return this.module._wasm_media_player_can_pause(this.media_player_ptr);
  }

  program_scrambled() {
    return this.module._wasm_media_player_program_scrambled(this.media_player_ptr);
  }

  next_frame() {
    return this.module._wasm_media_player_next_frame(this.media_player_ptr);
  }

  get_size() {
    let x = this.module._wasm_video_get_size_x(this.media_player_ptr);
    let y = this.module._wasm_video_get_size_y(this.media_player_ptr);

    if (x == -1 || y == -1) {
      // TODO - give more context
      throw new Error("Cannot get video size");
    }

    return { x, y };
  }

  get_cursor() {
    let x = this.module._wasm_video_get_cursor_x(this.media_player_ptr);
    let y = this.module._wasm_video_get_cursor_y(this.media_player_ptr);

    if (x == -1 || y == -1) {
      // TODO - give more context
      throw new Error("Cannot get video cursor");
    }

    return { x, y };
  }

  toggle_mute() {
    this.module._wasm_audio_toggle_mute(this.media_player_ptr);
  }

  get_mute() {
    return this.module._wasm_audio_get_mute(this.media_player_ptr);
  }

  set_mute(mute) {
    this.module._wasm_audio_set_mute(this.media_player_ptr, mute);
  }

  get_volume() {
    return this.module._wasm_audio_get_volume(this.media_player_ptr);
  }

  set_volume(volume) {
    return this.module._wasm_audio_set_volume(this.media_player_ptr, volume);
  }

  get_channel() {
    return this.module._wasm_audio_get_channel(this.media_player_ptr);
  }

  set_channel(rate) {
    return this.module._wasm_audio_set_channel(this.media_player_ptr, rate);
  }

  get_delay() {
    return this.module._wasm_audio_get_delay(this.media_player_ptr);
  }

  set_delay(rate) {
    return this.module._wasm_audio_set_delay(this.media_player_ptr, rate);
  }

  get_role() {
    return this.module._wasm_media_player_get_role(this.media_player_ptr);
  }

  set_role(role) {
    return this.module._wasm_media_player_set_role(this.media_player_ptr, role);
  }
}


// Encapsulates libvlc_media_t
export class Media {
  constructor(module, path, raw_ptr) {
    if (raw_ptr != null) {
      this.module = module;
      this.media_ptr = raw_ptr;
      return;
    }

    if (typeof path != 'string') {
      throw new Error("Tried to create Media with invalid value");
    }

    this.module = module;

    let path_ptr = module.allocateUTF8(path)
    this.media_ptr = module._wasm_media_new_location(path_ptr);
    module._free(path_ptr);

    if (this.media_ptr == 0) {
      // TODO - give more context
      throw new Error(`Could not create media from path {path}`);
    }
  }

  release() {
    this.module._wasm_media_release(this.media_ptr);
    this.media_ptr = 0;
  }
}

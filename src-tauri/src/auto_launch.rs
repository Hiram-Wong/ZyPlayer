use auto_launch::*;
use std::env;

#[tauri::command]
pub fn enable_auto_launch() {
  let exe = env::current_exe().unwrap();
  let exe_string = exe.to_str().unwrap();

  let auto = AutoLaunchBuilder::new()
    .set_app_name("Authme")
    .set_app_path(exe_string)
    .set_use_launch_agent(false)
    .set_args(&["--minimized"])
    .build()
    .unwrap();

  if !auto.is_enabled().unwrap() {
    auto.enable().unwrap();
  }
}

#[tauri::command]
pub fn disable_auto_launch() {
  let exe = env::current_exe().unwrap();
  let exe_string = exe.to_str().unwrap();

  let auto = AutoLaunchBuilder::new()
    .set_app_name("Authme")
    .set_app_path(exe_string)
    .set_use_launch_agent(false)
    .set_args(&["--minimized"])
    .build()
    .unwrap();

  if auto.is_enabled().unwrap() {
    auto.disable().unwrap();
  }
}
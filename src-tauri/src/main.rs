// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod network;
mod auto_launch;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
	tauri::Builder::default()
		.plugin(tauri_plugin_window_state::Builder::default().build())
		.invoke_handler(tauri::generate_handler![
			auto_launch::enable_auto_launch,
			auto_launch::disable_auto_launch,
			network::resolve_ip_address,
			network::open_system_proxy,
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}

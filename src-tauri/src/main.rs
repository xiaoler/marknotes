#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod menu;
use tauri::{Manager, Wry};

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .menu(menu::item(&context.package_info().name))
        .setup(|app| Ok(set_window(app)))
        .run(context)
        .expect("error while running tauri application");
}

fn set_window(app: &mut tauri::App<Wry>) {
    app.get_window("main")
        .unwrap()
        .set_min_size(Some(tauri::Size::Logical(tauri::LogicalSize {
            width: 500.0,
            height: 600.0,
        })))
        .expect("Failed to set min size");
}

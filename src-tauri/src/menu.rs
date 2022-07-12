use tauri::api::dialog::FileDialogBuilder;
use tauri::api::file;
use tauri::{AboutMetadata, CustomMenuItem, Menu, MenuItem, Submenu, Window, WindowMenuEvent, Wry};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
    path: String,
    content: String,
}

pub fn item(#[allow(unused)] app_name: &str) -> tauri::Menu {
    let mut menu = Menu::new();
    #[cfg(target_os = "macos")]
    {
        menu = menu.add_submenu(Submenu::new(
            app_name,
            Menu::new()
                .add_native_item(MenuItem::About(
                    app_name.to_string(),
                    AboutMetadata::default(),
                ))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Services)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Hide)
                .add_native_item(MenuItem::HideOthers)
                .add_native_item(MenuItem::ShowAll)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        ));
    }

    let file_menu = Menu::new()
        .add_item(CustomMenuItem::new("create_file".to_string(), "新建..."))
        .add_item(CustomMenuItem::new("save_file".to_string(), "保存"))
        .add_item(CustomMenuItem::new("save_file_as".to_string(), "另存为..."))
        .add_native_item(MenuItem::Separator)
        .add_item(CustomMenuItem::new("open_file".to_string(), "打开..."))
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::CloseWindow);

    #[cfg(not(target_os = "macos"))]
    {
        file_menu = file_menu.add_native_item(MenuItem::Quit);
    }
    menu = menu.add_submenu(Submenu::new("文件", file_menu));

    #[cfg(not(target_os = "linux"))]
    let mut edit_menu = Menu::new();
    #[cfg(target_os = "macos")]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::Undo);
        edit_menu = edit_menu.add_native_item(MenuItem::Redo);
        edit_menu = edit_menu.add_native_item(MenuItem::Separator);
    }
    #[cfg(not(target_os = "linux"))]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::Cut);
        edit_menu = edit_menu.add_native_item(MenuItem::Copy);
        edit_menu = edit_menu.add_native_item(MenuItem::Paste);
    }
    #[cfg(target_os = "macos")]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::SelectAll);
    }
    #[cfg(not(target_os = "linux"))]
    {
        menu = menu.add_submenu(Submenu::new("编辑", edit_menu));
    }
    #[cfg(target_os = "macos")]
    {
        menu = menu.add_submenu(Submenu::new(
            "View",
            Menu::new().add_native_item(MenuItem::EnterFullScreen),
        ));
    }

    let mut window_menu = Menu::new();
    window_menu = window_menu.add_native_item(MenuItem::Minimize);
    #[cfg(target_os = "macos")]
    {
        window_menu = window_menu.add_native_item(MenuItem::Zoom);
        window_menu = window_menu.add_native_item(MenuItem::Separator);
    }
    window_menu = window_menu.add_native_item(MenuItem::CloseWindow);
    menu = menu.add_submenu(Submenu::new("Window", window_menu));

    menu
}

pub fn event_handler(event: WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "open_file" => {
            FileDialogBuilder::new().pick_file(move |file_path| match file_path {
                Some(file_path) => {
                    event_open_file(event.window(), file_path.to_str().unwrap());
                }
                None => {
                    println!("cancelled");
                }
            });
        }
        "save_file" => {
            // event.window().close().unwrap();
        }
        _ => {}
    }
}

fn event_open_file(window: &Window, file_path: &str) {
    let text = file::read_string(file_path).unwrap();
    window
        .emit(
            "open_file",
            Payload {
                path: file_path.to_string(),
                content: text.into(),
            },
        )
        .unwrap();
}

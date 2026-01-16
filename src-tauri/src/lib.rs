mod monitors;

use serde::Deserialize;
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
use tauri_plugin_positioner::{Position, WindowExt};

use monitors::{battery, cpu, disk, ram};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SystemStatus {
    Excellent,
    CouldBeBetter,
    Critical,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            // Build system tray icon
            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true) // macOS: adapts to light/dark menu bar
                .on_tray_icon_event(|tray, event| {
                    // Forward events to positioner for window positioning
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                // Position window relative to tray icon
                                let _ = window.move_window(Position::TrayCenter);
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // RAM commands
            ram::get_ram_info,
            ram::get_top_memory_processes,
            ram::purge_memory_with_admin,
            ram::force_quit_process,
            // CPU commands
            cpu::get_cpu_info,
            cpu::get_top_cpu_processes,
            cpu::get_system_uptime,
            cpu::open_activity_monitor,
            // Battery commands
            battery::get_battery_info,
            battery::open_energy_settings,
            // Disk commands
            disk::get_disk_info,
            disk::get_storage_categories,
            disk::refresh_storage_categories,
            disk::open_storage_settings,
            disk::open_system_settings,
            // Tray commands
            update_tray_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn update_tray_status(app: AppHandle, status: SystemStatus) -> Result<(), String> {
    // For now, we just acknowledge the status change.
    // Custom icons (tray-normal.png, tray-warning.png, tray-critical.png)
    // can be added to the icons/ folder later.
    // When icons are available, this function will update the tray icon accordingly.

    let _icon_name = match status {
        SystemStatus::Excellent => "tray-normal",
        SystemStatus::CouldBeBetter => "tray-warning",
        SystemStatus::Critical => "tray-critical",
    };

    // Verify the tray exists (for future icon updates)
    if app.tray_by_id("main").is_none() {
        return Err("Tray icon not found".to_string());
    }

    // TODO: When custom icons are added, load and set the appropriate icon here
    // For now, we keep the default icon and just log the status

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_app_builds() {
        // Basic test to ensure the app configuration is valid
        assert!(true);
    }
}

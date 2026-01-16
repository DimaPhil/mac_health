use serde::Serialize;
use sysinfo::Disks;
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Clone, Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub used_percentage: f32,
    pub file_system: String,
    pub is_removable: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct DisksOverview {
    pub primary: Option<DiskInfo>,
    pub all_disks: Vec<DiskInfo>,
    pub total_space_bytes: u64,
    pub total_available_bytes: u64,
    pub total_used_bytes: u64,
    pub total_used_percentage: f32,
}

#[tauri::command]
pub fn get_disk_info() -> Result<DisksOverview, String> {
    let disks = Disks::new_with_refreshed_list();

    let mut all_disks: Vec<DiskInfo> = disks
        .iter()
        .map(|disk| {
            let total = disk.total_space();
            let available = disk.available_space();
            let used = total.saturating_sub(available);
            let used_percentage = if total > 0 {
                (used as f32 / total as f32) * 100.0
            } else {
                0.0
            };

            DiskInfo {
                name: disk.name().to_string_lossy().to_string(),
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                total_bytes: total,
                available_bytes: available,
                used_bytes: used,
                used_percentage,
                file_system: disk.file_system().to_string_lossy().to_string(),
                is_removable: disk.is_removable(),
            }
        })
        .collect();

    // Sort by total space descending (primary disk first)
    all_disks.sort_by(|a, b| b.total_bytes.cmp(&a.total_bytes));

    // Find primary disk (usually "/" mount point or largest disk)
    let primary = all_disks
        .iter()
        .find(|d| d.mount_point == "/")
        .cloned()
        .or_else(|| all_disks.first().cloned());

    // Calculate totals (only for non-removable disks)
    let non_removable: Vec<&DiskInfo> = all_disks.iter().filter(|d| !d.is_removable).collect();

    let total_space_bytes: u64 = non_removable.iter().map(|d| d.total_bytes).sum();
    let total_available_bytes: u64 = non_removable.iter().map(|d| d.available_bytes).sum();
    let total_used_bytes: u64 = non_removable.iter().map(|d| d.used_bytes).sum();
    let total_used_percentage = if total_space_bytes > 0 {
        (total_used_bytes as f32 / total_space_bytes as f32) * 100.0
    } else {
        0.0
    };

    Ok(DisksOverview {
        primary,
        all_disks,
        total_space_bytes,
        total_available_bytes,
        total_used_bytes,
        total_used_percentage,
    })
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct StorageCategory {
    pub name: String,
    pub bytes: u64,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct StorageCategories {
    pub categories: Vec<StorageCategory>,
    pub total_categorized: u64,
}

/// Get directory size using du -s (fast, single line output)
fn get_dir_size(path: &std::path::Path) -> u64 {
    if !path.exists() {
        return 0;
    }

    let output = std::process::Command::new("du")
        .args(["-sk", path.to_string_lossy().as_ref()])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            stdout
                .split_whitespace()
                .next()
                .and_then(|s| s.parse::<u64>().ok())
                .map(|kb| kb * 1024)
                .unwrap_or(0)
        }
        _ => 0,
    }
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
struct CachedStorageCategories {
    categories: StorageCategories,
    timestamp: u64,
}

fn get_cache_path() -> Option<std::path::PathBuf> {
    dirs::cache_dir().map(|p| p.join("mac-health").join("storage-categories.json"))
}

fn read_cache() -> Option<CachedStorageCategories> {
    let path = get_cache_path()?;
    let content = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

fn write_cache(categories: &StorageCategories) {
    if let Some(path) = get_cache_path() {
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let cached = CachedStorageCategories {
            categories: categories.clone(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0),
        };
        if let Ok(json) = serde_json::to_string(&cached) {
            let _ = std::fs::write(path, json);
        }
    }
}

fn calculate_categories() -> StorageCategories {
    let home = dirs::home_dir().unwrap_or_default();

    let dirs_to_scan: Vec<(&str, std::path::PathBuf, &str)> = vec![
        ("Applications", std::path::PathBuf::from("/Applications"), "#3b82f6"),
        ("Documents", home.join("Documents"), "#22c55e"),
        ("Downloads", home.join("Downloads"), "#14b8a6"),
        ("Pictures", home.join("Pictures"), "#f59e0b"),
        ("Music", home.join("Music"), "#ec4899"),
        ("Movies", home.join("Movies"), "#8b5cf6"),
        ("Desktop", home.join("Desktop"), "#6366f1"),
    ];

    // Run du commands in parallel
    let handles: Vec<_> = dirs_to_scan
        .into_iter()
        .map(|(name, path, color)| {
            let name = name.to_string();
            let color = color.to_string();
            std::thread::spawn(move || StorageCategory {
                name,
                bytes: get_dir_size(&path),
                color,
            })
        })
        .collect();

    let categories: Vec<StorageCategory> = handles
        .into_iter()
        .filter_map(|h| h.join().ok())
        .collect();

    let total_categorized = categories.iter().map(|c| c.bytes).sum();

    StorageCategories {
        categories,
        total_categorized,
    }
}

/// Get storage categories - returns cached data immediately, refreshes in background if stale
#[tauri::command]
pub fn get_storage_categories() -> Result<StorageCategories, String> {
    // Return cached data if available (less than 5 minutes old)
    if let Some(cached) = read_cache() {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let age_secs = now.saturating_sub(cached.timestamp);
        if age_secs < 300 {
            // Cache is fresh, return it
            return Ok(cached.categories);
        }

        // Cache is stale, return it but trigger background refresh
        std::thread::spawn(|| {
            let categories = calculate_categories();
            write_cache(&categories);
        });
        return Ok(cached.categories);
    }

    // No cache - return empty and trigger background calculation
    std::thread::spawn(|| {
        let categories = calculate_categories();
        write_cache(&categories);
    });

    Ok(StorageCategories {
        categories: vec![],
        total_categorized: 0,
    })
}

/// Force refresh storage categories (called when user wants fresh data)
#[tauri::command]
pub fn refresh_storage_categories() -> Result<StorageCategories, String> {
    let categories = calculate_categories();
    write_cache(&categories);
    Ok(categories)
}

#[tauri::command]
pub async fn open_storage_settings(app: AppHandle) -> Result<(), String> {
    app.shell()
        .open("x-apple.systempreferences:com.apple.settings.Storage", None)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_system_settings(app: AppHandle, panel: String) -> Result<(), String> {
    let url = match panel.as_str() {
        "storage" => "x-apple.systempreferences:com.apple.settings.Storage",
        "privacy" => "x-apple.systempreferences:com.apple.preference.security?Privacy",
        "accessibility" => {
            "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
        }
        "full-disk-access" => {
            "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"
        }
        _ => return Err(format!("Unknown panel: {}", panel)),
    };

    app.shell().open(url, None).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_disk_info() {
        let result = get_disk_info();
        assert!(result.is_ok());

        let overview = result.unwrap();
        assert!(!overview.all_disks.is_empty());
        assert!(overview.primary.is_some());
        assert!(overview.total_space_bytes > 0);
    }
}

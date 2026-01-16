use nix::sys::signal::{kill, Signal};
use nix::unistd::Pid;
use serde::Serialize;
use std::process::Command;
use sysinfo::System;

#[derive(Debug, Clone, Serialize)]
pub struct RamInfo {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub available_bytes: u64,
    pub used_percentage: f32,
    pub pressure_level: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProcessMemoryInfo {
    pub pid: u32,
    pub name: String,
    pub path: String,
    pub memory_bytes: u64,
    pub memory_percentage: f32,
}

#[tauri::command]
pub fn get_ram_info() -> Result<RamInfo, String> {
    let mut sys = System::new();
    sys.refresh_memory();

    let total = sys.total_memory();
    let used = sys.used_memory();
    // available_memory() can return 0 on macOS, calculate from total - used
    let available = sys.available_memory();
    let available = if available == 0 {
        total.saturating_sub(used)
    } else {
        available
    };

    let used_percentage = if total > 0 {
        (used as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    // Determine pressure level based on usage percentage
    let pressure_level = if used_percentage < 60.0 {
        "normal".to_string()
    } else if used_percentage < 85.0 {
        "warn".to_string()
    } else {
        "critical".to_string()
    };

    Ok(RamInfo {
        total_bytes: total,
        used_bytes: used,
        available_bytes: available,
        used_percentage,
        pressure_level,
    })
}

#[tauri::command]
pub fn get_top_memory_processes(count: Option<usize>) -> Result<Vec<ProcessMemoryInfo>, String> {
    let count = count.unwrap_or(10);

    // Use ps command - much faster than sysinfo for process listing
    let output = Command::new("ps")
        .args(["-axm", "-o", "pid,rss,command"])
        .output()
        .map_err(|e| format!("Failed to run ps: {}", e))?;

    if !output.status.success() {
        return Err("ps command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut sys = System::new();
    sys.refresh_memory();
    let total_memory = sys.total_memory();

    let mut processes: Vec<ProcessMemoryInfo> = stdout
        .lines()
        .skip(1) // Skip header
        .filter_map(|line| {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let pid = parts[0].parse::<u32>().ok()?;
                let rss_kb = parts[1].parse::<u64>().ok()?;
                let memory_bytes = rss_kb * 1024;
                let full_path = parts[2..].join(" ");
                // Extract just the executable name from the path
                let name = full_path
                    .split('/')
                    .last()
                    .unwrap_or(&full_path)
                    .split(' ')
                    .next()
                    .unwrap_or(&full_path)
                    .to_string();
                let memory_percentage = if total_memory > 0 {
                    (memory_bytes as f32 / total_memory as f32) * 100.0
                } else {
                    0.0
                };
                Some(ProcessMemoryInfo {
                    pid,
                    name,
                    path: full_path,
                    memory_bytes,
                    memory_percentage,
                })
            } else {
                None
            }
        })
        .collect();

    // Sort by memory descending and take top N
    processes.sort_by(|a, b| b.memory_bytes.cmp(&a.memory_bytes));
    processes.truncate(count);
    Ok(processes)
}

#[derive(Debug, Clone, Serialize)]
pub struct MemoryCleanResult {
    pub success: bool,
    pub freed_bytes: u64,
    pub message: String,
}

/// Get current used memory for calculating freed bytes
fn get_used_memory() -> u64 {
    let mut sys = System::new();
    sys.refresh_memory();
    sys.used_memory()
}

#[tauri::command]
pub fn purge_memory_with_admin() -> Result<MemoryCleanResult, String> {
    let before = get_used_memory();

    // Use osascript to run purge with admin privileges
    // This will prompt the user for their password
    let script = r#"do shell script "purge" with administrator privileges"#;

    let output = Command::new("osascript")
        .args(["-e", script])
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        // User cancelled or authentication failed
        if stderr.contains("canceled") || stderr.contains("User canceled") {
            return Ok(MemoryCleanResult {
                success: false,
                freed_bytes: 0,
                message: "Authentication cancelled".to_string(),
            });
        }
        return Err(format!("Purge failed: {}", stderr));
    }

    // Wait a moment for memory to settle
    std::thread::sleep(std::time::Duration::from_millis(500));

    let after = get_used_memory();
    let freed_bytes = before.saturating_sub(after);

    Ok(MemoryCleanResult {
        success: true,
        freed_bytes,
        message: format!("Freed {} bytes of memory", freed_bytes),
    })
}

#[derive(Debug, Clone, Serialize)]
pub struct ForceQuitResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub fn force_quit_process(pid: u32) -> Result<ForceQuitResult, String> {
    let nix_pid = Pid::from_raw(pid as i32);

    // First try SIGTERM (graceful termination)
    match kill(nix_pid, Signal::SIGTERM) {
        Ok(_) => {
            // Wait a moment to see if process terminates
            std::thread::sleep(std::time::Duration::from_millis(500));

            // Check if process still exists
            match kill(nix_pid, None) {
                Ok(_) => {
                    // Process still alive, try SIGKILL
                    match kill(nix_pid, Signal::SIGKILL) {
                        Ok(_) => Ok(ForceQuitResult {
                            success: true,
                            message: "Process force killed".to_string(),
                        }),
                        Err(e) => Err(format!("Failed to kill process: {}", e)),
                    }
                }
                Err(_) => {
                    // Process no longer exists (terminated successfully)
                    Ok(ForceQuitResult {
                        success: true,
                        message: "Process terminated".to_string(),
                    })
                }
            }
        }
        Err(nix::errno::Errno::ESRCH) => {
            // Process doesn't exist
            Ok(ForceQuitResult {
                success: false,
                message: "Process not found".to_string(),
            })
        }
        Err(nix::errno::Errno::EPERM) => {
            // Permission denied - need elevated privileges
            Ok(ForceQuitResult {
                success: false,
                message: "Permission denied. Try granting Accessibility access.".to_string(),
            })
        }
        Err(e) => Err(format!("Failed to terminate process: {}", e)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_ram_info() {
        let result = get_ram_info();
        assert!(result.is_ok());

        let info = result.unwrap();
        assert!(info.total_bytes > 0);
        assert!(info.used_percentage >= 0.0 && info.used_percentage <= 100.0);
        assert!(["normal", "warn", "critical"].contains(&info.pressure_level.as_str()));
    }

    #[test]
    fn test_get_top_memory_processes() {
        let result = get_top_memory_processes(Some(5));
        assert!(result.is_ok());

        let processes = result.unwrap();
        assert!(processes.len() <= 5);

        // Verify sorted by memory descending
        for i in 1..processes.len() {
            assert!(processes[i - 1].memory_bytes >= processes[i].memory_bytes);
        }
    }
}

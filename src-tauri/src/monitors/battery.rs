use serde::Serialize;
use std::process::Command;
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Clone, Serialize)]
pub struct BatteryInfo {
    pub percentage: f32,
    pub is_charging: bool,
    pub is_plugged_in: bool,
    pub power_source: String,
    pub condition: String,
    pub max_capacity_percentage: f32,
    pub cycle_count: Option<u32>,
    pub time_to_full_minutes: Option<u32>,
    pub time_to_empty_minutes: Option<u32>,
    pub temperature_celsius: Option<f32>,
    pub voltage_volts: Option<f32>,
}

fn get_ioreg_value(output: &str, key: &str) -> Option<String> {
    // Look for top-level key = value pattern (with spaces around =)
    // This avoids matching nested values inside BatteryData
    let pattern = format!("{} = ", key);
    for line in output.lines() {
        if let Some(pos) = line.find(&pattern) {
            let value_start = pos + pattern.len();
            let value = line[value_start..].trim().trim_matches('"');
            // Handle values that might have trailing content
            let value = value.split_whitespace().next().unwrap_or(value);
            return Some(value.to_string());
        }
    }
    None
}

#[tauri::command]
pub fn get_battery_info() -> Result<BatteryInfo, String> {
    // Use ioreg to get accurate battery info from macOS
    let output = Command::new("ioreg")
        .args(["-rc", "AppleSmartBattery"])
        .output()
        .map_err(|e| format!("Failed to run ioreg: {}", e))?;

    if !output.status.success() {
        return Err("ioreg command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    if stdout.trim().is_empty() {
        return Err("No battery found (desktop Mac?)".to_string());
    }

    // Parse values from ioreg output
    // Use AppleRaw* values for accurate readings (the non-raw ones are percentages)
    let current_capacity = get_ioreg_value(&stdout, "\"AppleRawCurrentCapacity\"")
        .and_then(|v| v.parse::<f32>().ok())
        .unwrap_or(0.0);

    let max_capacity = get_ioreg_value(&stdout, "\"AppleRawMaxCapacity\"")
        .and_then(|v| v.parse::<f32>().ok())
        .unwrap_or(100.0);

    let design_capacity = get_ioreg_value(&stdout, "\"DesignCapacity\"")
        .and_then(|v| v.parse::<f32>().ok())
        .unwrap_or(100.0);

    let is_charging = get_ioreg_value(&stdout, "\"IsCharging\"")
        .map(|v| v == "Yes" || v == "1")
        .unwrap_or(false);

    let external_connected = get_ioreg_value(&stdout, "\"ExternalConnected\"")
        .map(|v| v == "Yes" || v == "1")
        .unwrap_or(false);

    let cycle_count = get_ioreg_value(&stdout, "\"CycleCount\"")
        .and_then(|v| v.parse::<u32>().ok());

    let temperature = get_ioreg_value(&stdout, "\"Temperature\"")
        .and_then(|v| v.parse::<f32>().ok())
        .map(|t| t / 100.0); // Temperature is in centi-degrees

    let voltage = get_ioreg_value(&stdout, "\"Voltage\"")
        .and_then(|v| v.parse::<f32>().ok())
        .map(|v| v / 1000.0); // Voltage is in mV

    let time_to_empty = get_ioreg_value(&stdout, "\"TimeRemaining\"")
        .and_then(|v| v.parse::<u32>().ok())
        .filter(|&v| v < 65535); // Filter out invalid values

    let time_to_full = if is_charging {
        get_ioreg_value(&stdout, "\"TimeRemaining\"")
            .and_then(|v| v.parse::<u32>().ok())
            .filter(|&v| v < 65535)
    } else {
        None
    };

    // Calculate percentages
    let percentage = if max_capacity > 0.0 {
        (current_capacity / max_capacity) * 100.0
    } else {
        0.0
    };

    let max_capacity_percentage = if design_capacity > 0.0 {
        (max_capacity / design_capacity) * 100.0
    } else {
        100.0
    };

    // Determine condition based on health
    let condition = if max_capacity_percentage >= 80.0 {
        "Normal".to_string()
    } else if max_capacity_percentage >= 50.0 {
        "Service Recommended".to_string()
    } else {
        "Replace Soon".to_string()
    };

    let power_source = if external_connected {
        "AC Adapter".to_string()
    } else {
        "Battery".to_string()
    };

    Ok(BatteryInfo {
        percentage,
        is_charging,
        is_plugged_in: external_connected,
        power_source,
        condition,
        max_capacity_percentage,
        cycle_count,
        time_to_full_minutes: if is_charging { time_to_full } else { None },
        time_to_empty_minutes: if !is_charging { time_to_empty } else { None },
        temperature_celsius: temperature,
        voltage_volts: voltage,
    })
}

#[tauri::command]
pub async fn open_energy_settings(app: AppHandle) -> Result<(), String> {
    app.shell()
        .open("x-apple.systempreferences:com.apple.preference.battery", None)
        .map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_battery_info() {
        let result = get_battery_info();
        // Battery info may not be available on desktop Macs
        match result {
            Ok(info) => {
                assert!(info.percentage >= 0.0 && info.percentage <= 100.0);
                assert!(info.max_capacity_percentage >= 0.0 && info.max_capacity_percentage <= 150.0);
                assert!(["Normal", "Service Recommended", "Replace Soon"]
                    .contains(&info.condition.as_str()));
            }
            Err(e) => {
                // Expected on desktop Macs without batteries
                assert!(e.contains("No battery found") || e.contains("Failed"));
            }
        }
    }
}

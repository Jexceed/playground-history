use tauri_plugin_dialog::DialogExt;

const MAX_PROGRESS_BYTES: usize = 262_144;

fn validate_progress(data: &str) -> Result<(), String> {
    if data.len() > MAX_PROGRESS_BYTES {
        return Err("学习记录文件过大。".into());
    }
    let value: serde_json::Value = serde_json::from_str(data.trim_start_matches('\u{feff}'))
        .map_err(|_| "这不是有效的学习记录文件。".to_string())?;
    if value.get("schemaVersion").and_then(|v| v.as_u64()) != Some(2)
        || !value
            .get("completed")
            .and_then(|v| v.as_array())
            .is_some_and(|ids| ids.iter().all(|id| id.is_string()))
    {
        return Err("请选择小小历史旅行团导出的学习记录。".into());
    }
    Ok(())
}

#[tauri::command]
async fn export_progress(app: tauri::AppHandle, data: String) -> Result<bool, String> {
    validate_progress(&data)?;
    tauri::async_runtime::spawn_blocking(move || {
        let selected = app
            .dialog()
            .file()
            .set_title("导出学习记录")
            .add_filter("学习记录", &["json"])
            .set_file_name("小小历史旅行团-学习记录.json")
            .blocking_save_file();
        let Some(selected) = selected else {
            return Ok(false);
        };
        let path = selected
            .into_path()
            .map_err(|_| "无法使用所选位置。".to_string())?;
        std::fs::write(path, data).map_err(|_| "学习记录未能写入所选位置。".to_string())?;
        Ok(true)
    })
    .await
    .map_err(|_| "保存窗口暂时未能完成。".to_string())?
}

#[tauri::command]
async fn import_progress(app: tauri::AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let selected = app
            .dialog()
            .file()
            .set_title("导入学习记录")
            .add_filter("学习记录", &["json"])
            .blocking_pick_file();
        let Some(selected) = selected else {
            return Ok(None);
        };
        let path = selected
            .into_path()
            .map_err(|_| "无法使用所选文件。".to_string())?;
        let size = std::fs::metadata(&path)
            .map_err(|_| "无法读取所选文件。".to_string())?
            .len();
        if size > MAX_PROGRESS_BYTES as u64 {
            return Err("学习记录文件过大。".into());
        }
        let data = std::fs::read_to_string(path).map_err(|_| "无法读取所选文件。".to_string())?;
        validate_progress(&data)?;
        Ok(Some(data))
    })
    .await
    .map_err(|_| "打开窗口暂时未能完成。".to_string())?
}

#[tauri::command]
fn open_source(url: String) -> Result<(), String> {
    let parsed = tauri::Url::parse(&url).map_err(|_| "资料地址无效。".to_string())?;
    if !matches!(parsed.scheme(), "http" | "https")
        || parsed.host_str().is_none()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
    {
        return Err("仅支持打开网页资料地址。".into());
    }
    std::process::Command::new("/usr/bin/open")
        .arg(parsed.as_str())
        .spawn()
        .map_err(|_| "暂时无法打开系统浏览器。".to_string())?;
    Ok(())
}

fn allowed_navigation(url: &tauri::Url) -> bool {
    (url.scheme() == "tauri" && url.host_str() == Some("localhost"))
        || url.as_str() == "about:blank"
        || (cfg!(debug_assertions)
            && url.scheme() == "http"
            && url.host_str() == Some("127.0.0.1")
            && url.port() == Some(1420))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            export_progress,
            import_progress,
            open_source
        ])
        .setup(|app| {
            tauri::WebviewWindowBuilder::from_config(app.handle(), &app.config().app.windows[0])?
                .on_navigation(allowed_navigation)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("小小历史旅行团未能启动");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn progress_rejects_unrelated_or_oversized_files() {
        assert!(validate_progress(r#"{"schemaVersion":2,"completed":[],"current":null}"#).is_ok());
        assert!(validate_progress(r#"{"schemaVersion":1,"completed":[]}"#).is_err());
        assert!(validate_progress(r#"{"schemaVersion":2,"completed":[3]}"#).is_err());
        assert!(validate_progress(&" ".repeat(MAX_PROGRESS_BYTES + 1)).is_err());
    }
    #[test]
    fn external_pages_cannot_replace_the_game() {
        assert!(allowed_navigation(
            &tauri::Url::parse("tauri://localhost/index.html").unwrap()
        ));
        assert!(!allowed_navigation(
            &tauri::Url::parse("https://example.com/").unwrap()
        ));
        assert!(!allowed_navigation(
            &tauri::Url::parse("file:///etc/passwd").unwrap()
        ));
    }
}

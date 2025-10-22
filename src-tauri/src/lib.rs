// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_image(data: String, filename: String) -> Result<String, String> {
    use std::fs;
    use std::path::Path;
    
    // Create paintings directory if it doesn't exist
    let paintings_dir = "paintings";
    if !Path::new(paintings_dir).exists() {
        fs::create_dir_all(paintings_dir).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Decode base64 data
    use base64::{Engine as _, engine::general_purpose};
    let image_data = general_purpose::STANDARD.decode(&data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    // Save to file
    let file_path = format!("{}/{}", paintings_dir, filename);
    fs::write(&file_path, image_data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("Image saved to: {}", file_path))
}

#[tauri::command]
async fn describe_image(image_url: String) -> Result<String, String> {
    use reqwest;
    use serde_json;
    use std::env;
    
    // Try to get API key from environment
    let api_key = env::var("OPENAI_API_KEY")
        .or_else(|_| env::var("VITE_OPENAI_API_KEY"))
        .or_else(|_| {
            // Try to read from .env file in parent directory
            use std::fs;
            if let Ok(env_content) = fs::read_to_string("../.env") {
                for line in env_content.lines() {
                    if line.starts_with("OPENAI_API_KEY=") {
                        return Ok(line.strip_prefix("OPENAI_API_KEY=").unwrap_or("").to_string());
                    }
                }
            }
            Err("Not found")
        })
        .map_err(|_| "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file or environment variables.")?;
    
    let client = reqwest::Client::new();
    
    let request_body = serde_json::json!({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You return strictly descriptive, non-interpretive prose about the supplied image.\nDo not infer intent, symbolism, psychology, or narrative. Describe only what is visually present.\n\nStart with a brief tl;dr summary, then provide a concise description that is 40% shorter than typical responses."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Describe this image."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1000
    });
    
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error: {}", error_text));
    }
    
    let response_json: serde_json::Value = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No content in response")?;
    
    Ok(content.to_string())
}

#[tauri::command]
async fn critique_image(image_url: String) -> Result<String, String> {
    use reqwest;
    use serde_json;
    use std::env;
    
    // Try to get API key from environment
    let api_key = env::var("OPENAI_API_KEY")
        .or_else(|_| env::var("VITE_OPENAI_API_KEY"))
        .or_else(|_| {
            // Try to read from .env file in parent directory
            use std::fs;
            if let Ok(env_content) = fs::read_to_string("../.env") {
                for line in env_content.lines() {
                    if line.starts_with("OPENAI_API_KEY=") {
                        return Ok(line.strip_prefix("OPENAI_API_KEY=").unwrap_or("").to_string());
                    }
                }
            }
            Err("Not found")
        })
        .map_err(|_| "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file or environment variables.")?;
    
    let client = reqwest::Client::new();
    
    let request_body = serde_json::json!({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are a contemporary critical theorist with deep familiarity with art history, institutional critique, and the present art-market discourse.\nYou focus specifically on what makes this image 'good' within the contemporary art scene. Analyze the work's strengths in relation to current artistic practices, market positioning, critical reception, and cultural relevance.\nYou evaluate the work's merit within institutional discourse and contemporary art-market conditions.\n\nStart with a brief tl;dr summary, then provide a concise critique that is 40% shorter than typical responses."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Critique this image."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1000
    });
    
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error: {}", error_text));
    }
    
    let response_json: serde_json::Value = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No content in response")?;
    
    Ok(content.to_string())
}

#[tauri::command]
async fn artist_statement(image_url: String) -> Result<String, String> {
    use reqwest;
    use serde_json;
    use std::env;
    
    // Try to get API key from environment
    let api_key = env::var("OPENAI_API_KEY")
        .or_else(|_| env::var("VITE_OPENAI_API_KEY"))
        .or_else(|_| {
            // Try to read from .env file in parent directory
            use std::fs;
            if let Ok(env_content) = fs::read_to_string("../.env") {
                for line in env_content.lines() {
                    if line.starts_with("OPENAI_API_KEY=") {
                        return Ok(line.strip_prefix("OPENAI_API_KEY=").unwrap_or("").to_string());
                    }
                }
            }
            Err("Not found")
        })
        .map_err(|_| "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file or environment variables.")?;
    
    let client = reqwest::Client::new();
    
    let request_body = serde_json::json!({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "The speaker is a conceptual artist discussing their own work. They use the language of contemporary art practice, referencing process, materiality, and conceptual frameworks. They articulate decisions rather than feelings and avoid sentimentality except where deployed as material. They speak from within institutional discourse, assuming the work's legitimacy rather than defending it. They frame the work as part of an ongoing research trajectory and position it in relation to broader cultural, technological, and art-historical contexts without over-citation. The register is intellectual yet accessible, terse and precise, with form and concept treated as inseparable. They do not narrate biography; they speak from within the logic of the work."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Describe this piece from the perspective of the conceptual artist who created it."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1000
    });
    
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error: {}", error_text));
    }
    
    let response_json: serde_json::Value = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No content in response")?;
    
    Ok(content.to_string())
}

#[tauri::command]
async fn new_prompt_creation_voice(artist_statement: String, critic_opinion: String) -> Result<String, String> {
    use reqwest;
    use serde_json;
    use std::env;
    
    // Try to get API key from environment
    let api_key = env::var("OPENAI_API_KEY")
        .or_else(|_| env::var("VITE_OPENAI_API_KEY"))
        .or_else(|_| {
            // Try to read from .env file in parent directory
            use std::fs;
            if let Ok(env_content) = fs::read_to_string("../.env") {
                for line in env_content.lines() {
                    if line.starts_with("OPENAI_API_KEY=") {
                        return Ok(line.strip_prefix("OPENAI_API_KEY=").unwrap_or("").to_string());
                    }
                }
            }
            Err("Not found")
        })
        .map_err(|_| "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file or environment variables.")?;
    
    let client = reqwest::Client::new();
    
    let request_body = serde_json::json!({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are given:\n(1) an artist statement, and\n(2) a critic's statement about an existing artwork.\n\nYour task is to generate a new image prompt for a different artwork that:\n\n- emphasizes one conceptual aspect present in the discourse\n- does not recreate or closely echo the original image's composition, motifs, or style\n- treats the statements as conceptual source material, not visual reference\n\nOutput ONLY a concise, generatable image prompt describing an entirely new image that embodies a chosen conceptual aspect, with no mention of the original work, the discourse, or instructions. Do not include any other text, explanations, or formatting."
            },
            {
                "role": "user",
                "content": format!("Artist Statement: {}\n\nCritic's Opinion: {}\n\nGenerate a new image prompt based on the artist statement and critic's opinion provided.", artist_statement, critic_opinion)
            }
        ],
        "max_tokens": 1000
    });
    
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error: {}", error_text));
    }
    
    let response_json: serde_json::Value = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No content in response")?;
    
    Ok(content.to_string())
}

#[tauri::command]
async fn save_session_data(session_data: String) -> Result<String, String> {
    use std::fs;
    use std::path::Path;
    
    // Create sessions directory if it doesn't exist
    let sessions_dir = "sessions";
    if !Path::new(sessions_dir).exists() {
        fs::create_dir_all(sessions_dir).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Create filename with timestamp
    let timestamp = chrono::Utc::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("session-{}.json", timestamp);
    let file_path = format!("{}/{}", sessions_dir, filename);
    
    // Parse the session data to validate it
    let session_json: serde_json::Value = serde_json::from_str(&session_data)
        .map_err(|e| format!("Failed to parse session data: {}", e))?;
    
    // Write the JSON data to file
    let json_string = serde_json::to_string_pretty(&session_json)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    
    fs::write(&file_path, json_string)
        .map_err(|e| format!("Failed to write session data: {}", e))?;
    
    Ok(format!("Session data saved to: {}", file_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_image, describe_image, critique_image, artist_statement, new_prompt_creation_voice, save_session_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

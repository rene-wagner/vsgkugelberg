use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::io::{BufReader, BufWriter};
use slug::slugify;
use chrono::Utc;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Category {
    id: u64,
    parent_id: Option<u64>,
    title: String,
    description: String,
    #[serde(default)]
    created_at: Option<String>,
    #[serde(default)]
    updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct OutputCategory {
    id: u64,
    parent_id: Option<String>,
    name: String,
    slug: String,
    description: String,
    created_at: String,
    updated_at: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <input.csv> [output.csv]", args[0]);
        eprintln!("If output.csv is not specified, output will be printed to stdout");
        std::process::exit(1);
    }

    let input_path = &args[1];
    let output_path = args.get(2);

    // Read CSV file
    let file = File::open(input_path)
        .map_err(|e| format!("Failed to open file: {}: {}", input_path, e))?;
    let reader = BufReader::new(file);
    let mut csv_reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_reader(reader);

    // Validate headers
    let headers = csv_reader.headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?;
    
    let expected_headers = vec!["id", "parent_id", "title", "description", "created_at", "updated_at"];
    for expected in &expected_headers {
        if !headers.iter().any(|h| h == *expected) {
            return Err(format!("Missing required column: {}", expected).into());
        }
    }

    // Parse CSV into Vec<Category>
    let mut categories: Vec<Category> = Vec::new();
    for result in csv_reader.deserialize() {
        let record: Category = result
            .map_err(|e| format!("Failed to deserialize CSV record: {}", e))?;
        categories.push(record);
    }

    // Sort categories: parent_id = null first, then by parent_id
    categories.sort_by(|a, b| {
        match (&a.parent_id, &b.parent_id) {
            (None, None) => std::cmp::Ordering::Equal,
            (None, Some(_)) => std::cmp::Ordering::Less,
            (Some(_), None) => std::cmp::Ordering::Greater,
            (Some(a_pid), Some(b_pid)) => a_pid.cmp(b_pid),
        }
    });

    // Create mapping from old ID to new ID (after sorting)
    let mut old_to_new_id: HashMap<u64, u64> = HashMap::new();
    for (index, category) in categories.iter().enumerate() {
        let new_id = (index + 1) as u64;
        old_to_new_id.insert(category.id, new_id);
    }

    // Transform categories with new IDs
    let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let output_categories: Vec<OutputCategory> = categories
        .iter()
        .enumerate()
        .map(|(index, cat)| {
            let new_id = (index + 1) as u64;

            // Map parent_id to new ID, set to "null" string if parent_id was 1 or None
            let new_parent_id = cat.parent_id.and_then(|old_parent_id| {
                if old_parent_id == 1 {
                    // parent_id of 1 becomes null
                    None
                } else {
                    // Map to new ID if it exists in our mapping
                    old_to_new_id.get(&old_parent_id).copied()
                }
            }).map(|id| id.to_string())
            .or_else(|| Some("null".to_string()))
            .filter(|s| s != "null");

            OutputCategory {
                id: new_id,
                parent_id: new_parent_id,
                name: cat.title.clone(),
                slug: slugify(&cat.title),
                description: cat.description.clone(),
                created_at: now.clone(),
                updated_at: now.clone(),
            }
        })
        .collect();

    // Write to CSV file or stdout
    match output_path {
        Some(path) => {
            let file = File::create(path)
                .map_err(|e| format!("Failed to create output file: {}: {}", path, e))?;
            let writer = BufWriter::new(file);
            let mut csv_writer = csv::WriterBuilder::new()
                .from_writer(writer);

            for category in &output_categories {
                csv_writer.serialize(category)
                    .map_err(|e| format!("Failed to write CSV record: {}", e))?;
            }

            csv_writer.flush()
                .map_err(|e| format!("Failed to flush CSV writer: {}", e))?;
            println!("Output written to: {}", path);
        }
        None => {
            let mut csv_writer = csv::WriterBuilder::new()
                .from_writer(std::io::stdout());

            for category in &output_categories {
                csv_writer.serialize(category)
                    .map_err(|e| format!("Failed to write CSV record: {}", e))?;
            }

            csv_writer.flush()
                .map_err(|e| format!("Failed to flush CSV writer: {}", e))?;
        }
    }

    Ok(())
}

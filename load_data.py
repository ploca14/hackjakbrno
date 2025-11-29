import os
import subprocess
import gdown
import py7zr
import pandas as pd # New dependency for xlsx

# --- CONFIGURATION ---
DATA_DIR = "docker/data/pruchod" # Ensure this matches your folder structure
SQL_SCRIPT = "docker/misc/sql/load_data.sql"

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Files configuration
files = [
    ("1Q02yqPRWr-h6Z0weYdMj0imoVG6WdNof", "SeznamDat.xlsx"),
    ("1X7mjzbhX-h-WPIyNm0B2pxaFQZ7lH2hW", "Ciselnik_HVLP.xlsx"),
    ("1MInlov9RUUCEzJmeFOlaruk9mJwthVly", "Ciselnik_Ukonceni.xlsx"),
    ("1oBQWhUKzjyX6W4QhZE3oyLWCyakShq-W", "HB_lazne.csv"),
    ("1djN0pzKkOxfkKVU9RAsYbtfCWUoLHh1r", "HB_PACIENTI_ostatni_hosp.csv"),
    ("1YUL0WBI6__pMhMmcAQwTQvrCmsiu3MJd", "HB_PACIENTI_prvni_hosp.csv"),
    ("1YX2qqVRxmJUVGbpm2HlpsJxnSApn4EqZ", "HB_pece.7z"),
    ("1_SlHmf2avWXASUFx79_YEQmXhaEfOZti", "HB_Popisky_Pruchod.xlsx"),
    ("1_oP1K2d6ryqWClD47F79G45n4e7t0Zqf", "Ciselnik_ICZ.csv")
]

# 1. DOWNLOAD
print(f"⬇️ Downloading {len(files)} files...")
for file_id, filename in files:
    output_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(output_path):
        print(f"   Downloading {filename}...")
        try:
            gdown.download(id=file_id, output=output_path, quiet=True)
        except Exception as e:
            print(f"   ❌ Failed: {e}")
    else:
        print(f"   Skipping {filename} (exists)")

# 2. EXTRACT 7Z
archive_path = os.path.join(DATA_DIR, "HB_pece.7z")
if os.path.exists(archive_path) and not os.path.exists(os.path.join(DATA_DIR, "HB_pece.csv")):
    print("📦 Extracting HB_pece.7z...")
    try:
        with py7zr.SevenZipFile(archive_path, mode='r') as z:
            z.extractall(path=DATA_DIR)
        print("   Extraction complete.")
    except Exception as e:
        print(f"   ❌ Extraction failed: {e}")

# 3. CONVERT XLSX -> CSV
print("🔄 Converting XLSX to CSV...")
xlsx_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.xlsx')]
for xlsx_file in xlsx_files:
    csv_name = xlsx_file.replace(".xlsx", ".csv")
    csv_path = os.path.join(DATA_DIR, csv_name)
    xlsx_path = os.path.join(DATA_DIR, xlsx_file)
    
    if not os.path.exists(csv_path):
        print(f"   Converting {xlsx_file} -> {csv_name}...")
        try:
            # Read Excel and write to CSV as standard UTF-8
            df = pd.read_excel(xlsx_path)
            df.to_csv(csv_path, index=False, encoding='utf-8')
        except Exception as e:
            print(f"   ❌ Conversion failed for {xlsx_file}: {e}")
    else:
        print(f"   Skipping {csv_name} (exists)")

# 4. CONVERT CP1250 CSV -> UTF-8
print("🔄 Converting CP1250 CSVs to UTF-8...")
cp1250_files = [
    "HB_PACIENTI_prvni_hosp.csv",
    "HB_PACIENTI_ostatni_hosp.csv",
    "HB_lazne.csv",
    "HB_pece.csv"
]

for filename in cp1250_files:
    input_path = os.path.join(DATA_DIR, filename)
    output_filename = filename.replace(".csv", "_utf8.csv")
    output_path = os.path.join(DATA_DIR, output_filename)
    
    if os.path.exists(input_path):
        if not os.path.exists(output_path):
            print(f"   Converting {filename} -> {output_filename}...")
            try:
                # Use iconv for fast conversion
                subprocess.run(
                    ["iconv", "-f", "CP1250", "-t", "UTF-8", input_path], 
                    stdout=open(output_path, "w"), 
                    check=True
                )
            except Exception as e:
                print(f"   ❌ Conversion failed for {filename}: {e}")
        else:
            print(f"   Skipping {output_filename} (exists)")
    else:
        print(f"   ⚠️ Source file {filename} not found.")

# 5. RUN SQL LOADER
print("🚀 Running SQL Loader in Docker...")
# Only try to load if the SQL file exists
if os.path.exists(SQL_SCRIPT):
    command = [
        "docker", "compose", 
        "-f", "docker/docker-compose.yml", 
        "exec", "-T", "iris", 
        "iris", "sql", "iris", "-U", "FHIRSERVER"
    ]
    try:
        with open(SQL_SCRIPT, "r") as f:
            result = subprocess.run(command, stdin=f, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Data Loaded Successfully!")
            print(result.stdout)
        else:
            print("❌ SQL Error:")
            print(result.stderr)
    except Exception as e:
        print(f"❌ Failed to run Docker command: {e}")
else:
    print(f"⚠️  SQL file not found at {SQL_SCRIPT}. Skipping load.")
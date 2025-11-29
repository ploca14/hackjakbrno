import gdown
import os

import gdown
import os
import py7zr

# Output directory
output_directory = "docker/data/pruchod"

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# List of files to download (ID, Name)
files = [
    ("1Q02yqPRWr-h6Z0weYdMj0imoVG6WdNof", "20251126_SeznamDatovychSad_HackathonBrno2025.xlsx"),
    ("1X7mjzbhX-h-WPIyNm0B2pxaFQZ7lH2hW", "Číselník HVLP, IPLP, ZP, stoma.xlsx"),
    ("1MInlov9RUUCEzJmeFOlaruk9mJwthVly", "Číselník ukončení hospitalizace.xlsx"),
    ("1oBQWhUKzjyX6W4QhZE3oyLWCyakShq-W", "HB_lazne.csv"),
    ("1djN0pzKkOxfkKVU9RAsYbtfCWUoLHh1r", "HB_PACIENTI_ostatni_hosp.csv"),
    ("1YUL0WBI6__pMhMmcAQwTQvrCmsiu3MJd", "HB_PACIENTI_prvni_hosp.csv"),
    ("1YX2qqVRxmJUVGbpm2HlpsJxnSApn4EqZ", "HB_pece.7z"),
    ("1_SlHmf2avWXASUFx79_YEQmXhaEfOZti", "HB_Popisky_Pruchod.xlsx"),
    ("1_oP1K2d6ryqWClD47F79G45n4e7t0Zqf", "Otevrena-data-OIS-12-02-ciselnik-icz-pojistovny-posledni-dostupne.csv")
]

print(f"Downloading {len(files)} files to {output_directory}...")

for file_id, filename in files:
    output_path = os.path.join(output_directory, filename)
    url = f'https://drive.google.com/uc?id={file_id}'
    
    if os.path.exists(output_path):
        print(f"Skipping {filename} (already exists)")
    else:
        print(f"Downloading {filename}...")
        try:
            gdown.download(id=file_id, output=output_path, quiet=False)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

print("Download process complete!")

# Extraction logic
archive_name = "HB_pece.7z"
archive_path = os.path.join(output_directory, archive_name)

if os.path.exists(archive_path):
    print(f"Extracting {archive_name}...")
    try:
        with py7zr.SevenZipFile(archive_path, mode='r') as z:
            z.extractall(path=output_directory)
        print("Extraction complete!")
    except Exception as e:
        print(f"Failed to extract {archive_name}: {e}")
else:
    print(f"Archive {archive_name} not found, skipping extraction.")

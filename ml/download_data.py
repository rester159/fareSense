"""
Download training data for FareSense fare prediction model.

Sources:
1. BTS DB1B - US domestic airfare survey (free, public domain)
2. Kaggle dilwong/flightprices - 31M Expedia flight records

Usage:
  pip install -r requirements.txt
  python download_data.py
"""

import os
import zipfile
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# BTS DB1B Market data - quarterly US domestic fares
# Available at: https://transtats.bts.gov/Tables.asp?DB_ID=125
BTS_URLS = {
    "db1b_2024_q3": "https://transtats.bts.gov/PREZIP/Origin_and_Destination_Survey_DB1BMarket_2024_3.zip",
    "db1b_2024_q2": "https://transtats.bts.gov/PREZIP/Origin_and_Destination_Survey_DB1BMarket_2024_2.zip",
    "db1b_2024_q1": "https://transtats.bts.gov/PREZIP/Origin_and_Destination_Survey_DB1BMarket_2024_1.zip",
    "db1b_2023_q4": "https://transtats.bts.gov/PREZIP/Origin_and_Destination_Survey_DB1BMarket_2023_4.zip",
}


def download_file(url: str, dest: str):
    """Download a file with progress indication."""
    if os.path.exists(dest):
        print(f"  Already exists: {dest}")
        return

    print(f"  Downloading: {url}")
    resp = requests.get(url, stream=True)
    resp.raise_for_status()

    total = int(resp.headers.get("content-length", 0))
    downloaded = 0

    with open(dest, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r  {pct:.1f}%", end="", flush=True)
    print()


def extract_zip(zip_path: str, dest_dir: str):
    """Extract a zip file."""
    print(f"  Extracting: {zip_path}")
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(dest_dir)


def download_bts():
    """Download BTS DB1B Market data."""
    bts_dir = os.path.join(DATA_DIR, "bts")
    os.makedirs(bts_dir, exist_ok=True)

    print("\n=== Downloading BTS DB1B Market Data ===")
    print("Source: US Bureau of Transportation Statistics")
    print("License: Public domain\n")

    for name, url in BTS_URLS.items():
        zip_path = os.path.join(bts_dir, f"{name}.zip")
        download_file(url, zip_path)

        csv_dir = os.path.join(bts_dir, name)
        if not os.path.exists(csv_dir):
            os.makedirs(csv_dir, exist_ok=True)
            extract_zip(zip_path, csv_dir)


def download_kaggle():
    """Download Kaggle flight prices dataset (requires kaggle CLI auth)."""
    kaggle_dir = os.path.join(DATA_DIR, "kaggle")
    os.makedirs(kaggle_dir, exist_ok=True)

    print("\n=== Kaggle Flight Prices Dataset ===")
    print("To download, set up Kaggle API credentials:")
    print("  1. Go to kaggle.com/settings → API → Create New Token")
    print("  2. Save kaggle.json to ~/.kaggle/kaggle.json")
    print("  3. Run: kaggle datasets download -d dilwong/flightprices -p ml/data/kaggle")
    print()

    try:
        import kaggle
        print("Kaggle API found. Attempting download...")
        kaggle.api.dataset_download_files(
            "dilwong/flightprices", path=kaggle_dir, unzip=True
        )
        print("Kaggle data downloaded successfully.")
    except Exception as e:
        print(f"Kaggle download skipped: {e}")
        print("Download manually from: https://www.kaggle.com/datasets/dilwong/flightprices")


if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)

    print("FareSense ML Training Data Downloader")
    print("=" * 40)

    download_bts()
    download_kaggle()

    print("\n✓ Done. Data saved to:", DATA_DIR)
    print("\nNext step: python train_model.py")

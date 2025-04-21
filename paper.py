import re
from bs4 import BeautifulSoup
import os

# Create papers/eccv directory if it doesn't exist
os.makedirs("papers/eccv", exist_ok=True)

print("Loading HTML file...")
with open("temp.html", "r", encoding="utf-8") as f:
    html = f.read()

print("Parsing HTML...")
soup = BeautifulSoup(html, "html.parser")

# Dictionary to store papers by year
papers_by_year = {
    "2024": [],
    "2022": [],
    "2020": [],
    "2018": []
}

# Get all dt.ptitle elements
dt_elements = soup.find_all("dt", class_="ptitle")
print(f"Found {len(dt_elements)} paper elements")

# Debug sample elements
if dt_elements:
    print("\nSample paper element:")
    sample = dt_elements[0]
    print(sample)
    a_tag = sample.find("a")
    if a_tag:
        print("\nSample anchor tag:")
        print(a_tag)
        print("Title:", a_tag.get_text(strip=True))
        print("HREF:", a_tag.get("href", ""))

# Process each dt element
for dt in dt_elements:
    a_tag = dt.find("a")
    if a_tag:
        title = a_tag.get_text(strip=True)
        href = a_tag.get("href", "")
        
        # Check for different year patterns
        if "eccv_2024" in href or "ECCV_2024" in href:
            papers_by_year["2024"].append(title)
        elif "eccv_2022" in href or "ECCV_2022" in href:
            papers_by_year["2022"].append(title)
        elif "eccv_2020" in href or "ECCV_2020" in href:
            papers_by_year["2020"].append(title)
        elif "eccv_2018" in href or "ECCV_2018" in href:
            papers_by_year["2018"].append(title)

# Print paper counts for each year
for year, titles in papers_by_year.items():
    print(f"Found {len(titles)} papers for ECCV {year}")

# Save papers to separate files by year
for year, titles in papers_by_year.items():
    if titles:  # Only create files for years that have papers
        with open(f"papers/eccv/{year}.txt", "w", encoding="utf-8") as f:
            for title in titles:
                f.write(f"{title}\n")
        print(f"Saved {len(titles)} paper titles for ECCV {year}")

import re
from bs4 import BeautifulSoup

conf = "cvpr"
year = "2023"
with open("source/paper.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
paper_links = soup.find_all("a", href=True)

# 提取论文标题和链接
papers = []
for link in paper_links:
    title = link.get_text(strip=True)
    # url = link.get("href")
    # if title and url:  # 确保标题和链接都存在
        # papers.append((title, url))
    if title:
        papers.append(title)

with open(f"papers/{conf}/{year}.txt", "w", encoding="utf-8") as f:
    for title in papers:
        f.write(f"{title}\n")

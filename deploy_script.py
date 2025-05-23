import json
import os
import datetime
from bs4 import BeautifulSoup

# Create site directory if it doesn't exist
if not os.path.exists('site'):
    os.makedirs('site')

# Copy static files and index.html if they don't exist in site
if not os.path.exists('site/static'):
    os.system('cp -r static site/')
if not os.path.exists('site/index.html'):
    os.system('cp templates/index.html site/index.html')

# Create css directory and copy CSS files for GitHub Pages structure
if not os.path.exists('site/css'):
    os.makedirs('site/css')
    os.system('cp static/css/* site/css/')

# Create js directory and copy JavaScript files for GitHub Pages structure
if not os.path.exists('site/js'):
    os.makedirs('site/js')
    os.system('cp static/js/* site/js/')

# Read selected papers
papers = []
topic = 'diffusion'  # Default topic
with open('selected_papers.txt', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('用 markdown'):
            if line.startswith('[') and ']' in line:
                conf_year, title = line.split('] ', 1)
                conf_year = conf_year[1:]
                conf, year = conf_year.split('/')
                papers.append({
                    'title': title,
                    'conference': conf,
                    'year': year
                })

# Read the HTML file
with open('site/index.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Find existing script tags and replace
for script in soup.find_all('script'):
    if 'script.js' in str(script) and 'src' in script.attrs:
        script['src'] = script['src'].replace('static/js', 'js')

# We'll remove the embedded script creation code and rely solely on the external script.js

# Update CSS links
for link in soup.find_all('link'):
    if 'href' in link.attrs and 'static/css' in link.get('href'):
        link['href'] = link['href'].replace('static/css', 'css')

# Update JavaScript src attributes
for script in soup.find_all('script'):
    if 'src' in script.attrs and 'static/js' in script.get('src'):
        script['src'] = script['src'].replace('static/js', 'js')

# Write the updated HTML
with open('site/index.html', 'w') as f:
    f.write(str(soup))

# Create a JSON file with all papers for client-side filtering
all_papers = []
paper_dirs = os.path.join('papers')
if os.path.exists(paper_dirs):
    for conf_dir in os.listdir(paper_dirs):
        conf_path = os.path.join(paper_dirs, conf_dir)
        if os.path.isdir(conf_path):
            for year_file in os.listdir(conf_path):
                if year_file.endswith('.txt'):
                    year = year_file.replace('.txt', '')
                    with open(os.path.join(conf_path, year_file), 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                all_papers.append({
                                    'title': line,
                                    'conference': conf_dir,
                                    'year': year
                                })

# Write all papers to a JSON file
with open('site/papers.json', 'w') as f:
    json.dump({'papers': all_papers}, f)

# 创建conferences.json文件，用于静态网站的会议和年份数据
# 定义会议分类到不同领域
CONFERENCE_CATEGORIES = {
    "CV": ["cvpr", "eccv", "iccv"],
    "AI": ["aaai", "ijcai", "mm", "acmmm"],
    "ML": ["nips", "icml", "iclr"]
}

# 其他会议分类到Other类别
OTHER_CONFERENCES = ["wacv", "siggraph", "siggraphasia", "emnlp", "aistats", "corl", "colm", "www"]

papers_dir = "./papers"
conferences = {}

# 获取所有会议及其年份
if os.path.exists(papers_dir) and os.path.isdir(papers_dir):
    for conf_dir in os.listdir(papers_dir):
        conf_path = os.path.join(papers_dir, conf_dir)
        
        # 确保是目录而不是文件
        if not os.path.isdir(conf_path):
            continue
            
        years = []
        for year_file in os.listdir(conf_path):
            if year_file.endswith(".txt"):
                year = year_file.replace(".txt", "")
                years.append(year)
        
        # 按年份排序
        years.sort(reverse=True)
        
        if years:  # 只添加有论文的会议
            conferences[conf_dir] = years

# 将会议分到各个领域
categorized_conferences = {}

for field, confs in CONFERENCE_CATEGORIES.items():
    field_confs = {}
    for conf in confs:
        if conf in conferences:
            field_confs[conf] = conferences.pop(conf, [])
    
    if field_confs:  # 只添加有会议的领域
        categorized_conferences[field] = field_confs

# 处理其他未分类会议
other_confs = {}
for conf in OTHER_CONFERENCES:
    if conf in conferences:
        other_confs[conf] = conferences.pop(conf, [])

# 将剩余会议添加到其他类别
for conf, years in conferences.items():
    other_confs[conf] = years

if other_confs:
    categorized_conferences["Other"] = other_confs

# 获取当前年份计算最近5年
current_year = datetime.datetime.now().year
recent_years = [str(year) for year in range(current_year-4, current_year+1)]

# 写入conferences.json文件
with open('site/conferences.json', 'w') as f:
    json.dump({
        "categories": categorized_conferences,
        "recent_years": recent_years
    }, f)

print("Deployment script completed successfully!") 
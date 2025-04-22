from flask import Flask, render_template, jsonify, request
import os
import subprocess
import json
from select_papers import select_random_papers
import random
import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')

# 将会议分类到不同领域
CONFERENCE_CATEGORIES = {
    "CV": ["cvpr", "eccv", "iccv"],
    "AI": ["aaai", "ijcai", "mm", "acmmm"],
    "ML": ["nips", "icml", "iclr"]
}

# 其他会议分类到Other类别
OTHER_CONFERENCES = ["wacv", "siggraph", "siggraphasia", "emnlp", "aistats", "corl", "colm", "www"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_conferences', methods=['GET'])
def get_conferences():
    """获取会议信息和分类"""
    papers_dir = "./papers"
    conferences = {}
    
    # 检查papers目录存在
    if not os.path.exists(papers_dir) or not os.path.isdir(papers_dir):
        return jsonify({"error": "Papers directory not found"}), 404
    
    # 获取所有会议及其年份
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
    
    return jsonify({
        "categories": categorized_conferences,
        "recent_years": recent_years
    })

@app.route('/get_papers', methods=['POST'])
def get_papers():
    data = request.get_json() if request.is_json else {}
    topic = data.get('topic', '').strip()
    
    # 获取过滤条件
    conferences = data.get('conferences', [])  # 选中的会议
    start_year = data.get('start_year', '2023')  # 开始年份
    end_year = data.get('end_year', '2025')  # 结束年份
    
    if not topic:
        # 如果未提供主题，返回空结果
        return jsonify({
            "papers": [],
            "topic": ""
        })
    
    # 设置要显示的论文数量
    num_papers = 15  # 更改为15篇
    
    # 论文目录路径
    papers_dir = "./papers"
    output_dir = "./"
    
    # 清除之前的选择
    if os.path.exists("selected_papers.txt"):
        os.remove("selected_papers.txt")
    
    # 生成年份列表
    try:
        start_year_int = int(start_year)
        end_year_int = int(end_year)
        
        if start_year_int > end_year_int:
            start_year_int, end_year_int = end_year_int, start_year_int
            
        year_range = [str(year) for year in range(start_year_int, end_year_int + 1)]
    except ValueError:
        # 如果解析年份出错，使用默认年份范围
        year_range = ["2023", "2024", "2025"]
    
    # 生成会议过滤列表
    filtered_conferences = []
    if conferences and len(conferences) > 0:
        # 如果指定了会议，则使用指定的会议
        filtered_conferences = conferences
    else:
        # 默认使用所有会议
        for field in CONFERENCE_CATEGORIES:
            filtered_conferences.extend(CONFERENCE_CATEGORIES[field])
        filtered_conferences.extend(OTHER_CONFERENCES)
    
    # 调用论文选择函数
    select_random_papers(
        papers_dir, 
        output_dir, 
        num_papers=num_papers, 
        topic_pool=[topic],
        conference_filter=filtered_conferences,
        year_range=year_range
    )
    
    # 读取生成的文件
    papers = []
    if os.path.exists("selected_papers.txt"):
        with open("selected_papers.txt", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("用 markdown"):
                    # 解析会议/年份和论文标题
                    if line.startswith("[") and "]" in line:
                        conf_year, title = line.split("] ", 1)
                        conf_year = conf_year[1:]  # 移除开头的括号
                        if "/" in conf_year:
                            conf, year = conf_year.split("/")
                            papers.append({
                                "title": title,
                                "conference": conf,
                                "year": year
                            })
    
    return jsonify({
        "papers": papers,
        "topic": topic
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 
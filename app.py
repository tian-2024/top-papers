from flask import Flask, render_template, jsonify, request
import os
import subprocess
import json
from select_papers import select_random_papers
import random

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_papers', methods=['POST'])
def get_papers():
    # 从请求中获取主题，如果没有则随机选择一个
    data = request.get_json() if request.is_json else {}
    topic = data.get('topic', '')
    
    if not topic:
        # 如果未提供主题，则从常见主题中随机选择一个
        topics = ["diffusion", "transformer", "attention", "detection", "segmentation", 
                "reconstruction", "generation", "3d", "video", "gan"]
        topic = random.choice(topics)
    
    # 设置要显示的论文数量
    num_papers = 20
    
    # 运行论文选择函数
    papers_dir = "./papers"
    output_dir = "./"
    
    # 清除之前的选择
    if os.path.exists("selected_papers.txt"):
        os.remove("selected_papers.txt")
    
    # 生成新的选择
    select_random_papers(papers_dir, output_dir, num_papers=num_papers, topic_pool=[topic])
    
    # 读取生成的文件
    papers = []
    with open("selected_papers.txt", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("用 markdown"):
                # 解析会议/年份和论文标题
                if line.startswith("[") and "]" in line:
                    conf_year, title = line.split("] ", 1)
                    conf_year = conf_year[1:]  # 移除开头的括号
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
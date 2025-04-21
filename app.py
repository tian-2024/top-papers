from flask import Flask, render_template, jsonify
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
    # Get random topic from a list of common CV/ML topics
    topics = ["diffusion", "transformer", "attention", "detection", "segmentation", 
              "reconstruction", "generation", "3d", "video", "gan"]
    selected_topic = random.choice(topics)
    
    # Set number of papers to display
    num_papers = 20
    
    # Run the paper selection function
    papers_dir = "./papers"
    output_dir = "./"
    
    # Clear any previous selection
    if os.path.exists("selected_papers.txt"):
        os.remove("selected_papers.txt")
    
    # Generate new selection
    select_random_papers(papers_dir, output_dir, num_papers=num_papers, topic_pool=[selected_topic])
    
    # Read the generated file
    papers = []
    with open("selected_papers.txt", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("用 markdown"):
                # Parse the conference/year and paper title
                if line.startswith("[") and "]" in line:
                    conf_year, title = line.split("] ", 1)
                    conf_year = conf_year[1:]  # Remove the opening bracket
                    conf, year = conf_year.split("/")
                    papers.append({
                        "title": title,
                        "conference": conf,
                        "year": year
                    })
    
    return jsonify({
        "papers": papers,
        "topic": selected_topic
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 
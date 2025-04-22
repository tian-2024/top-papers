import json
import os
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

# Update the template to use static data
script_tag = soup.new_tag('script')
script_content = """
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const papersGrid = document.getElementById('papers-grid');
    const loading = document.getElementById('loading');
    
    // Initial paper data
    const initialData = %s;
    let allPapersData = null;
    
    // Function to display papers
    function displayPapers(papers) {
        // Clear previous papers
        const papersGrid = document.getElementById('papers-grid');
        if (!papersGrid) return;
        
        papersGrid.innerHTML = '';
        
        // Show/hide container based on results
        if (papers.length === 0) {
            papersGrid.style.display = 'none';
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = 'block';
        } else {
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = 'none';
            papersGrid.style.display = 'grid';
            
            papers.forEach(paper => {
                const card = document.createElement('div');
                card.className = 'paper-card';
                
                card.innerHTML = `
                    <div class="paper-title">${ paper.title }</div>
                    <div class="paper-info">
                        <div class="badges-container">
                            <span class="conference-badge">${ paper.conference }</span>
                            <span class="year-badge">${ paper.year }</span>
                        </div>
                        <button class="copy-button" title="Copy paper title to clipboard">
                            <i class="fas fa-copy"></i> Copy Title
                        </button>
                    </div>
                `;
                
                papersGrid.appendChild(card);
            });
        }
    }
    
    // Function to load all papers
    function loadAllPapers() {
        return fetch('papers.json')
            .then(response => response.json())
            .then(data => {
                allPapersData = data;
                return data;
            });
    }
    
    // Function to get random papers matching topic
    function getRandomPapersByTopic(topic) {
        if (!allPapersData) return [];
        
        const normalizedTopic = topic.toLowerCase().trim();
        
        // Filter papers by topic
        const filteredPapers = allPapersData.papers.filter(paper => 
            paper.title.toLowerCase().includes(normalizedTopic) ||
            paper.conference.toLowerCase().includes(normalizedTopic) ||
            paper.year.toLowerCase().includes(normalizedTopic)
        );
        
        // If we have enough papers, shuffle them
        if (filteredPapers.length > 0) {
            // Randomize paper order
            return [...filteredPapers].sort(() => 0.5 - Math.random());
        }
        
        return filteredPapers;
    }
    
    // Function to search by user input
    function searchByTopic() {
        const topic = topicInput.value.trim();
        if (!topic) return;
        
        // Show loading
        if (loading) loading.style.display = 'block';
        
        const papersGrid = document.getElementById('papers-grid');
        if (papersGrid) papersGrid.style.display = 'none';
        
        if (searchBtn) searchBtn.disabled = true;
        
        // Get papers for topic
        const searchPromise = allPapersData ? 
            Promise.resolve() : 
            loadAllPapers();
        
        searchPromise.then(() => {
            const randomFilteredPapers = getRandomPapersByTopic(topic);
            
            // Display results (limit to 20 papers)
            displayPapers(randomFilteredPapers.slice(0, 20));
            
            // Reset UI
            if (loading) loading.style.display = 'none';
            if (searchBtn) searchBtn.disabled = false;
        });
    }
    
    // Load all papers data on page load
    loadAllPapers();
    
    // Hide initial loading 
    if (loading) loading.style.display = 'none';
    
    // Add click event to search button
    searchBtn.addEventListener('click', searchByTopic);
    
    // Add enter key event to topic input
    topicInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchByTopic();
        }
    });
});
""" % json.dumps({'papers': papers})

script_tag.string = script_content

# Find existing script tags and replace
for script in soup.find_all('script'):
    if 'script.js' in str(script):
        script.decompose()

# Add our new script
soup.body.append(script_tag)

# Update CSS links
for link in soup.find_all('link'):
    if 'href' in link.attrs and 'static/css' in link.get('href'):
        link['href'] = link['href'].replace('static/css', 'css')

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

print("Deployment script completed successfully!") 
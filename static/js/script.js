document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refresh-btn');
    const papersList = document.getElementById('papers-list');
    const loading = document.getElementById('loading');
    const currentTopic = document.getElementById('current-topic');
    const themeToggle = document.getElementById('theme-toggle-input');
    const toggleIcon = document.querySelector('.toggle-icon');

    // Theme toggle functionality
    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            toggleIcon.textContent = '☀️';
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            toggleIcon.textContent = '🌙';
            themeToggle.checked = false;
        }
        localStorage.setItem('darkMode', isDark);
    }

    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme (priority: saved preference > system preference)
    setTheme(savedDarkMode !== null ? savedDarkMode : prefersDarkMode);
    
    // Listen for theme toggle changes
    themeToggle.addEventListener('change', function() {
        setTheme(this.checked);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only apply if user hasn't set a preference
        if (localStorage.getItem('darkMode') === null) {
            setTheme(e.matches);
        }
    });

    // Function to fetch papers
    async function fetchPapers() {
        try {
            // Show loading, hide papers list
            loading.style.display = 'block';
            papersList.style.display = 'none';
            
            // Disable button during fetch
            refreshBtn.disabled = true;
            refreshBtn.innerText = 'Loading...';
            
            // Fetch new papers
            const response = await fetch('/get_papers', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch papers');
            }
            
            const data = await response.json();
            
            // Update topic badge
            currentTopic.textContent = data.topic;
            
            // Clear previous papers
            papersList.innerHTML = '';
            
            // Add new papers
            data.papers.forEach(paper => {
                const paperItem = document.createElement('div');
                paperItem.className = 'paper-item';
                
                const paperTitle = document.createElement('div');
                paperTitle.className = 'paper-title';
                paperTitle.textContent = paper.title;
                
                const paperMeta = document.createElement('div');
                paperMeta.className = 'paper-meta';
                
                const confBadge = document.createElement('span');
                confBadge.className = 'conference-badge';
                confBadge.textContent = paper.conference.toUpperCase();
                
                paperMeta.appendChild(confBadge);
                paperMeta.appendChild(document.createTextNode(paper.year));
                
                paperItem.appendChild(paperTitle);
                paperItem.appendChild(paperMeta);
                
                papersList.appendChild(paperItem);
            });
            
            // Hide loading, show papers list
            loading.style.display = 'none';
            papersList.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            loading.textContent = 'Failed to load papers. Try again.';
        } finally {
            // Re-enable button
            refreshBtn.disabled = false;
            refreshBtn.innerText = 'Get New Papers';
        }
    }
    
    // Fetch papers on page load
    fetchPapers();
    
    // Add click event to refresh button
    refreshBtn.addEventListener('click', fetchPapers);
}); 
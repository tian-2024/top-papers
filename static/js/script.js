document.addEventListener('DOMContentLoaded', function() {
    const papersList = document.getElementById('papers-list');
    const loading = document.getElementById('loading');
    const themeToggle = document.getElementById('theme-toggle-input');
    const toggleIcon = document.querySelector('.toggle-icon');
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const papersTable = document.getElementById('papers-table');

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
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only apply if user hasn't set a preference
            if (localStorage.getItem('darkMode') === null) {
                setTheme(e.matches);
            }
        });
    } catch (e) {
        console.log('Browser does not support matchMedia listener');
    }

    // Search functionality
    if (searchBtn && topicInput) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = topicInput.value.trim();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                // 这里实现搜索功能
                
                // 示例显示加载状态
                if (loading) loading.style.display = 'block';
                if (papersTable) papersTable.style.display = 'none';
                
                // 模拟搜索完成
                setTimeout(() => {
                    if (loading) loading.style.display = 'none';
                    if (papersTable) papersTable.style.display = 'table';
                }, 1000);
            }
        });
        
        // 支持按回车键搜索
        topicInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}); 
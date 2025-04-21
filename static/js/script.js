document.addEventListener('DOMContentLoaded', function() {
    const papersList = document.getElementById('papers-list');
    const loading = document.getElementById('loading');
    const themeToggle = document.getElementById('theme-toggle-input');
    const toggleIcon = document.querySelector('.toggle-icon');
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const papersTable = document.getElementById('papers-table');

    console.log("Theme toggle loaded:", themeToggle); // 调试信息

    // 直接添加夜间模式切换按钮点击事件
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        console.log("Theme toggle clicked!"); // 调试信息
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            // 切换到亮模式
            document.body.classList.remove('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '🌙';
            if (themeToggle) themeToggle.checked = false;
            localStorage.setItem('darkMode', 'false');
            console.log("Switched to light mode"); // 调试信息
        } else {
            // 切换到暗模式
            document.body.classList.add('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '☀️';
            if (themeToggle) themeToggle.checked = true;
            localStorage.setItem('darkMode', 'true');
            console.log("Switched to dark mode"); // 调试信息
        }
    });

    // Theme toggle functionality - 保留原始代码但增加调试信息
    function setTheme(isDark) {
        console.log("Setting theme, dark mode:", isDark); // 调试信息
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '☀️';
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '🌙';
            if (themeToggle) themeToggle.checked = false;
        }
        localStorage.setItem('darkMode', isDark);
        console.log("Theme applied, body classes:", document.body.className); // 调试信息
    }

    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log("Saved dark mode preference:", savedDarkMode); // 调试信息
    
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log("System prefers dark mode:", prefersDarkMode); // 调试信息
    
    // Set initial theme (priority: saved preference > system preference)
    setTheme(savedDarkMode !== null ? savedDarkMode : prefersDarkMode);
    
    // Listen for theme toggle changes
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            console.log("Toggle changed, new value:", this.checked); // 调试信息
            setTheme(this.checked);
        });
    }

    // Listen for system theme changes
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            console.log("System theme changed:", e.matches); // 调试信息
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
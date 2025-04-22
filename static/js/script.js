document.addEventListener('DOMContentLoaded', function() {
    const papersGrid = document.getElementById('papers-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const themeToggle = document.getElementById('theme-toggle-input');
    const toggleIcon = document.querySelector('.toggle-icon');
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const themeToggleContainer = document.querySelector('.theme-toggle');
    const topicTags = document.querySelectorAll('.topic-tag');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');
    const fieldMainCheckboxes = document.querySelectorAll('.field-main-checkbox');
    const selectAllBtn = document.getElementById('select-all-btn');
    
    // 存储领域和会议数据
    let conferencesData = {};
    let selectedConferences = {};
    let fieldsSelected = {
        'CV': true,
        'AI': true,
        'ML': true,
        'Other': true
    };
    
    // 全选/全不选功能
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const isSelected = this.dataset.selected === 'true';
            const newState = !isSelected;
            
            // 更新按钮状态
            this.dataset.selected = newState.toString();
            this.textContent = newState ? 'Deselect All' : 'Select All';
            
            // 更新所有领域复选框
            fieldMainCheckboxes.forEach(checkbox => {
                checkbox.checked = newState;
                const field = checkbox.dataset.field;
                fieldsSelected[field] = newState;
                
                // 更新该领域下的所有会议复选框
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                    conferenceCheckboxes.forEach(confCheckbox => {
                        confCheckbox.checked = newState;
                        selectedConferences[confCheckbox.dataset.conference] = newState;
                    });
                }
            });
        });
    }
    
    // 领域复选框功能
    fieldMainCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            const field = this.dataset.field;
            fieldsSelected[field] = this.checked;
            
            // 更新该领域下的所有会议复选框
            const dropdownContent = document.getElementById(`dropdown-${field}`);
            if (dropdownContent) {
                const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                conferenceCheckboxes.forEach(confCheckbox => {
                    confCheckbox.checked = this.checked;
                    selectedConferences[confCheckbox.dataset.conference] = this.checked;
                });
            }
            
            // 防止事件冒泡，避免触发下拉菜单
            e.stopPropagation();
            
            // 更新全选按钮状态
            updateSelectAllButton();
        });
    });
    
    // 更新全选按钮状态
    function updateSelectAllButton() {
        if (selectAllBtn) {
            const allSelected = Object.values(fieldsSelected).every(selected => selected);
            const allDeselected = Object.values(fieldsSelected).every(selected => !selected);
            
            if (allSelected) {
                selectAllBtn.dataset.selected = 'true';
                selectAllBtn.textContent = 'Deselect All';
            } else if (allDeselected) {
                selectAllBtn.dataset.selected = 'false';
                selectAllBtn.textContent = 'Select All';
            }
        }
    }
    
    // 更新会议复选框选择事件
    function updateConferenceCheckboxEvents() {
        document.querySelectorAll('.conference-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                const conf = this.dataset.conference;
                selectedConferences[conf] = this.checked;
                
                // 防止事件冒泡
                e.stopPropagation();
            });
        });
    }
    
    console.log("Theme toggle loaded:", themeToggle); // 调试信息

    // 主题切换功能
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

    // 检查保存的主题偏好
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log("Saved dark mode preference:", savedDarkMode); // 调试信息
    
    // 检查系统是否首选暗模式
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log("System prefers dark mode:", prefersDarkMode); // 调试信息
    
    // 设置初始主题（优先级：保存的偏好 > 系统偏好）
    setTheme(savedDarkMode !== null ? savedDarkMode : prefersDarkMode);
    
    // 添加主题切换事件监听器
    if (themeToggleContainer) {
        themeToggleContainer.addEventListener('click', function(e) {
            // 防止复选框点击事件被触发两次
            if (e.target !== themeToggle) {
                console.log("Theme toggle container clicked!"); // 调试信息
                const isDarkMode = document.body.classList.contains('dark-mode');
                setTheme(!isDarkMode);
            }
        });
    }
    
    // 监听复选框更改事件
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            console.log("Toggle changed, new value:", this.checked); // 调试信息
            setTheme(this.checked);
        });
    }

    // 监听系统主题更改
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            console.log("System theme changed:", e.matches); // 调试信息
            // 仅在用户未设置首选项时应用
            if (localStorage.getItem('darkMode') === null) {
                setTheme(e.matches);
            }
        });
    } catch (e) {
        console.log('Browser does not support matchMedia listener');
    }

    // 确保开始年份不大于结束年份
    function validateYearRange() {
        const startYear = parseInt(startYearSelect.value);
        const endYear = parseInt(endYearSelect.value);
        
        if (startYear > endYear) {
            endYearSelect.value = startYearSelect.value;
        }
    }
    
    // 添加年份选择事件
    if (startYearSelect && endYearSelect) {
        startYearSelect.addEventListener('change', validateYearRange);
        endYearSelect.addEventListener('change', validateYearRange);
    }

    // 获取会议信息
    function fetchConferences() {
        fetch('/get_conferences')
            .then(response => response.json())
            .then(data => {
                conferencesData = data;
                initializeDropdowns(data.categories);
            })
            .catch(error => {
                console.error('Error fetching conferences:', error);
            });
    }
    
    // 初始化下拉菜单
    function initializeDropdowns(categories) {
        // 为每个领域设置会议选项
        const fields = ['CV', 'AI', 'ML', 'Other'];
        
        fields.forEach(field => {
            if (categories[field]) {
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const confs = categories[field];
                    
                    // 初始化所有会议为选中状态
                    Object.keys(confs).forEach(conf => {
                        if (!selectedConferences[conf]) {
                            selectedConferences[conf] = true;
                        }
                    });
                    
                    // 创建会议选项
                    Object.keys(confs).forEach(conf => {
                        const option = document.createElement('div');
                        option.className = 'conference-option';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'conference-checkbox';
                        checkbox.dataset.conference = conf;
                        checkbox.checked = true; // 默认选中
                        
                        checkbox.addEventListener('change', function(e) {
                            selectedConferences[conf] = this.checked;
                            // 防止事件冒泡
                            e.stopPropagation();
                        });
                        
                        option.appendChild(checkbox);
                        option.appendChild(document.createTextNode(conf.toUpperCase()));
                        
                        // 点击选项文本也可以切换复选框
                        option.addEventListener('click', function(e) {
                            // 避免重复触发复选框自己的点击事件
                            if (e.target !== checkbox) {
                                checkbox.checked = !checkbox.checked;
                                selectedConferences[conf] = checkbox.checked;
                                
                                // 防止事件冒泡导致下拉菜单关闭
                                e.stopPropagation();
                            }
                        });
                        
                        dropdownContent.appendChild(option);
                    });
                }
            }
        });
        
        // 调用更新会议复选框事件
        updateConferenceCheckboxEvents();
        
        // 设置下拉菜单的切换事件
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                const field = this.dataset.field;
                const dropdown = document.getElementById(`dropdown-${field}`);
                
                // 如果点击的是复选框，则不触发下拉菜单
                if (e.target.classList.contains('field-main-checkbox')) {
                    e.stopPropagation();
                    return;
                }
                
                // 关闭其他所有下拉菜单
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    if (content !== dropdown && content.classList.contains('show')) {
                        content.classList.remove('show');
                    }
                });
                
                // 切换当前下拉菜单
                dropdown.classList.toggle('show');
            });
        });
        
        // 点击页面其他地方关闭所有下拉菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.field-dropdown')) {
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    content.classList.remove('show');
                });
            }
        });
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        // Fallback method for older browsers
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                console.log('Fallback: Copying text successful');
            } catch (err) {
                console.error('Fallback: Could not copy text: ', err);
            }
            
            document.body.removeChild(textArea);
            return;
        }
        
        // Modern approach with Clipboard API
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Error copying text: ', err);
            });
    }

    // Function to handle the copy button UI feedback
    function handleCopyButtonClick(button, title) {
        // Copy the title to clipboard
        copyToClipboard(title);
        
        // Change button style to show success
        button.classList.add('copy-success');
        
        // Change button text and icon temporarily
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copy-success');
        }, 2000);
    }

    // Function to check if a paper matches all keywords
    function paperMatchesAllKeywords(paper, keywords) {
        return keywords.every(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            return paper.title.toLowerCase().includes(lowerKeyword) || 
                   paper.conference.toLowerCase().includes(lowerKeyword) ||
                   paper.year.toLowerCase().includes(lowerKeyword);
        });
    }

    // Function to display no results message
    function showNoResultsMessage() {
        if (loading) loading.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (papersGrid) papersGrid.style.display = 'none';
    }

    // Function to display papers as cards
    function displayPapers(papers) {
        if (!papersGrid) return;
        
        if (papers.length === 0) {
            showNoResultsMessage();
            return;
        }
        
        if (loading) loading.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        if (papersGrid) papersGrid.style.display = 'grid';
        
        papersGrid.innerHTML = '';
        papers.forEach(paper => {
            const card = document.createElement('div');
            card.className = 'paper-card';
            
            card.innerHTML = `
                <div class="paper-title">${paper.title}</div>
                <div class="paper-info">
                    <div class="badges-container">
                        <span class="conference-badge">${paper.conference}</span>
                        <span class="year-badge">${paper.year}</span>
                    </div>
                    <button class="copy-button" title="Copy paper title to clipboard">
                        <i class="fas fa-copy"></i> Copy Title
                    </button>
                </div>
            `;
            
            // Add copy functionality
            const copyButton = card.querySelector('.copy-button');
            const paperTitle = paper.title; // Store in a local variable for closure
            
            copyButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent any default button behavior
                e.stopPropagation(); // Prevent event bubbling
                handleCopyButtonClick(this, paperTitle);
            });
            
            papersGrid.appendChild(card);
        });
    }

    // 处理主题标签点击
    topicTags.forEach(tag => {
        tag.addEventListener('click', function() {
            topicInput.value = this.dataset.topic;
        });
    });

    // 获取所有选择的会议
    function getSelectedConferences() {
        const selected = [];
        
        // 获取所有选中的会议
        for (const conf in selectedConferences) {
            // 判断该会议是否在选中的领域中
            let isInSelectedField = false;
            const fields = ['CV', 'AI', 'ML', 'Other'];
            
            for (const field of fields) {
                // 如果该领域被选中且该会议属于该领域
                if (fieldsSelected[field] && conferencesData.categories[field] && 
                    Object.keys(conferencesData.categories[field]).includes(conf)) {
                    isInSelectedField = true;
                    break;
                }
            }
            
            // 只有领域选中且会议选中才添加
            if (isInSelectedField && selectedConferences[conf]) {
                selected.push(conf);
            }
        }
        
        return selected;
    }

    // Search functionality
    if (searchBtn && topicInput) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = topicInput.value.trim();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                
                // 获取过滤条件
                const conferences = getSelectedConferences();
                const startYear = startYearSelect ? startYearSelect.value : '2023';
                const endYear = endYearSelect ? endYearSelect.value : '2025';
                
                // Show loading status
                if (loading) loading.style.display = 'block';
                if (noResults) noResults.style.display = 'none';
                if (papersGrid) papersGrid.style.display = 'none';
                
                // Fetch papers data
                fetch('/get_papers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        topic: searchTerm,
                        conferences: conferences,
                        start_year: startYear,
                        end_year: endYear
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Data received:', data);
                    
                    // 检查是否有论文数据
                    if (data.papers && data.papers.length > 0) {
                        // 直接显示结果，后端已经基于主题筛选过了
                        displayPapers(data.papers);
                    } else {
                        showNoResultsMessage();
                    }
                })
                .catch(error => {
                    console.error('Error fetching papers:', error);
                    showNoResultsMessage();
                });
            } else {
                showNoResultsMessage();
            }
        });
        
        // Support Enter key for search
        topicInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // 初始化页面
    fetchConferences(); // 获取会议数据
    showNoResultsMessage(); // 默认显示无结果消息
}); 
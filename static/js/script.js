document.addEventListener('DOMContentLoaded', function() {
    const papersGrid = document.getElementById('papers-grid');
    const papersList = document.getElementById('papers-list-view');
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
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const batchSizeSlider = document.getElementById('batch-size');
    const batchSizeValue = document.getElementById('batch-size-value');
    const viewToggleBtn = document.getElementById('view-toggle');
    
    // 视图模式：默认为网格视图
    let currentView = 'grid';
    
    // 视图切换功能
    if (viewToggleBtn) {
        viewToggleBtn.classList.add('grid-view-active');
        
        viewToggleBtn.addEventListener('click', function() {
            if (currentView === 'grid') {
                // 切换到列表视图
                currentView = 'list';
                if (papersGrid.childNodes.length === 0) {
                    // 如果当前没有内容，不显示空表格
                    papersGrid.classList.remove('view-active');
                    papersList.classList.remove('view-active');
                    papersGrid.style.display = 'none';
                    papersList.style.display = 'none';
                    noResults.style.display = 'block';
                } else {
                    // 有内容则显示表格
                    papersGrid.classList.remove('view-active');
                    papersList.classList.add('view-active');
                    papersGrid.style.display = 'none';
                    papersList.style.display = 'table';
                    noResults.style.display = 'none';
                }
                viewToggleBtn.classList.remove('grid-view-active');
                viewToggleBtn.classList.add('list-view-active');
            } else {
                // 切换到网格视图
                currentView = 'grid';
                if (papersGrid.childNodes.length === 0) {
                    // 如果当前没有内容，继续显示提示
                    papersGrid.classList.remove('view-active');
                    papersList.classList.remove('view-active');
                    papersGrid.style.display = 'none';
                    papersList.style.display = 'none';
                    noResults.style.display = 'block';
                } else {
                    // 有内容则显示网格视图
                    papersList.classList.remove('view-active');
                    papersGrid.classList.add('view-active');
                    papersList.style.display = 'none';
                    papersGrid.style.display = 'grid';
                    noResults.style.display = 'none';
                }
                viewToggleBtn.classList.remove('list-view-active');
                viewToggleBtn.classList.add('grid-view-active');
            }
        });
    }
    
    // Update batch size value display when slider moves
    if (batchSizeSlider && batchSizeValue) {
        batchSizeSlider.addEventListener('input', function() {
            batchSizeValue.textContent = this.value;
        });
    }
    
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
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // 更新所有领域复选框
            fieldMainCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                checkbox.indeterminate = false;
                const field = checkbox.dataset.field;
                fieldsSelected[field] = isChecked;
                
                // 更新该领域下的所有会议复选框
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                    conferenceCheckboxes.forEach(confCheckbox => {
                        confCheckbox.checked = isChecked;
                        selectedConferences[confCheckbox.dataset.conference] = isChecked;
                    });
                }
            });
            
            console.log('All checkbox changed:', isChecked);
            console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
        });
    }
    
    // 领域复选框功能
    fieldMainCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            const field = this.dataset.field;
            const isChecked = this.checked;
            this.indeterminate = false; // 手动点击时清除部分选中状态
            fieldsSelected[field] = isChecked;
            
            // 更新该领域下的所有会议复选框
            const dropdownContent = document.getElementById(`dropdown-${field}`);
            if (dropdownContent) {
                const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                conferenceCheckboxes.forEach(confCheckbox => {
                    confCheckbox.checked = isChecked;
                    selectedConferences[confCheckbox.dataset.conference] = isChecked;
                });
            }
            
            // 防止事件冒泡，避免触发下拉菜单
            e.stopPropagation();
            
            // 更新所有领域状态
            updateFieldCheckboxes();
            
            console.log('Field checkbox changed:', field, isChecked);
            console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
        });
    });
    
    // 更新全选复选框状态
    function updateSelectAllCheckbox() {
        if (selectAllCheckbox) {
            const fields = ['CV', 'AI', 'ML', 'Other'];
            const fieldCheckboxes = fields.map(field => 
                document.querySelector(`.field-main-checkbox[data-field="${field}"]`)
            ).filter(checkbox => checkbox !== null);
            
            // 计算选中和部分选中的数量
            let checkedCount = 0;
            let indeterminateCount = 0;
            
            fieldCheckboxes.forEach(checkbox => {
                if (checkbox.indeterminate) {
                    indeterminateCount++;
                } else if (checkbox.checked) {
                    checkedCount++;
                }
            });
            
            // 全部选中
            if (checkedCount === fieldCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            }
            // 全部未选中，且没有部分选中
            else if (checkedCount === 0 && indeterminateCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            // 部分选中或至少有一个领域是部分选中
            else {
                selectAllCheckbox.indeterminate = true;
                selectAllCheckbox.checked = false;
            }
            
            console.log('All checkbox state updated:', { 
                checked: selectAllCheckbox.checked, 
                indeterminate: selectAllCheckbox.indeterminate,
                checkedFields: checkedCount,
                indeterminateFields: indeterminateCount,
                totalFields: fieldCheckboxes.length
            });
        }
    }
    
    // 更新会议复选框选择事件
    function updateConferenceCheckboxEvents() {
        document.querySelectorAll('.conference-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', conferenceCheckboxChangeHandler);
            checkbox.addEventListener('change', conferenceCheckboxChangeHandler);
        });
    }
    
    // 更新领域复选框状态
    function updateFieldCheckboxes() {
        const fields = ['CV', 'AI', 'ML', 'Other'];
        
        // 遍历每个领域
        fields.forEach(field => {
            const fieldCheckbox = document.querySelector(`.field-main-checkbox[data-field="${field}"]`);
            if (!fieldCheckbox) return;
            
            const dropdownContent = document.getElementById(`dropdown-${field}`);
            if (!dropdownContent) return;
            
            const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
            if (conferenceCheckboxes.length === 0) return;
            
            const checkedCount = Array.from(conferenceCheckboxes).filter(cb => cb.checked).length;
            
            // 完全选中
            if (checkedCount === conferenceCheckboxes.length) {
                fieldCheckbox.checked = true;
                fieldCheckbox.indeterminate = false;
                fieldsSelected[field] = true;
            } 
            // 完全不选中
            else if (checkedCount === 0) {
                fieldCheckbox.checked = false;
                fieldCheckbox.indeterminate = false;
                fieldsSelected[field] = false;
            } 
            // 部分选中
            else {
                fieldCheckbox.indeterminate = true;
                fieldCheckbox.checked = false;
                fieldsSelected[field] = true; // 即使部分选中，也视为选中状态
            }
        });
        
        // 更新全选框状态
        updateSelectAllCheckbox();
    }

    // 会议复选框变化处理函数
    function conferenceCheckboxChangeHandler(e) {
        const conf = this.dataset.conference;
        selectedConferences[conf] = this.checked;
        
        // 更新相应领域的选中状态
        updateFieldCheckboxes();
        
        // 防止事件冒泡
        e.stopPropagation();
        
        console.log('Conference selection updated:', conf, this.checked);
        console.log('Current selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
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
        fetch('conferences.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load conferences data');
                }
                return response.json();
            })
            .then(data => {
                conferencesData = data;
                initializeDropdowns(data.categories);
            })
            .catch(error => {
                console.error('Error fetching conferences:', error);
                // 如果加载失败，尝试使用默认会议数据
                const defaultCategories = {
                    "CV": {"cvpr": ["2023", "2024"], "eccv": ["2022", "2024"], "iccv": ["2023"]},
                    "ML": {"nips": ["2023", "2024"], "icml": ["2023", "2024"], "iclr": ["2023", "2024"]}
                };
                conferencesData = {
                    categories: defaultCategories,
                    recent_years: ["2020", "2021", "2022", "2023", "2024"]
                };
                initializeDropdowns(defaultCategories);
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
                    dropdownContent.innerHTML = ''; // 清空现有内容
                    
                    // 初始化所有会议为选中状态
                    Object.keys(confs).forEach(conf => {
                        if (selectedConferences[conf] === undefined) {
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
                        checkbox.checked = selectedConferences[conf]; // 使用储存的状态
                        
                        option.appendChild(checkbox);
                        option.appendChild(document.createTextNode(conf.toUpperCase()));
                        
                        // 点击选项文本也可以切换复选框
                        option.addEventListener('click', function(e) {
                            // 避免重复触发复选框自己的点击事件
                            if (e.target !== checkbox) {
                                checkbox.checked = !checkbox.checked;
                                selectedConferences[conf] = checkbox.checked;
                                
                                // 手动触发change事件
                                const changeEvent = new Event('change');
                                checkbox.dispatchEvent(changeEvent);
                                
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
        
        // 初始化所有复选框状态
        updateFieldCheckboxes();
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
        if (papersList) papersList.style.display = 'none';
    }

    // 初始化页面时隐藏表格视图
    if (papersList) {
        papersList.classList.remove('view-active');
    }

    // Function to display papers as cards and list
    function displayPapers(papers) {
        if (!papersGrid || !papersList) return;
        
        if (papers.length === 0) {
            showNoResultsMessage();
            return;
        }
        
        if (loading) loading.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        
        // Fix: Remove the unconditional display setting for grid view
        // if (papersGrid) papersGrid.style.display = 'grid';
        
        // Only set the appropriate view to be active based on currentView
        if (currentView === 'grid') {
            papersGrid.classList.add('view-active');
            papersList.classList.remove('view-active');
            // Explicitly set display properties
            papersGrid.style.display = 'grid';
            papersList.style.display = 'none';
        } else {
            papersList.classList.add('view-active');
            papersGrid.classList.remove('view-active');
            // Explicitly set display properties
            papersGrid.style.display = 'none';
            papersList.style.display = 'table';
        }
        
        // 获取当前年份
        const currentYear = new Date().getFullYear();
        
        // 定义会议所属领域的映射
        const conferenceFieldMap = {
            // CV领域
            'cvpr': 'cv', 'iccv': 'cv', 'eccv': 'cv', 
            // ML领域
            'icml': 'ml', 'nips': 'ml', 'iclr': 'ml', 'neurips': 'ml',
            // AI领域 
            'aaai': 'ai', 'ijcai': 'ai', 'acl': 'ai', 'naacl': 'ai', 'emnlp': 'ai',
            // 默认为Other
        };
        
        // Sort papers by title length
        papers.sort((a, b) => a.title.length - b.title.length);
        
        // 清空现有内容
        papersGrid.innerHTML = '';
        const listTbody = papersList.querySelector('tbody');
        if (listTbody) listTbody.innerHTML = '';
        
        papers.forEach(paper => {
            // 卡片视图
            const card = document.createElement('div');
            card.className = 'paper-card';
            
            // 确定会议所属领域
            const confLower = paper.conference.toLowerCase();
            const field = conferenceFieldMap[confLower] || 'other';
            const conferenceClass = `${field}-conference`;
            
            // 确定年份类别
            const paperYear = parseInt(paper.year);
            const yearDiff = currentYear - paperYear;
            let yearClass = 'current-year';
            
            if (yearDiff === 1) {
                yearClass = 'year-1';
            } else if (yearDiff === 2) {
                yearClass = 'year-2';
            } else if (yearDiff === 3) {
                yearClass = 'year-3';
            } else if (yearDiff > 3) {
                yearClass = 'year-old';
            }
            
            card.innerHTML = `
                <div class="paper-title">${paper.title}</div>
                <div class="paper-info">
                    <div class="badges-container">
                        <span class="conference-badge ${conferenceClass}">${paper.conference}</span>
                        <span class="year-badge ${yearClass}">${paper.year}</span>
                    </div>
                    <button class="copy-button" title="Copy paper title to clipboard">
                        <i class="fas fa-copy"></i> Copy
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
            
            // 列表视图
            if (listTbody) {
                const row = document.createElement('tr');
                
                // 创建会议单元格
                const confCell = document.createElement('td');
                const confBadge = document.createElement('span');
                confBadge.className = `conference-badge ${conferenceClass}`;
                confBadge.textContent = paper.conference;
                confCell.appendChild(confBadge);
                
                // 创建年份单元格
                const yearCell = document.createElement('td');
                const yearBadge = document.createElement('span');
                yearBadge.className = `year-badge ${yearClass}`;
                yearBadge.textContent = paper.year;
                yearCell.appendChild(yearBadge);
                
                // 创建标题单元格
                const titleCell = document.createElement('td');
                titleCell.className = 'list-paper-title';
                titleCell.title = paper.title;
                titleCell.textContent = paper.title;
                
                // 创建操作单元格
                const actionCell = document.createElement('td');
                const copyBtn = document.createElement('button');
                copyBtn.className = 'list-copy-button';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                copyBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyButtonClick(this, paperTitle);
                });
                actionCell.appendChild(copyBtn);
                
                // 将所有单元格添加到行
                row.appendChild(confCell);
                row.appendChild(yearCell);
                row.appendChild(titleCell);
                row.appendChild(actionCell);
                
                listTbody.appendChild(row);
            }
        });
    }

    // 处理主题标签点击
    topicTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event propagation
            
            const topic = tag.dataset.topic;
            topicInput.value = topic;
            filterPapers();
        });
        
        // Prevent touch scrolling issues on mobile
        tag.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        tag.addEventListener('touchend', (e) => {
            e.preventDefault();
            const topic = tag.dataset.topic;
            topicInput.value = topic;
            filterPapers();
        }, { passive: false });
    });

    // 获取所有选择的会议
    function getSelectedConferences() {
        const selected = [];
        
        // 检查是否有任何会议被选中，无论领域状态
        let anyConferenceSelected = false;
        for (const conf in selectedConferences) {
            if (selectedConferences[conf]) {
                anyConferenceSelected = true;
                break;
            }
        }
        
        // 如果没有任何会议被选中，返回空数组
        if (!anyConferenceSelected) {
            return [];
        }
        
        // 获取所有选中的会议，无需检查领域状态
        for (const conf in selectedConferences) {
            if (selectedConferences[conf]) {
                selected.push(conf);
            }
        }
        
        return selected;
    }

    // Search functionality
    if (searchBtn && topicInput) {
        // 全局变量存储所有论文数据
        let allPapersData = null;
        
        // 加载所有论文数据
        function loadAllPapers() {
            return fetch('papers.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load papers data');
                    }
                    return response.json();
                })
                .then(data => {
                    allPapersData = data;
                    return data;
                });
        }
        
        // 加载所有论文数据
        loadAllPapers().catch(error => {
            console.error('Error loading papers data:', error);
        });
        
        searchBtn.addEventListener('click', function() {
            const searchTerm = topicInput.value.trim();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                
                // 获取过滤条件
                const conferences = getSelectedConferences();
                console.log('Selected conferences:', conferences);
                
                const startYear = startYearSelect ? startYearSelect.value : '2023';
                const endYear = endYearSelect ? endYearSelect.value : '2025';
                
                // 如果没有选中任何会议，显示提示
                if (conferences.length === 0) {
                    showNoResultsMessage();
                    alert('Please select at least one field or conference to search.');
                    return;
                }
                
                // Show loading status
                if (loading) loading.style.display = 'block';
                if (noResults) noResults.style.display = 'none';
                if (papersGrid) papersGrid.style.display = 'none';
                
                // 检查是否已加载论文数据
                const papersPromise = allPapersData ? Promise.resolve(allPapersData) : loadAllPapers();
                
                papersPromise.then(data => {
                    // 在客户端过滤论文
                    const papers = data.papers || [];
                    
                    // 根据条件过滤论文
                    const filteredPapers = papers.filter(paper => {
                        // 检查会议
                        if (conferences.length > 0 && !conferences.includes(paper.conference)) {
                            return false;
                        }
                        
                        // 检查年份
                        const paperYear = parseInt(paper.year);
                        const startYearInt = parseInt(startYear);
                        const endYearInt = parseInt(endYear);
                        if (paperYear < startYearInt || paperYear > endYearInt) {
                            return false;
                        }
                        
                        // 检查标题
                        return paper.title.toLowerCase().includes(searchTerm.toLowerCase());
                    });
                    
                    // 随机排序并限制数量
                    const shuffledPapers = [...filteredPapers].sort(() => 0.5 - Math.random());
                    const batchSizeInput = document.getElementById('batch-size');
                    const batchSize = batchSizeInput ? parseInt(batchSizeInput.value) || 9 : 9;
                    const limitedPapers = shuffledPapers.slice(0, batchSize);
                    
                    console.log('Filtered papers:', limitedPapers.length);
                    
                    // 显示过滤后的论文
                    if (limitedPapers.length > 0) {
                        displayPapers(limitedPapers);
                    } else {
                        showNoResultsMessage();
                    }
                })
                .catch(error => {
                    console.error('Error fetching papers:', error);
                    showNoResultsMessage();
                })
                .finally(() => {
                    if (loading) loading.style.display = 'none';
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

    // Fix for references to non-existent elements
    document.querySelectorAll('.papers-table').forEach(element => {
        // This is just to ensure any potential references to papers-table don't cause errors
        // We're not using tables anymore, but this prevents errors from old code
    });

    // 获取当前年份
    const currentYear = new Date().getFullYear();

    // 更新年份下拉框选项
    function updateYearOptions() {
        // 更新结束年份选项，确保包含当前年份
        const endYearSelect = document.getElementById('end-year');
        const options = endYearSelect.options;
        
        // 检查是否需要更新选项
        let maxYear = 0;
        for (let i = 0; i < options.length; i++) {
            const yearValue = parseInt(options[i].value);
            maxYear = Math.max(maxYear, yearValue);
        }
        
        // 如果当前年份大于最大年份，添加新选项
        if (currentYear > maxYear) {
            for (let year = maxYear + 1; year <= currentYear; year++) {
                const option = document.createElement('option');
                option.value = year.toString();
                option.textContent = year.toString();
                endYearSelect.appendChild(option);
            }
        }
        
        // 默认选择当前年份作为结束年份
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === currentYear.toString()) {
                options[i].selected = true;
                break;
            }
        }
    }

    // 设置最近三年
    function setRecentThreeYears() {
        const startYearSelect = document.getElementById('start-year');
        const endYearSelect = document.getElementById('end-year');
        
        // 设置开始年份为当前年份减2
        const startYear = currentYear - 2;
        for (let i = 0; i < startYearSelect.options.length; i++) {
            if (startYearSelect.options[i].value === startYear.toString()) {
                startYearSelect.options[i].selected = true;
                break;
            }
        }
        
        // 设置结束年份为当前年份
        for (let i = 0; i < endYearSelect.options.length; i++) {
            if (endYearSelect.options[i].value === currentYear.toString()) {
                endYearSelect.options[i].selected = true;
                break;
            }
        }
        
        // 修复：确保选择框视觉上更新
        startYearSelect.dispatchEvent(new Event('change'));
        endYearSelect.dispatchEvent(new Event('change'));
        
        // 移除自动触发搜索的功能
        // if (document.getElementById('search-btn')) {
        //    document.getElementById('search-btn').click();
        // }
    }

    // 更新年份选项
    updateYearOptions();
    
    // 为"recent 3 years"按钮添加点击事件
    const recentYearsBtn = document.getElementById('recent-years-btn');
    if (recentYearsBtn) {
        recentYearsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setRecentThreeYears();
        });
    }

    // 添加移动端侧边栏切换功能
    function setupSidebarToggle() {
        // 移除侧边栏切换功能，使侧边栏始终显示
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebar) {
            // 确保侧边栏不包含折叠类
            sidebar.classList.remove('collapsed');
        }
    }

    // 添加移动端适配支持
    function handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // 可以在这里添加针对移动端的特定逻辑
        // 例如：调整卡片尺寸、简化UI等
        
        // 当在移动端时，点击侧边栏选项后滚动到卡片区域
        if(isMobile) {
            const topicTags = document.querySelectorAll('.topic-tag');
            const searchBtn = document.getElementById('search-btn');
            
            const scrollToPapers = () => {
                setTimeout(() => {
                    document.getElementById('papers-grid').scrollIntoView({ behavior: 'smooth' });
                }, 300);
            };
            
            topicTags.forEach(tag => {
                tag.addEventListener('click', scrollToPapers);
            });
            
            if(searchBtn) {
                searchBtn.addEventListener('click', scrollToPapers);
            }
        }
    }

    // 初始化时调用
    setupSidebarToggle();
    handleResponsiveLayout();

    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
        
        // 在窗口大小变化时，确保侧边栏始终可见
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
    });
}); 
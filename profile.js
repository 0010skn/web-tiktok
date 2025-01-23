document.addEventListener('DOMContentLoaded', () => {
    // 标签切换功能
    const tabs = document.querySelectorAll('.profile-tabs .tab');
    const grids = document.querySelectorAll('.works-grid');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            grids.forEach(g => g.classList.remove('active'));

            // 添加新的活动状态
            tab.classList.add('active');
            const gridId = `${tab.dataset.tab}-grid`;
            document.getElementById(gridId).classList.add('active');
        });
    });

    // 设置菜单功能
    const settingsButton = document.querySelector('.fa-ellipsis-h');
    const settingsMenu = document.querySelector('.settings-menu');
    const closeSettings = document.querySelector('.close-settings');

    settingsButton.addEventListener('click', () => {
        settingsMenu.style.display = 'block';
        setTimeout(() => {
            settingsMenu.classList.add('active');
        }, 10);
    });

    closeSettings.addEventListener('click', () => {
        settingsMenu.classList.remove('active');
        setTimeout(() => {
            settingsMenu.style.display = 'none';
        }, 300);
    });

    // 设置项点击效果
    const settingsItems = document.querySelectorAll('.settings-item');
    settingsItems.forEach(item => {
        item.addEventListener('click', () => {
            // 这里可以添加具体的设置项功能
            const settingName = item.querySelector('span').textContent;
            console.log(`Clicked setting: ${settingName}`);
        });
    });

    // 退出登录功能
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
            // 这里添加退出登录逻辑
            console.log('User logged out');
        }
    });
}); 
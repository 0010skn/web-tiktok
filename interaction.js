document.addEventListener('DOMContentLoaded', () => {
    // 视频点击展示评论
    const videoItems = document.querySelectorAll('.work-item');
    const interaction = document.querySelector('.video-interaction');
    const closeInteraction = document.querySelector('.close-interaction');

    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            interaction.style.display = 'block';
            setTimeout(() => {
                interaction.classList.add('active');
            }, 10);
        });
    });

    closeInteraction.addEventListener('click', () => {
        interaction.classList.remove('active');
        setTimeout(() => {
            interaction.style.display = 'none';
        }, 300);
    });

    // 评论点赞功能
    const likeButtons = document.querySelectorAll('.comment-like, .reply-like');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('i');
            const count = button.querySelector('span');
            if (icon.classList.contains('far')) {
                icon.classList.replace('far', 'fas');
                icon.style.color = '#ff2d55';
                count.textContent = parseInt(count.textContent) + 1;
            } else {
                icon.classList.replace('fas', 'far');
                icon.style.color = '';
                count.textContent = parseInt(count.textContent) - 1;
            }
        });
    });

    // 发送评论功能
    const commentInput = document.querySelector('.comment-input');
    const sendButton = document.querySelector('.send-comment');

    sendButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text) {
            // 这里添加发送评论的逻辑
            console.log('Sending comment:', text);
            commentInput.value = '';
        }
    });

    // 关注功能
    const followButton = document.querySelector('.follow-button');
    followButton.addEventListener('click', () => {
        const isFollowing = followButton.classList.contains('following');
        if (isFollowing) {
            followButton.classList.remove('following');
            followButton.innerHTML = '<i class="fas fa-plus"></i><span>关注</span>';
            followButton.style.background = '#ff2d55';
        } else {
            followButton.classList.add('following');
            followButton.innerHTML = '<span>已关注</span>';
            followButton.style.background = 'rgba(255, 255, 255, 0.2)';
        }
    });
}); 
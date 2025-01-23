class VideoPlayer {
    constructor() {
        this.container = document.querySelector('.video-container');
        this.template = document.querySelector('#video-template');
        this.currentVideoIndex = 0;
        this.videos = [];
        this.touchStartY = 0;
        this.currentVideo = null;
        this.isFirstLoad = true;
        this.isAnimating = false;
        
        this.init();
        this.setupInteractions();
    }

    async init() {
        // 模拟从服务器获取视频数据
        await this.fetchVideos();
        this.setupEventListeners();
        // 首次加载时不自动播放
        if (this.isFirstLoad) {
            this.loadVideo(0, true);
        }
    }

    async fetchVideos() {
        // 模拟视频数据，实际应该从服务器获取
        this.videos = [
            {
                url: 'https://vjs.zencdn.net/v/oceans.mp4',
                avatar: 'https://picsum.photos/50/50',
                title: '有趣的短视频1',
                description: '这是一个非常有趣的短视频描述...',
                likes: 1234,
                comments: 89,
                shares: 45,
                bookmarks: 67
            },
            {
                url: 'https://stream7.iqilu.com/10339/upload_transcode/202002/09/20200209105011F0zPoYzHry.mp4',
                avatar: 'https://picsum.photos/50/50',
                title: '有趣的短视频2',
                description: '这是一个非常有趣的短视频描述...',
                likes: 14,
                comments: 9,
                shares: 5,
                bookmarks: 7
            }
        ];
    }

    createVideoElement(videoData) {
        const clone = this.template.content.cloneNode(true);
        const videoItem = clone.querySelector('.video-item');
        
        // 设置视频源和属性
        const video = videoItem.querySelector('video');
        video.src = videoData.url;
        // 添加静音属性以支持自动播放
        video.muted = true;
        // 添加 playsinline 属性以支持 iOS 内联播放
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        // 设置用户头像
        const avatar = videoItem.querySelector('.user-avatar img');
        avatar.src = videoData.avatar;
        
        // 设置标题和描述
        videoItem.querySelector('.video-title-text').textContent = videoData.title;
        videoItem.querySelector('.video-description').textContent = videoData.description;
        
        // 设置计数
        const counts = videoItem.querySelectorAll('.count');
        counts[0].textContent = videoData.likes;
        counts[1].textContent = videoData.bookmarks;
        counts[2].textContent = videoData.comments;
        counts[3].textContent = videoData.shares;
        
        return videoItem;
    }

    async loadVideo(index, isFirstLoad = false) {
        const videoData = this.videos[index];
        const videoElement = this.createVideoElement(videoData);
        
        // 如果是首次加载，不需要动画
        if (!isFirstLoad) {
            videoElement.classList.add('slide-next-enter');
        }
        
        this.container.appendChild(videoElement);
        this.currentVideo = videoElement.querySelector('video');

        // 触发重排以应用初始状态
        if (!isFirstLoad) {
            videoElement.offsetHeight;
            videoElement.classList.add('slide-next-enter-active');
        }

        try {
            if (isFirstLoad) {
                this.showPlayButton(videoElement);
            } else {
                await this.currentVideo.play();
            }
        } catch (error) {
            console.log('Video play failed:', error);
            this.showPlayButton(videoElement);
        }
        
        this.setupSpeedControl(this.currentVideo);
    }

    setupSpeedControl(video) {
        let longPressTimer;
        
        video.addEventListener('touchstart', () => {
            longPressTimer = setTimeout(() => {
                video.playbackRate = 1.5;
            }, 500);
        });

        video.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
            video.playbackRate = 1.0;
        });
    }

    showPlayButton(videoElement) {
        // 创建播放按钮
        const playButton = document.createElement('div');
        playButton.className = 'play-button';
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        videoElement.appendChild(playButton);

        // 点击播放按钮时开始播放
        playButton.addEventListener('click', async () => {
            try {
                this.currentVideo.muted = false; // 取消静音
                await this.currentVideo.play();
                playButton.style.display = 'none';
                this.isFirstLoad = false;
            } catch (error) {
                console.log('Video play failed:', error);
            }
        });
    }

    async switchVideo(direction = 'next') {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const oldVideo = this.container.querySelector('.video-item');
        const newIndex = direction === 'next' ? 
            this.currentVideoIndex + 1 : 
            this.currentVideoIndex - 1;

        // 创建新视频元素
        const videoData = this.videos[newIndex];
        const newVideoElement = this.createVideoElement(videoData);

        // 设置初始位置
        newVideoElement.classList.add(`slide-${direction}-enter`);
        this.container.appendChild(newVideoElement);
        
        // 开始动画
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                // 添加过渡类
                oldVideo.classList.add(`slide-${direction}-exit`);
                newVideoElement.classList.add(`slide-${direction}-enter-active`);
                oldVideo.classList.add(`slide-${direction}-exit-active`);

                // 动画结束后清理
                const onTransitionEnd = () => {
                    oldVideo.remove();
                    newVideoElement.classList.remove(`slide-${direction}-enter`);
                    newVideoElement.classList.remove(`slide-${direction}-enter-active`);
                    this.isAnimating = false;
                    this.currentVideo = newVideoElement.querySelector('video');
                    this.currentVideo.play().catch(() => {});
                    newVideoElement.removeEventListener('transitionend', onTransitionEnd);
                    resolve();
                };

                newVideoElement.addEventListener('transitionend', onTransitionEnd);
            });
        });

        // 更新当前索引
        this.currentVideoIndex = newIndex;
    }

    setupEventListeners() {
        let touchStartY = 0;
        let touchStartTime = 0;

        this.container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            this.touchStartY = e.touches[0].clientY;
        });

        this.container.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            const diff = touchEndY - touchStartY;
            const duration = touchEndTime - touchStartTime;
            
            // 判断是否为快速滑动
            const velocity = Math.abs(diff) / duration;
            const isQuickSwipe = velocity > 0.5;
            
            // 上下滑动切换视频
            if ((Math.abs(diff) > 50 || isQuickSwipe) && !this.isAnimating) {
                if (diff < 0 && this.currentVideoIndex < this.videos.length - 1) {
                    // 向上滑动，播放下一个视频
                    this.switchVideo('next');
                } else if (diff > 0 && this.currentVideoIndex > 0) {
                    // 向下滑动，播放上一个视频
                    this.switchVideo('prev');
                }
            }
        });

        // 添加视频结束事件监听
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentVideo) {
                this.currentVideo.pause();
            } else if (!document.hidden && this.currentVideo && !this.isFirstLoad) {
                this.currentVideo.play().catch(() => {});
            }
        });
    }

    setupInteractions() {
        // 点赞功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
                const likeBtn = e.target.closest('.like-btn');
                const icon = likeBtn.querySelector('i');
                const count = likeBtn.querySelector('.count');
                
                if (icon.classList.contains('far')) {
                    icon.classList.replace('far', 'fas');
                    icon.style.color = '#ff2d55';
                    count.textContent = parseInt(count.textContent) + 1;
                } else {
                    icon.classList.replace('fas', 'far');
                    icon.style.color = '';
                    count.textContent = parseInt(count.textContent) - 1;
                }
            }
        });

        // 收藏功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) {
                const bookmarkBtn = e.target.closest('.bookmark-btn');
                const icon = bookmarkBtn.querySelector('i');
                const count = bookmarkBtn.querySelector('.count');
                
                if (icon.classList.contains('far')) {
                    icon.classList.replace('far', 'fas');
                    icon.style.color = '#ffcc00';
                    count.textContent = parseInt(count.textContent) + 1;
                } else {
                    icon.classList.replace('fas', 'far');
                    icon.style.color = '';
                    count.textContent = parseInt(count.textContent) - 1;
                }
            }
        });

        // 评论功能
        const interaction = document.querySelector('.video-interaction');
        const commentsContainer = interaction.querySelector('.comments-container');
        const commentInput = interaction.querySelector('.comment-input');
        const sendButton = interaction.querySelector('.send-comment');

        document.addEventListener('click', (e) => {
            if (e.target.closest('.comment-btn')) {
                interaction.style.display = 'block';
                setTimeout(() => {
                    interaction.classList.add('active');
                }, 10);
            }
        });

        document.querySelector('.close-interaction').addEventListener('click', () => {
            interaction.classList.remove('active');
            setTimeout(() => {
                interaction.style.display = 'none';
            }, 300);
        });

        // 发送评论
        sendButton.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (text) {
                const commentHTML = `
                    <div class="comment-item">
                        <img src="https://picsum.photos/40/40" alt="用户头像" class="comment-avatar">
                        <div class="comment-content">
                            <div class="comment-user">我</div>
                            <div class="comment-text">${text}</div>
                            <div class="comment-info">
                                <span class="comment-time">刚刚</span>
                                <span class="comment-reply">回复</span>
                            </div>
                        </div>
                        <div class="comment-like">
                            <i class="far fa-heart"></i>
                            <span>0</span>
                        </div>
                    </div>
                `;
                commentsContainer.insertAdjacentHTML('afterbegin', commentHTML);
                commentInput.value = '';

                // 更新评论数
                const commentBtn = this.currentVideo.parentElement.querySelector('.comment-btn .count');
                commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
            }
        });

        // 关注功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.follow-btn')) {
                const followBtn = e.target.closest('.follow-btn');
                if (followBtn.classList.contains('following')) {
                    followBtn.classList.remove('following');
                    followBtn.innerHTML = '<i class="fas fa-plus"></i>';
                    followBtn.style.background = '#007aff';
                } else {
                    followBtn.classList.add('following');
                    followBtn.innerHTML = '<i class="fas fa-check"></i>';
                    followBtn.style.background = '#999';
                }
            }
        });

        // 用户头像点击
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-avatar img')) {
                window.location.href = 'user-profile.html';
            }
        });

        // 在 setupInteractions 方法中添加分享功能
        const shareModal = document.querySelector('.share-modal');
        const shareOverlay = shareModal.querySelector('.share-overlay');
        const shareCancel = shareModal.querySelector('.share-cancel');
        const shareOptions = shareModal.querySelectorAll('.share-option');

        // 显示分享弹窗
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                shareModal.style.display = 'block';
                setTimeout(() => {
                    shareModal.classList.add('active');
                }, 10);
            }
        });

        // 关闭分享弹窗
        const closeShareModal = () => {
            shareModal.classList.remove('active');
            setTimeout(() => {
                shareModal.style.display = 'none';
            }, 300);
        };

        shareOverlay.addEventListener('click', closeShareModal);
        shareCancel.addEventListener('click', closeShareModal);

        // 分享选项点击处理
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const type = option.querySelector('span').textContent;
                const currentVideo = this.currentVideo;
                const videoUrl = currentVideo.src;
                const videoTitle = currentVideo.parentElement.querySelector('.video-title-text').textContent;

                switch (type) {
                    case '复制链接':
                        navigator.clipboard.writeText(videoUrl).then(() => {
                            showToast('链接已复制');
                        });
                        break;
                    case '保存本地':
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = `video-${Date.now()}.mp4`;
                        a.click();
                        showToast('正在保存视频');
                        break;
                    default:
                        showToast(`正在打开${type}...`);
                        // 这里可以添加实际的分享逻辑
                        break;
                }

                closeShareModal();
            });
        });

        // 显示提示信息
        const showToast = (message) => {
            const toast = document.createElement('div');
            toast.className = 'share-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('active');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 2000);
        };
    }
}

// 初始化视频播放器
document.addEventListener('DOMContentLoaded', () => {
    new VideoPlayer();
}); 
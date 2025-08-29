// WisdomHub Article Publishing Platform
// JavaScript functionality for hedra-new.html

class WisdomHub {
    constructor() {
        this.currentCategory = 'all';
        this.posts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
    }

    setupEventListeners() {
        // Category filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Write form submission
        document.getElementById('writeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitPost();
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('write-modal')) {
                this.closeWriteModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeWriteModal();
            }
        });
    }

    switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.filterPosts();
    }

    async loadPosts(category = 'all') {
        try {
            const url = category === 'all' ? '/api/posts' : `/api/posts?category=${category}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // التأكد من أن البيانات مصفوفة
            this.posts = Array.isArray(data) ? data : [];
            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
            this.renderPosts();
        }
    }

    filterPosts() {
        if (this.currentCategory === 'all') {
            this.renderPosts();
        } else {
            const filteredPosts = this.posts.filter(post => post.category === this.currentCategory);
            this.renderPosts(filteredPosts);
        }
    }

    renderPosts(postsToRender = null) {
        const container = document.getElementById('postsContainer');
        const posts = postsToRender || this.posts;

        if (posts.length === 0) {
            this.showEmptyState();
            return;
        }

        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        
        container.innerHTML = `
            <div class="posts-grid">
                ${postsHTML}
            </div>
        `;
    }

    createPostCard(post) {
        const excerpt = post.excerpt || post.content.substring(0, 150) + '...';
        const categoryName = this.getCategoryName(post.category);
        
        return `
            <div class="post-card" data-category="${post.category}" onclick="openArticleModal('${post.id}')" style="cursor: pointer;">
                <div class="post-category" data-category="${post.category}">${categoryName}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${excerpt}</p>
                <div class="post-meta">
                    <span class="post-author">بواسطة: ${post.author}</span>
                    <span class="post-date">${post.date}</span>
                </div>
            </div>
        `;
    }

    getCategoryName(category) {
        const categoryNames = {
            'all': 'الرئيسية',
            'news': 'أخبار',
            'articles': 'مقالات',
            'tech': 'تقنية',
            'technology': 'تقنية',
            'culture': 'ثقافة',
            'sports': 'رياضة',
            'economy': 'اقتصاد',
            'art': 'فن',
            'philosophy': 'الفلسفة',
            'psychology': 'مشاكل نفسية',
            'help': 'المساعدة',
            'rap-religion': 'الراب والدين'
        };
        return categoryNames[category] || 'مقالات';
    }

    showEmptyState() {
        const container = document.getElementById('postsContainer');
        const categoryNames = {
            'all': 'جميع المقالات',
            'news': 'الأخبار',
            'articles': 'المقالات',
            'tech': 'التقنية',
            'technology': 'التقنية',
            'culture': 'الثقافة',
            'sports': 'الرياضة',
            'economy': 'الاقتصاد',
            'art': 'الفن',
            'philosophy': 'الفلسفة',
            'psychology': 'المشاكل النفسية',
            'help': 'المساعدة',
            'rap-religion': 'الراب والدين'
        };

        const categoryName = categoryNames[this.currentCategory] || 'هذه الفئة';
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>لا توجد مقالات في ${categoryName}</h3>
                <p>كن أول من ينشر مقالاً في هذه الفئة</p>
            </div>
        `;
    }

    showLoading() {
        const container = document.getElementById('postsContainer');
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <div>جاري تحميل المقالات...</div>
            </div>
        `;
    }

    async submitPost() {
        try {
            const form = document.getElementById('writeForm');
            const formData = new FormData(form);
            
            const response = await fetch('/api/posts/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    category: formData.get('category'),
                    excerpt: formData.get('excerpt'),
                    content: formData.get('content'),
                    author: formData.get('author'),
                    password: formData.get('password')
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.showMessage(result.message || 'تم إرسال المقال بنجاح! سيتم مراجعته قبل النشر.', 'success');
                this.resetForm();
                this.closeWriteModal();
            } else {
                console.log('Server response:', result);
                this.showMessage(result.message || result.error || 'حدث خطأ أثناء إرسال المقال', 'error');
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            this.showMessage('تم إرسال المقال بنجاح! سيتم مراجعته قبل النشر', 'error');
        }
    }

    resetForm() {
        document.getElementById('writeForm').reset();
        this.hideMessages();
    }

    showSuccess(message) {
        const successEl = document.getElementById('successMessage');
        successEl.textContent = message;
        successEl.style.display = 'block';
        
        const errorEl = document.getElementById('errorMessage');
        errorEl.style.display = 'none';
    }

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        const successEl = document.getElementById('successMessage');
        successEl.style.display = 'none';
    }

    showMessage(message, type) {
        if (type === 'success') {
            this.showSuccess(message);
        } else if (type === 'error') {
            this.showError(message);
        }
    }

    hideMessages() {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Global functions for modal control
function openWriteModal() {
    const modal = document.getElementById('writeModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('postTitle').focus();
    }, 100);
}

// Admin access function with advanced security
function accessAdmin() {
    // Redirect to login page
    window.location.href = '/login.html';
}

function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form and hide messages
    if (window.wisdomHub) {
        window.wisdomHub.resetForm();
    }
}

// Article Modal Functions
let currentArticleId = null;

function openArticleModal(postId) {
    currentArticleId = postId;
    const modal = document.getElementById('articleModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Load article content
    loadArticleContent(postId);
}

function getCurrentArticleId() {
    return currentArticleId;
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function loadArticleContent(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch article');
        }
        const post = await response.json();
        
        document.getElementById('modal-category').textContent = post.category;
        document.getElementById('modal-title').textContent = post.title;
        document.getElementById('modal-author').textContent = post.author;
        document.getElementById('modal-date').textContent = new Date(post.createdAt).toLocaleDateString('ar-SA');
        document.getElementById('modal-content').innerHTML = post.content;
        
        // Load like/dislike counts
        loadLikeDislikeCounts(postId);
    } catch (error) {
            console.error('Error loading article:', error);
            document.getElementById('modal-content').innerHTML = '<p>حدث خطأ في تحميل المقال</p>';
    }
}

async function loadLikeDislikeCounts(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/interactions`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('like-count').textContent = data.interactions.likes;
            document.getElementById('dislike-count').textContent = data.interactions.dislikes;
        }
    } catch (error) {
        console.error('Error loading interactions:', error);
        document.getElementById('like-count').textContent = '0';
        document.getElementById('dislike-count').textContent = '0';
    }
}

async function likeArticle(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('like-count').textContent = data.interactions.likes;
            document.getElementById('dislike-count').textContent = data.interactions.dislikes;
            
            // Update button appearance based on like status
            const likeBtn = document.querySelector('.like-btn');
            if (data.liked) {
                likeBtn.classList.add('active');
            } else {
                likeBtn.classList.remove('active');
            }
            
            // Remove active state from dislike button
            document.querySelector('.dislike-btn').classList.remove('active');
        }
    } catch (error) {
        console.error('Error liking article:', error);
    }
}

async function dislikeArticle(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/dislike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('like-count').textContent = data.interactions.likes;
            document.getElementById('dislike-count').textContent = data.interactions.dislikes;
            
            // Update button appearance based on dislike status
            const dislikeBtn = document.querySelector('.dislike-btn');
            if (data.disliked) {
                dislikeBtn.classList.add('active');
            } else {
                dislikeBtn.classList.remove('active');
            }
            
            // Remove active state from like button
            document.querySelector('.like-btn').classList.remove('active');
        }
    } catch (error) {
        console.error('Error disliking article:', error);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wisdomHub = new WisdomHub();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WisdomHub;
}

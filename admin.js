// Admin Panel JavaScript

// Global variables
let allPosts = [];
let currentTab = 'pending';
const API_BASE = window.location.origin;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    updateStats();
    setupSecurityFeatures();
});



// Setup additional security features
function setupSecurityFeatures() {
    // Add logout functionality
    const logoutBtn = document.createElement('button');
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> تسجيل الخروج';
    logoutBtn.className = 'logout-btn';
    logoutBtn.onclick = logout;
    
    const header = document.querySelector('.admin-header');
    if (header) {
        header.appendChild(logoutBtn);
    }
    
    // Auto-logout on token expiry
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (tokenExpiry) {
        const timeLeft = parseInt(tokenExpiry) - Date.now();
        if (timeLeft > 0) {
            setTimeout(logout, timeLeft);
        }
    }
}

// Load all posts from server
async function loadPosts() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/api/posts/all`);
        if (response.ok) {
            allPosts = await response.json();
            updateStats();
            showTab(currentTab);
        } else {
            throw new Error('فشل في تحميل المقالات');
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('فشل في تحميل المقالات. يرجى المحاولة مرة أخرى.');
    } finally {
        showLoading(false);
    }
}

// Update statistics cards
function updateStats() {
    const pendingPosts = allPosts.filter(post => post.status === 'pending' || (!post.approved && !post.status));
    const approvedPosts = allPosts.filter(post => post.status === 'approved' || post.approved);
    const uniqueAuthors = [...new Set(allPosts.map(post => post.author))];
    
    document.getElementById('pendingCount').textContent = pendingPosts.length;
    document.getElementById('approvedCount').textContent = approvedPosts.length;
    document.getElementById('totalCount').textContent = allPosts.length;
    document.getElementById('authorsCount').textContent = uniqueAuthors.length;
}

// Show specific tab
function showTab(tab) {
    currentTab = tab;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active') || document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
    
    // Filter posts based on tab
    let postsToShow = [];
    
    switch(tab) {
        case 'pending':
            postsToShow = allPosts.filter(post => post.status === 'pending' || (!post.approved && !post.status));
            break;
        case 'approved':
            postsToShow = allPosts.filter(post => post.status === 'approved' || post.approved);
            break;
        case 'all':
            postsToShow = allPosts;
            break;
    }
    
    displayPosts(postsToShow);
}

// Display posts in the grid
function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (posts.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = posts.map(post => createPostCard(post)).join('');
}

// Create post card HTML
function createPostCard(post) {
    const isApproved = post.status === 'approved' || post.approved;
    const statusClass = isApproved ? 'approved' : 'pending';
    const statusText = isApproved ? 'منشور' : 'معلق';
    
    // Get category name
    const categoryNames = {
        'all': 'الرئيسية',
        'news': 'أخبار',
        'articles': 'مقالات',
        'technology': 'تقنية',
        'culture': 'ثقافة',
        'sports': 'رياضة',
        'economy': 'اقتصاد',
        'art': 'فن',
        'rap-religion': 'الراب والدين'
    };
    const categoryName = categoryNames[post.category] || 'مقالات';
    
    // Use excerpt if available, otherwise truncate content
    const displayContent = post.excerpt || post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '');
    
    return `
        <div class="admin-post-card ${statusClass}">
            <div class="post-header">
                <div>
                    <div class="post-title">${escapeHtml(post.title)}</div>
                    <div class="post-category-badge">${categoryName}</div>
                    <div class="post-status ${statusClass}">${statusText}</div>
                </div>
            </div>
            
            <div class="post-content">
                ${escapeHtml(displayContent)}
            </div>
            
            <div class="post-meta">
                <span class="post-author">بواسطة: ${escapeHtml(post.author)}</span>
                <span class="post-date">${formatDate(post.date || post.createdAt)}</span>
            </div>
            
            <div class="post-actions">
                <button class="action-btn view-btn" onclick="viewPost('${post.id}')">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
                
                ${!isApproved ? `
                    <button class="action-btn approve-btn" onclick="approvePost('${post.id}')">
                        <i class="fas fa-check"></i>
                        موافقة
                    </button>
                    <button class="action-btn reject-btn" onclick="rejectPost('${post.id}')">
                        <i class="fas fa-times"></i>
                        رفض
                    </button>
                ` : `
                    <button class="action-btn delete-btn" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                `}
            </div>
        </div>
    `;
}

// Approve post
async function approvePost(postId) {
    if (!confirm('هل أنت متأكد من الموافقة على هذا المقال؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.ok) {
            // Update local data
            const post = allPosts.find(p => p.id === postId);
            if (post) {
                post.approved = true;
                post.status = 'approved';
            }
            
            updateStats();
            showTab(currentTab);
            showSuccess('تم نشر المقال بنجاح!');
        } else {
            throw new Error('فشل في الموافقة على المقال');
        }
    } catch (error) {
        console.error('Error approving post:', error);
        showError('فشل في الموافقة على المقال. يرجى المحاولة مرة أخرى.');
    }
}

// Reject post
async function rejectPost(postId) {
    if (!confirm('هل أنت متأكد من رفض هذا المقال؟ سيتم حذفه نهائياً.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'rejected' })
        });
        
        if (response.ok) {
            // Remove from local data
            allPosts = allPosts.filter(p => p.id !== postId);
            
            updateStats();
            showTab(currentTab);
            showSuccess('تم رفض المقال.');
        } else {
            throw new Error('فشل في رفض المقال');
        }
    } catch (error) {
        console.error('Error rejecting post:', error);
        showError('فشل في رفض المقال. يرجى المحاولة مرة أخرى.');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from local data
            allPosts = allPosts.filter(p => p.id !== postId);
            
            updateStats();
            showTab(currentTab);
            showSuccess('تم حذف المقال.');
        } else {
            throw new Error('فشل في حذف المقال');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showError('فشل في حذف المقال. يرجى المحاولة مرة أخرى.');
    }
}

// View post in modal
function viewPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${escapeHtml(post.title)}</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="post-full-content">
                    ${escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>
                <div class="modal-meta">
                    <div><strong>الكاتب:</strong> ${escapeHtml(post.author)}</div>
                    <div><strong>التاريخ:</strong> ${formatDate(post.date || post.createdAt)}</div>
                    <div><strong>الحالة:</strong> ${post.approved ? 'منشور' : 'معلق'}</div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .post-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            padding: 20px;
        }
        
        .post-modal .modal-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 15px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .post-modal .modal-header {
            padding: 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .post-modal .modal-header h2 {
            color: #ff6b35;
            font-size: 24px;
            margin: 0;
        }
        
        .post-modal .close-btn {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 30px;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .post-modal .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .post-modal .modal-body {
            padding: 25px;
        }
        
        .post-modal .post-full-content {
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.8;
            margin-bottom: 25px;
            font-size: 16px;
        }
        
        .post-modal .modal-meta {
            display: grid;
            gap: 10px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .post-modal .modal-meta div {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .post-modal .modal-meta strong {
            color: #ff6b35;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.post-modal');
    if (modal) {
        modal.remove();
    }
}

// Logout function
function logout() {
    // Simple redirect to main page
    window.location.href = '/';
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (show) {
        spinner.style.display = 'flex';
        container.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        spinner.style.display = 'none';
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: #ffffff;
            font-weight: 600;
            z-index: 4000;
            animation: slideIn 0.3s ease;
        }
        
        .notification.success {
            background: #28a745;
        }
        
        .notification.error {
            background: #dc3545;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('style[data-notifications]')) {
        style.setAttribute('data-notifications', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-MA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // R to refresh
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        loadPosts();
    }
});

console.log('Admin Panel loaded successfully!');
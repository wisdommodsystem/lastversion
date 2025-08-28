// Chat Application JavaScript

class ChatApp {
    constructor() {
        this.socket = null;
        this.user = null;
        this.messages = [];
        this.onlineUsers = 0;
        this.isConnected = false;

        
        this.initializeElements();
        this.bindEvents();
        this.loadMessages();
    }

    initializeElements() {
        // Welcome screen elements
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.joinForm = document.getElementById('joinForm');
        this.nicknameInput = document.getElementById('nickname');
        
        // Chat interface elements
        this.chatInterface = document.getElementById('chatInterface');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');

        this.onlineCount = document.getElementById('onlineCount');
        this.leaveBtn = document.getElementById('leaveBtn');
        
        // Modal elements
        this.rulesModal = document.getElementById('rulesModal');
        this.rulesBtn = document.getElementById('rulesBtn');
        this.closeRulesModal = document.getElementById('closeRulesModal');
    }

    bindEvents() {
        // Join form submission
        this.joinForm.addEventListener('submit', (e) => this.handleJoin(e));
        
        // Chat form submission
        this.chatForm.addEventListener('submit', (e) => this.handleSendMessage(e));
        
        // Leave button
        this.leaveBtn.addEventListener('click', () => this.handleLeave());
        
        // Rules modal
        this.rulesBtn.addEventListener('click', () => this.showRulesModal());
        this.closeRulesModal.addEventListener('click', () => this.hideRulesModal());
        
        // Close modal when clicking outside
        this.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.rulesModal) {
                this.hideRulesModal();
            }
        });
        
        // Enter key for sending messages
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.chatForm.dispatchEvent(new Event('submit'));
            }
        });
        
        // Auto-scroll to bottom when new messages arrive
        this.chatMessages.addEventListener('DOMNodeInserted', () => {
            this.scrollToBottom();
        });
        
        // Periodic message refresh
        setInterval(() => {
            if (this.isConnected) {
                this.loadMessages();
            }
        }, 2000);
    }

    async handleJoin(e) {
        e.preventDefault();
        
        const formData = new FormData(this.joinForm);
        const nickname = formData.get('nickname').trim();
        const gender = formData.get('gender');
        
        if (!nickname || !gender) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (nickname.length < 2 || nickname.length > 20) {
            this.showNotification('يجب أن يكون اسم المستخدم بين 2 و 20 حرف', 'error');
            return;
        }
        
        // Check if nickname is already taken
        const isAvailable = await this.checkNicknameAvailability(nickname);
        if (!isAvailable) {
            this.showNotification('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر', 'error');
            return;
        }
        
        this.user = {
            nickname: nickname,
            gender: gender,
            joinTime: new Date().toISOString(),
            avatar: this.generateAvatar(nickname)
        };
        
        // Save user to localStorage
        localStorage.setItem('chatUser', JSON.stringify(this.user));
        
        // Join the chat
        await this.joinChat();
        
        // Switch to chat interface
        this.welcomeScreen.style.display = 'none';
        this.chatInterface.style.display = 'block';
        
        this.isConnected = true;
        this.messageInput.focus();
        
        // Send join message
        await this.sendSystemMessage(`${this.user.nickname} انضم إلى الدردشة`);
        
        this.showNotification('مرحباً بك في الدردشة!', 'success');
    }

    async checkNicknameAvailability(nickname) {
        try {
            const response = await fetch('/api/chat/check-nickname', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname })
            });
            
            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('Error checking nickname:', error);
            return true; // Allow if server is not available
        }
    }

    async joinChat() {
        try {
            const response = await fetch('/api/chat/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.user)
            });
            
            if (!response.ok) {
                throw new Error('Failed to join chat');
            }
            
            const data = await response.json();
            this.onlineUsers = data.onlineUsers || 1;
            this.updateOnlineCount();
        } catch (error) {
            console.error('Error joining chat:', error);
            this.onlineUsers = 1;
            this.updateOnlineCount();
        }
    }

    async handleSendMessage(e) {
        e.preventDefault();
        
        const messageText = this.messageInput.value.trim();
        if (!messageText) return;
        
        const message = {
            id: this.generateMessageId(),
            user: this.user,
            text: messageText,
            timestamp: new Date().toISOString(),
            type: 'text'
        };
        
        await this.sendMessage(message);
        this.messageInput.value = '';
    }



    async sendMessage(message) {
        try {
            // Add message to local array immediately
            this.messages.push(message);
            this.displayMessage(message);
            
            // Send to server
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('فشل في إرسال الرسالة', 'error');
        }
    }

    async sendSystemMessage(text) {
        const message = {
            id: this.generateMessageId(),
            text: text,
            timestamp: new Date().toISOString(),
            type: 'system'
        };
        
        await this.sendMessage(message);
    }

    async loadMessages() {
        try {
            const response = await fetch('/api/chat/messages');
            if (!response.ok) {
                throw new Error('Failed to load messages');
            }
            
            const data = await response.json();
            const newMessages = data.messages || [];
            
            // Check for new messages
            const lastMessageId = this.messages.length > 0 ? this.messages[this.messages.length - 1].id : null;
            const newMessagesOnly = newMessages.filter(msg => {
                return !this.messages.find(existingMsg => existingMsg.id === msg.id);
            });
            
            // Add new messages
            newMessagesOnly.forEach(message => {
                this.messages.push(message);
                this.displayMessage(message);
            });
            
            // Update online count
            if (data.onlineUsers !== undefined) {
                this.onlineUsers = data.onlineUsers;
                this.updateOnlineCount();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    displayMessage(message) {
        const messageElement = document.createElement('div');
        
        if (message.type === 'system') {
            messageElement.className = 'system-message';
            messageElement.textContent = message.text;
        } else {
            messageElement.className = 'message';
            messageElement.setAttribute('data-message-id', message.id);
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = message.user.avatar;
            
            const content = document.createElement('div');
            content.className = 'message-content';
            
            const header = document.createElement('div');
            header.className = 'message-header';
            
            const username = document.createElement('span');
            username.className = 'message-username';
            username.textContent = message.user.nickname;
            
            const gender = document.createElement('span');
            gender.className = 'message-gender';
            gender.textContent = this.getGenderIcon(message.user.gender);
            
            const time = document.createElement('span');
            time.className = 'message-time';
            time.textContent = this.formatTime(message.timestamp);
            
            // Add delete button if message belongs to current user
            if (this.user && message.user.nickname === this.user.nickname) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-message-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = 'حذف الرسالة';
                deleteBtn.addEventListener('click', () => this.deleteMessage(message.id));
                header.appendChild(deleteBtn);
            }
            
            header.appendChild(username);
            header.appendChild(gender);
            header.appendChild(time);
            
            content.appendChild(header);
            
            if (message.type === 'text') {
                const text = document.createElement('div');
                text.className = 'message-text';
                text.textContent = message.text;
                content.appendChild(text);
            }
            
            messageElement.appendChild(avatar);
            messageElement.appendChild(content);
        }
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    async handleLeave() {
        if (confirm('هل أنت متأكد من مغادرة الدردشة؟')) {
            await this.leaveChat();
            
            // Clear user data
            localStorage.removeItem('chatUser');
            this.user = null;
            this.isConnected = false;
            
            // Switch back to welcome screen
            this.chatInterface.style.display = 'none';
            this.welcomeScreen.style.display = 'block';
            
            // Clear messages
            this.chatMessages.innerHTML = '';
            this.messages = [];
            
            // Reset form
            this.joinForm.reset();
            
            this.showNotification('تم مغادرة الدردشة', 'success');
        }
    }

    async leaveChat() {
        try {
            if (this.user) {
                await this.sendSystemMessage(`${this.user.nickname} غادر الدردشة`);
                
                await fetch('/api/chat/leave', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nickname: this.user.nickname })
                });
            }
        } catch (error) {
            console.error('Error leaving chat:', error);
        }
    }

    showRulesModal() {
        this.rulesModal.style.display = 'block';
    }

    hideRulesModal() {
        this.rulesModal.style.display = 'none';
    }


        

    updateOnlineCount() {
        this.onlineCount.textContent = `${this.onlineUsers} متصل`;
    }

    async deleteMessage(messageId) {
        try {
            const response = await fetch('/api/chat/delete-message', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    messageId: messageId,
                    userNickname: this.user.nickname 
                })
            });

            if (response.ok) {
                // Remove message from UI
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
                
                // Remove from local messages array
                this.messages = this.messages.filter(msg => msg.id !== messageId);
                
                this.showNotification('تم حذف الرسالة بنجاح', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'فشل في حذف الرسالة', 'error');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showNotification('حدث خطأ أثناء حذف الرسالة', 'error');
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    generateAvatar(nickname) {
        return nickname.charAt(0).toUpperCase();
    }

    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getGenderIcon(gender) {
        switch (gender) {
            case 'male': return '♂';
            case 'female': return '♀';
            case 'other': return '⚧';
            default: return '';
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    // Auto-reconnect functionality
    startAutoReconnect() {
        setInterval(async () => {
            if (this.isConnected && this.user) {
                try {
                    const response = await fetch('/api/chat/ping', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ nickname: this.user.nickname })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Ping failed');
                    }
                } catch (error) {
                    console.error('Connection lost, attempting to reconnect...', error);
                    this.showNotification('فقدان الاتصال، جاري إعادة المحاولة...', 'warning');
                }
            }
        }, 30000); // Ping every 30 seconds
    }
}

// Initialize chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();
    
    // Start auto-reconnect
    chatApp.startAutoReconnect();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (chatApp.isConnected && chatApp.user) {
            chatApp.leaveChat();
        }
    });
    
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            // Auto-join if user was previously connected (within last hour)
            const joinTime = new Date(user.joinTime);
            const now = new Date();
            const hoursDiff = (now - joinTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 1) {
                chatApp.user = user;
                chatApp.isConnected = true;
                chatApp.welcomeScreen.style.display = 'none';
                chatApp.chatInterface.style.display = 'block';
                chatApp.loadMessages();
                chatApp.showNotification('تم استعادة جلسة الدردشة', 'success');
            } else {
                localStorage.removeItem('chatUser');
            }
        } catch (error) {
            console.error('Error restoring user session:', error);
            localStorage.removeItem('chatUser');
        }
    }
});

// Discord Popup Functionality
class DiscordPopup {
    constructor() {
        this.init();
    }

    init() {
        this.popup = document.getElementById('discordPopup');
        if (!this.popup) return;
        
        this.bindEvents();
        this.scheduleShow();
    }

    bindEvents() {
        const closeBtn = document.getElementById('closeDiscordPopup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Close on outside click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup.classList.contains('show')) {
                this.hide();
            }
        });
    }

    scheduleShow() {
        // Check if popup was dismissed today
        const today = new Date().toDateString();
        const dismissedToday = localStorage.getItem('discordPopupDismissed');
        
        if (dismissedToday !== today) {
            // Show popup after 10 seconds
            setTimeout(() => {
                this.show();
            }, 10000);
        }
    }

    show() {
        if (this.popup) {
            this.popup.classList.add('show');
        }
    }

    hide() {
        if (this.popup) {
            this.popup.classList.remove('show');
            
            // Mark as dismissed for today
            const today = new Date().toDateString();
            localStorage.setItem('discordPopupDismissed', today);
        }
    }
}

// Initialize Discord popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DiscordPopup();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatApp;
}
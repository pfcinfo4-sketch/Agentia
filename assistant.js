// assistant.js

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================== نظام الثيم ====================
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            html.classList.add('dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            html.classList.remove('dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    };
    initTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
        });
    }

    // ==================== العودة للصفحة الرئيسية ====================
    const backToHomeBtn = document.getElementById('nav-back-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'main.html#/';
        });
    }

    // ==================== إظهار/إخفاء الجهة اليسرى ====================
    const leftPanel = document.getElementById('assistantLeftPanel');
    const rightPanel = document.getElementById('rightPanel');
    const toggleBtn = document.getElementById('toggleLeftBtn');
    const toggleIcon = document.getElementById('toggleIcon');
    const messagesContainer = document.getElementById('messagesContainer');
    const body = document.body;

    // تصحيح تحديد عنصر الإدخال - نأخذ الـ div الذي يحتوي على max-w-4xl
    const inputField = document.querySelector('#inputContainer > div');
    let panelOpen = true;

    if (toggleBtn && leftPanel && rightPanel) {
        toggleBtn.addEventListener('click', () => {
            panelOpen = !panelOpen;
            if (panelOpen) {
                // إظهار اللوحة اليسرى
                leftPanel.classList.remove('left-panel-closed');
                leftPanel.style.display = 'flex';
                leftPanel.style.width = '250px';
                rightPanel.classList.remove('right-panel-full');
                
                // إزالة كلاس الإخفاء من body
                body.classList.remove('left-panel-hidden');
                
                // إعادة الهوامش الأصلية للرسائل
                if (messagesContainer) {
                    messagesContainer.style.paddingLeft = '';
                    messagesContainer.style.paddingRight = '';
                }
                
                // إعادة الهوامش الأصلية لحقل الإدخال
                if (inputField) {
                    inputField.style.marginLeft = '';
                    inputField.style.marginRight = '';
                    inputField.style.width = '';
                    inputField.style.maxWidth = '';
                }
                
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-angles-right');
                    toggleIcon.classList.add('fa-angles-left');
                }
            } else {
                // إخفاء اللوحة اليسرى
                leftPanel.classList.add('left-panel-closed');
                leftPanel.style.display = 'none';
                leftPanel.style.width = '0';
                rightPanel.classList.add('right-panel-full');
                
                // إضافة كلاس للإشارة إلى أن اللوحة اليسرى مخفية
                body.classList.add('left-panel-hidden');
                
                // CSS سيتولى الباقي تلقائياً
                if (messagesContainer) {
                    messagesContainer.style.paddingLeft = '';
                    messagesContainer.style.paddingRight = '';
                }
                
                if (inputField) {
                    inputField.style.marginLeft = '';
                    inputField.style.marginRight = '';
                    inputField.style.width = '';
                    inputField.style.maxWidth = '';
                }
                
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-angles-left');
                    toggleIcon.classList.add('fa-angles-right');
                }
            }
        });
    }

    // ==================== نظام المحادثات ====================
    
    const STORAGE_KEY = 'unimate_chat_sessions';
    const CURRENT_SESSION_KEY = 'unimate_current_session';
    const PINNED_KEY = 'pinned_sessions';
    
    let chatSessions = [];
    let pinnedSessions = [];
    let currentSessionId = null;
    let hasMessages = false;
    
    const chatArea = document.getElementById('chatMessagesArea');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const sessionsContainer = document.getElementById('chatSessionsList');
    const chatTitleSpan = document.getElementById('chatTitleSpan');
    const newChatBtn = document.getElementById('newChatBtn');
    const inputContainer = document.getElementById('inputContainer');
    const greetingContainer = document.getElementById('greetingContainer');
    
    // ===== إغلاق جميع القوائم =====
    const closeAllPopovers = () => {
        document.querySelectorAll('.session-popover').forEach(p => p.remove());
    };

    // ===== عرض إشعار =====
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    };

    // ===== حفظ المحادثات المثبتة =====
    const savePinnedSessions = () => {
        localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSessions));
    };

    // ===== تثبيت/إلغاء تثبيت محادثة =====
    const togglePinSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        
        const index = pinnedSessions.indexOf(sessionId);
        if (index === -1) {
            pinnedSessions.unshift(sessionId);
            showNotification(`"${session.title}" pinned`);
        } else {
            pinnedSessions.splice(index, 1);
            showNotification(`"${session.title}" unpinned`);
        }
        
        savePinnedSessions();
        renderSessionsList();
    };

    // ===== عرض قائمة المحادثات مع النقاط الثلاث =====
    const renderSessionsList = () => {
        if (!sessionsContainer) return;
        
        if (chatSessions.length === 0) {
            sessionsContainer.innerHTML = '<div class="text-slate-400 dark:text-slate-600 text-sm italic px-3 py-2">No chats yet</div>';
            return;
        }
        
        const pinned = chatSessions.filter(s => pinnedSessions.includes(s.id));
        const unpinned = chatSessions.filter(s => !pinnedSessions.includes(s.id));
        
        let html = '';
        
        if (pinned.length > 0) {
            html += `<div class="date-header text-amber-600 dark:text-amber-400"><i class="fa-solid fa-bookmark mr-1"></i> Pinned</div>`;
            pinned.forEach(session => {
                const isActive = session.id === currentSessionId;
                html += `
                    <div class="session-wrapper" data-session-id="${session.id}">
                        <div class="session-item ${isActive ? 'active' : ''}">
                            <span class="session-title flex items-center gap-1">
                                <i class="fa-solid fa-bookmark text-amber-500 text-[10px]"></i>
                                ${session.title}
                            </span>
                            <button class="session-menu-btn">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        if (unpinned.length > 0) {
            html += `<div class="date-header">Recent</div>`;
            unpinned.forEach(session => {
                const isActive = session.id === currentSessionId;
                html += `
                    <div class="session-wrapper" data-session-id="${session.id}">
                        <div class="session-item ${isActive ? 'active' : ''}">
                            <span class="session-title">${session.title}</span>
                            <button class="session-menu-btn">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        sessionsContainer.innerHTML = html;
        
        document.querySelectorAll('.session-wrapper').forEach(wrapper => {
            const sessionId = wrapper.dataset.sessionId;
            
            wrapper.querySelector('.session-item').addEventListener('click', (e) => {
                if (e.target.closest('.session-menu-btn')) return;
                switchToSession(sessionId);
            });
            
            const menuBtn = wrapper.querySelector('.session-menu-btn');
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllPopovers();
                
                const session = chatSessions.find(s => s.id === sessionId);
                const isPinned = pinnedSessions.includes(sessionId);
                
                const popover = document.createElement('div');
                popover.className = 'session-popover';
                popover.innerHTML = `
                    <div class="menu-item" data-action="rename"><i class="fa-regular fa-pen-to-square"></i> Rename</div>
                    <div class="menu-item" data-action="pin">
                        <i class="fa-regular fa-bookmark"></i> 
                        ${isPinned ? 'Unpin' : 'Pin'}
                    </div>
                    <div class="menu-item delete" data-action="delete"><i class="fa-regular fa-trash-can"></i> Delete</div>
                `;
                
                const rect = menuBtn.getBoundingClientRect();
                popover.style.top = `${rect.bottom + 5}px`;
                popover.style.left = `${rect.left - 130}px`;
                
                document.body.appendChild(popover);
                
                popover.querySelectorAll('.menu-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = item.dataset.action;
                        
                        if (action === 'delete') {
                            if (confirm('Are you sure you want to delete this chat?')) {
                                chatSessions = chatSessions.filter(s => s.id !== sessionId);
                                pinnedSessions = pinnedSessions.filter(id => id !== sessionId);
                                savePinnedSessions();
                                
                                if (currentSessionId === sessionId) {
                                    if (chatSessions.length > 0) {
                                        currentSessionId = chatSessions[0].id;
                                    } else {
                                        createNewSession();
                                        popover.remove();
                                        return;
                                    }
                                }
                                saveSessions();
                                renderSessionsList();
                                loadSessionMessages();
                            }
                        } else if (action === 'rename') {
                            const newTitle = prompt('Enter new name:', session.title);
                            if (newTitle && newTitle.trim()) {
                                session.title = newTitle.trim();
                                if (currentSessionId === sessionId) {
                                    chatTitleSpan.textContent = session.title;
                                }
                                saveSessions();
                                renderSessionsList();
                            }
                        } else if (action === 'pin') {
                            togglePinSession(sessionId);
                        }
                        
                        popover.remove();
                    });
                });
                
                setTimeout(() => {
                    document.addEventListener('click', function closeMenu(e) {
                        if (!popover.contains(e.target) && !menuBtn.contains(e.target)) {
                            popover.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            });
        });
    };

    const adjustInputPosition = () => {
        if (!inputContainer) return;
        if (hasMessages) {
            inputContainer.classList.remove('input-center');
            inputContainer.classList.add('input-bottom');
            body.classList.remove('has-no-messages');
        } else {
            inputContainer.classList.remove('input-bottom');
            inputContainer.classList.add('input-center');
            body.classList.add('has-no-messages');
        }
    };
    
    const loadSessions = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                chatSessions = JSON.parse(saved);
            } else {
                chatSessions = [];
            }
            
            const savedPinned = localStorage.getItem(PINNED_KEY);
            if (savedPinned) {
                pinnedSessions = JSON.parse(savedPinned);
            } else {
                pinnedSessions = [];
            }
            
            const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
            if (currentId && chatSessions.some(s => s.id === currentId)) {
                currentSessionId = currentId;
            } else if (chatSessions.length > 0) {
                currentSessionId = chatSessions[0].id;
            } else {
                createNewSession();
            }
            
            renderSessionsList();
            loadSessionMessages();
        } catch (e) {
            console.error('Error loading sessions:', e);
            chatSessions = [];
            createNewSession();
        }
    };
    
    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New conversation',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        chatSessions.unshift(newSession);
        currentSessionId = newSession.id;
        
        saveSessions();
        renderSessionsList();
        clearChatArea();
        showGreeting();
        
        if (chatTitleSpan) {
            chatTitleSpan.textContent = 'New conversation';
        }
        
        hasMessages = false;
        adjustInputPosition();
    };
    
    const saveSessions = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
        if (currentSessionId) {
            localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
        }
    };
    
    const switchToSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        
        currentSessionId = sessionId;
        saveSessions();
        renderSessionsList();
        loadSessionMessages();
        
        if (chatTitleSpan) {
            chatTitleSpan.textContent = session.title;
        }
        
        hasMessages = session.messages.length > 0;
        adjustInputPosition();
    };
    
    const loadSessionMessages = () => {
        clearChatArea();
        
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;
        
        if (session.messages.length === 0) {
            showGreeting();
            hasMessages = false;
        } else {
            if (greetingContainer) {
                greetingContainer.style.display = 'none';
            }
            
            session.messages.forEach(msg => {
                displayMessage(msg.text, msg.isUser);
            });
            hasMessages = true;
        }
        adjustInputPosition();
    };
    
    const showGreeting = () => {
        if (!messagesContainer) return;
        if (greetingContainer) {
            greetingContainer.style.display = 'flex';
        }
    };
    
    const clearChatArea = () => {
        if (!messagesContainer) return;
        const messages = messagesContainer.querySelectorAll('.message-bubble');
        messages.forEach(msg => msg.remove());
        if (greetingContainer) {
            greetingContainer.style.display = 'flex';
        }
    };
    
    const displayMessage = (text, isUser = true) => {
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message-bubble fade-in' : 'message-bubble assistant fade-in';
        messageDiv.textContent = text;
        
        if (greetingContainer && greetingContainer.style.display !== 'none') {
            messagesContainer.insertBefore(messageDiv, greetingContainer);
        } else {
            messagesContainer.appendChild(messageDiv);
        }
        
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    };
    
    const addMessageToCurrentSession = (text) => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;
        
        session.messages.push({
            text: text,
            isUser: true,
            timestamp: new Date().toISOString()
        });
        
        if (session.messages.length === 1) {
            session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            if (chatTitleSpan) {
                chatTitleSpan.textContent = session.title;
            }
        }
        
        saveSessions();
        renderSessionsList();
        
        if (greetingContainer) {
            greetingContainer.style.display = 'none';
        }
        
        displayMessage(text, true);
        
        if (!hasMessages) {
            hasMessages = true;
            adjustInputPosition();
        }
        
        setTimeout(() => {
            const reply = "I'm here to help! (Demo response)";
            session.messages.push({
                text: reply,
                isUser: false,
                timestamp: new Date().toISOString()
            });
            displayMessage(reply, false);
            saveSessions();
        }, 500);
    };
    
    const resetToNewChat = () => {
        createNewSession();
        if (chatInput) {
            chatInput.value = '';
            if (sendBtn) sendBtn.disabled = true;
        }
    };
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', resetToNewChat);
    }
    
    if (chatInput && sendBtn) {
        chatInput.addEventListener('input', () => {
            sendBtn.disabled = chatInput.value.trim() === '';
        });
        
        sendBtn.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg === '') return;
            addMessageToCurrentSession(msg);
            chatInput.value = '';
            sendBtn.disabled = true;
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendBtn.disabled) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    // ===== النافدة المنبثقة للملف الشخصي =====
    const profileBtn = document.getElementById('profileButton');
    const popover = document.getElementById('profilePopover');

    if (profileBtn && popover) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
            
            if (!popover.classList.contains('hidden')) {
                const btnRect = profileBtn.getBoundingClientRect();
                const popoverRect = popover.getBoundingClientRect();
                const leftPanelRect = leftPanel.getBoundingClientRect();
                
                if (btnRect.left + popoverRect.width > leftPanelRect.right) {
                    popover.style.left = 'auto';
                    popover.style.right = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) {
                        arrow.style.left = 'auto';
                        arrow.style.right = '20px';
                    }
                }
                
                if (btnRect.top - popoverRect.height < 0) {
                    popover.style.bottom = 'auto';
                    popover.style.top = '100%';
                    popover.style.marginTop = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) {
                        arrow.style.bottom = 'auto';
                        arrow.style.top = '-8px';
                        arrow.style.transform = 'rotate(-135deg)';
                    }
                }
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !popover.contains(e.target)) {
                popover.classList.add('hidden');
            }
        });
    }

    // ===== زر تسجيل الخروج =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'main.html#/';
        });
    }

    // ===== ضبط محاذاة الرسائل مع حقل الإدخال عند تغيير حجم النافذة =====
    const adjustMessagesAlignment = () => {
        if (!messagesContainer || !inputField) return;
        
        // التأكد من أن الرسائل وحقل الإدخال لهما نفس الهوامش
        if (panelOpen) {
            // الوضع الطبيعي - الهوامش محددة في CSS
            messagesContainer.style.paddingLeft = '';
            messagesContainer.style.paddingRight = '';
            inputField.style.marginLeft = '';
            inputField.style.marginRight = '';
        } else {
            // اللوحة اليسرى مخفية - CSS سيتولى الأمر
            messagesContainer.style.paddingLeft = '';
            messagesContainer.style.paddingRight = '';
            inputField.style.marginLeft = '';
            inputField.style.marginRight = '';
        }
    };

    // استدعاء الدالة عند تغيير حجم النافذة
    window.addEventListener('resize', adjustMessagesAlignment);

    // ===== التهيئة النهائية =====
    loadSessions();
    
    if (leftPanel) {
        leftPanel.classList.remove('left-panel-closed');
        leftPanel.style.display = 'flex';
        leftPanel.style.width = '250px';
    }
    if (rightPanel) rightPanel.classList.remove('right-panel-full');
    if (toggleIcon) {
        toggleIcon.classList.remove('fa-angles-right');
        toggleIcon.classList.add('fa-angles-left');
    }
    
    setTimeout(() => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        hasMessages = session ? session.messages.length > 0 : false;
        adjustInputPosition();
        adjustMessagesAlignment();
    }, 100);
    
    window.addEventListener('resize', () => {
        adjustInputPosition();
        adjustMessagesAlignment();
    });
});
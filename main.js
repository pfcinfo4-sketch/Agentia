// file: main.js
document.addEventListener('DOMContentLoaded', () => {
    // ==============================
    // بداية التطبيق: بعد تحميل الصفحة بالكامل
    // ==============================
    
    const viewContainer = document.getElementById('view-container');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const navLoginBtn = document.getElementById('nav-login-btn');
    const html = document.documentElement;

    // ==============================
    // القسم الأول: نظام الثيم (Dark/Light Mode)
    // ==============================
    
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

    // ==============================
    // القسم الثاني: نظام التوجيه (SPA Router)
    // ==============================
    
    const routes = {
        '#/': 'home-template',
        '#/login': 'login-template',
        '#/assistant': 'assistant-template'
    };

    const renderView = () => {
        const hash = window.location.hash || '#/';
        const templateId = routes[hash] || 'home-template';
        const template = document.getElementById(templateId);
        
        if (!template) {
            if (hash === '#/assistant') {
                window.location.href = 'assistant.html';
                return;
            }
            viewContainer.innerHTML = '<div class="p-10 text-center text-slate-500 dark:text-slate-400">Page not found</div>';
            return;
        }
        
        viewContainer.innerHTML = '';
        viewContainer.appendChild(template.content.cloneNode(true));

        if (hash === '#/login') {
            navLoginBtn.textContent = 'BACK TO HOME';
            navLoginBtn.href = '#/';
            initLoginLogic();
        } else {
            navLoginBtn.textContent = 'LOG IN';
            navLoginBtn.href = '#/login';
        }
    };

    window.addEventListener('hashchange', renderView);

    // ==============================
    // القسم الثالث: منطق صفحة تسجيل الدخول
    // ==============================
    
    const initLoginLogic = () => {
        const dobInput = document.getElementById('dob');
        if (dobInput) {
            dobInput.addEventListener('input', function(e) {
                let v = e.target.value.replace(/\D/g, '').slice(0, 8);
                if (v.length >= 5) {
                    v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                } else if (v.length >= 3) {
                    v = v.slice(0, 2) + '/' + v.slice(2);
                }
                e.target.value = v;
            });
        }

        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const emailInput = form.querySelector('input[type="email"]');
                
                if (emailInput) {
                    const email = emailInput.value;
                    alert('Logging in: ' + email);
                    
                    /* 
                    // كود التكامل مع PHP - مستقبلاً
                    fetch('login.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            dob: dobInput ? dobInput.value : ''
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Login successful!');
                            window.location.hash = '#/';
                        } else {
                            alert('Login failed: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Connection error');
                    });
                    */
                }
            });
        }
    };

    // ==============================
    // بدء تشغيل التطبيق
    // ==============================
    
    initTheme();
    renderView();
});
// Global language variable
let currentLanguage = 'ar';

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Performance optimization functions
function initializePerformanceOptimizations() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Optimize scroll events with header effects
    const optimizedScroll = debounce(() => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }, 10);
    
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    // Initialize modern visual effects
    initializeVisualEffects();
}

// Modern visual effects and animations
function initializeVisualEffects() {
    // Smooth reveal animations for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe sections for reveal animations
    const sections = document.querySelectorAll('.hero-section, .youtube-videos-section, .wisdom-team, .buttons-section');
    sections.forEach(section => {
        section.classList.add('animate-ready');
        revealObserver.observe(section);
    });
    
    // Enhanced card hover effects
    initializeCardEffects();
    
    // Smooth button interactions
    initializeButtonEffects();
    
    // Parallax effects for backgrounds
    initializeParallaxEffects();
}

// Enhanced card hover effects
function initializeCardEffects() {
    const cards = document.querySelectorAll('.video-card, .team-member, .interactive-button');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add ripple effect on click
        card.addEventListener('click', (e) => {
            createRippleEffect(e, card);
        });
    });
}

// Smooth button interactions
function initializeButtonEffects() {
    const buttons = document.querySelectorAll('button, .interactive-button, .video-card');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.target.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', (e) => {
            e.target.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    });
}

// Create ripple effect
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Subtle parallax effects
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-section, .youtube-videos-section');
    
    window.addEventListener('scroll', debounce(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, 10), { passive: true });
}

// Modern smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    // Show disclaimer modal if not accepted before
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    const disclaimerModal = document.getElementById('disclaimerModal');
    const acceptDisclaimerBtn = document.getElementById('acceptDisclaimer');
    
    if (!disclaimerAccepted && disclaimerModal) {
        disclaimerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Accept disclaimer button click handler
    if (acceptDisclaimerBtn) {
        acceptDisclaimerBtn.addEventListener('click', function() {
            localStorage.setItem('disclaimerAccepted', 'true');
            disclaimerModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Add modern smooth scrolling to all links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Modal functionality
    const aboutBtn = document.getElementById('aboutBtn');
    const privacyBtn = document.getElementById('privacyBtn');
    const aboutModal = document.getElementById('aboutModal');
    const privacyModal = document.getElementById('privacyModal');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    
    // Function to open modal
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close modal
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Function to close all modals
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            closeModal(modal);
        });
    }
    
    // About button click handler
    aboutBtn.addEventListener('click', function() {
        openModal(aboutModal);
    });
    
    // Privacy button click handler
    privacyBtn.addEventListener('click', function() {
        openModal(privacyModal);
    });
    
    // Header navigation links
    const headerAboutBtn = document.getElementById('headerAboutBtn');
    const headerPrivacyBtn = document.getElementById('headerPrivacyBtn');
    
    if (headerAboutBtn) {
        headerAboutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(aboutModal);
        });
    }
    
    if (headerPrivacyBtn) {
        headerPrivacyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(privacyModal);
        });
    }
    
    // Modal close buttons click handlers
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                closeModal(targetModal);
            }
        });
    });
    
    // Click outside modal to close
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Add loading animation to social buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add a subtle loading effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe modal content for animations
    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        observer.observe(content);
    });
    
    // Parallax effect removed - background-overlay element no longer used
    
    // Add hover effects to modal content
    modalContents.forEach(content => {
        content.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        content.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add typing effect to the main title
    const title = document.querySelector('.logo');
    if (title) {
        const originalText = title.textContent;
        title.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                title.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
    
    // Add click tracking for social media buttons (for analytics)
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.querySelector('span')?.textContent || 'Unknown';
            console.log(`Social media click: ${platform}`);
            
            // You can add analytics tracking here if needed
            // Example: gtag('event', 'click', { 'event_category': 'social', 'event_label': platform });
        });
    });
    
    // Mobile menu functionality
    function createMobileMenu() {
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            if (window.innerWidth <= 768) {
                socialLinks.classList.add('mobile-nav');
            } else {
                socialLinks.classList.remove('mobile-nav');
            }
        }
    }

    // Survey Questions Data
    const surveyQuestions = {
        ar: {
            title: "استبيان اللادينيين في المغرب",
            submitText: "إرسال",
            questions: [
                {
                    id: "belief",
                    title: "ما هو معتقدك؟",
                    type: "radio",
                    options: [
                        { value: "atheist", label: "ملحد" },
                        { value: "agnostic", label: "لا أدري" },
                        { value: "deist", label: "ربوبي" },
                        { value: "spiritual", label: "روحاني" },
                        { value: "other", label: "أخرى" }
                    ]
                },
                {
                    id: "age",
                    title: "كم عمرك؟",
                    type: "radio",
                    options: [
                        { value: "14-17", label: "14-17" },
                        { value: "18-25", label: "18-25" },
                        { value: "26-35", label: "26-35" },
                        { value: "36-45", label: "36-45" },
                        { value: "46+", label: "46+" }
                    ]
                },
                {
                    id: "location",
                    title: "أين تعيش؟",
                    type: "radio",
                    options: [
                        { value: "morocco", label: "المغرب" },
                        { value: "europe", label: "أوروبا" },
                        { value: "north-america", label: "أمريكا الشمالية" },
                        { value: "other", label: "مكان آخر" }
                    ]
                },
                {
                    id: "gender",
                    title: "ما هو جنسك؟",
                    type: "radio",
                    options: [
                        { value: "male", label: "ذكر" },
                        { value: "female", label: "أنثى" },
                        { value: "other", label: "آخر" }
                    ]
                },
                {
                    id: "education",
                    title: "ما هو مستواك التعليمي؟",
                    type: "radio",
                    options: [
                        { value: "high-school", label: "ثانوي" },
                        { value: "bachelor", label: "بكالوريوس" },
                        { value: "master", label: "ماجستير" },
                        { value: "phd", label: "دكتوراه" },
                        { value: "other", label: "آخر" }
                    ]
                },
                {
                    id: "religious-background",
                    title: "ما هي خلفيتك الدينية؟",
                    type: "radio",
                    options: [
                        { value: "sunni-islam", label: "إسلام سني" },
                        { value: "shia-islam", label: "إسلام شيعي" },
                        { value: "christianity", label: "مسيحية" },
                        { value: "judaism", label: "يهودية" },
                        { value: "other", label: "أخرى" }
                    ]
                },
                {
                    id: "religious-commitment",
                    title: "هل كنت متديناً في السابق؟",
                    type: "radio",
                    options: [
                        { value: "fully-committed", label: "نعم، كثيراً" },
                        { value: "partially-committed", label: "نعم، قليلاً" },
                        { value: "always-skeptical", label: "لا، كنت متشككاً" },
                        { value: "not-applicable", label: "لا ينطبق" }
                    ]
                },
                {
                    id: "family-support",
                    title: "هل تدعمك عائلتك؟",
                    type: "radio",
                    options: [
                        { value: "yes", label: "نعم" },
                        { value: "no", label: "لا" },
                        { value: "partially", label: "جزئياً" },
                        { value: "unknown", label: "لا أعرف" }
                    ]
                },
                {
                    id: "reason-for-leaving",
                    title: "لماذا تركت الدين؟",
                    type: "radio",
                    options: [
                        { value: "scientific-reasons", label: "أسباب علمية" },
                        { value: "moral-issues", label: "مشاكل أخلاقية" },
                        { value: "personal-experience", label: "تجربة شخصية" },
                        { value: "philosophical", label: "أسباب فلسفية" },
                        { value: "other", label: "أخرى" }
                    ]
                },
                {
                    id: "additional-thoughts",
                    title: "أي أفكار إضافية؟ (اختياري)",
                    type: "textarea",
                    placeholder: "شاركنا أفكارك..."
                }
            ]
        },
        en: {
            title: "Non-Religious Survey in Morocco",
            submitText: "Submit",
            questions: [
                {
                    id: "belief",
                    title: "What is your belief?",
                    type: "radio",
                    options: [
                        { value: "atheist", label: "Atheist" },
                        { value: "agnostic", label: "Agnostic" },
                        { value: "deist", label: "Deist" },
                        { value: "spiritual", label: "Spiritual" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "age",
                    title: "What is your age?",
                    type: "radio",
                    options: [
                        { value: "14-17", label: "14-17" },
                        { value: "18-25", label: "18-25" },
                        { value: "26-35", label: "26-35" },
                        { value: "36-45", label: "36-45" },
                        { value: "46+", label: "46+" }
                    ]
                },
                {
                    id: "location",
                    title: "Where do you live?",
                    type: "radio",
                    options: [
                        { value: "morocco", label: "Morocco" },
                        { value: "europe", label: "Europe" },
                        { value: "north-america", label: "North America" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "gender",
                    title: "What is your gender?",
                    type: "radio",
                    options: [
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "education",
                    title: "What is your education level?",
                    type: "radio",
                    options: [
                        { value: "high-school", label: "High School" },
                        { value: "bachelor", label: "Bachelor's" },
                        { value: "master", label: "Master's" },
                        { value: "phd", label: "PhD" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "religious-background",
                    title: "What is your religious background?",
                    type: "radio",
                    options: [
                        { value: "sunni-islam", label: "Sunni Islam" },
                        { value: "shia-islam", label: "Shia Islam" },
                        { value: "christianity", label: "Christianity" },
                        { value: "judaism", label: "Judaism" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "religious-commitment",
                    title: "Were you religious before?",
                    type: "radio",
                    options: [
                        { value: "fully-committed", label: "Yes, very much" },
                        { value: "partially-committed", label: "Yes, a little" },
                        { value: "always-skeptical", label: "No, I was skeptical" },
                        { value: "not-applicable", label: "Not applicable" }
                    ]
                },
                {
                    id: "family-support",
                    title: "Does your family support you?",
                    type: "radio",
                    options: [
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                        { value: "partially", label: "Partially" },
                        { value: "unknown", label: "Don't know" }
                    ]
                },
                {
                    id: "reason-for-leaving",
                    title: "Why did you leave religion?",
                    type: "radio",
                    options: [
                        { value: "scientific-reasons", label: "Scientific reasons" },
                        { value: "moral-issues", label: "Moral issues" },
                        { value: "personal-experience", label: "Personal experience" },
                        { value: "philosophical", label: "Philosophical reasons" },
                        { value: "other", label: "Other" }
                    ]
                },
                {
                    id: "additional-thoughts",
                    title: "Any additional thoughts? (Optional)",
                    type: "textarea",
                    placeholder: "Share your thoughts..."
                }
            ]
        }
    };

    // Get Started Button and Modal Functionality
    function initializeGetStarted() {
        const getStartedBtn = document.getElementById('getStartedBtn');
        const languageModal = document.getElementById('languageModal');
        const surveyModal = document.getElementById('surveyModal');
        const closeLangModal = document.getElementById('closeLangModal');
        const closeSurveyModal = document.getElementById('closeSurveyModal');
        const langButtons = document.querySelectorAll('.lang-btn');
        const surveyForm = document.getElementById('surveyForm');

        // Open survey in new page within same tab
        getStartedBtn.addEventListener('click', () => {
            // Navigate to survey page in same tab
            window.location.href = 'survey.html';
        });

        // Chat button functionality
        const chatBtn = document.getElementById('chatBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                // Open chat page in new tab
                window.open('chat.html', '_blank');
            });
        }

        // Hedra button functionality
        const hedraBtn = document.getElementById('hedraBtn');
        if (hedraBtn) {
            hedraBtn.addEventListener('click', () => {
                // Open hedra page in new tab
                window.open('/hedra', '_blank');
            });
        }

        // Close language modal
        closeLangModal.addEventListener('click', () => {
            languageModal.style.display = 'none';
        });

        // Close survey modal
        closeSurveyModal.addEventListener('click', () => {
            surveyModal.style.display = 'none';
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === languageModal) {
                languageModal.style.display = 'none';
            }
            if (e.target === surveyModal) {
                surveyModal.style.display = 'none';
            }
        });

        // Language selection
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                currentLanguage = btn.dataset.lang;
                languageModal.style.display = 'none';
                generateSurvey(currentLanguage);
                surveyModal.style.display = 'block';
            });
        });

        // Survey form submission
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSurveySubmission();
        });
    }

    let currentQuestionIndex = 0;
    let surveyAnswers = {};

    function generateSurvey(language) {
        const surveyData = surveyQuestions[language];
        const surveyTitle = document.getElementById('surveyTitle');
        const surveyQuestionsContainer = document.getElementById('surveyQuestions');
        const submitBtn = document.getElementById('submitSurvey');

        // Reset survey state
        currentQuestionIndex = 0;
        surveyAnswers = {};

        // Update title
        surveyTitle.textContent = surveyData.title;

        // Clear previous questions
        surveyQuestionsContainer.innerHTML = '';

        // Create navigation container first
        const navContainer = document.createElement('div');
        navContainer.className = 'survey-navigation';
        navContainer.innerHTML = `
            <button type="button" id="prevBtn" class="nav-btn prev-btn" style="display: none;">${language === 'ar' ? 'السابق' : 'Previous'}</button>
            <div class="question-counter">
                <span id="currentQ">1</span> / <span id="totalQ">${surveyData.questions.length}</span>
            </div>
            <button type="button" id="nextBtn" class="nav-btn next-btn" style="display: none;">${language === 'ar' ? 'التالي' : 'Next'}</button>
            <button type="submit" id="submitBtn" class="nav-btn submit-btn" style="display: none;">${surveyData.submitText}</button>
        `;

        // Add navigation to container first
        surveyQuestionsContainer.appendChild(navContainer);

        // Hide the original submit button
        submitBtn.style.display = 'none';

        // Show first question
        showQuestion(0, surveyData, language);

        // Add event listeners for navigation
        setupNavigation(surveyData, language);
    }

    function showQuestion(index, surveyData, language) {
        const surveyQuestionsContainer = document.getElementById('surveyQuestions');
        const question = surveyData.questions[index];

        // Remove previous question (keep navigation)
        const existingQuestion = surveyQuestionsContainer.querySelector('.question-group');
        if (existingQuestion) {
            existingQuestion.remove();
        }

        // Create question element
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-group';

        const questionTitle = document.createElement('div');
        questionTitle.className = 'question-title';
        questionTitle.textContent = question.title;
        questionDiv.appendChild(questionTitle);

        if (question.type === 'radio') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'question-options';

            question.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option-item';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = question.id;
                radio.value = option.value;
                radio.id = `${question.id}_${option.value}`;

                // Restore previous answer if exists
                if (surveyAnswers[question.id] === option.value) {
                    radio.checked = true;
                }

                const label = document.createElement('label');
                label.htmlFor = radio.id;
                label.textContent = option.label;

                optionDiv.appendChild(radio);
                optionDiv.appendChild(label);

                if (option.hasInput) {
                    const textInput = document.createElement('input');
                    textInput.type = 'text';
                    textInput.className = 'text-input';
                    textInput.name = `${question.id}_other_text`;
                    textInput.placeholder = language === 'ar' ? 'حدد...' : 'Specify...';
                    textInput.style.display = radio.checked ? 'block' : 'none';
                    
                    // Restore previous text if exists
                    if (surveyAnswers[`${question.id}_other_text`]) {
                        textInput.value = surveyAnswers[`${question.id}_other_text`];
                    }

                    radio.addEventListener('change', () => {
                        if (radio.checked) {
                            textInput.style.display = 'block';
                            updateNavigationState();
                        }
                    });

                    // Hide text input when other options are selected
                    const otherRadios = optionsDiv.querySelectorAll(`input[name="${question.id}"]`);
                    otherRadios.forEach(otherRadio => {
                        if (otherRadio !== radio) {
                            otherRadio.addEventListener('change', () => {
                                if (otherRadio.checked) {
                                    textInput.style.display = 'none';
                                    updateNavigationState();
                                }
                            });
                        }
                    });

                    optionDiv.appendChild(textInput);
                }

                // Add change listener to update navigation
                radio.addEventListener('change', updateNavigationState);
                optionsDiv.appendChild(optionDiv);
            });

            questionDiv.appendChild(optionsDiv);
        } else if (question.type === 'text') {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'text-input';
            textInput.name = question.id;
            textInput.placeholder = question.placeholder;
            
            // Restore previous answer if exists
            if (surveyAnswers[question.id]) {
                textInput.value = surveyAnswers[question.id];
            }
            
            textInput.addEventListener('input', updateNavigationState);
            questionDiv.appendChild(textInput);
        } else if (question.type === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.className = 'text-input textarea-input';
            textarea.name = question.id;
            textarea.placeholder = question.placeholder;
            
            // Restore previous answer if exists
            if (surveyAnswers[question.id]) {
                textarea.value = surveyAnswers[question.id];
            }
            
            textarea.addEventListener('input', updateNavigationState);
            questionDiv.appendChild(textarea);
        }

        // Insert question before navigation
        const navContainer = surveyQuestionsContainer.querySelector('.survey-navigation');
        surveyQuestionsContainer.insertBefore(questionDiv, navContainer);

        // Update question counter
        document.getElementById('currentQ').textContent = index + 1;
        
        // Update navigation state
        updateNavigationState();
    }

    function setupNavigation(surveyData, language) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                saveCurrentAnswer();
                currentQuestionIndex--;
                showQuestion(currentQuestionIndex, surveyData, language);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex < surveyData.questions.length - 1) {
                saveCurrentAnswer();
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex, surveyData, language);
            }
        });

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveCurrentAnswer();
            handleSurveySubmission();
        });
    }

    function saveCurrentAnswer() {
        const currentQuestion = document.querySelector('.question-group');
        if (!currentQuestion) return;

        const inputs = currentQuestion.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio' && input.checked) {
                surveyAnswers[input.name] = input.value;
                console.log('Saved radio answer:', input.name, '=', input.value);
            } else if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                if (input.value.trim()) {
                    surveyAnswers[input.name] = input.value.trim();
                    console.log('Saved text answer:', input.name, '=', input.value.trim());
                }
            }
        });
        console.log('Current surveyAnswers:', surveyAnswers);
    }

    function updateNavigationState() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const totalQuestions = parseInt(document.getElementById('totalQ').textContent);

        // Show/hide previous button
        prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';

        // Check if current question is answered
        const isAnswered = isCurrentQuestionAnswered();

        if (currentQuestionIndex === totalQuestions - 1) {
            // Last question - show submit button
            nextBtn.style.display = 'none';
            submitBtn.style.display = isAnswered ? 'inline-block' : 'none';
        } else {
            // Not last question - show next button
            nextBtn.style.display = isAnswered ? 'inline-block' : 'none';
            submitBtn.style.display = 'none';
        }
    }

    function isCurrentQuestionAnswered() {
        const currentQuestion = document.querySelector('.question-group');
        if (!currentQuestion) return false;

        const radioInputs = currentQuestion.querySelectorAll('input[type="radio"]');
        const textInputs = currentQuestion.querySelectorAll('input[type="text"], textarea');

        // For radio questions
        if (radioInputs.length > 0) {
            const isRadioChecked = Array.from(radioInputs).some(radio => radio.checked);
            if (!isRadioChecked) return false;

            // Check if "other" option is selected and requires text input
            const checkedRadio = Array.from(radioInputs).find(radio => radio.checked);
            if (checkedRadio && checkedRadio.value === 'other') {
                const otherTextInput = currentQuestion.querySelector(`input[name="${checkedRadio.name}_other_text"]`);
                if (otherTextInput && !otherTextInput.value.trim()) {
                    return false;
                }
            }
            return true;
        }

        // For text/textarea questions (optional questions don't require answers)
        if (textInputs.length > 0) {
            const questionTitle = currentQuestion.querySelector('.question-title').textContent;
            const isOptional = questionTitle.includes('اختياري') || questionTitle.includes('Optional');
            
            if (isOptional) {
                return true; // Optional questions are always considered "answered"
            }
            
            return Array.from(textInputs).some(input => input.value.trim());
        }

        return false;
    }

    // Advanced Global Counter System
    class AdvancedCounter {
        constructor() {
            this.currentValue = 0;
            this.lastUpdate = 0;
            this.retryCount = 0;
            this.maxRetries = 3;
            this.retryDelay = 1000;
            this.updateInterval = null;
            this.isOnline = navigator.onLine;
            this.failedAttempts = 0;
            this.maxFailedAttempts = 5;
            this.backoffMultiplier = 1.5;
            this.element = null;
            this.statusIndicator = null;
            
            this.init();
        }
        
        init() {
            this.element = document.getElementById('globalCounter');
            this.createStatusIndicator();
            this.setupEventListeners();
            this.startPeriodicUpdates();
            this.loadCounter();
        }
        
        createStatusIndicator() {
            if (!this.element) return;
            
            const container = this.element.closest('.counter-container');
            if (!container) return;
            
            // Create status indicator if it doesn't exist
            this.statusIndicator = container.querySelector('.counter-status') || document.createElement('div');
            this.statusIndicator.className = 'counter-status';
            this.statusIndicator.style.cssText = `
                font-size: 10px;
                color: #888;
                margin-top: 5px;
                text-align: center;
                opacity: 0.8;
                transition: all 0.3s ease;
            `;
            
            if (!container.querySelector('.counter-status')) {
                container.appendChild(this.statusIndicator);
            }
        }
        
        setupEventListeners() {
            // Online/offline detection
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.updateStatus('🟢 Online', '#4fc3f7');
                this.resetFailureCount();
                this.loadCounter();
            });
            
            window.addEventListener('offline', () => {
                this.isOnline = false;
                this.updateStatus('🔴 Offline', '#ff6b6b');
            });
            
            // Page visibility change
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isOnline) {
                    this.loadCounter();
                }
            });
        }
        
        updateStatus(message, color = '#ffffff') {
             if (this.statusIndicator) {
                 this.statusIndicator.textContent = message;
                 this.statusIndicator.style.color = color;
                 this.statusIndicator.classList.add('highlight');
                 setTimeout(() => {
                     this.statusIndicator.classList.remove('highlight');
                 }, 2000);
             }
         }
         
         addVisualStatusIndicator() {
             if (!this.element) return;
             
             // Remove existing status indicator
             const existingStatus = this.element.querySelector('.counter-status');
             if (existingStatus) {
                 existingStatus.remove();
             }
             
             // Create new status indicator
             const statusDot = document.createElement('div');
             statusDot.className = 'counter-status';
             this.element.appendChild(statusDot);
             this.statusDot = statusDot;
         }
         
         updateVisualStatus(status) {
             if (!this.statusDot) return;
             
             // Remove all status classes
             this.statusDot.classList.remove('loading', 'error', 'offline');
             
             // Add appropriate status class
             if (status !== 'online') {
                 this.statusDot.classList.add(status);
             }
         }
        
        async loadCounter(forceUpdate = false) {
            if (!this.isOnline) {
                this.updateStatus('🔴 Offline - Using cached data', '#ff6b6b');
                this.updateVisualStatus('offline');
                return;
            }
            
            if (this.failedAttempts >= this.maxFailedAttempts) {
                this.updateStatus('⚠️ Service temporarily unavailable', '#ffa726');
                this.updateVisualStatus('error');
                return;
            }
            
            try {
                // Add loading visual feedback
                this.updateStatus('🔄 Updating...', '#4fc3f7');
                this.updateVisualStatus('loading');
                
                // Add loading animation to counter number
                if (this.element) {
                    const numberElement = this.element.querySelector('.counter-number');
                    if (numberElement) {
                        numberElement.classList.add('updating');
                    }
                }
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch('/api/counter', {
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': forceUpdate ? 'no-cache' : 'max-age=5'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    if (response.status === 429) {
                        const data = await response.json();
                        this.updateStatus(`⏳ Rate limited - retry in ${data.retryAfter}s`, '#ffa726');
                        this.updateVisualStatus('loading');
                        setTimeout(() => this.loadCounter(), data.retryAfter * 1000);
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Remove loading animation
                if (this.element) {
                    const numberElement = this.element.querySelector('.counter-number');
                    if (numberElement) {
                        numberElement.classList.remove('updating');
                    }
                }
                
                if (data.success) {
                    this.handleSuccessfulUpdate(data);
                    this.updateVisualStatus('online');
                    this.resetFailureCount();
                } else {
                    throw new Error(data.message || 'Unknown server error');
                }
                
            } catch (error) {
                // Remove loading animation on error
                if (this.element) {
                    const numberElement = this.element.querySelector('.counter-number');
                    if (numberElement) {
                        numberElement.classList.remove('updating');
                        numberElement.classList.add('error');
                        setTimeout(() => {
                            numberElement.classList.remove('error');
                        }, 500);
                    }
                }
                
                this.handleError(error);
                this.updateVisualStatus('error');
            }
        }
        
        handleSuccessfulUpdate(data) {
            // Validate the received data
            const validation = this.validateCounterData(data);
            
            if (!validation.isValid) {
                console.error('Counter data validation failed:', validation.errors);
                throw new Error('Invalid counter data: ' + validation.errors.join(', '));
            }
            
            // Log warnings if any
            if (validation.warnings.length > 0) {
                console.warn('Counter data warnings:', validation.warnings);
            }
            
            const newValue = data.counter;
            const wasUpdated = newValue !== this.currentValue;
            
            this.currentValue = newValue;
            this.lastUpdate = Date.now();
            
            // Update display with animation
            this.animateCounterUpdate(newValue, wasUpdated);
            
            // Update status
            let statusMessage = '🟢 Live';
            if (data.cached) {
                statusMessage += ` (cached ${data.cacheAge || 0}s ago)`;
            }
            if (data.warning) {
                statusMessage = `⚠️ ${data.warning}`;
            }
            
            this.updateStatus(statusMessage, data.warning ? '#ffa726' : '#4fc3f7');
            
            // Store in localStorage for offline use
            localStorage.setItem('counterCache', JSON.stringify({
                value: newValue,
                timestamp: this.lastUpdate
            }));
        }
        
        animateCounterUpdate(newValue, wasUpdated) {
            if (!this.element) return;
            
            if (wasUpdated) {
                // Animate value change
                this.element.style.transform = 'scale(1.1)';
                this.element.style.color = '#ffffff';
                
                setTimeout(() => {
                    this.element.textContent = newValue.toLocaleString();
                    
                    setTimeout(() => {
                        this.element.style.transform = 'scale(1)';
                        this.element.style.color = '#e5e5e5';
                    }, 200);
                }, 100);
            } else {
                // Just update the value without animation
                this.element.textContent = newValue.toLocaleString();
            }
        }
        
        handleError(error) {
            console.error('Counter update failed:', error);
            this.failedAttempts++;
            
            if (error.name === 'AbortError') {
                this.updateStatus('⏱️ Request timeout', '#ffa726');
            } else if (!this.isOnline) {
                this.updateStatus('🔴 Connection lost', '#ff6b6b');
            } else {
                this.updateStatus(`❌ Error (${this.failedAttempts}/${this.maxFailedAttempts})`, '#ff6b6b');
            }
            
            // Try to load from cache
            this.loadFromCache();
            
            // Schedule retry with exponential backoff
            if (this.failedAttempts < this.maxFailedAttempts) {
                const delay = this.retryDelay * Math.pow(this.backoffMultiplier, this.failedAttempts - 1);
                setTimeout(() => this.loadCounter(), delay);
            }
        }
        
        loadFromCache() {
            try {
                const cached = localStorage.getItem('counterCache');
                if (cached) {
                    const { value, timestamp } = JSON.parse(cached);
                    const age = Math.floor((Date.now() - timestamp) / 1000);
                    
                    if (this.element && (!this.currentValue || this.currentValue === 0)) {
                        this.element.textContent = value.toLocaleString();
                        this.currentValue = value;
                    }
                    
                    this.updateStatus(`💾 Cached data (${age}s old)`, '#9e9e9e');
                }
            } catch (error) {
                console.warn('Failed to load from cache:', error);
            }
        }
        
        resetFailureCount() {
            this.failedAttempts = 0;
        }
        
        startPeriodicUpdates() {
            // Clear existing interval
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            
            // Update every 15 seconds (more frequent than before)
            this.updateInterval = setInterval(() => {
                if (this.isOnline && !document.hidden) {
                    this.loadCounter();
                }
            }, 15000);
        }
        
        forceUpdate() {
            this.resetFailureCount();
            this.loadCounter(true);
        }
        
        destroy() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        }
    }
    
    // Initialize advanced counter
    let globalCounter = null;
    
    // Load and display global counter (legacy function for compatibility)
    async function loadGlobalCounter() {
        if (globalCounter) {
            globalCounter.loadCounter();
        }
    }
    
    // Update global counter after successful submission
    function updateGlobalCounter() {
        if (globalCounter) {
            globalCounter.forceUpdate();
        }
    }
    
    // Counter Analytics System
     class CounterAnalytics {
         constructor() {
             this.sessionData = {
                 startTime: Date.now(),
                 updates: [],
                 errors: [],
                 cacheHits: 0,
                 networkRequests: 0
             };
             this.historicalData = this.loadHistoricalData();
         }
         
         loadHistoricalData() {
             try {
                 const stored = localStorage.getItem('counterAnalytics');
                 return stored ? JSON.parse(stored) : {
                     dailyStats: {},
                     totalUpdates: 0,
                     totalErrors: 0,
                     averageResponseTime: 0,
                     peakValues: []
                 };
             } catch (error) {
                 console.warn('Failed to load analytics data:', error);
                 return { dailyStats: {}, totalUpdates: 0, totalErrors: 0, averageResponseTime: 0, peakValues: [] };
             }
         }
         
         recordUpdate(value, responseTime, cached = false) {
             const now = Date.now();
             const today = new Date().toDateString();
             
             // Session data
             this.sessionData.updates.push({ value, timestamp: now, responseTime, cached });
             if (cached) {
                 this.sessionData.cacheHits++;
             } else {
                 this.sessionData.networkRequests++;
             }
             
             // Historical data
             if (!this.historicalData.dailyStats[today]) {
                 this.historicalData.dailyStats[today] = {
                     updates: 0,
                     errors: 0,
                     maxValue: 0,
                     minValue: Infinity,
                     totalResponseTime: 0
                 };
             }
             
             const dayStats = this.historicalData.dailyStats[today];
             dayStats.updates++;
             dayStats.maxValue = Math.max(dayStats.maxValue, value);
             dayStats.minValue = Math.min(dayStats.minValue, value);
             dayStats.totalResponseTime += responseTime;
             
             this.historicalData.totalUpdates++;
             
             // Track peak values
             if (this.historicalData.peakValues.length === 0 || value > Math.max(...this.historicalData.peakValues)) {
                 this.historicalData.peakValues.push(value);
                 if (this.historicalData.peakValues.length > 10) {
                     this.historicalData.peakValues.shift();
                 }
             }
             
             this.saveHistoricalData();
         }
         
         recordError(error, responseTime = 0) {
             const now = Date.now();
             const today = new Date().toDateString();
             
             // Session data
             this.sessionData.errors.push({ error: error.message, timestamp: now, responseTime });
             
             // Historical data
             if (!this.historicalData.dailyStats[today]) {
                 this.historicalData.dailyStats[today] = {
                     updates: 0,
                     errors: 0,
                     maxValue: 0,
                     minValue: Infinity,
                     totalResponseTime: 0
                 };
             }
             
             this.historicalData.dailyStats[today].errors++;
             this.historicalData.totalErrors++;
             
             this.saveHistoricalData();
         }
         
         saveHistoricalData() {
             try {
                 // Keep only last 30 days of data
                 const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString();
                 const filteredStats = {};
                 
                 Object.keys(this.historicalData.dailyStats).forEach(date => {
                     if (new Date(date) >= new Date(thirtyDaysAgo)) {
                         filteredStats[date] = this.historicalData.dailyStats[date];
                     }
                 });
                 
                 this.historicalData.dailyStats = filteredStats;
                 localStorage.setItem('counterAnalytics', JSON.stringify(this.historicalData));
             } catch (error) {
                 console.warn('Failed to save analytics data:', error);
             }
         }
         
         getSessionStats() {
             const sessionDuration = Date.now() - this.sessionData.startTime;
             const successRate = this.sessionData.updates.length / (this.sessionData.updates.length + this.sessionData.errors.length) * 100;
             const cacheHitRate = this.sessionData.cacheHits / (this.sessionData.cacheHits + this.sessionData.networkRequests) * 100;
             
             return {
                 duration: sessionDuration,
                 updates: this.sessionData.updates.length,
                 errors: this.sessionData.errors.length,
                 successRate: isNaN(successRate) ? 100 : successRate,
                 cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
                 networkRequests: this.sessionData.networkRequests
             };
         }
         
         getHistoricalStats() {
             const days = Object.keys(this.historicalData.dailyStats);
             const recentDays = days.slice(-7); // Last 7 days
             
             let totalUpdates = 0;
             let totalErrors = 0;
             let totalResponseTime = 0;
             
             recentDays.forEach(day => {
                 const stats = this.historicalData.dailyStats[day];
                 totalUpdates += stats.updates;
                 totalErrors += stats.errors;
                 totalResponseTime += stats.totalResponseTime;
             });
             
             return {
                 recentDays: recentDays.length,
                 averageUpdatesPerDay: totalUpdates / Math.max(recentDays.length, 1),
                 averageErrorsPerDay: totalErrors / Math.max(recentDays.length, 1),
                 averageResponseTime: totalResponseTime / Math.max(totalUpdates, 1),
                 peakValue: Math.max(...this.historicalData.peakValues, 0),
                 totalLifetimeUpdates: this.historicalData.totalUpdates,
                 totalLifetimeErrors: this.historicalData.totalErrors
             };
         }
     }
     
     // Enhanced Advanced Counter with Analytics
     class EnhancedAdvancedCounter extends AdvancedCounter {
         constructor() {
             super();
             this.analytics = new CounterAnalytics();
         }
         
         async loadCounter(forceUpdate = false) {
             const startTime = Date.now();
             
             try {
                 await super.loadCounter(forceUpdate);
             } catch (error) {
                 const responseTime = Date.now() - startTime;
                 this.analytics.recordError(error, responseTime);
                 throw error;
             }
         }
         
         handleSuccessfulUpdate(data) {
             super.handleSuccessfulUpdate(data);
             
             // Add visual feedback
             if (this.element) {
                 const numberElement = this.element.querySelector('.counter-number');
                 if (numberElement) {
                     numberElement.classList.add('success');
                     setTimeout(() => {
                         numberElement.classList.remove('success');
                     }, 800);
                 }
             }
             
             // Record analytics
             const responseTime = Date.now() - (this.requestStartTime || Date.now());
             this.analytics.recordUpdate(data.counter, responseTime, data.cached);
         }
         
         async loadCounterWithAnalytics(forceUpdate = false) {
             this.requestStartTime = Date.now();
             return this.loadCounter(forceUpdate);
         }
         
         getAnalytics() {
             return {
                 session: this.analytics.getSessionStats(),
                 historical: this.analytics.getHistoricalStats()
             };
         }
         
         // Data validation methods
         validateCounterData(data) {
             const validation = {
                 isValid: true,
                 errors: [],
                 warnings: []
             };
             
             // Check if data exists
             if (!data) {
                 validation.isValid = false;
                 validation.errors.push('No data received');
                 return validation;
             }
             
             // Validate counter value
             if (typeof data.counter !== 'number') {
                 validation.isValid = false;
                 validation.errors.push('Counter value is not a number');
             } else if (data.counter < 0) {
                 validation.isValid = false;
                 validation.errors.push('Counter value cannot be negative');
             } else if (!Number.isInteger(data.counter)) {
                 validation.warnings.push('Counter value is not an integer');
             }
             
             // Validate against previous value (detect suspicious jumps)
             if (this.currentValue !== null && typeof data.counter === 'number') {
                 const difference = Math.abs(data.counter - this.currentValue);
                 const percentageChange = (difference / Math.max(this.currentValue, 1)) * 100;
                 
                 // Flag large jumps (more than 50% change or more than 1000 difference)
                 if (percentageChange > 50 && difference > 10) {
                     validation.warnings.push(`Large counter jump detected: ${this.currentValue} → ${data.counter}`);
                 }
                 
                 if (difference > 1000) {
                     validation.warnings.push(`Unusually large counter change: +${difference}`);
                 }
             }
             
             // Validate timestamp if present
             if (data.timestamp) {
                 const now = Date.now();
                 const dataTime = new Date(data.timestamp).getTime();
                 const timeDiff = Math.abs(now - dataTime);
                 
                 // Flag data older than 5 minutes
                 if (timeDiff > 5 * 60 * 1000) {
                     validation.warnings.push(`Data is ${Math.round(timeDiff / 60000)} minutes old`);
                 }
             }
             
             return validation;
         }
         
         checkDataIntegrity() {
             const integrity = {
                 cacheConsistency: true,
                 updateFrequency: 'normal',
                 dataQuality: 'good',
                 issues: []
             };
             
             // Check cache consistency
             const cachedData = localStorage.getItem('counterCache');
             if (cachedData) {
                 try {
                     const parsed = JSON.parse(cachedData);
                     if (parsed.value !== this.currentValue) {
                         integrity.cacheConsistency = false;
                         integrity.issues.push('Cache value mismatch');
                     }
                 } catch (error) {
                     integrity.issues.push('Cache data corrupted');
                 }
             }
             
             // Check update frequency
             if (this.lastUpdate) {
                 const timeSinceUpdate = Date.now() - this.lastUpdate;
                 if (timeSinceUpdate > 2 * 60 * 1000) { // More than 2 minutes
                     integrity.updateFrequency = 'slow';
                     integrity.issues.push('Updates are infrequent');
                 }
             }
             
             // Check error rate
             const sessionStats = this.analytics.getSessionStats();
             if (sessionStats.errors > 0) {
                 const errorRate = (sessionStats.errors / (sessionStats.updates + sessionStats.errors)) * 100;
                 if (errorRate > 20) {
                     integrity.dataQuality = 'poor';
                     integrity.issues.push(`High error rate: ${Math.round(errorRate)}%`);
                 } else if (errorRate > 10) {
                     integrity.dataQuality = 'fair';
                     integrity.issues.push(`Moderate error rate: ${Math.round(errorRate)}%`);
                 }
             }
             
             return integrity;
         }
         
         // Add analytics display method
         showAnalytics() {
             const analytics = this.getAnalytics();
             const integrity = this.checkDataIntegrity();
             
             console.group('🔢 Counter Analytics');
             console.log('Session Stats:', analytics.session);
             console.log('Historical Stats:', analytics.historical);
             console.log('Data Integrity:', integrity);
             console.groupEnd();
             
             // Update status with analytics info
             if (this.statusIndicator) {
                 const stats = analytics.session;
                 const successRate = Math.round(stats.successRate);
                 const cacheRate = Math.round(stats.cacheHitRate);
                 const integrityStatus = integrity.issues.length === 0 ? '✅' : '⚠️';
                 this.updateStatus(`📊 ${stats.updates} updates, ${successRate}% success, ${cacheRate}% cached ${integrityStatus}`, '#4fc3f7');
             }
         }
     }
     
     // Initialize counter when DOM is ready
     function initializeAdvancedCounter() {
         globalCounter = new EnhancedAdvancedCounter();
         
         // Add visual status indicator
         globalCounter.addVisualStatusIndicator();
         
         // Add analytics display on double-click (for debugging)
         if (globalCounter.element) {
             globalCounter.element.addEventListener('dblclick', () => {
                 globalCounter.showAnalytics();
             });
         }
     }

    async function handleSurveySubmission() {
        // Survey can be completed multiple times now
        
        // Use saved answers instead of form data
        console.log('Survey Data:', surveyAnswers);
        
        // Check if there are any answers
        if (Object.keys(surveyAnswers).length === 0) {
            const warningTitle = currentLanguage === 'ar' ? 'إجابات مفقودة' : 'Missing Answers';
            const warningMessage = currentLanguage === 'ar'
                ? 'يرجى الإجابة على الأسئلة قبل الإرسال'
                : 'Please answer the questions before submitting';
            notificationSystem.warning(warningTitle, warningMessage, 5000);
            return;
        }
        
        // Show loading message
        const loadingMessage = currentLanguage === 'ar' 
            ? 'جاري الإرسال...' 
            : 'Submitting...';
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
            font-weight: bold;
        `;
        loadingOverlay.textContent = loadingMessage;
        document.body.appendChild(loadingOverlay);
        
        try {
            // Prepare data for submission
            const submissionData = {
                language: currentLanguage,
                answers: surveyAnswers
            };
            
            // Add logging for debugging
            console.log('Submitting survey data:', submissionData);
            console.log('surveyAnswers keys:', Object.keys(surveyAnswers));
            console.log('surveyAnswers values:', Object.values(surveyAnswers));
            
            // Validate that we have answers
            if (!surveyAnswers || Object.keys(surveyAnswers).length === 0) {
                throw new Error('No survey answers found. Please answer the questions before submitting.');
            }
            
            // Send data to server
            const response = await fetch('/api/submit-survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });
            
            const result = await response.json();
            
            // Add detailed logging for debugging
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Result:', result);
            
            // Remove loading overlay
            document.body.removeChild(loadingOverlay);
            
            if (response.ok && result.success) {
                // Survey completed successfully - no longer storing completion status
                console.log('Survey submission successful, about to show thank you modal');
                
                // Check if user has voted before and show appropriate message
                if (result.hasVotedBefore) {
                    // Show friendly notification for repeat voters
                    showFriendlyRepeatVoterNotification();
                } else {
                    // Show success notification for first-time voters
                    const successTitle = currentLanguage === 'ar' ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!';
                    const successMessage = currentLanguage === 'ar' 
                        ? 'شكراً لك على مشاركة آرائك معنا! 🎉'
                        : 'Thank you for sharing your thoughts with us! 🎉';
                    notificationSystem.success(successTitle, successMessage, 4000);
                }
                
                // Show funny thank you modal instead of alert
                showThankYouModal();
                console.log('showThankYouModal called from handleSurveySubmission');
                
                // Update global counter
                updateGlobalCounter();
                
                // Close survey modal
                document.getElementById('surveyModal').style.display = 'none';
                
                // Reset survey state
                currentQuestionIndex = 0;
                surveyAnswers = {};
            } else {
                throw new Error(result.message || 'فشل في إرسال الاستبيان');
            }
            
        } catch (error) {
            console.error('خطأ في إرسال الاستبيان:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Remove loading overlay if it exists
            if (document.body.contains(loadingOverlay)) {
                document.body.removeChild(loadingOverlay);
            }
            
            // Handle submission errors normally
            const errorTitle = currentLanguage === 'ar' ? 'خطأ في الإرسال' : 'Submission Error';
            const errorMessage = currentLanguage === 'ar'
                ? `حدث خطأ: ${error.message}. يرجى المحاولة مرة أخرى.`
                : `An error occurred: ${error.message}. Please try again.`;
            
            notificationSystem.error(errorTitle, errorMessage, 7000);
            
            // Also log to console for debugging
            console.log('Survey submission failed with error:', errorMessage);
        }
    }
    
    // Check on load and resize
    createMobileMenu();
    window.addEventListener('resize', createMobileMenu);
    
    // Initialize get started functionality
    initializeGetStarted();
    
    // Initialize advanced global counter system
    initializeAdvancedCounter();
    
    // Legacy interval cleanup (now handled by AdvancedCounter class)
    // The new system updates every 15 seconds with smart retry logic
    
    // Add scroll-to-top functionality
    const createScrollToTop = () => {
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '↑';
        scrollButton.className = 'scroll-to-top';
        scrollButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(scrollButton);
        
        // Show/hide scroll button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.style.opacity = '1';
                scrollButton.style.visibility = 'visible';
            } else {
                scrollButton.style.opacity = '0';
                scrollButton.style.visibility = 'hidden';
            }
        });
    };
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Initialize scroll to top
    createScrollToTop();
});

const createScrollToTop = () => {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(scrollButton);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', debounce(() => {
        if (window.pageYOffset > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
        }
    }, 100));
    
    // Scroll to top when clicked
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add hover effect
    scrollButton.addEventListener('mouseenter', () => {
        scrollButton.style.transform = 'scale(1.1)';
    });
    
    scrollButton.addEventListener('mouseleave', () => {
        scrollButton.style.transform = 'scale(1)';
    });
};
    
    createScrollToTop();
    
    // Add loading screen fade out
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);


// Add some utility functions
const utils = {
    // Debounce function for performance optimization
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Initialize body opacity for smooth loading
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Console message for developers


console.log('%c🇲🇦 MOROCCAN ATHEIST VOTING ✨ - 🌟 BY WISDOM CIRCLE ⭕ 🔮', 'color: #ffffff; font-size: 16px; font-weight: bold;');
        console.log('%cWebsite developed with modern web technologies & optimized performance', 'color: #e5e5e5; font-size: 12px;');
        console.log('%cFor more information, visit our social media channels', 'color: #b3b3b3; font-size: 12px;');
        console.log('%c📱 Modern UI & responsive design loaded successfully', 'color: #ffffff; font-size: 12px; font-weight: bold;');

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeThankYouModal();
    }
});

// Advanced Notification System
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.notifications = [];
    }

    show(options) {
        const {
            type = 'info',
            title,
            message,
            duration = 5000,
            icon = this.getDefaultIcon(type)
        } = options;

        const notification = this.createNotification({
            type,
            title,
            message,
            icon,
            duration
        });

        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification({ type, title, message, icon, duration }) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" onclick="notificationSystem.remove(this.parentElement.parentElement)">×</button>
            </div>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Click to dismiss
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                this.remove(notification);
            }
        });

        return notification;
    }

    remove(notification) {
        if (!notification || !notification.parentElement) return;
        
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 400);
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            duplicate: '🔄'
        };
        return icons[type] || 'ℹ️';
    }

    success(title, message, duration) {
        return this.show({ type: 'success', title, message, duration });
    }

    error(title, message, duration) {
        return this.show({ type: 'error', title, message, duration });
    }

    warning(title, message, duration) {
        return this.show({ type: 'warning', title, message, duration });
    }

    info(title, message, duration) {
        return this.show({ type: 'info', title, message, duration });
    }

    duplicate(title, message, duration) {
        return this.show({ type: 'duplicate', title, message, duration });
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Thank You Modal Functions
function showThankYouModal() {
    console.log('showThankYouModal called');
    const modal = document.getElementById('thankYouModal');
    const title = document.querySelector('.thank-you-title');
    const message = document.querySelector('.thank-you-message p');
    const messageSmall = document.querySelector('.thank-you-message small');
    const shareButtonText = document.getElementById('shareButtonText');
    const closeButtonText = document.getElementById('closeButtonText');
    
    console.log('Modal elements:', { modal, title, message, messageSmall, shareButtonText, closeButtonText });
    
    if (!modal) {
        console.error('thankYouModal element not found!');
        return;
    }
    
    // Set content based on language
    if (currentLanguage === 'ar') {
        if (title) title.textContent = 'تم إرسال أجوبتك إلى حاسوب الله! 😄';
        if (message) message.innerHTML = 'شكراً لك على مشاركة آرائك معنا! 🎉<br>إجاباتك الآن في رحلة عبر الفضاء الرقمي إلى الخوادم المقدسة! 🛸';
        if (messageSmall) messageSmall.textContent = 'لا تقلق، سنحافظ على خصوصيتك أكثر من حفاظنا على كلمة سر الواي فاي! 🔐';
        if (shareButtonText) shareButtonText.textContent = 'شارك الموقع 🔗';
        if (closeButtonText) closeButtonText.textContent = 'رائع! 🎊';
    } else {
        if (title) title.textContent = 'Your answers have been sent to God\'s computer! 😄';
        if (message) message.innerHTML = 'Thank you for sharing your thoughts with us! 🎉<br>Your answers are now traveling through digital space to the sacred servers! 🛸';
        if (messageSmall) messageSmall.textContent = 'Don\'t worry, we\'ll protect your privacy more than we protect our WiFi password! 🔐';
        if (shareButtonText) shareButtonText.textContent = 'Share Website 🔗';
        if (closeButtonText) closeButtonText.textContent = 'Awesome! 🎊';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Auto close after 8 seconds (increased for share button)
    setTimeout(() => {
        closeThankYouModal();
    }, 8000);
}

function closeThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    modal.classList.remove('active');
    
    // Hide modal after animation completes
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Share Website Function
function shareWebsite() {
    const websiteUrl = 'https://www.malahida.com/';
    const shareText = currentLanguage === 'ar' 
        ? 'شارك الموقع مع صحابك اصاط/ة باش حتى هما باش يصوتو ... ونمشيو لجهنم كاملين ...'
        : 'Share the website with your friends so they can vote too ... and we all go to hell together ...';
    
    const fullShareText = `${shareText}\n\nالرابط: ${websiteUrl}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: currentLanguage === 'ar' ? 'استبيان الملاحدة المغاربة' : 'Moroccan Atheist Survey',
            text: shareText,
            url: websiteUrl
        }).then(() => {
            console.log('Share successful');
        }).catch((error) => {
            console.log('Share failed:', error);
            fallbackShare(fullShareText);
        });
    } else {
        // Fallback to copying to clipboard
        fallbackShare(fullShareText);
    }
}

// Fallback share function
function fallbackShare(text) {
    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showShareSuccess();
        }).catch(() => {
            // If clipboard fails, show the text in a modal
            showShareModal(text);
        });
    } else {
        // Show the text in a modal for manual copying
        showShareModal(text);
    }
}

// Show share success message
function showShareSuccess() {
    const message = currentLanguage === 'ar' 
        ? 'تم نسخ الرابط والنص! يمكنك الآن مشاركته مع أصدقائك 📋✨'
        : 'Link and text copied! You can now share it with your friends 📋✨';
    
    // Create a temporary success message with enhanced styling
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(145deg, #10b981, #059669);
        color: white;
        padding: 25px 35px;
        border-radius: 20px;
        box-shadow: 
            0 20px 40px rgba(16, 185, 129, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        z-index: 10001;
        font-weight: bold;
        text-align: center;
        font-size: 1.1rem;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
    `;
    successDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
            <span style="font-size: 1.5rem; animation: bounce 1s ease-in-out infinite;">✅</span>
            <span>${message}</span>
        </div>
    `;
    
    // Add CSS animation keyframes if not already added
    if (!document.querySelector('#shareSuccessStyles')) {
        const style = document.createElement('style');
        style.id = 'shareSuccessStyles';
        style.textContent = `
            @keyframes shareSuccessIn {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8) translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) translateY(0);
                }
            }
            @keyframes shareSuccessOut {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(successDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        successDiv.style.animation = 'shareSuccessIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    });
    
    // Animate out and remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            successDiv.style.animation = 'shareSuccessOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => {
                if (document.body.contains(successDiv)) {
                    document.body.removeChild(successDiv);
                }
            }, 400);
        }
    }, 2600);
}

// Show share modal for manual copying
function showShareModal(text) {
    const shareTitle = currentLanguage === 'ar' ? 'مشاركة الموقع' : 'Share Website';
    const shareMessage = currentLanguage === 'ar' 
        ? `انسخ النص التالي وشاركه مع أصدقائك:\n\n${text}`
        : `Copy the following text and share it with your friends:\n\n${text}`;
    
    notificationSystem.info(shareTitle, shareMessage, 8000);
}

// Close thank you modal when clicking outside
document.getElementById('thankYouModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeThankYouModal();
    }
});

// Admin functionality
document.addEventListener('DOMContentLoaded', function() {
    // Admin button click - direct access to statistics with authentication
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            // Clear any existing authentication token to force login
            localStorage.removeItem('statisticsAuthToken');
            window.open('statistics.html', '_blank');
        });
    }
});









function loadStatistics() {
    // Open statistics page directly
    window.open('statistics.html', '_blank');
}

function displayStatistics(stats) {
    const content = document.getElementById('statisticsContent');
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalSubmissions}</div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.languageStats['العربية'] || 0}</div>
                <div class="stat-label">Arabic Responses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.languageStats['English'] || 0}</div>
                <div class="stat-label">English Responses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.storageType}</div>
                <div class="stat-label">Storage Type</div>
            </div>
        </div>
        
        <div class="recent-submissions">
            <h3>Recent Submissions</h3>
            <div class="submissions-list">
                ${stats.recentSubmissions.map(submission => `
                    <div class="submission-item">
                        <div class="submission-info">
                            <span class="submission-id">ID: ${submission.id}</span>
                            <span class="submission-lang">${submission.language}</span>
                            <span class="submission-date">${new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${generateChart('Language Distribution', stats.languageStats)}
        ${generateChart('Age Distribution', stats.ageStats)}
        ${generateChart('Gender Distribution', stats.genderStats)}
        ${generateChart('Education Distribution', stats.educationStats)}
        ${generateChart('Employment Distribution', stats.employmentStats)}
        ${generateChart('Income Distribution', stats.incomeStats)}
        ${generateChart('Region Distribution', stats.regionStats)}
    `;
    
    content.innerHTML = html;
    
    // Animate chart bars
    setTimeout(() => {
        document.querySelectorAll('.chart-fill').forEach(bar => {
            const width = bar.dataset.width;
            bar.style.width = width + '%';
        });
    }, 100);
}

function generateChart(title, data) {
    if (!data || Object.keys(data).length === 0) {
        return `<div class="chart-container">
            <div class="chart-title">${title}</div>
            <p style="text-align: center; opacity: 0.7;">No data available</p>
        </div>`;
    }
    
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(data));
    
    const bars = Object.entries(data).map(([key, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
        
        return `
            <div class="chart-bar">
                <div class="chart-label">${formatLabel(key)}</div>
                <div class="chart-progress">
                    <div class="chart-fill" data-width="${barWidth}" style="width: 0%"></div>
                </div>
                <div class="chart-value">${count} (${percentage}%)</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="chart-container">
            <div class="chart-title">${title}</div>
            ${bars}
        </div>
    `;
}

function formatLabel(key) {
    const labelMap = {
        'atheist': 'Atheist',
        'agnostic': 'Agnostic',
        'deist': 'Deist',
        'spiritual': 'Spiritual',
        'other': 'Other',
        'male': 'Male',
        'female': 'Female',
        'morocco': 'Morocco',
        'europe': 'Europe',
        'north-america': 'North America',
        'high-school': 'High School',
        'bachelor': 'Bachelor',
        'master': 'Master',
        'phd': 'PhD',
        'sunni-islam': 'Sunni Islam',
        'shia-islam': 'Shia Islam',
        'christianity': 'Christianity',
        'judaism': 'Judaism',
        'fully-committed': 'Fully Committed',
        'partially-committed': 'Partially Committed',
        'not-committed': 'Not Committed',
        'yes': 'Yes',
        'no': 'No',
        'moral-issues': 'Moral Issues',
        'scientific-evidence': 'Scientific Evidence',
        'personal-experience': 'Personal Experience',
        'philosophical-reasons': 'Philosophical Reasons'
    };
    
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
}



// Online Indicator System Removed
// The online indicator has been removed from dada lkbir as requested

// YouTube Videos Click Handler
function initializeVideoCards() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-url');
            if (videoUrl) {
                // Open YouTube video in new tab
                window.open(videoUrl, '_blank');
            }
        });
        
        // Add hover effect for better UX
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
}

// Initialize video cards when DOM is loaded
 document.addEventListener('DOMContentLoaded', function() {
     // Wait for the page to load completely
     setTimeout(initializeVideoCards, 500);
 });

// Friendly Repeat Voter Notification Function
function showFriendlyRepeatVoterNotification() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'friendly-notification-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    // Create notification modal
    const modal = document.createElement('div');
    modal.className = 'friendly-notification-modal';
    modal.style.cssText = `
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        border-radius: 25px;
        padding: 40px;
        max-width: 600px;
        width: 95%;
        min-height: 400px;
        text-align: center;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        transform: scale(0.8);
        opacity: 0;
        transition: all 0.4s ease;
        color: white;
        position: relative;
        overflow: hidden;
        margin: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;
    
    // Add animated background
    const animatedBg = document.createElement('div');
    animatedBg.style.cssText = `
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: rotate 4s linear infinite;
        pointer-events: none;
    `;
    modal.appendChild(animatedBg);
    
    // Create content container
    const content = document.createElement('div');
    content.style.cssText = `
        position: relative;
        z-index: 2;
    `;
    
    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = '💝';
    icon.style.cssText = `
        font-size: 80px;
        margin-bottom: 25px;
        animation: bounce 2s infinite;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    `;
    content.appendChild(icon);
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Thank You, Dear Friend! 💖';
    title.style.cssText = `
        margin: 0 0 25px 0;
        font-size: 36px;
        font-weight: bold;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
        line-height: 1.2;
        background: linear-gradient(45deg, #1a1a1a, #0a0a0a);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    content.appendChild(title);
    
    // Add message
    const message = document.createElement('p');
    message.textContent = 'If you have already answered the survey, once is enough. We do not want to prevent you by force for the privacy of your data, dear ones.';
    message.style.cssText = `
        font-size: 22px;
        line-height: 1.7;
        margin: 0 0 35px 0;
        opacity: 0.95;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        max-width: 100%;
        word-wrap: break-word;
        font-weight: 300;
    `;
    content.appendChild(message);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        background: linear-gradient(45deg, #2a2a2a, #1a1a1a);
        color: white;
        border: none;
        padding: 16px 40px;
        border-radius: 30px;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 20px rgba(238, 90, 36, 0.5);
        text-transform: uppercase;
        letter-spacing: 2px;
        min-width: 120px;
        margin-top: 10px;
    `;
    
    closeButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(238, 90, 36, 0.6)';
    });
    
    closeButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(238, 90, 36, 0.4)';
    });
    
    closeButton.addEventListener('click', function() {
        modal.style.transform = 'scale(0.8)';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
    });
    
    content.appendChild(closeButton);
    modal.appendChild(content);
    overlay.appendChild(modal);
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        modal.style.transform = 'scale(1)';
        modal.style.opacity = '1';
    }, 50);
    
    // Add CSS animations if not already added
    if (!document.querySelector('#friendly-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'friendly-notification-styles';
        styles.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-15px); }
                60% { transform: translateY(-8px); }
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @media (max-width: 768px) {
                .friendly-notification-modal {
                    padding: 30px 20px !important;
                    margin: 10px !important;
                    min-height: 350px !important;
                    max-width: 95% !important;
                }
                .friendly-notification-modal h2 {
                    font-size: 28px !important;
                }
                .friendly-notification-modal p {
                    font-size: 18px !important;
                }
                .friendly-notification-modal button {
                    padding: 14px 35px !important;
                    font-size: 18px !important;
                }
            }
            @media (max-width: 480px) {
                .friendly-notification-modal {
                    padding: 25px 15px !important;
                    margin: 5px !important;
                    min-height: 320px !important;
                }
                .friendly-notification-modal h2 {
                    font-size: 24px !important;
                }
                .friendly-notification-modal p {
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                }
                .friendly-notification-modal button {
                    padding: 12px 30px !important;
                    font-size: 16px !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Discord Popup Functionality
class DiscordPopup {
    constructor() {
        this.popup = null;
        this.isVisible = false;
        this.showDelay = 10000; // Show after 10 seconds
        this.hideDelay = 30000; // Hide after 30 seconds
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
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    scheduleShow() {
        // Check if user has already dismissed the popup today
        const dismissedToday = localStorage.getItem('discordPopupDismissed');
        const today = new Date().toDateString();
        
        if (dismissedToday === today) {
            return; // Don't show if dismissed today
        }

        setTimeout(() => {
            this.show();
        }, this.showDelay);
    }

    show() {
        if (!this.popup || this.isVisible) return;
        
        this.popup.classList.add('show');
        this.isVisible = true;

        // Auto hide after delay
        setTimeout(() => {
            if (this.isVisible) {
                this.hide();
            }
        }, this.hideDelay);
    }

    hide() {
        if (!this.popup || !this.isVisible) return;
        
        this.popup.classList.remove('show');
        this.isVisible = false;

        // Remember that user dismissed it today
        const today = new Date().toDateString();
        localStorage.setItem('discordPopupDismissed', today);
    }
}

// Initialize Discord popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new DiscordPopup();
});

// Duplicate Vote Modal Functions
// Survey Questions Data
const surveyQuestions = {
    ar: {
        title: "استبيان شامل حول اللادينية في المغرب  ",
        description: "مشاركتك مهمة وسرية تماماً",
        questions: [
            {
                id: "belief",
                title: "ما هو معتقدك؟ (يمكن اختيار أكثر من إجابة)",
                type: "checkbox",
                options: [
                    { value: "atheist", label: "ملحد" },
                    { value: "deist", label: "ربوبي / غير متدين" },
                    { value: "agnostic", label: "لا أدري" },
                    { value: "apatheist", label: "لا مبالي / غير مبالي" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "age",
                title: "كم عمرك؟",
                type: "radio",
                options: [
                    { value: "-17", label: "أقل من 17" },
                    { value: "18-28", label: "18 - 28" },
                    { value: "29-39", label: "29 - 39" },
                    { value: "40plus", label: "40 فما فوق" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "location",
                title: "أين تعيش؟",
                type: "radio",
                options: [
                    { value: "morocco", label: "المغرب" },
                    { value: "abroad", label: "خارج المغرب" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "gender",
                title: "ما هو جنسك؟",
                type: "radio",
                options: [
                    { value: "male", label: "ذكر" },
                    { value: "female", label: "أنثى" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "education",
                title: "ما هو مستواك التعليمي؟",
                type: "radio",
                options: [
                    { value: "no-education", label: "بدون تعليم رسمي" },
                    { value: "high-school", label: "ثانوي أو أقل" },
                    { value: "university", label: "جامعي أو أعلى" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "religious-background",
                title: "ما هي خلفيتك الدينية؟",
                type: "radio",
                options: [
                    { value: "islam", label: "الإسلام" },
                    { value: "other-religion", label: "دين آخر" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "religious-commitment",
                title: "كيف كانت ممارستك الدينية سابقاً؟",
                type: "radio",
                options: [
                    { value: "extremist", label: "صارمة / متطرفة" },
                    { value: "moderate", label: "معتدلة / ممارسة مغربية بسيطة" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "family-support",
                title: "هل تدعمك عائلتك؟",
                type: "radio",
                options: [
                    { value: "yes", label: "نعم" },
                    { value: "no", label: "لا" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "reason-for-leaving",
                title: "لماذا تركت الدين؟",
                type: "radio",
                options: [
                    { value: "scientific", label: "أسباب علمية / فكرية" },
                    { value: "personal", label: "تجربة شخصية" },
                    { value: "other", label: "أخرى...", allowText: true }
                ]
            },
            {
                id: "additional-thoughts",
                title: "اتركوا لنا فكرة أو رسالة أو شاركوا قلوبكم بسرية تامة",
                type: "textarea",
                placeholder: "شاركوا بحرية وسرية تامة..."
            }
        ]
    },
    en: {
        title: "Comprehensive Survey on Non-Religion in Morocco and the Arab World",
        description: "Your participation is important and completely confidential",
        questions: [
            {
                id: "belief",
                title: "What is your belief? (You can select multiple answers)",
                type: "checkbox",
                options: [
                    { value: "atheist", label: "Atheist" },
                    { value: "deist", label: "Deist / Non-religious" },
                    { value: "agnostic", label: "Agnostic" },
                    { value: "apatheist", label: "Apatheist / Indifferent" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "age",
                title: "How old are you?",
                type: "radio",
                options: [
                    { value: "-17", label: "Under 17" },
                    { value: "18-28", label: "18 - 28" },
                    { value: "29-39", label: "29 - 39" },
                    { value: "40plus", label: "40 and above" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "location",
                title: "Where do you live?",
                type: "radio",
                options: [
                    { value: "morocco", label: "Morocco" },
                    { value: "abroad", label: "Abroad" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "gender",
                title: "What is your gender?",
                type: "radio",
                options: [
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "education",
                title: "What is your educational level?",
                type: "radio",
                options: [
                    { value: "no-education", label: "No formal education" },
                    { value: "high-school", label: "High school or lower" },
                    { value: "university", label: "University or higher" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "religious-background",
                title: "What is your religious background?",
                type: "radio",
                options: [
                    { value: "islam", label: "Islam" },
                    { value: "other-religion", label: "Other religion" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "religious-commitment",
                title: "How strict was your religious practice previously?",
                type: "radio",
                options: [
                    { value: "extremist", label: "Strict / Extremist" },
                    { value: "moderate", label: "Moderate / Simple Moroccan practice" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "family-support",
                title: "Does your family support you?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "reason-for-leaving",
                title: "Why did you leave religion?",
                type: "radio",
                options: [
                    { value: "scientific", label: "Scientific / Intellectual reasons" },
                    { value: "personal", label: "Personal experience" },
                    { value: "other", label: "Other...", allowText: true }
                ]
            },
            {
                id: "additional-thoughts",
                title: "Leave us a thought, message, or share your heart with complete confidentiality",
                type: "textarea",
                placeholder: "Share freely and confidentially..."
            }
        ]
    }
};

// Global variables
let currentLanguage = 'ar';
let currentQuestionIndex = 0;
let surveyAnswers = {};
let currentSurveyData = null;

// Language selection
function selectLanguage(lang) {
    console.log('Language selected:', lang);
    currentLanguage = lang;
    currentSurveyData = surveyQuestions[lang];
    
    // Update HTML direction and language
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update header content
    document.getElementById('surveyTitle').textContent = currentSurveyData.title;
    document.getElementById('surveyDescription').textContent = currentSurveyData.description;
    
    // Hide language selection
    document.getElementById('languageSelection').style.display = 'none';
    
    // Show survey content
    document.getElementById('surveyContent').classList.add('active');
    
    // Update navigation text based on language
    updateNavigationText();
    
    // Initialize survey
    initializeSurvey();
}

// Update navigation button text based on language
function updateNavigationText() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (currentLanguage === 'ar') {
        prevBtn.textContent = 'السابق';
        nextBtn.textContent = 'التالي';
        submitBtn.textContent = 'إرسال';
    } else {
        prevBtn.textContent = 'Previous';
        nextBtn.textContent = 'Next';
        submitBtn.textContent = 'Submit';
    }
}

// Initialize survey
function initializeSurvey() {
    console.log('Initializing survey with', currentSurveyData.questions.length, 'questions');
    currentQuestionIndex = 0;
    surveyAnswers = {};
    
    // Update total questions counter
    document.getElementById('totalQuestions').textContent = currentSurveyData.questions.length;
    
    // Show first question
    showQuestion(currentQuestionIndex);
    
    // Update progress
    updateProgress();
    
    // Update navigation
    updateNavigation();
}

// Show question
function showQuestion(index) {
    console.log('Showing question', index + 1);
    const question = currentSurveyData.questions[index];
    const container = document.getElementById('questionContainer');
    
    // Clear container
    container.innerHTML = '';
    
    // Create question title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'question-title';
    titleDiv.textContent = question.title;
    container.appendChild(titleDiv);
    
    if (question.type === 'textarea') {
        // Create textarea for open-ended questions
        const textareaContainer = document.createElement('div');
        textareaContainer.className = 'textarea-container';
        
        const textarea = document.createElement('textarea');
        textarea.className = 'textarea-input';
        textarea.placeholder = question.placeholder || '';
        textarea.id = question.id;
        
        // Restore previous answer if exists
        if (surveyAnswers[question.id]) {
            textarea.value = surveyAnswers[question.id];
        }
        
        // Save answer on input
        textarea.addEventListener('input', function() {
            surveyAnswers[question.id] = this.value.trim();
            updateNavigation();
        });
        
        textareaContainer.appendChild(textarea);
        container.appendChild(textareaContainer);
    } else {
        // Create options container for radio questions
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'question-options';
        
        // Create options
        question.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            
            // Create input (radio or checkbox based on question type)
            const input = document.createElement('input');
            input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
            input.name = question.id;
            input.value = option.value;
            input.id = `${question.id}_${option.value}`;
            
            // Check if this option was previously selected
            if (question.type === 'checkbox') {
                // For checkboxes, check if this value is in the array
                if (surveyAnswers[question.id] && Array.isArray(surveyAnswers[question.id]) && surveyAnswers[question.id].includes(option.value)) {
                    input.checked = true;
                    optionDiv.classList.add('selected');
                }
            } else {
                // For radio buttons, check direct equality
                if (surveyAnswers[question.id] === option.value) {
                    input.checked = true;
                    optionDiv.classList.add('selected');
                }
            }
            
            // Create label
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = option.label;
            
            // Add elements to option div
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            
            // Add custom text input if needed
            if (option.allowText) {
                const customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.className = 'custom-input';
                customInput.placeholder = currentLanguage === 'ar' ? 'حدد...' : 'Specify...';
                customInput.style.display = input.checked ? 'block' : 'none';
                
                // Restore custom text if exists
                if (surveyAnswers[question.id + '_custom']) {
                    customInput.value = surveyAnswers[question.id + '_custom'];
                }
                
                optionDiv.appendChild(customInput);
                
                // Show/hide custom input based on input selection
                input.addEventListener('change', function() {
                    if (this.checked) {
                        customInput.style.display = 'block';
                        customInput.focus();
                    }
                });
                
                // Save custom text
                customInput.addEventListener('input', function() {
                    surveyAnswers[question.id + '_custom'] = this.value;
                });
            }
            
            // Add click handler for the entire option
            optionDiv.addEventListener('click', function(e) {
                if (e.target.type !== 'radio' && e.target.type !== 'checkbox' && e.target.type !== 'text') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });
            
            // Add change handler for input
            input.addEventListener('change', function() {
                if (question.type === 'checkbox') {
                    // Handle checkbox selection
                    if (this.checked) {
                        optionDiv.classList.add('selected');
                        // Initialize array if it doesn't exist
                        if (!surveyAnswers[question.id] || !Array.isArray(surveyAnswers[question.id])) {
                            surveyAnswers[question.id] = [];
                        }
                        // Add value to array if not already present
                        if (!surveyAnswers[question.id].includes(option.value)) {
                            surveyAnswers[question.id].push(option.value);
                        }
                    } else {
                        optionDiv.classList.remove('selected');
                        // Remove value from array
                        if (surveyAnswers[question.id] && Array.isArray(surveyAnswers[question.id])) {
                            surveyAnswers[question.id] = surveyAnswers[question.id].filter(val => val !== option.value);
                        }
                    }
                    console.log('Checkbox answer saved:', question.id, '=', surveyAnswers[question.id]);
                } else {
                    // Handle radio button selection (original behavior)
                    if (this.checked) {
                        // Update visual selection
                        document.querySelectorAll(`input[name="${question.id}"]`).forEach(r => {
                            r.closest('.option-item').classList.remove('selected');
                        });
                        optionDiv.classList.add('selected');
                        
                        // Hide other custom inputs
                        document.querySelectorAll(`input[name="${question.id}"]`).forEach(r => {
                            const customInput = r.closest('.option-item').querySelector('.custom-input');
                            if (customInput && r !== this) {
                                customInput.style.display = 'none';
                            }
                        });
                        
                        // Save answer
                        surveyAnswers[question.id] = option.value;
                        console.log('Radio answer saved:', question.id, '=', option.value);
                    }
                }
                
                // Update navigation
                updateNavigation();
            });
            
            optionsDiv.appendChild(optionDiv);
        });
        
        container.appendChild(optionsDiv);
    }
    
    // Update question counter
    document.getElementById('currentQuestion').textContent = index + 1;
}

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentSurveyData.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next/Submit button
    const isLastQuestion = currentQuestionIndex === currentSurveyData.questions.length - 1;
    const currentQuestion = currentSurveyData.questions[currentQuestionIndex];
    const hasAnswer = surveyAnswers[currentQuestion.id] && 
        (Array.isArray(surveyAnswers[currentQuestion.id]) ? 
            surveyAnswers[currentQuestion.id].length > 0 : 
            surveyAnswers[currentQuestion.id].trim() !== '');
    
    if (isLastQuestion) {
        nextBtn.classList.add('hidden');
        if (hasAnswer) {
            submitBtn.classList.remove('hidden');
        } else {
            submitBtn.classList.add('hidden');
        }
    } else {
        submitBtn.classList.add('hidden');
        if (hasAnswer) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.add('hidden');
        }
    }
}

// Previous question
function previousQuestion() {
    console.log('Going to previous question');
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigation();
    }
}

// Next question
function nextQuestion() {
    console.log('Going to next question');
    const currentQuestion = currentSurveyData.questions[currentQuestionIndex];
    
    // Check if current question is answered
    const hasAnswer = surveyAnswers[currentQuestion.id] && 
        (Array.isArray(surveyAnswers[currentQuestion.id]) ? 
            surveyAnswers[currentQuestion.id].length > 0 : 
            surveyAnswers[currentQuestion.id].trim() !== '');
    
    if (!hasAnswer) {
        alert(currentLanguage === 'ar' ? 'يرجى الإجابة على السؤال الحالي' : 'Please answer the current question');
        return;
    }
    
    if (currentQuestionIndex < currentSurveyData.questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigation();
    }
}

// Submit survey
async function submitSurvey() {
    console.log('Submitting survey');
    
    // Check if all questions are answered
    const unansweredQuestions = currentSurveyData.questions.filter(q => {
        const answer = surveyAnswers[q.id];
        if (!answer) return true;
        if (Array.isArray(answer)) {
            return answer.length === 0;
        }
        return answer.trim() === '';
    });
    
    if (unansweredQuestions.length > 0) {
        alert(currentLanguage === 'ar' ? 'يرجى الإجابة على جميع الأسئلة' : 'Please answer all questions');
        return;
    }
    
    // Prepare submission data
    const submissionData = {
        language: currentLanguage,
        answers: surveyAnswers
    };
    
    try {
        // Send data to server
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Survey submitted successfully:', result);
            // Show success message
            alert(currentLanguage === 'ar' ? 'تم إرسال الاستبيان بنجاح! شكراً لمشاركتك.' : 'Survey submitted successfully! Thank you for your participation.');
            
            // Redirect to home page
            window.location.href = 'index.html';
        } else {
            throw new Error(result.message || 'Failed to submit survey');
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert(currentLanguage === 'ar' ? 'حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.' : 'An error occurred while submitting the survey. Please try again.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Survey page loaded successfully');
    console.log('Available questions:', Object.keys(surveyQuestions));
});

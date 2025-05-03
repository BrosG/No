/**
 * NO Detector - Ultimate Rejection Machine
 * Enhanced by Claude 3.7 Sonnet
 * script.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Main UI
    const word = document.getElementById('word');
    const status = document.getElementById('status');
    const startButton = document.getElementById('start-button');
    const floatingStartButton = document.getElementById('floating-start-button');
    const installPrompt = document.getElementById('install-prompt');
    const installButton = document.getElementById('install-button');
    const languageSelect = document.getElementById('language-select');
    const subtitle = document.getElementById('subtitle');
    const volumeBar = document.getElementById('volume-bar');
    const volumeValue = document.getElementById('volume-value');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    const notification = document.getElementById('notification');
    const mainContainer = document.getElementById('main-container');
    const keyboardShortcut = document.getElementById('keyboard-shortcut');
    const tooltip = document.getElementById('tooltip');
    
    // DOM Elements - Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const splashButton = document.getElementById('splash-button');
    const onboardingSlider = document.getElementById('onboarding-slider');
    const onboardingDots = document.getElementById('onboarding-dots');
    
    // DOM Elements - Settings
    const sensitivitySlider = document.getElementById('sensitivity-slider');
    const sensitivityValue = document.getElementById('sensitivity-value');
    const delaySlider = document.getElementById('delay-slider');
    const delayValue = document.getElementById('delay-value');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValueSetting = document.getElementById('volume-value-setting');
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchValue = document.getElementById('pitch-value');
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    const effectsSwitch = document.getElementById('effects-switch');
    const statsSwitch = document.getElementById('stats-switch');
    const autostartSwitch = document.getElementById('autostart-switch');
    const shortcutsSwitch = document.getElementById('shortcuts-switch');
    const rememberSwitch = document.getElementById('remember-switch');
    
    // Initialize speech synthesis
    const synth = window.speechSynthesis;
    
    // App state
    let isDetectorActive = false;
    let rejectionCount = 0;
    let currentThreshold = 0.05;
    let currentDelay = 300;
    let currentVolume = 0.8;
    let currentPitch = 1.0;
    let isDarkMode = true;
    let showEffects = true;
    let enableShortcuts = true;
    let currentOnboardingSlide = 0;
    let deferredPrompt;
    let audioStream = null;
    let audioContext = null;
    let analyser = null;
    let isScrolling = false;
    let hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    // Onboarding slides content
    const onboardingSlides = [
      {
        icon: '🎤',
        title: 'Say NO Effortlessly',
        text: 'Let our detector handle all your rejections automatically with its voice-powered technology'
      },
      {
        icon: '🌍',
        title: 'Works in 10 Languages',
        text: 'Reject people in their native language for maximum impact and clarity'
      },
      {
        icon: '⚡',
        title: 'Ready When You Are',
        text: 'Works offline, customizable settings, and saves your preferences for next time'
      }
    ];
    
    // Initialize onboarding slides
    function setupOnboarding() {
      let slidesHTML = '';
      onboardingSlides.forEach((slide, index) => {
        slidesHTML += `
          <div class="onboarding-slide" data-slide="${index}" style="transform: translateX(${index * 100}%)">
            <div class="onboarding-icon">${slide.icon}</div>
            <h3 class="onboarding-title">${slide.title}</h3>
            <p class="onboarding-text">${slide.text}</p>
          </div>
        `;
      });
      onboardingSlider.innerHTML = slidesHTML;
      
      // Set up onboarding navigation
      const dots = onboardingDots.querySelectorAll('.onboarding-dot');
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          goToSlide(index);
        });
      });
      
      // Swipe functionality for mobile
      let touchStartX = 0;
      let touchEndX = 0;
      
      onboardingSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, false);
      
      onboardingSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, false);
      
      function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          // Swipe left, go to next slide
          if (currentOnboardingSlide < onboardingSlides.length - 1) {
            goToSlide(currentOnboardingSlide + 1);
          }
        }
        
        if (touchEndX > touchStartX + 50) {
          // Swipe right, go to previous slide
          if (currentOnboardingSlide > 0) {
            goToSlide(currentOnboardingSlide - 1);
          }
        }
      }
      
      // Auto advance slides
      let slideInterval = setInterval(() => {
        if (currentOnboardingSlide < onboardingSlides.length - 1) {
          goToSlide(currentOnboardingSlide + 1);
        } else {
          goToSlide(0);
        }
      }, 5000);
      
      // Clear interval if user interacts
      onboardingSlider.addEventListener('click', () => {
        clearInterval(slideInterval);
      });
    }
    
    function goToSlide(index) {
      const slides = onboardingSlider.querySelectorAll('.onboarding-slide');
      const dots = onboardingDots.querySelectorAll('.onboarding-dot');
      
      currentOnboardingSlide = index;
      
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - index) * 100}%)`;
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    
    // Initialize splash screen
    setupOnboarding();
    
    // Handle splash screen transitions
    splashButton.addEventListener('click', () => {
      splashScreen.style.opacity = '0';
      splashScreen.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContainer.classList.add('show');
        
        // Save that user has visited before
        if (rememberSwitch.checked) {
          localStorage.setItem('hasVisitedBefore', 'true');
        }
        
        // Show tutorial tooltips if it's the first visit
        if (!hasVisitedBefore) {
          setTimeout(() => {
            showTooltip(startButton, 'Click here to start the NO Detector', 'bottom');
          }, 1000);
          
          setTimeout(() => {
            showTooltip(darkModeToggle, 'Toggle dark/light mode', 'right');
          }, 4000);
          
          setTimeout(() => {
            showTooltip(settingsToggle, 'Access settings and preferences', 'left');
          }, 7000);
        }
        
        // Auto-start if enabled
        if (autostartSwitch.checked) {
          setTimeout(() => {
            startDetector();
          }, 2000);
        }
      }, 600);
    });
    
    // Skip splash screen if user has visited before
    if (hasVisitedBefore) {
      splashScreen.style.display = 'none';
      mainContainer.classList.add('show');
      
      // Auto-start if enabled
      if (autostartSwitch.checked) {
        setTimeout(() => {
          startDetector();
        }, 1000);
      }
    }
    
    // Enhanced translations for multilingual support
    const translations = {
      en: { 
        word: "NO", 
        status: "Click Start to activate the NO Detector", 
        active: "Listening for requests to reject",
        subtitle: "Your personal assistant for saying NO to every request", 
        button: "START DETECTOR",
        notification: {
          title: "NO Detector Active",
          message: "Ready to reject any requests"
        }
      },
      es: { 
        word: "NO", 
        status: "Haga clic en Iniciar para activar el Detector de NO", 
        active: "Escuchando solicitudes para rechazar",
        subtitle: "Tu asistente personal para decir NO a cada solicitud", 
        button: "INICIAR DETECTOR",
        notification: {
          title: "Detector de NO Activo",
          message: "Listo para rechazar cualquier solicitud"
        }
      },
      fr: { 
        word: "NON", 
        status: "Cliquez sur Démarrer pour activer le Détecteur de NON", 
        active: "À l'écoute des demandes à rejeter",
        subtitle: "Votre assistant personnel pour dire NON à chaque demande", 
        button: "DÉMARRER DÉTECTEUR",
        notification: {
          title: "Détecteur de NON Actif",
          message: "Prêt à rejeter toute demande"
        }
      },
      de: { 
        word: "NEIN", 
        status: "Klicken Sie auf Start, um den NEIN-Detektor zu aktivieren", 
        active: "Höre auf Anfragen zum Ablehnen",
        subtitle: "Ihr persönlicher Assistent, um NEIN zu jeder Anfrage zu sagen", 
        button: "DETEKTOR STARTEN",
        notification: {
          title: "NEIN-Detektor Aktiv",
          message: "Bereit, alle Anfragen abzulehnen"
        }
      },
      it: { 
        word: "NO", 
        status: "Clicca su Avvia per attivare il Rilevatore di NO", 
        active: "In ascolto di richieste da rifiutare",
        subtitle: "Il tuo assistente personale per dire NO ad ogni richiesta", 
        button: "AVVIA RILEVATORE",
        notification: {
          title: "Rilevatore di NO Attivo",
          message: "Pronto a rifiutare qualsiasi richiesta"
        }
      },
      pt: { 
        word: "NÃO", 
        status: "Clique em Iniciar para ativar o Detector de NÃO", 
        active: "Ouvindo pedidos para rejeitar",
        subtitle: "Seu assistente pessoal para dizer NÃO a cada pedido", 
        button: "INICIAR DETECTOR",
        notification: {
          title: "Detector de NÃO Ativo",
          message: "Pronto para rejeitar qualquer pedido"
        }
      },
      ru: { 
        word: "НЕТ", 
        status: "Нажмите Старт, чтобы активировать Детектор НЕТ", 
        active: "Слушаю запросы для отклонения",
        subtitle: "Ваш личный помощник для отказа на любую просьбу", 
        button: "ЗАПУСТИТЬ ДЕТЕКТОР",
        notification: {
          title: "Детектор НЕТ Активен",
          message: "Готов отклонить любые запросы"
        }
      },
      zh: { 
        word: "不", 
        status: "点击开始激活不探测器", 
        active: "正在听取要拒绝的请求",
        subtitle: "您的个人助手，对每个请求说不", 
        button: "开始检测",
        notification: {
          title: "不探测器已激活",
          message: "准备拒绝任何请求"
        }
      },
      ja: { 
        word: "いいえ", 
        status: "スタートをクリックして「いいえ」検出器を起動します", 
        active: "拒否するリクエストをリスニング中",
        subtitle: "あらゆるリクエストに「いいえ」と言うあなたの個人アシスタント", 
        button: "検出器を起動",
        notification: {
          title: "「いいえ」検出器が有効",
          message: "任意のリクエストを拒否する準備ができています"
        }
      },
      ko: { 
        word: "아니오", 
        status: "시작을 클릭하여 아니오 감지기를 활성화하세요", 
        active: "거부할 요청 듣는 중",
        subtitle: "모든 요청에 아니오라고 말하는 개인 비서", 
        button: "감지기 시작",
        notification: {
          title: "아니오 감지기 활성화됨",
          message: "모든 요청을 거부할 준비가 되었습니다"
        }
      }
    };
  
    // Detect browser language
    function detectLanguage() {
      try {
        // First check localStorage if we have a saved preference
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && translations[savedLang]) {
          return savedLang;
        }
        
        // Next check navigator language
        let browserLang = navigator.language || navigator.userLanguage;
        browserLang = browserLang.split('-')[0]; // Get primary language code
        
        // Check if we support this language
        if (translations[browserLang]) {
          return browserLang;
        }
        
        // Default to English if not supported
        return 'en';
      } catch (e) {
        console.error('Error detecting language:', e);
        return 'en'; // Fallback to English
      }
    }
  
    // Set initial language
    const initialLanguage = detectLanguage();
    languageSelect.value = initialLanguage;
    updateLanguage(initialLanguage);
  
    // Update UI with selected language
    function updateLanguage(lang) {
      const translation = translations[lang] || translations.en;
      word.textContent = translation.word;
      word.setAttribute('data-text', translation.word);
      status.textContent = isDetectorActive ? translation.active : translation.status;
      subtitle.textContent = translation.subtitle;
      startButton.querySelector('.start-button-text').innerHTML = `<span class="microphone-icon"></span>${translation.button}`;
      floatingStartButton.textContent = translation.button;
      
      // Save language preference if remember settings is enabled
      if (rememberSwitch.checked) {
        localStorage.setItem('preferredLanguage', lang);
      }
    }
  
    // Listen for language changes
    languageSelect.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
    });
    
    // Show tooltip helper function
    function showTooltip(element, message, position = 'top') {
      const rect = element.getBoundingClientRect();
      tooltip.textContent = message;
      tooltip.className = 'tooltip';
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Position the tooltip based on the position parameter
      switch(position) {
        case 'top':
          tooltip.classList.add('top');
          tooltip.style.bottom = `${window.innerHeight - rect.top + 10 + scrollTop}px`;
          tooltip.style.left = `${rect.left + rect.width / 2 - 150}px`;
          break;
        case 'bottom':
          tooltip.classList.add('bottom');
          tooltip.style.top = `${rect.bottom + 10 + scrollTop}px`;
          tooltip.style.left = `${rect.left + rect.width / 2 - 150}px`;
          break;
        case 'left':
          tooltip.classList.add('left');
          tooltip.style.top = `${rect.top + rect.height / 2 + scrollTop}px`;
          tooltip.style.right = `${window.innerWidth - rect.left + 10}px`;
          tooltip.style.left = 'auto';
          break;
        case 'right':
          tooltip.classList.add('right');
          tooltip.style.top = `${rect.top + rect.height / 2 + scrollTop}px`;
          tooltip.style.left = `${rect.right + 10}px`;
          break;
      }
      
      // Add pulse animation to the element
      element.classList.add('pulse-animation');
      
      // Show the tooltip
      tooltip.classList.add('show');
      
      // Hide tooltip after delay
      setTimeout(() => {
        tooltip.classList.remove('show');
        element.classList.remove('pulse-animation');
      }, 3000);
    }
    
    // Settings panel functionality
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.add('show');
    });
    
    closeSettings.addEventListener('click', () => {
      settingsPanel.classList.remove('show');
      saveSettings();
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
      toggleDarkMode();
    });
    
    function toggleDarkMode() {
      isDarkMode = !isDarkMode;
      darkModeSwitch.checked = isDarkMode;
      document.body.classList.toggle('light-mode', !isDarkMode);
      
      // Update dark mode icon
      darkModeToggle.innerHTML = isDarkMode ? 
        `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` :
        `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      
      if (rememberSwitch.checked) {
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
      }
    }
    
    // Settings sliders functionality
    sensitivitySlider.addEventListener('input', () => {
      sensitivityValue.textContent = sensitivitySlider.value;
      // Convert slider value (1-10) to threshold (0.1-0.01)
      currentThreshold = 0.11 - (sensitivitySlider.value * 0.01);
    });
    
    delaySlider.addEventListener('input', () => {
      currentDelay = parseInt(delaySlider.value);
      delayValue.textContent = `${currentDelay}ms`;
    });
    
    volumeSlider.addEventListener('input', () => {
      currentVolume = parseFloat(volumeSlider.value);
      volumeValueSetting.textContent = `${Math.round(currentVolume * 100)}%`;
    });
    
    pitchSlider.addEventListener('input', () => {
      currentPitch = parseFloat(pitchSlider.value);
      let pitchText = 'Normal';
      if (currentPitch < 0.9) pitchText = 'Low';
      if (currentPitch > 1.1) pitchText = 'High';
      pitchValue.textContent = pitchText;
    });
    
    // Visual effects toggle
    effectsSwitch.addEventListener('change', () => {
      showEffects = effectsSwitch.checked;
      document.body.classList.toggle('reduced-effects', !showEffects);
    });
    
    // Stats display toggle
    statsSwitch.addEventListener('change', () => {
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) {
        statsSection.style.display = statsSwitch.checked ? 'flex' : 'none';
      }
    });
    
    // Keyboard shortcuts toggle
    shortcutsSwitch.addEventListener('change', () => {
      enableShortcuts = shortcutsSwitch.checked;
      keyboardShortcut.style.display = enableShortcuts ? 'block' : 'none';
    });
    
    // Autostart functionality
    autostartSwitch.addEventListener('change', () => {
      if (rememberSwitch.checked) {
        localStorage.setItem('autostart', autostartSwitch.checked ? 'true' : 'false');
      }
      
      if (autostartSwitch.checked && !isDetectorActive) {
        // Auto start the detector after a short delay
        setTimeout(() => {
          startDetector();
        }, 500);
      }
    });
    
    // Remember settings functionality
    rememberSwitch.addEventListener('change', () => {
      if (rememberSwitch.checked) {
        saveSettings();
      } else {
        // Clear saved settings
        localStorage.removeItem('settings');
        localStorage.removeItem('darkMode');
        localStorage.removeItem('preferredLanguage');
        localStorage.removeItem('autostart');
        localStorage.removeItem('hasVisitedBefore');
      }
    });
    
    // Save all settings to localStorage
    function saveSettings() {
      if (!rememberSwitch.checked) return;
      
      const settings = {
        sensitivity: sensitivitySlider.value,
        delay: delaySlider.value,
        volume: volumeSlider.value,
        pitch: pitchSlider.value,
        darkMode: darkModeSwitch.checked,
        effects: effectsSwitch.checked,
        stats: statsSwitch.checked,
        shortcuts: shortcutsSwitch.checked,
        autostart: autostartSwitch.checked
      };
      
      localStorage.setItem('settings', JSON.stringify(settings));
    }
    
    // Load settings from localStorage
    function loadSettings() {
      try {
        // Check if we should load saved settings
        const settingsJson = localStorage.getItem('settings');
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          
          // Apply settings to sliders
          sensitivitySlider.value = settings.sensitivity;
          sensitivityValue.textContent = settings.sensitivity;
          currentThreshold = 0.11 - (settings.sensitivity * 0.01);
          
          delaySlider.value = settings.delay;
          delayValue.textContent = `${settings.delay}ms`;
          currentDelay = parseInt(settings.delay);
          
          volumeSlider.value = settings.volume;
          volumeValueSetting.textContent = `${Math.round(settings.volume * 100)}%`;
          currentVolume = parseFloat(settings.volume);
          
          pitchSlider.value = settings.pitch;
          let pitchText = 'Normal';
          if (settings.pitch < 0.9) pitchText = 'Low';
          if (settings.pitch > 1.1) pitchText = 'High';
          pitchValue.textContent = pitchText;
          currentPitch = parseFloat(settings.pitch);
          
          // Apply toggle settings
          darkModeSwitch.checked = settings.darkMode;
          isDarkMode = settings.darkMode;
          document.body.classList.toggle('light-mode', !settings.darkMode);
          
          // Update dark mode icon
          darkModeToggle.innerHTML = settings.darkMode ? 
            `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` :
            `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
          
          effectsSwitch.checked = settings.effects;
          showEffects = settings.effects;
          document.body.classList.toggle('reduced-effects', !settings.effects);
          
          statsSwitch.checked = settings.stats;
          const statsSection = document.querySelector('.stats-section');
          if (statsSection) {
            statsSection.style.display = settings.stats ? 'flex' : 'none';
          }
          
          shortcutsSwitch.checked = settings.hasOwnProperty('shortcuts') ? settings.shortcuts : true;
          enableShortcuts = shortcutsSwitch.checked;
          keyboardShortcut.style.display = enableShortcuts ? 'block' : 'none';
          
          autostartSwitch.checked = settings.autostart;
        }
        
        // Check dark mode preference separately in case it was set independently
        const darkModePref = localStorage.getItem('darkMode');
        if (darkModePref !== null) {
          isDarkMode = darkModePref === 'true';
          darkModeSwitch.checked = isDarkMode;
          document.body.classList.toggle('light-mode', !isDarkMode);
          
          // Update dark mode icon
          darkModeToggle.innerHTML = isDarkMode ? 
            `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` :
            `<svg class="mode-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    
    // Load settings on init
    loadSettings();
    
    // PWA installation handler
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Show the install button
      installPrompt.classList.add('show');
    });
    
    installButton.addEventListener('click', () => {
      // Hide the app provided install promotion
      installPrompt.classList.remove('show');
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showNotification('App Installed', 'NO Detector has been added to your home screen');
        }
        deferredPrompt = null;
      });
    });
    
    // Notification system
    function showNotification(title, message, duration = 3000) {
      const notificationTitle = notification.querySelector('.notification-title');
      const notificationMessage = notification.querySelector('.notification-message');
      
      notificationTitle.textContent = title;
      notificationMessage.textContent = message;
      
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, duration);
    }
    
    // Social sharing functionality
    document.getElementById('twitter-share').addEventListener('click', () => {
      const text = "Check out the NO Detector - the ultimate rejection machine for spouse expenses, travel ideas, kids' requests, work commitments, social invitations and friends asking for money!";
      const url = window.location.href;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });
    
    document.getElementById('fb-share').addEventListener('click', () => {
      const url = window.location.href;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });
    
    document.getElementById('whatsapp-share').addEventListener('click', () => {
      const text = "Check out the NO Detector - the ultimate rejection machine!";
      const url = window.location.href;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    });
  
    // Start detector functionality
    function startDetector() {
      if (isDetectorActive) return;
      
      startButton.disabled = true;
      startButton.innerHTML = '<span class="loading-spinner"></span>Starting...';
      floatingStartButton.disabled = true;
      floatingStartButton.innerHTML = '<span class="loading-spinner"></span>Starting...';
      
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioStream = stream;
          isDetectorActive = true;
  
          // Add class to body to hide non-essential elements
          document.body.classList.add('detector-active');
          
          const currentLang = languageSelect.value;
          status.textContent = translations[currentLang].active;
          startButton.style.display = 'none';
          floatingStartButton.textContent = 'STOP DETECTOR';
          floatingStartButton.disabled = false;
          floatingStartButton.classList.add('show');
          
          // Show keyboard shortcuts if enabled
          if (enableShortcuts) {
            keyboardShortcut.classList.add('show');
            setTimeout(() => {
              keyboardShortcut.classList.remove('show');
            }, 5000);
          }
          
          // Show notification
          const notificationText = translations[currentLang].notification;
          showNotification(notificationText.title, notificationText.message);
  
          // Set up audio processing
          setupAudioProcessing(stream);
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          startButton.disabled = false;
          startButton.innerHTML = '<span class="start-button-text"><span class="microphone-icon"></span>RETRY</span>';
          floatingStartButton.disabled = false;
          floatingStartButton.textContent = 'RETRY';
          status.textContent = 'Microphone denied or unavailable. Permission needed.';
          showNotification('Error', 'Microphone access denied. Please allow microphone access.');
        });
    }
    
    // Stop detector functionality
    function stopDetector() {
      if (!isDetectorActive) return;
      
      // Stop microphone stream
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
      }
      
      // Stop audio context
      if (audioContext && audioContext.state === 'running') {
        audioContext.close();
        audioContext = null;
      }
      
      isDetectorActive = false;
  
      // Remove class from body to show all elements again
      document.body.classList.remove('detector-active');
      
      const currentLang = languageSelect.value;
      status.textContent = translations[currentLang].status;
      startButton.style.display = 'flex';
      startButton.disabled = false;
      startButton.innerHTML = `<span class="start-button-text"><span class="microphone-icon"></span>${translations[currentLang].button}</span>`;
      floatingStartButton.textContent = translations[currentLang].button;
      volumeBar.style.width = '0%';
      volumeValue.textContent = '0%';
      volumeValue.classList.remove('show');
      
      showNotification('Detector Stopped', 'NO Detector is now inactive');
    }
    
    // Toggle detector state
    function toggleDetector() {
      if (isDetectorActive) {
        stopDetector();
      } else {
        startDetector();
      }
    }
    
    // Floating button toggle
    floatingStartButton.addEventListener('click', toggleDetector);
    
    function setupAudioProcessing(stream) {
      // Scroll to detector section when activated
      document.getElementById('detector-section').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Set up audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const data = new Uint8Array(analyser.frequencyBinCount);
      let gate = false; // debounce control
      
      // Update the rejection stats
      function updateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) {
          statNumbers[0].textContent = (2500000 + rejectionCount).toLocaleString() + '+';
        }
      }
      
      // Say "NO" in the selected language
      function speakNo() {
        if (synth.speaking) return;
        
        const currentLang = languageSelect.value;
        const text = translations[currentLang].word;
        
        const utter = new SpeechSynthesisUtterance(text);
        
        // Set language based on current selection
        switch(currentLang) {
          case 'en': utter.lang = 'en-US'; break;
          case 'es': utter.lang = 'es-ES'; break;
          case 'fr': utter.lang = 'fr-FR'; break;
          case 'de': utter.lang = 'de-DE'; break;
          case 'it': utter.lang = 'it-IT'; break;
          case 'pt': utter.lang = 'pt-BR'; break;
          case 'ru': utter.lang = 'ru-RU'; break;
          case 'zh': utter.lang = 'zh-CN'; break;
          case 'ja': utter.lang = 'ja-JP'; break;
          case 'ko': utter.lang = 'ko-KR'; break;
          default: utter.lang = 'en-US';
        }
        
        // Apply settings
        utter.volume = currentVolume;
        utter.rate = 0.9;
        utter.pitch = currentPitch;
        
        // Add event listeners for error handling
        utter.onerror = function(event) {
          console.error('Speech synthesis error:', event);
          showNotification('Error', 'Could not speak. Try adjusting speech settings.');
        };
        
        synth.speak(utter);
      }
  
      // Visual + audio effect
      function trigger() {
        // Add the 'show' class to make the word visible with animation
        word.classList.add('show');
        
        // Haptic feedback on supported devices
        if (navigator.vibrate && window.innerWidth <= 768) {
          navigator.vibrate([50, 30, 100]);
        }
        
        // Speak the rejection after the configured delay
        setTimeout(() => {
          speakNo();
        }, currentDelay);
        
        // Remove the 'show' class after animation completes
        setTimeout(() => {
          word.classList.remove('show');
        }, 800);
        
        // Update rejection count and stats
        rejectionCount++;
        updateStats();
      }
  
      // Detection loop
      function loop() {
        if (!isDetectorActive) return;
        
        requestAnimationFrame(loop);
        analyser.getByteTimeDomainData(data);
  
        /* Advanced RMS calculation with smoothing */
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        
        // Update volume indicator
        const volumePercent = Math.min(100, rms * 2000);
        volumeBar.style.width = `${volumePercent}%`;
        volumeValue.textContent = `${Math.round(volumePercent)}%`;
        
        // Show volume value when it exceeds a certain threshold
        if (volumePercent > 10) {
          volumeValue.classList.add('show');
        } else {
          volumeValue.classList.remove('show');
        }
        
        // Check if sound is above threshold
        if (rms > currentThreshold && !gate) {
          trigger();
          gate = true;
          
          // Reset gate after delay proportional to rejection delay
          setTimeout(() => gate = false, 800 + currentDelay);
        }
      }
      
      // Start the detection loop
      loop();
    }
    
    // Manual trigger for testing and demo
    function manualTrigger() {
      // Don't trigger if settings panel is open
      if (settingsPanel.classList.contains('show')) return;
      
      // Add the 'show' class to make the word visible with animation
      word.classList.add('show');
      
      // Speak the rejection
      const currentLang = languageSelect.value;
      const text = translations[currentLang].word;
      const utter = new SpeechSynthesisUtterance(text);
      
      // Set language based on current selection
      switch(currentLang) {
        case 'en': utter.lang = 'en-US'; break;
        case 'es': utter.lang = 'es-ES'; break;
        case 'fr': utter.lang = 'fr-FR'; break;
        case 'de': utter.lang = 'de-DE'; break;
        case 'it': utter.lang = 'it-IT'; break;
        case 'pt': utter.lang = 'pt-BR'; break;
        case 'ru': utter.lang = 'ru-RU'; break;
        case 'zh': utter.lang = 'zh-CN'; break;
        case 'ja': utter.lang = 'ja-JP'; break;
        case 'ko': utter.lang = 'ko-KR'; break;
        default: utter.lang = 'en-US';
      }
      
      // Apply settings
      utter.volume = currentVolume;
      utter.rate = 0.9;
      utter.pitch = currentPitch;
      
      synth.speak(utter);
      
      // Haptic feedback on supported devices
      if (navigator.vibrate && window.innerWidth <= 768) {
        navigator.vibrate([50, 30, 100]);
      }
      
      // Remove the 'show' class after animation completes
      setTimeout(() => {
        word.classList.remove('show');
      }, 800);
      
      // Update rejection count and stats
      rejectionCount++;
      const statNumbers = document.querySelectorAll('.stat-number');
      if (statNumbers[0]) {
        statNumbers[0].textContent = (2500000 + rejectionCount).toLocaleString() + '+';
      }
    }
    
    // Start button event
    startButton.addEventListener('click', startDetector);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!enableShortcuts) return;
      
      // Space key to trigger manually
      if (e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (!e.target.matches('input, textarea, select, button')) {
          e.preventDefault();
          manualTrigger();
        }
      }
      
      // 'S' key to start/stop detector
      if (e.code === 'KeyS' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (!e.target.matches('input, textarea, select, button')) {
          e.preventDefault();
          toggleDetector();
        }
      }
      
      // 'Escape' key to close settings panel
      if (e.code === 'Escape') {
        if (settingsPanel.classList.contains('show')) {
          settingsPanel.classList.remove('show');
          saveSettings();
        }
      }
    });
    
    // Scroll event to show/hide floating button
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!isDetectorActive) return;
      
      if (!isScrolling) {
        floatingStartButton.classList.add('show');
        isScrolling = true;
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (window.scrollY <= 100) {
          floatingStartButton.classList.remove('show');
        }
      }, 1000);
    });
    
    // Event listener for word container to enable manual trigger on mobile
    document.getElementById('word-container').addEventListener('click', () => {
      if (!isDetectorActive) {
        startDetector();
      } else {
        manualTrigger();
      }
    });
    
    // Register service worker for PWA offline functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').then(registration => {
          console.log('ServiceWorker registration successful');
        }).catch(error => {
          console.log('ServiceWorker registration failed:', error);
          
          // Create and install a comprehensive service worker if none exists
          createServiceWorker();
        });
      });
    }
    
    // Create and install a comprehensive service worker if none exists
    function createServiceWorker() {
      if (!('serviceWorker' in navigator)) return;
      
      const swContent = `
        // Advanced Service Worker for PWA
        const CACHE_NAME = 'no-detector-v3';
        const ASSETS = [
          './',
          './index.html',
          './styles.css',
          './script.js',
          'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&family=Montserrat:wght@500;700;900&display=swap'
        ];
        
        // Install event
        self.addEventListener('install', event => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS);
              })
              .then(() => self.skipWaiting())
          );
        });
        
        // Activate event
        self.addEventListener('activate', event => {
          const cacheWhitelist = [CACHE_NAME];
          event.waitUntil(
            caches.keys().then(cacheNames => {
              return Promise.all(
                cacheNames.map(cacheName => {
                  if (cacheWhitelist.indexOf(cacheName) === -1) {
                    // Delete old caches
                    return caches.delete(cacheName);
                  }
                })
              );
            }).then(() => self.clients.claim())
          );
        });
        
        // Fetch event with improved network-first strategy
        self.addEventListener('fetch', event => {
          // Skip cross-origin requests
          if (!event.request.url.startsWith(self.location.origin) && 
              !event.request.url.includes('fonts.googleapis.com')) {
            return;
          }
          
          event.respondWith(
            // Try network first
            fetch(event.request)
              .then(response => {
                // Clone the response to store in cache
                const responseToCache = response.clone();
                
                // Only cache valid responses
                if (response.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
                }
                
                return response;
              })
              .catch(() => {
                // If network fails, try cache
                return caches.match(event.request)
                  .then(cachedResponse => {
                    if (cachedResponse) {
                      return cachedResponse;
                    }
                    
                    // If both network and cache fail, show fallback for HTML requests
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return caches.match('./');
                    }
                  });
              })
          );
        });
        
        // Handle push notifications
        self.addEventListener('push', event => {
          const title = 'NO Detector';
          const options = {
            body: event.data ? event.data.text() : 'Someone needs a rejection!',
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Ccircle cx="96" cy="96" r="96" fill="%23000"%3E%3C/circle%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="80" fill="%23ff0033"%3ENO%3C/text%3E%3C/svg%3E',
            badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Ccircle cx="96" cy="96" r="96" fill="%23000"%3E%3C/circle%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="80" fill="%23ff0033"%3EN%3C/text%3E%3C/svg%3E',
            vibrate: [200, 100, 200]
          };
          
          event.waitUntil(self.registration.showNotification(title, options));
        });
        
        // Notification click event
        self.addEventListener('notificationclick', event => {
          event.notification.close();
          event.waitUntil(
            clients.matchAll({type: 'window'})
              .then(clientList => {
                // If a window is already open, focus it
                for (const client of clientList) {
                  if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                  }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                  return clients.openWindow('/');
                }
              })
          );
        });
        
        // Background sync for offline usage
        self.addEventListener('sync', event => {
          if (event.tag === 'record-rejection') {
            event.waitUntil(syncRejectionData());
          }
        });
        
        // Function to sync rejection data when back online
        async function syncRejectionData() {
          try {
            // This would normally send data to a server
            console.log('Syncing rejection data');
            
            // For this demo, we just show a notification
            self.registration.showNotification('NO Detector', {
              body: 'Your rejection stats have been synced!',
              icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Ccircle cx="96" cy="96" r="96" fill="%23000"%3E%3C/circle%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="80" fill="%23ff0033"%3ENO%3C/text%3E%3C/svg%3E'
            });
          } catch (err) {
            console.error('Sync failed:', err);
          }
        }
      `;
      
      const swBlob = new Blob([swContent], {type: 'application/javascript'});
      const swURL = URL.createObjectURL(swBlob);
      
      navigator.serviceWorker.register(swURL)
        .then(reg => console.log('Fallback service worker registered'))
        .catch(err => console.error('Fallback service worker registration failed', err));
    }
    
    // Intersection Observer for lazy loading and animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all cards and features for animations
    document.querySelectorAll('.use-case-card, .feature-item, .stat-card').forEach(item => {
      observer.observe(item);
    });
    
    // Check for device capabilities and enhance user experience
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // App is installed - adjust UI for installed experience
      document.querySelector('.install-prompt').style.display = 'none';
      showNotification('App Mode', 'Running as installed application', 2000);
    }
    
    // Check if device supports speech synthesis
    if (!window.speechSynthesis) {
      showNotification('Warning', 'Your browser does not support speech synthesis. Some features may not work.', 5000);
    }
    
    // Add double-tap functionality for quick rejection on touch devices
    if ('ontouchstart' in window) {
      let lastTap = 0;
      document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
          // Double tap detected
          if (isDetectorActive) {
            manualTrigger();
          }
        }
        
        lastTap = currentTime;
      });
    }
  });
  
  // Service Worker for offline functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
    });
  }

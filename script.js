// Eunoia Wellness App - Main JavaScript File

// Global state management
const AppState = {
    currentPage: 'home',
    journalEntries: [],
    currentPromptIndex: 0,
    activityTimer: null,
    detoxTimer: null,
    selectedMood: null,
    detoxDuration: 0,
    detoxTimeRemaining: 0,
    activityTimeRemaining: 300, // 5 minutes default
    isDetoxRunning: false,
    isActivityTimerRunning: false
};

// Journal prompts array
const journalPrompts = [
    "What are three things you're grateful for today?",
    "Describe a moment today when you felt truly present.",
    "What emotion are you experiencing right now, and where do you feel it in your body?",
    "If you could send a message to your past self this morning, what would it be?",
    "What's one small act of kindness you witnessed or performed today?",
    "How did you take care of yourself today?",
    "What thoughts are you ready to let go of?",
    "Describe your ideal peaceful moment.",
    "What challenge today helped you grow?",
    "How do you want to feel tomorrow, and what can you do to support that?",
    "What made you smile today?",
    "If your feelings were weather, what would today's forecast be?",
    "What would you like to forgive yourself for?",
    "Describe a place where you feel completely at peace.",
    "What's one thing you learned about yourself this week?",
    "How did you show compassion to yourself or others today?",
    "What are you curious about right now?",
    "If you could plant a garden of thoughts, what would you grow?",
    "What does self-love look like for you today?",
    "How do you want to end this day?"
];

// Activity suggestions array
const activitySuggestions = [
    {
        activity: "Take a 10-minute mindful walk",
        description: "Step outside and focus on your breathing and surroundings",
        duration: 10,
        icon: "👣"
    },
    {
        activity: "Call a friend or family member",
        description: "Reach out to someone you care about and have a meaningful conversation",
        duration: 15,
        icon: "📞"
    },
    {
        activity: "Write a handwritten letter",
        description: "Express your thoughts on paper to someone special",
        duration: 20,
        icon: "✍️"
    },
    {
        activity: "Do 5 gentle yoga poses",
        description: "Stretch your body and calm your mind with simple poses",
        duration: 10,
        icon: "🧘"
    },
    {
        activity: "Practice deep breathing for 5 minutes",
        description: "Focus on slow, intentional breaths to center yourself",
        duration: 5,
        icon: "🫁"
    },
    {
        activity: "Organize a small space",
        description: "Tidy up your desk, a drawer, or a corner of your room",
        duration: 15,
        icon: "🏠"
    },
    {
        activity: "Read a few pages of a book",
        description: "Escape into a good story or learn something new",
        duration: 15,
        icon: "📖"
    },
    {
        activity: "Make a warm cup of tea",
        description: "Prepare and mindfully enjoy a soothing beverage",
        duration: 10,
        icon: "🍵"
    },
    {
        activity: "Draw or sketch something you see",
        description: "Express creativity by drawing your surroundings",
        duration: 20,
        icon: "🎨"
    },
    {
        activity: "Listen to your favorite music",
        description: "Put on headphones and get lost in melodies that move you",
        duration: 15,
        icon: "🎵"
    },
    {
        activity: "Water your plants or garden",
        description: "Connect with nature by caring for growing things",
        duration: 10,
        icon: "🌱"
    },
    {
        activity: "Practice gratitude meditation",
        description: "Spend time reflecting on things you're thankful for",
        duration: 10,
        icon: "🙏"
    }
];

// Music tracks for different moods
const musicTracks = {
    happy: {
        title: "Uplifting Ambient",
        description: "Bright, energizing sounds to match your positive mood",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder - replace with actual audio
    },
    sad: {
        title: "Gentle Comfort",
        description: "Soft, comforting melodies to support you through difficult feelings",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder - replace with actual audio
    },
    anxious: {
        title: "Calming Waves",
        description: "Peaceful sounds to help ease anxiety and promote relaxation",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder - replace with actual audio
    },
    tired: {
        title: "Restorative Rest",
        description: "Gentle sounds to help you recharge and find peace",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder - replace with actual audio
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadJournalEntries();
    setupEventListeners();
    
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Initialize application
function initializeApp() {
    console.log('Eunoia Wellness App initialized');
    
    // Load saved state from localStorage
    const savedEntries = localStorage.getItem('eunoia-journal-entries');
    if (savedEntries) {
        AppState.journalEntries = JSON.parse(savedEntries);
    }
    
    const savedPromptIndex = localStorage.getItem('eunoia-prompt-index');
    if (savedPromptIndex) {
        AppState.currentPromptIndex = parseInt(savedPromptIndex);
    }
    
    // Show initial page
    navigateTo('home');
}

// Navigation function
function navigateTo(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageId;
        
        // Page-specific initialization
        switch(pageId) {
            case 'journal':
                initializeJournalPage();
                break;
            case 'music':
                initializeMusicPage();
                break;
            case 'activities':
                initializeActivitiesPage();
                break;
            case 'detox':
                initializeDetoxPage();
                break;
        }
        
        // Update Feather icons for the new page
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Journal page events
    const newPromptBtn = document.getElementById('new-prompt-btn');
    const saveEntryBtn = document.getElementById('save-entry-btn');
    const viewEntriesBtn = document.getElementById('view-entries-btn');
    
    if (newPromptBtn) newPromptBtn.addEventListener('click', generateNewPrompt);
    if (saveEntryBtn) saveEntryBtn.addEventListener('click', saveJournalEntry);
    if (viewEntriesBtn) viewEntriesBtn.addEventListener('click', toggleEntriesView);
    
    // Music page events
    const moodCards = document.querySelectorAll('.mood-card');
    moodCards.forEach(card => {
        card.addEventListener('click', () => selectMood(card.dataset.mood));
    });
    
    // Activities page events
    const newActivityBtn = document.getElementById('new-activity-btn');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    
    if (newActivityBtn) newActivityBtn.addEventListener('click', generateNewActivity);
    if (startTimerBtn) startTimerBtn.addEventListener('click', startActivityTimer);
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseActivityTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetActivityTimer);
    
    // Detox page events
    const timeOptions = document.querySelectorAll('.time-option');
    const customTimerBtn = document.getElementById('custom-timer-btn');
    const startDetoxBtn = document.getElementById('start-detox-btn');
    const pauseDetoxBtn = document.getElementById('pause-detox-btn');
    const stopDetoxBtn = document.getElementById('stop-detox-btn');
    const newDetoxBtn = document.getElementById('new-detox-btn');
    
    timeOptions.forEach(option => {
        option.addEventListener('click', () => selectDetoxTime(parseInt(option.dataset.minutes)));
    });
    
    if (customTimerBtn) customTimerBtn.addEventListener('click', setCustomDetoxTime);
    if (startDetoxBtn) startDetoxBtn.addEventListener('click', startDetoxTimer);
    if (pauseDetoxBtn) pauseDetoxBtn.addEventListener('click', pauseDetoxTimer);
    if (stopDetoxBtn) stopDetoxBtn.addEventListener('click', stopDetoxTimer);
    if (newDetoxBtn) newDetoxBtn.addEventListener('click', resetDetoxTimer);
}

// ============= JOURNAL FUNCTIONALITY =============

function initializeJournalPage() {
    // Initialize with a default prompt if none is shown
    const promptText = document.getElementById('prompt-text');
    if (promptText && promptText.textContent === 'Click "New Prompt" to get started') {
        generateNewPrompt();
    }
}

function generateNewPrompt() {
    const promptText = document.getElementById('prompt-text');
    if (!promptText) return;
    
    // Get a random prompt
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    AppState.currentPromptIndex = randomIndex;
    
    // Update the display
    promptText.textContent = journalPrompts[randomIndex];
    
    // Clear the text area
    const journalEntry = document.getElementById('journal-entry');
    if (journalEntry) {
        journalEntry.value = '';
    }
    
    // Save the current prompt index
    localStorage.setItem('eunoia-prompt-index', AppState.currentPromptIndex.toString());
}

function saveJournalEntry() {
    const journalEntry = document.getElementById('journal-entry');
    const promptText = document.getElementById('prompt-text');
    
    if (!journalEntry || !promptText) return;
    
    const entryText = journalEntry.value.trim();
    if (!entryText) {
        alert('Please write something in your journal entry before saving.');
        return;
    }
    
    // Create new entry object
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        prompt: promptText.textContent,
        text: entryText
    };
    
    // Add to entries array
    AppState.journalEntries.unshift(newEntry);
    
    // Save to localStorage
    localStorage.setItem('eunoia-journal-entries', JSON.stringify(AppState.journalEntries));
    
    // Clear the text area
    journalEntry.value = '';
    
    // Show success message
    showNotification('Journal entry saved successfully!', 'success');
    
    // Update entries view if it's currently visible
    const entriesList = document.getElementById('entries-list');
    if (entriesList && !entriesList.classList.contains('hidden')) {
        displayJournalEntries();
    }
}

function toggleEntriesView() {
    const entriesList = document.getElementById('entries-list');
    const viewEntriesBtn = document.getElementById('view-entries-btn');
    
    if (!entriesList || !viewEntriesBtn) return;
    
    if (entriesList.classList.contains('hidden')) {
        entriesList.classList.remove('hidden');
        viewEntriesBtn.textContent = 'Hide Entries';
        displayJournalEntries();
    } else {
        entriesList.classList.add('hidden');
        viewEntriesBtn.textContent = 'View Past Entries';
    }
}

function displayJournalEntries() {
    const entriesContainer = document.getElementById('entries-container');
    if (!entriesContainer) return;
    
    if (AppState.journalEntries.length === 0) {
        entriesContainer.innerHTML = '<p class="text-center">No journal entries yet. Start writing to see your entries here!</p>';
        return;
    }
    
    entriesContainer.innerHTML = AppState.journalEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-date">${entry.date} at ${entry.time}</div>
            <div class="entry-prompt">"${entry.prompt}"</div>
            <div class="entry-text">${entry.text}</div>
        </div>
    `).join('');
}

function loadJournalEntries() {
    const saved = localStorage.getItem('eunoia-journal-entries');
    if (saved) {
        AppState.journalEntries = JSON.parse(saved);
    }
}

// ============= MUSIC FUNCTIONALITY =============

function initializeMusicPage() {
    // Reset music player state
    const musicPlayer = document.getElementById('music-player');
    if (musicPlayer) {
        musicPlayer.classList.add('hidden');
    }
    
    // Clear selected mood
    const moodCards = document.querySelectorAll('.mood-card');
    moodCards.forEach(card => card.classList.remove('selected'));
    AppState.selectedMood = null;
}

function selectMood(mood) {
    AppState.selectedMood = mood;
    
    // Update UI
    const moodCards = document.querySelectorAll('.mood-card');
    moodCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.mood === mood) {
            card.classList.add('selected');
        }
    });
    
    // Show music player
    const musicPlayer = document.getElementById('music-player');
    const currentMood = document.getElementById('current-mood');
    const trackDescription = document.getElementById('track-description');
    const audioSource = document.getElementById('audio-source');
    const audioPlayer = document.getElementById('audio-player');
    
    if (musicPlayer && currentMood && trackDescription && audioSource && audioPlayer) {
        const track = musicTracks[mood];
        
        musicPlayer.classList.remove('hidden');
        currentMood.textContent = `Playing for your ${mood} mood`;
        trackDescription.textContent = track.description;
        
        // Note: In a real app, you would use actual audio files
        // For now, we'll use a placeholder or Web Audio API generated tones
        generateMoodAudio(mood);
    }
}

function generateMoodAudio(mood) {
    // Since we can't include actual audio files, we'll create a simple Web Audio API tone
    // In a real application, you would load actual audio files based on the mood
    
    const audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) return;
    
    // For demonstration, we'll create different frequencies for different moods
    const frequencies = {
        happy: 523.25, // C5
        sad: 261.63,   // C4
        anxious: 349.23, // F4
        tired: 196.00   // G3
    };
    
    try {
        // Create a simple tone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[mood], audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        // Play a gentle tone for 2 seconds
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
        
        showNotification(`Playing calming sounds for your ${mood} mood`, 'info');
        
    } catch (error) {
        console.log('Web Audio API not supported, showing placeholder message');
        showNotification(`Audio would play here for your ${mood} mood in a real deployment`, 'info');
    }
    
    // Hide the HTML5 audio player since we're using Web Audio API
    audioPlayer.style.display = 'none';
    
    // Show a message about the audio
    const musicPlayer = document.getElementById('music-player');
    if (musicPlayer) {
        const existingMessage = musicPlayer.querySelector('.audio-message');
        if (!existingMessage) {
            const audioMessage = document.createElement('div');
            audioMessage.className = 'audio-message';
            audioMessage.innerHTML = `
                <p style="margin-top: 1rem; padding: 1rem; background: hsl(var(--surface-alt)); border-radius: var(--radius-md); color: hsl(var(--text-secondary));">
                    🎵 Calming ${mood} sounds are now playing through your device's audio system
                </p>
            `;
            musicPlayer.appendChild(audioMessage);
        }
    }
}

// ============= ACTIVITIES FUNCTIONALITY =============

function initializeActivitiesPage() {
    // Reset activity timer
    resetActivityTimer();
}

function generateNewActivity() {
    const activityText = document.getElementById('activity-text');
    const activityIcon = document.querySelector('#activity-card .activity-icon i');
    const activityTimer = document.getElementById('activity-timer');
    
    if (!activityText) return;
    
    // Get random activity
    const randomIndex = Math.floor(Math.random() * activitySuggestions.length);
    const activity = activitySuggestions[randomIndex];
    
    // Update display
    activityText.innerHTML = `
        <strong>${activity.activity}</strong><br>
        <span style="color: hsl(var(--text-secondary)); font-size: var(--font-size-sm);">
            ${activity.description}
        </span>
    `;
    
    // Update icon (using a cycle of available feather icons)
    const icons = ['smile', 'heart', 'sun', 'star', 'zap', 'coffee', 'book', 'music'];
    const iconName = icons[randomIndex % icons.length];
    
    if (activityIcon) {
        activityIcon.setAttribute('data-feather', iconName);
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    // Set timer duration and show timer
    AppState.activityTimeRemaining = activity.duration * 60; // Convert to seconds
    updateActivityTimerDisplay();
    
    if (activityTimer) {
        activityTimer.classList.remove('hidden');
    }
    
    showNotification('New activity suggested! Use the timer if helpful.', 'success');
}

function startActivityTimer() {
    if (AppState.isActivityTimerRunning) return;
    
    AppState.isActivityTimerRunning = true;
    
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');
    
    if (startBtn) startBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.remove('hidden');
    
    AppState.activityTimer = setInterval(() => {
        AppState.activityTimeRemaining--;
        updateActivityTimerDisplay();
        
        if (AppState.activityTimeRemaining <= 0) {
            clearInterval(AppState.activityTimer);
            AppState.isActivityTimerRunning = false;
            
            if (startBtn) startBtn.classList.remove('hidden');
            if (pauseBtn) pauseBtn.classList.add('hidden');
            
            showNotification('Activity timer complete! Great job taking time for yourself.', 'success');
        }
    }, 1000);
}

function pauseActivityTimer() {
    if (!AppState.isActivityTimerRunning) return;
    
    AppState.isActivityTimerRunning = false;
    clearInterval(AppState.activityTimer);
    
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');
    
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
}

function resetActivityTimer() {
    AppState.isActivityTimerRunning = false;
    clearInterval(AppState.activityTimer);
    AppState.activityTimeRemaining = 300; // 5 minutes default
    
    updateActivityTimerDisplay();
    
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');
    const activityTimer = document.getElementById('activity-timer');
    
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
    if (activityTimer) activityTimer.classList.add('hidden');
}

function updateActivityTimerDisplay() {
    const minutes = Math.floor(AppState.activityTimeRemaining / 60);
    const seconds = AppState.activityTimeRemaining % 60;
    
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    
    if (timerMinutes) timerMinutes.textContent = minutes.toString().padStart(2, '0');
    if (timerSeconds) timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

// ============= DETOX FUNCTIONALITY =============

function initializeDetoxPage() {
    resetDetoxTimer();
}

function selectDetoxTime(minutes) {
    AppState.detoxDuration = minutes * 60; // Convert to seconds
    AppState.detoxTimeRemaining = AppState.detoxDuration;
    
    // Update UI
    const timeOptions = document.querySelectorAll('.time-option');
    timeOptions.forEach(option => {
        option.classList.remove('selected');
        if (parseInt(option.dataset.minutes) === minutes) {
            option.classList.add('selected');
        }
    });
    
    // Show timer
    showDetoxTimer();
    updateDetoxTimerDisplay();
}

function setCustomDetoxTime() {
    const customInput = document.getElementById('custom-minutes');
    if (!customInput) return;
    
    const minutes = parseInt(customInput.value);
    if (isNaN(minutes) || minutes < 1 || minutes > 180) {
        alert('Please enter a valid time between 1 and 180 minutes.');
        return;
    }
    
    selectDetoxTime(minutes);
    customInput.value = '';
}

function showDetoxTimer() {
    const timerSetup = document.getElementById('timer-setup');
    const detoxTimer = document.getElementById('detox-timer');
    const detoxComplete = document.getElementById('detox-complete');
    
    if (timerSetup) timerSetup.classList.add('hidden');
    if (detoxTimer) detoxTimer.classList.remove('hidden');
    if (detoxComplete) detoxComplete.classList.add('hidden');
}

function startDetoxTimer() {
    if (AppState.isDetoxRunning) return;
    
    AppState.isDetoxRunning = true;
    
    const startBtn = document.getElementById('start-detox-btn');
    const pauseBtn = document.getElementById('pause-detox-btn');
    
    if (startBtn) startBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.remove('hidden');
    
    AppState.detoxTimer = setInterval(() => {
        AppState.detoxTimeRemaining--;
        updateDetoxTimerDisplay();
        
        if (AppState.detoxTimeRemaining <= 0) {
            completeDetoxTimer();
        }
    }, 1000);
    
    showNotification('Digital detox started! Enjoy your time away from screens.', 'success');
}

function pauseDetoxTimer() {
    if (!AppState.isDetoxRunning) return;
    
    AppState.isDetoxRunning = false;
    clearInterval(AppState.detoxTimer);
    
    const startBtn = document.getElementById('start-detox-btn');
    const pauseBtn = document.getElementById('pause-detox-btn');
    
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
}

function stopDetoxTimer() {
    AppState.isDetoxRunning = false;
    clearInterval(AppState.detoxTimer);
    
    showDetoxComplete();
}

function completeDetoxTimer() {
    AppState.isDetoxRunning = false;
    clearInterval(AppState.detoxTimer);
    
    showDetoxComplete();
    showNotification('Congratulations! You completed your digital detox.', 'success');
}

function showDetoxComplete() {
    const detoxTimer = document.getElementById('detox-timer');
    const detoxComplete = document.getElementById('detox-complete');
    
    if (detoxTimer) detoxTimer.classList.add('hidden');
    if (detoxComplete) detoxComplete.classList.remove('hidden');
}

function resetDetoxTimer() {
    AppState.isDetoxRunning = false;
    clearInterval(AppState.detoxTimer);
    AppState.detoxDuration = 0;
    AppState.detoxTimeRemaining = 0;
    
    const timerSetup = document.getElementById('timer-setup');
    const detoxTimer = document.getElementById('detox-timer');
    const detoxComplete = document.getElementById('detox-complete');
    
    if (timerSetup) timerSetup.classList.remove('hidden');
    if (detoxTimer) detoxTimer.classList.add('hidden');
    if (detoxComplete) detoxComplete.classList.add('hidden');
    
    // Clear selections
    const timeOptions = document.querySelectorAll('.time-option');
    timeOptions.forEach(option => option.classList.remove('selected'));
    
    const startBtn = document.getElementById('start-detox-btn');
    const pauseBtn = document.getElementById('pause-detox-btn');
    
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
}

function updateDetoxTimerDisplay() {
    const minutes = Math.floor(AppState.detoxTimeRemaining / 60);
    const seconds = AppState.detoxTimeRemaining % 60;
    
    const detoxMinutes = document.getElementById('detox-minutes');
    const detoxSeconds = document.getElementById('detox-seconds');
    
    if (detoxMinutes) detoxMinutes.textContent = minutes.toString().padStart(2, '0');
    if (detoxSeconds) detoxSeconds.textContent = seconds.toString().padStart(2, '0');
}

// ============= UTILITY FUNCTIONS =============

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'hsl(var(--success))' : 
                    type === 'error' ? 'hsl(var(--error))' : 
                    'hsl(var(--primary))'};
        color: white;
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-width: 300px;
        font-size: var(--font-size-sm);
        transform: translateX(100%);
        transition: transform var(--transition-base);
    `;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 200);
    }, 3000);
}

// Handle page visibility for timers
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden - you might want to pause timers or save state
        console.log('Page hidden - timers continue running');
    } else {
        // Page is visible again
        console.log('Page visible again');
    }
});

// Clean up timers when page is unloaded
window.addEventListener('beforeunload', function() {
    clearInterval(AppState.activityTimer);
    clearInterval(AppState.detoxTimer);
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateTo,
        generateNewPrompt,
        saveJournalEntry,
        selectMood,
        generateNewActivity,
        startActivityTimer,
        startDetoxTimer,
        AppState
    };
}

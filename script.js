document.addEventListener('DOMContentLoaded', function() {
    const welcomeModal = document.getElementById('welcomeModal');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const participantForm = document.getElementById('participantForm');
    const participantNameDisplay = document.getElementById('participantNameDisplay');
    const programNameDisplay = document.getElementById('programNameDisplay');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const container = document.querySelector('.container');
    const countdownMessage = document.getElementById('countdownMessage');
    const thanksMessage = document.getElementById('thanksMessage');

    // Définir la date et l'heure de l'événement
    const EVENT_DATE = new Date(2025, 1, 14); // 14 février 2025 (mois commence à 0)
    const EVENT_END_HOUR = 18;
    const EVENT_START_HOUR = 8;

    function isEventDay() {
        const now = new Date();
        return now.getFullYear() === EVENT_DATE.getFullYear() &&
               now.getMonth() === EVENT_DATE.getMonth() &&
               now.getDate() === EVENT_DATE.getDate();
    }

    function isPastEndTime() {
        if (!isEventDay()) return false;
        const now = new Date();
        const hours = now.getHours();
        return hours >= EVENT_END_HOUR;
    }

    function isBeforeEvent() {
        const now = new Date();
        if (now < EVENT_DATE) return true; // Si on est avant le 14 février
        if (!isEventDay()) return false; // Si ce n'est pas le jour de l'événement
        return now.getHours() < EVENT_START_HOUR; // Si c'est avant 8h le jour même
    }

    function updateCountdown() {
        const now = new Date();
        const difference = EVENT_DATE - now;

        if (difference <= 0) {
            return;
        }

        // Calculer les jours, heures, minutes et secondes
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Mettre à jour l'affichage
        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    function showCountdown() {
        welcomeModal.style.display = 'none';
        container.style.display = 'none';
        loadingOverlay.style.display = 'none';
        thankYouMessage.style.display = 'block';
        countdownMessage.style.display = 'block';
        thanksMessage.style.display = 'none';
        
        // Démarrer le countdown
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    function showThanks() {
        const storedInfo = localStorage.getItem('visitorInfo');
        const visitorInfo = storedInfo ? JSON.parse(storedInfo) : null;
        const participantName = visitorInfo ? visitorInfo.name : localStorage.getItem('participantName');
        
        if (participantName) {
            participantNameDisplay.textContent = participantName;
        }
        
        welcomeModal.style.display = 'none';
        container.style.display = 'none';
        loadingOverlay.style.display = 'none';
        thankYouMessage.style.display = 'block';
        countdownMessage.style.display = 'none';
        thanksMessage.style.display = 'block';
    }

    // Vérifier l'état initial
    if (isBeforeEvent()) {
        showCountdown();
        return;
    }

    if (isPastEndTime()) {
        showThanks();
        return;
    }

    // Check if user has already visited
    const storedVisitor = localStorage.getItem('visitorInfo');
    if (storedVisitor) {
        const visitorInfo = JSON.parse(storedVisitor);
        const now = new Date();
        const lastVisit = new Date(visitorInfo.timestamp);
        if (lastVisit.toDateString() === now.toDateString() && !isPastEndTime() && !isBeforeEvent()) {
            welcomeModal.style.display = 'none';
            container.style.display = 'block';
            programNameDisplay.textContent = visitorInfo.name;
            return;
        }
    }

    // Initially hide the container
    container.style.display = 'none';

    // Show welcome modal on page load if during event time
    if (!isPastEndTime() && !isBeforeEvent()) {
        welcomeModal.style.display = 'flex';
    }

    // Handle form submission
    participantForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isBeforeEvent()) {
            showCountdown();
            return;
        }

        if (isPastEndTime()) {
            const participantName = document.getElementById('participantName').value;
            localStorage.setItem('participantName', participantName);
            showThanks();
            return;
        }

        const participantName = document.getElementById('participantName').value;

        // Get IP address
        try {
            const response = await fetch('getip.php');
            const data = await response.json();
            
            // Store visitor info
            const visitorInfo = {
                name: participantName,
                ip: data.ip,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('visitorInfo', JSON.stringify(visitorInfo));
            localStorage.setItem('participantName', participantName);
        } catch (error) {
            console.error('Error getting IP:', error);
            localStorage.setItem('participantName', participantName);
        }
        
        welcomeModal.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        setTimeout(() => {
            if (isPastEndTime()) {
                showThanks();
            } else {
                loadingOverlay.style.display = 'none';
                container.style.display = 'block';
                programNameDisplay.textContent = participantName;
            }
        }, 2000);
    });

    // Check time every minute
    function checkTimeAndShowThankYou() {
        if (isBeforeEvent()) {
            showCountdown();
            return;
        }

        if (isPastEndTime()) {
            showThanks();
        }
    }

    // Check time every minute
    checkTimeAndShowThankYou();
    setInterval(checkTimeAndShowThankYou, 60000);

    // Footer blur effect on scroll
    let lastScrollTop = 0;
    const footer = document.querySelector('.main-footer');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const blurValue = Math.min(20, Math.abs(scrollTop - lastScrollTop) / 2);
        
        footer.style.backdropFilter = `blur(${blurValue}px)`;
        footer.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        
        lastScrollTop = scrollTop;
        
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
            footer.style.backdropFilter = 'blur(10px)';
            footer.style.webkitBackdropFilter = 'blur(10px)';
        }, 150);
    }, { passive: true });
});

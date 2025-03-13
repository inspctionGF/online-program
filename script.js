document.addEventListener('DOMContentLoaded', async function() {
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
    const EVENT_DATE = new Date(2025, 2, 17); // Mars est 2 en JavaScript (0-indexé)
    const EVENT_END_HOUR = 14;
    const EVENT_START_HOUR = 8;

    // Vérifier l'IP au démarrage
    let currentIP = '';
    try {
        const response = await fetch('getip.php');
        const data = await response.json();
        currentIP = data.ip;
        console.log('IP actuelle:', currentIP);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'IP:', error);
    }

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
        console.log('Vérification isBeforeEvent - Date actuelle:', now);
        console.log('Vérification isBeforeEvent - Date événement:', EVENT_DATE);
        console.log('Vérification isBeforeEvent - Avant événement?', now < EVENT_DATE);
        if (now < EVENT_DATE) return true;
        if (!isEventDay()) return false;
        return now.getHours() < EVENT_START_HOUR;
    }

    function getStoredParticipant() {
        const storedData = localStorage.getItem('participant');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                if (data.ip === currentIP) {
                    console.log('Participant trouvé:', data);
                    return data.name;
                }
            } catch (error) {
                console.error('Erreur lors de la lecture des données:', error);
            }
        }
        return null;
    }

    function storeParticipant(name) {
        const data = {
            name: name,
            ip: currentIP,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('participant', JSON.stringify(data));
        console.log('Participant enregistré:', data);
    }

    function updateCountdown() {
        const now = new Date();
        const difference = EVENT_DATE - now;

        console.log('Date actuelle:', now);
        console.log('Date de l\'événement:', EVENT_DATE);
        console.log('Différence en ms:', difference);

        if (difference <= 0) {
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

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
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    function showThanks(participantName) {
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

    // Initialisation
    if (isBeforeEvent()) {
        showCountdown();
        return;
    }

    if (isPastEndTime()) {
        const existingName = getStoredParticipant();
        showThanks(existingName);
        return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingName = getStoredParticipant();
    if (existingName && !isPastEndTime() && !isBeforeEvent()) {
        welcomeModal.style.display = 'none';
        container.style.display = 'block';
        programNameDisplay.textContent = existingName;
        return;
    }

    // Sinon afficher le modal de bienvenue
    container.style.display = 'none';
    if (!isPastEndTime() && !isBeforeEvent()) {
        welcomeModal.style.display = 'flex';
    }

    // Gestion du formulaire
    participantForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isBeforeEvent()) {
            showCountdown();
            return;
        }

        if (isPastEndTime()) {
            const participantName = document.getElementById('participantName').value;
            showThanks(participantName);
            return;
        }

        const participantName = document.getElementById('participantName').value;
        storeParticipant(participantName);
        
        welcomeModal.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        setTimeout(() => {
            if (isPastEndTime()) {
                showThanks(participantName);
            } else {
                loadingOverlay.style.display = 'none';
                container.style.display = 'block';
                programNameDisplay.textContent = participantName;
            }
        }, 2000);
    });

    // Vérification périodique
    function checkTimeAndShowThankYou() {
        if (isBeforeEvent()) {
            showCountdown();
            return;
        }

        if (isPastEndTime()) {
            const existingName = getStoredParticipant();
            showThanks(existingName);
        }
    }

    checkTimeAndShowThankYou();
    setInterval(checkTimeAndShowThankYou, 60000);

    // Footer blur effect
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

document.addEventListener('DOMContentLoaded', function() {
    const welcomeModal = document.getElementById('welcomeModal');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const participantForm = document.getElementById('participantForm');
    const participantNameDisplay = document.getElementById('programNameDisplay');
    const programNameDisplay = document.getElementById('programNameDisplay');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const container = document.querySelector('.container');

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
        if (!isEventDay()) return true;
        const now = new Date();
        const hours = now.getHours();
        return hours >= EVENT_END_HOUR;
    }

    function isBeforeEvent() {
        const now = new Date();
        if (now < EVENT_DATE) return true; // Si on est avant le 14 février
        if (!isEventDay()) return true; // Si ce n'est pas le jour de l'événement
        return now.getHours() < EVENT_START_HOUR; // Si c'est avant 8h le jour même
    }

    // Si nous sommes avant l'événement, afficher un message approprié
    if (isBeforeEvent()) {
        welcomeModal.style.display = 'none';
        container.style.display = 'none';
        loadingOverlay.style.display = 'none';
        thankYouMessage.style.display = 'block';
        document.querySelector('.thank-you-message h2').textContent = "L'événement n'a pas encore commencé";
        document.querySelector('.thank-you-message p').textContent = "La conférence Universitaire débutera le 14 février 2025 à 8h00";
        return;
    }

    // If it's already past end time, show thank you message immediately
    if (isPastEndTime()) {
        const storedInfo = localStorage.getItem('visitorInfo');
        const visitorInfo = storedInfo ? JSON.parse(storedInfo) : null;
        const participantName = visitorInfo ? visitorInfo.name : localStorage.getItem('participantName');
        
        if (participantName) {
            document.querySelector('.thank-you-message h2').textContent = 'Merci d\'avoir été parmi nous!';
            document.querySelector('.thank-you-message p').textContent = `Au revoir ${participantName}, nous espérons vous revoir bientôt`;
        }
        welcomeModal.style.display = 'none';
        container.style.display = 'none';
        loadingOverlay.style.display = 'none';
        thankYouMessage.style.display = 'block';
        return;
    }

    // Check if user has already visited
    const storedVisitor = localStorage.getItem('visitorInfo');
    if (storedVisitor) {
        const visitorInfo = JSON.parse(storedVisitor);
        // If we have stored info, check if it's from the same day
        const lastVisit = new Date(visitorInfo.timestamp);
        const now = new Date();
        if (lastVisit.toDateString() === now.toDateString() && !isPastEndTime() && !isBeforeEvent()) {
            // Same day visit, skip welcome modal
            welcomeModal.style.display = 'none';
            container.style.display = 'block';
            // Display name in program title
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
            return; // Ne rien faire si l'événement n'a pas commencé
        }

        // Check if it's past end time before proceeding
        if (isPastEndTime()) {
            const participantName = document.getElementById('participantName').value;
            participantNameDisplay.textContent = participantName;
            welcomeModal.style.display = 'none';
            thankYouMessage.style.display = 'block';
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
            // Still store the name if IP fetch fails
            localStorage.setItem('participantName', participantName);
        }
        
        // Hide welcome modal and show loading
        welcomeModal.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        // Simulate loading time (2 seconds) then show the program
        setTimeout(() => {
            // Check time again after loading
            if (isPastEndTime()) {
                loadingOverlay.style.display = 'none';
                participantNameDisplay.textContent = participantName;
                thankYouMessage.style.display = 'block';
            } else {
                loadingOverlay.style.display = 'none';
                container.style.display = 'block';
                // Display name in program title
                programNameDisplay.textContent = participantName;
            }
        }, 2000);
    });

    // Check time every minute
    function checkTimeAndShowThankYou() {
        if (isBeforeEvent()) {
            welcomeModal.style.display = 'none';
            container.style.display = 'none';
            loadingOverlay.style.display = 'none';
            thankYouMessage.style.display = 'block';
            document.querySelector('.thank-you-message h2').textContent = "L'événement n'a pas encore commencé";
            document.querySelector('.thank-you-message p').textContent = "La conférence débutera le 14 février 2025 à 8h00";
            return;
        }

        if (isPastEndTime()) {
            const storedInfo = localStorage.getItem('visitorInfo');
            const visitorInfo = storedInfo ? JSON.parse(storedInfo) : null;
            const participantName = visitorInfo ? visitorInfo.name : localStorage.getItem('participantName');

            if (participantName) {
                document.querySelector('.thank-you-message h2').textContent = 'Merci d\'avoir été parmi nous!';
                document.querySelector('.thank-you-message p').textContent = `Au revoir ${participantName}, nous espérons vous revoir bientôt`;
            }
            thankYouMessage.style.display = 'block';
            container.style.display = 'none';
            loadingOverlay.style.display = 'none';
            welcomeModal.style.display = 'none';
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
        
        // Reset blur after scroll stops
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
            footer.style.backdropFilter = 'blur(10px)';
            footer.style.webkitBackdropFilter = 'blur(10px)';
        }, 150);
    }, { passive: true });
});

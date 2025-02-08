document.addEventListener('DOMContentLoaded', function() {
    const welcomeModal = document.getElementById('welcomeModal');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const participantForm = document.getElementById('participantForm');
    const participantNameDisplay = document.getElementById('programNameDisplay');
    const programNameDisplay = document.getElementById('programNameDisplay');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const container = document.querySelector('.container');

    // Check if it's past the end time first
    function isPastEndTime() {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 15; // 3 PM
    }

    // Check if we're approaching end time
    function isApproachingEndTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        return hours === 14 && minutes >= 55; // Start checking 5 minutes before
    }

    // Function to check time and refresh if needed
    function checkTimeAndRefresh() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // If we're approaching end time, check more frequently
        if (isApproachingEndTime()) {
            // Check every 10 seconds when we're close
            setTimeout(checkTimeAndRefresh, 10000);
        } else if (!isPastEndTime()) {
            // Check every minute otherwise
            setTimeout(checkTimeAndRefresh, 60000);
        }

        // If it's exactly 3 PM (15:00:00), refresh the page
        if (hours === 15 && minutes === 0 && seconds === 0) {
            window.location.reload();
        }

        // If we're past end time and not showing thank you message, refresh
        if (isPastEndTime() && thankYouMessage.style.display !== 'block') {
            window.location.reload();
        }
    }

    // Start checking time
    checkTimeAndRefresh();

    // If it's already past end time, show thank you message immediately
    if (isPastEndTime()) {
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
        return; // Stop here, don't proceed with normal program display
    }

    // Check if user has already visited
    const storedVisitor = localStorage.getItem('visitorInfo');
    if (storedVisitor) {
        const visitorInfo = JSON.parse(storedVisitor);
        // If we have stored info, check if it's from the same day
        const lastVisit = new Date(visitorInfo.timestamp);
        const now = new Date();
        if (lastVisit.toDateString() === now.toDateString() && !isPastEndTime()) {
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

    // Show welcome modal on page load if not past end time
    if (!isPastEndTime()) {
        welcomeModal.style.display = 'flex';
    }

    // Handle form submission
    participantForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
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
        if (isPastEndTime()) {
            const storedInfo = localStorage.getItem('visitorInfo');
            const visitorInfo = storedInfo ? JSON.parse(storedInfo) : null;
            const participantName = visitorInfo ? visitorInfo.name : localStorage.getItem('participantName');

            if (participantName) {
                participantNameDisplay.textContent = participantName;
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

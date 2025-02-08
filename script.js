document.addEventListener('DOMContentLoaded', function() {
    const welcomeModal = document.getElementById('welcomeModal');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const participantForm = document.getElementById('participantForm');
    const participantNameDisplay = document.getElementById('participantNameDisplay');
    const headerParticipantName = document.getElementById('headerParticipantName');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const container = document.querySelector('.container');

    // Check if it's after end time first
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 12) { // After end time
        const storedVisitor = localStorage.getItem('visitorInfo');
        if (storedVisitor) {
            const visitorInfo = JSON.parse(storedVisitor);
            participantNameDisplay.textContent = visitorInfo.name;
        }
        thankYouMessage.style.display = 'block';
        container.style.display = 'none';
        welcomeModal.style.display = 'none';
        return;
    }

    // If not after end time, proceed with normal flow
    // Check if user has already visited
    const storedVisitor = localStorage.getItem('visitorInfo');
    if (storedVisitor) {
        const visitorInfo = JSON.parse(storedVisitor);
        // If we have stored info, check if it's from the same day
        const lastVisit = new Date(visitorInfo.timestamp);
        if (lastVisit.toDateString() === now.toDateString()) {
            // Same day visit, skip welcome modal and show name
            welcomeModal.style.display = 'none';
            container.style.display = 'block';
            headerParticipantName.textContent = visitorInfo.name;
            return;
        }
    }

    // Initially hide the container
    container.style.display = 'none';

    // Show welcome modal on page load
    welcomeModal.style.display = 'flex';

    // Handle form submission
    participantForm.addEventListener('submit', async function(e) {
        e.preventDefault();
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
            
            // Update header with participant name
            headerParticipantName.textContent = participantName;
        } catch (error) {
            console.error('Error getting IP:', error);
            // Still store the name if IP fetch fails
            localStorage.setItem('participantName', participantName);
            headerParticipantName.textContent = participantName;
        }
        
        // Hide welcome modal and show loading
        welcomeModal.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        // Simulate loading time (2 seconds) then show the program
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            container.style.display = 'block';
        }, 2000);
    });

    // Check time and show thank you message
    function checkTimeAndShowThankYou() {
        const now = new Date();
        const hours = now.getHours();
        const storedVisitor = localStorage.getItem('visitorInfo');

        if (hours >= 12) { // After end time
            if (storedVisitor) {
                const visitorInfo = JSON.parse(storedVisitor);
                participantNameDisplay.textContent = visitorInfo.name;
            }
            thankYouMessage.style.display = 'block';
            container.style.display = 'none';
            welcomeModal.style.display = 'none';
        }
    }

    // Check time every minute
    setInterval(checkTimeAndShowThankYou, 60000);
});

// Track current level
        let currentLevel = 'A';

        // Function to select proficiency level
        function selectLevel(level) {
            // Remove active class from all buttons
            document.getElementById('btnLevelA').classList.remove('active');
            document.getElementById('btnLevelB').classList.remove('active');
            document.getElementById('btnLevelC').classList.remove('active');
            
            // Add active class to selected button
            document.getElementById('btnLevel' + level).classList.add('active');
            
            // Update current level
            currentLevel = level;
            
            // You can add additional logic here for when level changes
            console.log('Selected level:', level);
        }

        // Function to handle Enter key press in input field
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        // Function to send message
        async function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            const responseArea = document.getElementById('chatbotResponse');
            
            if (message) {
                // Clear the welcome message if it's the first message
                if (responseArea.querySelector('.welcome-message')) {
                    responseArea.innerHTML = '';
                }
                
                // Add user message to chat
                responseArea.innerHTML += `
                    <div style="margin-bottom: 15px;">
                        <strong>Du:</strong> ${message}
                    </div>
                `;
                
                // Clear input and disable it while processing
                input.value = '';
                input.disabled = true;

                try {
                    const aiResponse = await fetch(`http://localhost:3000/${currentLevel}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt: message }),
                    });

                    if (!aiResponse.ok) {
                        throw new Error(`HTTP error! status: ${aiResponse.status}`);
                    }

                    const aiResponseJson = await aiResponse.json();
                    const formattedResponse = marked.parse(aiResponseJson.response);
                    
                    responseArea.innerHTML += `
                        <div style="margin-bottom: 15px; color: #ffa500;">
                            <strong>Tutor:</strong> ${formattedResponse}
                        </div>
                    `;
                } catch (error) {
                    console.error('Error:', error);
                    responseArea.innerHTML += `
                        <div style="margin-bottom: 15px; color: #ff0000;">
                            <strong>System:</strong> Es tut mir leid, aber ich konnte keine Verbindung zum Server herstellen. Bitte versuchen Sie es später erneut.
                        </div>
                    `;
                } finally {
                    // Re-enable input
                    input.disabled = false;
                    input.focus();
                    
                    // Scroll to bottom
                    responseArea.scrollTop = responseArea.scrollHeight;
                }
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set focus on input field
            document.getElementById('userInput').focus();
        });
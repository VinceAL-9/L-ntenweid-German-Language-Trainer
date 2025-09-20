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

        // Function to send message (to be implemented with chatbot logic)
        function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            
            if (message) {
                // Clear the welcome message if it's the first message
                const responseArea = document.getElementById('chatbotResponse');
                if (responseArea.querySelector('.welcome-message')) {
                    responseArea.innerHTML = '';
                }
                
                // Add user message to chat (you can style this differently)
                responseArea.innerHTML += `
                    <div style="margin-bottom: 15px;">
                        <strong>Du:</strong> ${message}
                    </div>
                `;
                
                // Clear input
                input.value = '';
                
                // Here you would typically send the message to your chatbot backend
                // and display the response
                responseArea.innerHTML += `
                        <div style="margin-bottom: 15px; color: #ffa500;">
                            <strong>Tutor:</strong> [Chatbot response for level ${currentLevel} will appear here]
                        </div>
                    `;
                // Scroll to bottom
                responseArea.scrollTop = responseArea.scrollHeight;
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set focus on input field
            document.getElementById('userInput').focus();
        });
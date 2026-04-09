// 1. When the user clicks the Submit button on the form...
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page from refreshing

    // 2. Gather all the answers from the dropdowns
    const myProfile = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        sleep_schedule: document.getElementById('sleep_schedule').value,
        cleanliness: document.getElementById('cleanliness').value,
        sociability: document.getElementById('sociability').value,
    };
    
    // Show a loading message
    document.getElementById('formMessage').textContent = 'Loading...';

    // 3. Send the answers to our Node.js Backend to save in MySQL
    await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(myProfile)
    });

    // 4. Go fetch all users from the database to find our matches
    findAndDisplayMatches(myProfile);
});

// 5. The Magic Matching Function
async function findAndDisplayMatches(myProfile) {
    // Grab everyone from the database
    const response = await fetch('/api/matches');
    const allUsers = await response.json();

    // Calculate match scores
    const matches = [];

    for (let user of allUsers) {
        // Skip comparing to ourself!
        if (user.email === myProfile.email) continue; 

        // Start with a zero score
        let score = 0; 

        // Award points if preferences match
        if (user.sleep_schedule === myProfile.sleep_schedule) { score += 33; }
        if (user.cleanliness === myProfile.cleanliness)       { score += 33; }
        if (user.sociability === myProfile.sociability)       { score += 34; }

        // Add this user and their final score to our array list
        user.score = score;
        matches.push(user);
    }

    // Sort the highest scores to the top of the list
    matches.sort((a, b) => b.score - a.score);

    // Call the function to draw them on the screen
    drawMatchesOnScreen(matches);
}

// 6. Draw the HTML boxes on screen
function drawMatchesOnScreen(matches) {
    // Hide the form, and show the matches section
    document.getElementById('registrationCard').classList.add('hidden');
    document.getElementById('matchesSection').classList.remove('hidden');

    const container = document.getElementById('matchesContainer');
    container.innerHTML = ''; // Clear out old results

    // Generate a card for every matched person
    for (let match of matches) {
        const cardBox = document.createElement('div');
        cardBox.className = 'match-card';
        cardBox.innerHTML = `
            <div class="match-info">
                <h3>${match.name}</h3>
                <p>Sleeps: ${match.sleep_schedule} | Clean: ${match.cleanliness} | Social: ${match.sociability}</p>
            </div>
            <div class="match-score">
                ${match.score}% Score
            </div>
        `;
        container.appendChild(cardBox);
    }
}

// 7. "Start Over" button brings back the form
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('matchesSection').classList.add('hidden');
    document.getElementById('registrationCard').classList.remove('hidden');
    document.getElementById('registrationForm').reset();
    document.getElementById('formMessage').textContent = '';
});

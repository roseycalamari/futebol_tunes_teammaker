document.addEventListener('DOMContentLoaded', function() {
    const playersContainer = document.getElementById('playersInputs');
    const generateButton = document.getElementById('generateTeams');
    const playersSection = document.querySelector('.players-container');
    const teamsContainer = document.querySelector('.teams-container');
    const REQUIRED_PLAYERS = 15; // Exactly 15 players needed
    const PLAYERS_PER_TEAM = 5; // 5 players per team

    // Initially hide teams container
    teamsContainer.style.display = 'none';

    function createPlayerInputs() {
        for (let i = 0; i < REQUIRED_PLAYERS; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <input type="text" placeholder="Nome do Jogador ${i + 1} *" class="player-name" required>
                <div class="skill-selector">
                    <label>Nível:</label>
                    <select class="skill-level">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
            `;
            playersContainer.appendChild(playerDiv);
        }
    }

    function calculateTeamSkill(team) {
        return team.reduce((sum, player) => sum + player.skill, 0);
    }

    function balanceTeams(players) {
        if (players.length !== REQUIRED_PLAYERS) {
            throw new Error(`Precisamente ${REQUIRED_PLAYERS} jogadores são necessários`);
        }

        // Sort players by skill level (highest to lowest)
        players.sort((a, b) => b.skill - a.skill);

        const teams = {
            A: [],
            B: [],
            C: []
        };

        // Use snake draft pattern to distribute players
        // This ensures each team gets a mix of high and low skilled players
        for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
            // Forward distribution (A -> B -> C)
            const forwardIndex = i * 3;
            if (forwardIndex < players.length) {
                teams.A.push(players[forwardIndex]);
                if (forwardIndex + 1 < players.length) teams.B.push(players[forwardIndex + 1]);
                if (forwardIndex + 2 < players.length) teams.C.push(players[forwardIndex + 2]);
            }
        }

        // Verify team balance
        const skillA = calculateTeamSkill(teams.A);
        const skillB = calculateTeamSkill(teams.B);
        const skillC = calculateTeamSkill(teams.C);

        console.log(`Team A Skill: ${skillA}`);
        console.log(`Team B Skill: ${skillB}`);
        console.log(`Team C Skill: ${skillC}`);

        return teams;
    }

    function generateTeams() {
        const players = [];
        const playerInputs = document.querySelectorAll('.player-input');
        let emptyFields = false;

        playerInputs.forEach(input => {
            const name = input.querySelector('.player-name').value.trim();
            const skill = parseInt(input.querySelector('.skill-level').value);
            
            if (!name) {
                emptyFields = true;
                input.querySelector('.player-name').classList.add('error');
            } else {
                input.querySelector('.player-name').classList.remove('error');
                players.push({ name, skill });
            }
        });

        if (emptyFields) {
            alert('Por favor, preencha os nomes de todos os 15 jogadores.');
            return;
        }

        if (players.length !== REQUIRED_PLAYERS) {
            alert(`São necessários exatamente ${REQUIRED_PLAYERS} jogadores para gerar as equipas.`);
            return;
        }

        try {
            const teams = balanceTeams(players);
            displayTeams(teams);
            
            // Hide players section and show teams
            playersSection.style.display = 'none';
            teamsContainer.style.display = 'grid';

            // Add a reset button after teams are generated
            const resetButton = document.createElement('button');
            resetButton.className = 'generate-btn';
            resetButton.innerHTML = '<i class="fas fa-redo"></i> Recomeçar';
            resetButton.addEventListener('click', resetGenerator);
            teamsContainer.insertAdjacentElement('afterend', resetButton);
        } catch (error) {
            alert(error.message);
        }
    }

    function displayTeams(teams) {
        Object.keys(teams).forEach(team => {
            const teamList = document.querySelector(`#team${team} .team-list`);
            teamList.innerHTML = '';
            
            teams[team].forEach(player => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${player.name}
                    <span class="skill-badge">Nível: ${player.skill}</span>
                `;
                teamList.appendChild(li);
            });

            // Display team total skill
            const totalSkill = calculateTeamSkill(teams[team]);
            const totalSkillElement = document.createElement('div');
            totalSkillElement.className = 'team-total-skill';
            totalSkillElement.innerHTML = `Total Skill: ${totalSkill}`;
            teamList.insertAdjacentElement('afterend', totalSkillElement);
        });
    }

    function resetGenerator() {
        // Show players section and hide teams
        playersSection.style.display = 'block';
        teamsContainer.style.display = 'none';
        
        // Remove reset button
        const resetButton = document.querySelector('.generate-btn:not(#generateTeams)');
        if (resetButton) {
            resetButton.remove();
        }

        // Clear all inputs
        document.querySelectorAll('.player-name').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        document.querySelectorAll('.skill-level').forEach(select => select.value = '1');
    }

    // Initialize
    createPlayerInputs();
    generateButton.addEventListener('click', generateTeams);
});
document.addEventListener('DOMContentLoaded', function() {
    const playersContainer = document.getElementById('playersInputs');
    const generateButton = document.getElementById('generateTeams');
    const playersSection = document.querySelector('.players-container');
    const teamsContainer = document.querySelector('.teams-container');
    let REQUIRED_PLAYERS = 15; // Default to 15 players
    const PLAYERS_PER_TEAM = 5; // Always 5 players per team

    // Initially hide teams container
    teamsContainer.style.display = 'none';

    // Add event listeners for player count buttons
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePlayerCount(parseInt(btn.dataset.count));
        });
    });

    function updatePlayerCount(count) {
        REQUIRED_PLAYERS = count;
        playersContainer.innerHTML = ''; // Clear existing inputs
        createPlayerInputs();
        
        // Update teams container layout and visibility of team C
        teamsContainer.className = `teams-container ${count === 10 ? 'two-teams' : 'three-teams'}`;
        const teamC = document.getElementById('teamC');
        teamC.style.display = count === 10 ? 'none' : 'block';
    }

    function createPlayerInputs() {
        playersContainer.innerHTML = ''; // Clear existing inputs
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
            C: REQUIRED_PLAYERS === 15 ? [] : null // Only create team C for 15 players
        };

        if (REQUIRED_PLAYERS === 15) {
            // Distribute 15 players into 3 teams using snake draft
            for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
                const forwardIndex = i * 3;
                teams.A.push(players[forwardIndex]);
                teams.B.push(players[forwardIndex + 1]);
                teams.C.push(players[forwardIndex + 2]);
            }
        } else {
            // Distribute 10 players into 2 teams using alternating pattern
            for (let i = 0; i < players.length; i++) {
                if (i % 2 === 0) {
                    teams.A.push(players[i]);
                } else {
                    teams.B.push(players[i]);
                }
            }
        }

        // Log team skills for verification
        Object.keys(teams).forEach(team => {
            if (teams[team]) {
                console.log(`Team ${team} Skill: ${calculateTeamSkill(teams[team])}`);
            }
        });

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
            alert(`Por favor, preencha os nomes de todos os ${REQUIRED_PLAYERS} jogadores.`);
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
            if (!teams[team]) return; // Skip if team is null (Team C in 10-player mode)
            
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

        // Clear team totals
        document.querySelectorAll('.team-total-skill').forEach(el => el.remove());
    }

    // Initialize
    createPlayerInputs();
    generateButton.addEventListener('click', generateTeams);
});
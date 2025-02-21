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
                <div class="player-attributes">
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
                    <div class="position-selector">
                        <label>Posição:</label>
                        <select class="player-position">
                            <option value="atacante">Atacante</option>
                            <option value="defensor">Defensor</option>
                            <option value="guarda-redes">Guarda-Redes</option>
                            <option value="híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>
            `;
            playersContainer.appendChild(playerDiv);
        }
    }

    function calculateTeamSkill(team) {
        return team.reduce((sum, player) => sum + player.skill, 0);
    }

    function countPositions(team) {
        const counts = {
            'atacante': 0,
            'defensor': 0, 
            'guarda-redes': 0,
            'híbrido': 0
        };
        
        team.forEach(player => {
            counts[player.position]++;
        });
        
        return counts;
    }

    function evaluateTeamBalance(teams) {
        let maxSkillDifference = 0;
        const teamKeys = Object.keys(teams).filter(key => teams[key] !== null);
        
        // Calculate max skill difference between any two teams
        for (let i = 0; i < teamKeys.length; i++) {
            for (let j = i + 1; j < teamKeys.length; j++) {
                const diff = Math.abs(
                    calculateTeamSkill(teams[teamKeys[i]]) - 
                    calculateTeamSkill(teams[teamKeys[j]])
                );
                maxSkillDifference = Math.max(maxSkillDifference, diff);
            }
        }
        
        // Calculate position balance score (lower is better)
        let positionImbalance = 0;
        const positionCounts = teamKeys.map(key => countPositions(teams[key]));
        
        for (let i = 0; i < teamKeys.length; i++) {
            for (let j = i + 1; j < teamKeys.length; j++) {
                Object.keys(positionCounts[0]).forEach(pos => {
                    positionImbalance += Math.abs(
                        positionCounts[i][pos] - positionCounts[j][pos]
                    );
                });
            }
        }
        
        // Combined score (lower is better)
        return maxSkillDifference * 2 + positionImbalance;
    }

    function balanceTeams(players) {
        if (players.length !== REQUIRED_PLAYERS) {
            throw new Error(`Precisamente ${REQUIRED_PLAYERS} jogadores são necessários`);
        }

        const numTeams = REQUIRED_PLAYERS === 15 ? 3 : 2;
        const teamKeys = ['A', 'B', 'C'].slice(0, numTeams);
        
        // Sort players by skill level (highest to lowest)
        players.sort((a, b) => b.skill - a.skill);
        
        // Try multiple distribution strategies and pick the most balanced one
        let bestTeams = null;
        let bestScore = Infinity;
        
        // Run multiple iterations with slight variations
        for (let iteration = 0; iteration < 1000; iteration++) {
            // Create a copy of players and add slight randomization for skill-equivalent players
            const shuffledPlayers = [...players].sort((a, b) => {
                const skillDiff = b.skill - a.skill;
                // If skills are equal, randomly sort
                if (skillDiff === 0) {
                    return Math.random() - 0.5;
                }
                return skillDiff;
            });
            
            const candidateTeams = {};
            teamKeys.forEach(key => {
                candidateTeams[key] = [];
            });
            
            // Initialize with the top players in each team
            for (let i = 0; i < numTeams; i++) {
                candidateTeams[teamKeys[i]].push(shuffledPlayers[i]);
            }
            
            // Distribute remaining players using a greedy approach
            for (let i = numTeams; i < shuffledPlayers.length; i++) {
                const player = shuffledPlayers[i];
                
                // Find the team with the lowest current skill total
                let minTeamSkill = Infinity;
                let targetTeam = null;
                
                teamKeys.forEach(key => {
                    const teamSkill = calculateTeamSkill(candidateTeams[key]);
                    if (teamSkill < minTeamSkill) {
                        minTeamSkill = teamSkill;
                        targetTeam = key;
                    }
                });
                
                candidateTeams[targetTeam].push(player);
            }
            
            // Evaluate this distribution
            const score = evaluateTeamBalance(candidateTeams);
            
            if (score < bestScore) {
                bestScore = score;
                bestTeams = JSON.parse(JSON.stringify(candidateTeams));
            }
        }
        
        // Add null for Team C if we're in 10-player mode
        if (numTeams === 2) {
            bestTeams.C = null;
        }
        
        // Log team info for verification
        Object.keys(bestTeams).forEach(team => {
            if (bestTeams[team]) {
                console.log(`Team ${team} Skill: ${calculateTeamSkill(bestTeams[team])}`);
                console.log(`Team ${team} Positions:`, countPositions(bestTeams[team]));
            }
        });
        
        return bestTeams;
    }

    function generateTeams() {
        const players = [];
        const playerInputs = document.querySelectorAll('.player-input');
        let emptyFields = false;

        playerInputs.forEach(input => {
            const name = input.querySelector('.player-name').value.trim();
            const skill = parseInt(input.querySelector('.skill-level').value);
            const position = input.querySelector('.player-position').value;
            
            if (!name) {
                emptyFields = true;
                input.querySelector('.player-name').classList.add('error');
            } else {
                input.querySelector('.player-name').classList.remove('error');
                players.push({ name, skill, position });
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
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <div class="player-badges">
                            <span class="skill-badge">Nível: ${player.skill}</span>
                            <span class="position-badge position-${player.position}">${formatPosition(player.position)}</span>
                        </div>
                    </div>
                `;
                teamList.appendChild(li);
            });

            // Display team stats
            const totalSkill = calculateTeamSkill(teams[team]);
            const positions = countPositions(teams[team]);
            
            const teamStatsElement = document.createElement('div');
            teamStatsElement.className = 'team-stats';
            
            teamStatsElement.innerHTML = `
                <div class="team-total-skill">Total Skill: ${totalSkill}</div>
                <div class="team-positions">
                    <div class="position-count"><span class="position-icon atacante"></span> ${positions['atacante']}</div>
                    <div class="position-count"><span class="position-icon defensor"></span> ${positions['defensor']}</div>
                    <div class="position-count"><span class="position-icon guarda-redes"></span> ${positions['guarda-redes']}</div>
                    <div class="position-count"><span class="position-icon híbrido"></span> ${positions['híbrido']}</div>
                </div>
            `;
            
            teamList.insertAdjacentElement('afterend', teamStatsElement);
        });
    }
    
    function formatPosition(position) {
        const map = {
            'atacante': 'AT',
            'defensor': 'DF',
            'guarda-redes': 'GR',
            'híbrido': 'HB'
        };
        return map[position] || position;
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
        document.querySelectorAll('.player-position').forEach(select => select.value = 'atacante');

        // Clear team stats
        document.querySelectorAll('.team-stats').forEach(el => el.remove());
    }

    // Initialize
    createPlayerInputs();
    generateButton.addEventListener('click', generateTeams);
});
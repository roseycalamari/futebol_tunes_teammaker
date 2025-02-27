document.addEventListener('DOMContentLoaded', function() {
    const playersContainer = document.getElementById('playersInputs');
    const generateButton = document.getElementById('generateTeams');
    const playersSection = document.querySelector('.players-container');
    const pitchContainer = document.querySelector('.pitch-container');
    let REQUIRED_PLAYERS = 15; // Default to 15 players
    const PLAYERS_PER_TEAM = 5; // Always 5 players per team
    let currentPlayers = []; // Store current player data for regeneration

    // Initialize pitch container to not display
    if (pitchContainer) {
        pitchContainer.style.display = 'none';
    }

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
                            <option value="0.7">1-</option>
                            <option value="1">1</option>
                            <option value="1.3">1+</option>
                            <option value="1.7">2-</option>
                            <option value="2">2</option>
                            <option value="2.3">2+</option>
                            <option value="2.7">3-</option>
                            <option value="3">3</option>
                            <option value="3.3">3+</option>
                            <option value="3.7">4-</option>
                            <option value="4">4</option>
                            <option value="4.3">4+</option>
                            <option value="4.7">5-</option>
                            <option value="5">5</option>
                            <option value="5.3">5+</option>
                        </select>
                    </div>
                    <div class="position-selector">
                        <label>Posição:</label>
                        <select class="player-position">
                            <option value="atacante">Atacante</option>
                            <option value="defensor">Defensor</option>
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
                // If skills are equal or very close, randomly sort
                if (Math.abs(skillDiff) < 0.1) {
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
        
        return bestTeams;
    }

    function collectPlayerData() {
        const players = [];
        const playerInputs = document.querySelectorAll('.player-input');
        let emptyFields = false;

        playerInputs.forEach(input => {
            const name = input.querySelector('.player-name').value.trim();
            const skill = parseFloat(input.querySelector('.skill-level').value);
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
            return null;
        }

        if (players.length !== REQUIRED_PLAYERS) {
            alert(`São necessários exatamente ${REQUIRED_PLAYERS} jogadores para gerar as equipas.`);
            return null;
        }

        return players;
    }

    function generateTeams() {
        const players = collectPlayerData();
        if (!players) return;

        // Store the current players for potential regeneration
        currentPlayers = [...players];
        
        try {
            const teams = balanceTeams(players);
            
            // Create or clear pitch visualization
            createPitchVisualization(teams);
            
            // Hide players section and show pitch container
            playersSection.style.display = 'none';
            pitchContainer.style.display = 'block';
            
            // Add a small delay before adding the active class for animation
            setTimeout(() => {
                pitchContainer.classList.add('active');
            }, 50);

            // Add button container for the action buttons
            if (!document.querySelector('.action-buttons')) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'action-buttons';
                
                // Add a regenerate button
                const regenerateButton = document.createElement('button');
                regenerateButton.className = 'generate-btn regenerate-btn';
                regenerateButton.innerHTML = '<i class="fas fa-random"></i> Gerar Novamente';
                regenerateButton.addEventListener('click', regenerateTeams);
                
                // Add a reset button
                const resetButton = document.createElement('button');
                resetButton.className = 'generate-btn reset-btn';
                resetButton.innerHTML = '<i class="fas fa-redo"></i> Recomeçar';
                resetButton.addEventListener('click', resetGenerator);
                
                // Add buttons to container
                buttonContainer.appendChild(regenerateButton);
                buttonContainer.appendChild(resetButton);
                
                // Add button container after pitch container
                pitchContainer.insertAdjacentElement('afterend', buttonContainer);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    function regenerateTeams() {
        // Generate new team distribution with the same players
        try {
            const teams = balanceTeams([...currentPlayers]);
            createPitchVisualization(teams);
        } catch (error) {
            alert(error.message);
        }
    }

    function createPitchVisualization(teams) {
        // Clear any existing content
        pitchContainer.innerHTML = '';
        
        // Create team info panels
        const teamInfoSection = document.createElement('div');
        teamInfoSection.className = 'team-info-section';
        
        const teamInfoPanels = document.createElement('div');
        teamInfoPanels.className = 'team-info-panels';
        
        // Add team information panels
        Object.keys(teams).forEach(team => {
            if (!teams[team]) return; // Skip if team is null (Team C in 10-player mode)
            
            const teamInfoPanel = createTeamInfoPanel(team, teams[team]);
            teamInfoPanels.appendChild(teamInfoPanel);
        });
        
        teamInfoSection.appendChild(teamInfoPanels);
        pitchContainer.appendChild(teamInfoSection);
        
        // Create pitch views for each team
        const pitchView = document.createElement('div');
        pitchView.className = 'pitch-view';
        
        Object.keys(teams).forEach(team => {
            if (!teams[team]) return; // Skip if team is null
            
            const pitchElement = createPitchElement(team, teams[team]);
            pitchView.appendChild(pitchElement);
        });
        
        pitchContainer.appendChild(pitchView);
    }
    
    function createTeamInfoPanel(teamKey, teamPlayers) {
        const totalSkill = calculateTeamSkill(teamPlayers).toFixed(1);
        const positions = countPositions(teamPlayers);
        
        const panel = document.createElement('div');
        panel.className = `team-info-panel team-${teamKey.toLowerCase()}`;
        
        panel.innerHTML = `
            <h2>Equipa ${teamKey}</h2>
            <ul class="team-players-list">
                ${teamPlayers.map(player => `
                    <li>
                        <div class="player-indicator"></div>
                        <div class="player-details">
                            <div class="player-details-name">${player.name}</div>
                            <div class="player-details-badges">
                                <span class="skill-badge">Nível: ${formatSkillLevel(player.skill)}</span>
                                <span class="position-badge position-${player.position}">${formatPosition(player.position)}</span>
                            </div>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <div class="team-stats">
                <div class="team-total-skill">Total Skill: ${totalSkill}</div>
                <div class="team-positions">
                    <div class="position-count"><span class="position-icon atacante"></span> ${positions['atacante']}</div>
                    <div class="position-count"><span class="position-icon defensor"></span> ${positions['defensor']}</div>
                    <div class="position-count"><span class="position-icon híbrido"></span> ${positions['híbrido']}</div>
                </div>
            </div>
        `;
        
        return panel;
    }
    
    function createPitchElement(teamKey, teamPlayers) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'pitch-wrapper';
        
        const totalSkill = calculateTeamSkill(teamPlayers).toFixed(1);
        const positions = countPositions(teamPlayers);
        
        containerDiv.innerHTML = `
            <div class="pitch-team-name">Equipa ${teamKey}</div>
            <div class="pitch-team-stats">
                <div class="pitch-team-stat">Skill: ${totalSkill}</div>
                <div class="pitch-team-stat">AT: ${positions['atacante']}</div>
                <div class="pitch-team-stat">DF: ${positions['defensor']}</div>
                <div class="pitch-team-stat">HB: ${positions['híbrido']}</div>
            </div>
            <div class="football-pitch">
                <!-- Field texture and shading for realism -->
                <div class="field-texture"></div>
                <div class="field-shading"></div>
                
                <!-- Pitch markings -->
                <div class="pitch-lines">
                    <!-- Center markings -->
                    <div class="center-line"></div>
                    <div class="center-circle"></div>
                    <div class="center-spot"></div>
                    
                    <!-- Penalty areas -->
                    <div class="penalty-area top"></div>
                    <div class="penalty-area bottom"></div>
                    
                    <!-- Penalty spots -->
                    <div class="penalty-spot top"></div>
                    <div class="penalty-spot bottom"></div>
                    
                    <!-- Goal areas -->
                    <div class="goal-area top"></div>
                    <div class="goal-area bottom"></div>
                    
                    <!-- Goals -->
                    <div class="goal top"></div>
                    <div class="goal bottom"></div>
                    
                    <!-- Corner arcs -->
                    <div class="corner-arc top-left"></div>
                    <div class="corner-arc top-right"></div>
                    <div class="corner-arc bottom-left"></div>
                    <div class="corner-arc bottom-right"></div>
                </div>
                
                <!-- Player tokens will be inserted here -->
                ${generatePlayerPositions(teamPlayers, teamKey)}
            </div>
        `;
        
        return containerDiv;
    }
    
    function getPositionCoordinates(position, index, totalOfType) {
        // Calculate positions based on player type and count
        // Using a more football-authentic positioning system
        let x, y;
        
        switch(position) {
            case 'atacante':
                // Attackers positioned in offensive third
                if (totalOfType === 1) {
                    // Single striker centered
                    x = 50; 
                    y = 28;
                } else if (totalOfType === 2) {
                    // Two strikers in a 2-forward formation
                    x = index === 0 ? 35 : 65;
                    y = 28;
                } else if (totalOfType === 3) {
                    // Three-forward formation
                    if (index === 0) x = 30;
                    else if (index === 1) x = 50;
                    else x = 70;
                    y = 28;
                } else {
                    // For 4+ attackers, distribute evenly
                    x = 20 + (index * (60 / (totalOfType - 1)));
                    y = 28;
                }
                break;
                
            case 'defensor':
                // Defenders positioned in defensive third
                if (totalOfType === 1) {
                    // Single center-back
                    x = 50;
                    y = 72;
                } else if (totalOfType === 2) {
                    // Two center-backs
                    x = index === 0 ? 35 : 65;
                    y = 72;
                } else if (totalOfType === 3) {
                    // Three-back formation
                    if (index === 0) x = 30;
                    else if (index === 1) x = 50;
                    else x = 70;
                    y = 72;
                } else {
                    // For 4+ defenders, distribute evenly
                    x = 20 + (index * (60 / (totalOfType - 1)));
                    y = 72;
                }
                break;
                
            case 'híbrido':
                // Hybrids positioned in midfield
                if (totalOfType === 1) {
                    // Single central midfielder
                    x = 50;
                    y = 50;
                } else if (totalOfType === 2) {
                    // Two central midfielders
                    x = index === 0 ? 40 : 60;
                    y = 50;
                } else if (totalOfType === 3) {
                    // Three-midfielder formation
                    if (index === 0) x = 30;
                    else if (index === 1) x = 50;
                    else x = 70;
                    y = 50;
                } else {
                    // For 4+ midfielders, distribute evenly
                    x = 20 + (index * (60 / (totalOfType - 1)));
                    y = 50;
                }
                break;
        }
        
        // Add slight randomization to prevent perfect alignment
        // Only if there are multiple players of the same type
        if (totalOfType > 1) {
            // Add up to ±3% random variation to make it look more natural
            x += (Math.random() - 0.5) * 3;
            y += (Math.random() - 0.5) * 3;
        }
        
        return { x, y };
    }
    
    function generatePlayerPositions(players, teamKey) {
        // Categorize players by position
        const attackers = players.filter(p => p.position === 'atacante');
        const defenders = players.filter(p => p.position === 'defensor');
        const hybrids = players.filter(p => p.position === 'híbrido');
        
        let positionHTML = '';
        
        // Position players based on their roles
        // Position attackers in front positions
        attackers.forEach((player, index) => {
            const positions = getPositionCoordinates('atacante', index, attackers.length);
            positionHTML += createPlayerToken(player, positions.x, positions.y, teamKey);
        });
        
        // Position defenders in back positions
        defenders.forEach((player, index) => {
            const positions = getPositionCoordinates('defensor', index, defenders.length);
            positionHTML += createPlayerToken(player, positions.x, positions.y, teamKey);
        });
        
        // Position hybrids in middle positions
        hybrids.forEach((player, index) => {
            const positions = getPositionCoordinates('híbrido', index, hybrids.length);
            positionHTML += createPlayerToken(player, positions.x, positions.y, teamKey);
        });
        
        return positionHTML;
    }
    
    function getPositionCoordinates(position, index, totalOfType) {
        // Calculate positions based on player type and count
        let x, y;
        
        switch(position) {
            case 'atacante':
                // Attackers positioned in front (top area)
                if (totalOfType === 1) {
                    x = 50; // Center
                    y = 20; // Near top
                } else if (totalOfType === 2) {
                    x = index === 0 ? 30 : 70; // Left and right
                    y = 20;
                } else {
                    // For 3 or more attackers, distribute across the top
                    x = 25 + (index * (50 / (totalOfType - 1)));
                    y = 20;
                }
                break;
                
            case 'defensor':
                // Defenders positioned in back (bottom area)
                if (totalOfType === 1) {
                    x = 50; // Center
                    y = 80; // Near bottom
                } else if (totalOfType === 2) {
                    x = index === 0 ? 30 : 70; // Left and right
                    y = 80;
                } else {
                    // For 3 or more defenders, distribute across the bottom
                    x = 25 + (index * (50 / (totalOfType - 1)));
                    y = 80;
                }
                break;
                
            case 'híbrido':
                // Hybrids positioned in the middle area
                if (totalOfType === 1) {
                    x = 50; // Center
                    y = 50; // Middle
                } else if (totalOfType === 2) {
                    x = index === 0 ? 35 : 65; // Left and right of center
                    y = 50;
                } else {
                    // For 3 or more hybrids, distribute across the middle
                    x = 25 + (index * (50 / (totalOfType - 1)));
                    y = 50;
                }
                break;
        }
        
        return { x, y };
    }
    
    function createPlayerToken(player, x, y, teamKey) {
        // Get initials from player name
        const nameParts = player.name.split(' ');
        let initials = nameParts[0].charAt(0).toUpperCase();
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
        
        return `
            <div class="team-player team-${teamKey.toLowerCase()}" style="left: ${x}%; top: ${y}%;">
                <div class="player-token">${initials}</div>
                <div class="player-popup">
                    <div class="player-popup-name">${player.name}</div>
                    <div class="player-popup-details">
                        <span class="popup-badge skill-badge">Nível: ${formatSkillLevel(player.skill)}</span>
                        <span class="popup-badge position-badge position-${player.position}">${formatPosition(player.position)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    function formatPosition(position) {
        const map = {
            'atacante': 'AT',
            'defensor': 'DF',
            'híbrido': 'HB'
        };
        return map[position] || position;
    }
    
    function formatSkillLevel(skillValue) {
        // Convert floating point skill values back to display format
        const skillMap = {
            0.7: '1-', 1: '1', 1.3: '1+',
            1.7: '2-', 2: '2', 2.3: '2+',
            2.7: '3-', 3: '3', 3.3: '3+',
            3.7: '4-', 4: '4', 4.3: '4+',
            4.7: '5-', 5: '5', 5.3: '5+'
        };
        
        return skillMap[skillValue] || skillValue.toString();
    }

    function resetGenerator() {
        // Show players section and hide pitch container with proper transition handling
        playersSection.style.display = 'block';
        pitchContainer.classList.remove('active');
        
        // Use setTimeout to ensure transition completes before hiding
        setTimeout(() => {
            pitchContainer.style.display = 'none';
            
            // Clear pitch container content to free memory
            pitchContainer.innerHTML = '';
        }, 300); // Match this with the CSS transition duration
        
        // Remove action buttons with proper cleanup
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            // Remove event listeners before removing element to prevent memory leaks
            const regenerateButton = actionButtons.querySelector('.regenerate-btn');
            const resetButton = actionButtons.querySelector('.reset-btn');
            
            if (regenerateButton) regenerateButton.removeEventListener('click', regenerateTeams);
            if (resetButton) resetButton.removeEventListener('click', resetGenerator);
            
            actionButtons.remove();
        }

        // Reset form to initial state
        resetFormInputs();
        
        // Reset currentPlayers array
        currentPlayers = [];
    }
    
    function resetFormInputs() {
        // Clear player names and remove any error styling
        document.querySelectorAll('.player-name').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        
        // Reset dropdowns to default values
        document.querySelectorAll('.skill-level').forEach(select => select.value = '1');
        document.querySelectorAll('.player-position').forEach(select => select.value = 'atacante');
    }
    
    // Initialize the application
    function initialize() {
        createPlayerInputs();
        generateButton.addEventListener('click', generateTeams);
        
        // Set default player count
        const defaultPlayerCount = 15;
        updatePlayerCount(defaultPlayerCount);
    }
    
    // Start the application
    initialize();
});
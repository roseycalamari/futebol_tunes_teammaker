// Sound Manager (global scope)
const SoundManager = {
  sounds: {
      click: new Audio('sounds/click.mp3'),
      generate: new Audio('sounds/generate.mp3'),
      success: new Audio('sounds/success.mp3'),
      error: new Audio('sounds/error.mp3'),
      addPlayer: new Audio('sounds/add_player.mp3'),
      removePlayer: new Audio('sounds/remove_player.mp3')
  },
  
  play: function(soundName) {
      try {
          if (this.sounds[soundName]) {
              // Reset the sound to start
              this.sounds[soundName].currentTime = 0;
              // Play the sound
              this.sounds[soundName].play().catch(error => {
                  console.log('Sound play failed:', error);
              });
          }
      } catch (error) {
          console.log('Sound error:', error);
      }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Global variables for team generator
  window.REQUIRED_PLAYERS = 15; // Default to 15 players
  window.PLAYERS_PER_TEAM = 5; // Always 5 players per team
  window.currentPlayers = []; // Store current player data for regeneration
  
  // Initialize team generator if we're on that page
  const teamGeneratorPage = document.querySelector('.players-container');
  if (teamGeneratorPage) {
      initializeTeamGenerator();
  }
  
  // Add click sound to feature cards on homepage
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
      card.addEventListener('click', () => {
          SoundManager.play('click');
      });
  });
});

// Initialize team generator functionality
function initializeTeamGenerator() {
  createPlayerInputs();
  
  // Get generate button and add event listener
  const generateButton = document.getElementById('generateTeams') || document.querySelector('.generate-btn');
  if (generateButton) {
      generateButton.addEventListener('click', generateTeams);
  }
  
  // Add player count selector functionality
  const countButtons = document.querySelectorAll('.count-btn');
  countButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          // Remove active class from all buttons
          countButtons.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          btn.classList.add('active');
          // Update player count
          const count = parseInt(btn.dataset.count);
          updatePlayerCount(count);
      });
  });
  
  // Set default player count
  const defaultPlayerCount = 15;
  updatePlayerCount(defaultPlayerCount);
}

// Global functions for team generator
function updatePlayerCount(count) {
  window.REQUIRED_PLAYERS = count;
  const playersContainer = document.getElementById('playersInputs');
  if (playersContainer) {
      createPlayerInputs();
      SoundManager.play('addPlayer');
  }
}

function createPlayerInputs() {
  const playersContainer = document.getElementById('playersInputs');
  if (!playersContainer) return;
  
  playersContainer.innerHTML = ''; // Clear existing inputs
      for (let i = 0; i < window.REQUIRED_PLAYERS; i++) {
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
      if (players.length !== window.REQUIRED_PLAYERS) {
          throw new Error(`Precisamente ${window.REQUIRED_PLAYERS} jogadores são necessários`);
      }

      const numTeams = window.REQUIRED_PLAYERS === 15 ? 3 : 2;
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

      // Randomly designate two teams to wear vests
      const vestTeams = [];
      const availableTeams = Object.keys(bestTeams).filter(key => bestTeams[key] !== null && key !== 'vestTeams');
      while (vestTeams.length < 2) {
          const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
          if (!vestTeams.includes(randomTeam)) {
              vestTeams.push(randomTeam);
          }
      }
      
      // Mark teams that need to wear vests
      vestTeams.forEach(teamKey => {
          bestTeams[teamKey].forEach(player => {
              player.needsVest = true;
          });
          bestTeams[teamKey].needsVest = true;
      });
      
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
          alert(`Por favor, preencha os nomes de todos os ${window.REQUIRED_PLAYERS} jogadores.`);
          return null;
      }

      if (players.length !== window.REQUIRED_PLAYERS) {
          alert(`São necessários exatamente ${window.REQUIRED_PLAYERS} jogadores para gerar as equipas.`);
          return null;
      }

      return players;
  }

  function generateTeams() {
      const players = collectPlayerData();
      if (!players) {
          SoundManager.play('error');
          return;
      }

      // Get DOM elements
      const playersSection = document.querySelector('.players-container');
      const pitchContainer = document.querySelector('.pitch-container');
      
      if (!playersSection || !pitchContainer) {
          console.error('Required DOM elements not found');
          return;
      }

      SoundManager.play('generate');
      
      // Store the current players for potential regeneration
      window.currentPlayers = [...players];
      
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
              SoundManager.play('success');
          }, 50);

          // Add button container for the action buttons
          if (!document.querySelector('.action-buttons')) {
              const buttonContainer = document.createElement('div');
              buttonContainer.className = 'action-buttons';
              
              // Add regenerate button
              const regenerateButton = document.createElement('button');
              regenerateButton.className = 'regenerate-btn';
              regenerateButton.innerHTML = `
                  <span class="regenerate-icon">🔄</span>
                  Regenerar Equipas
              `;
              regenerateButton.addEventListener('click', () => {
                  SoundManager.play('generate');
                  const newTeams = balanceTeams([...window.currentPlayers]);
                  createPitchVisualization(newTeams);
              });
              
              // Add back button
              const backButton = document.createElement('button');
              backButton.className = 'back-btn';
              backButton.innerHTML = `
                  <span class="back-icon">←</span>
                  Voltar
              `;
              backButton.addEventListener('click', () => {
                  SoundManager.play('click');
                  const currentPitchContainer = document.querySelector('.pitch-container');
                  const currentPlayersSection = document.querySelector('.players-container');
                  if (currentPitchContainer && currentPlayersSection) {
                      currentPitchContainer.style.display = 'none';
                      currentPlayersSection.style.display = 'block';
                  }
              });
              
              buttonContainer.appendChild(regenerateButton);
              buttonContainer.appendChild(backButton);
              pitchContainer.appendChild(buttonContainer);
          }
          
      } catch (error) {
          SoundManager.play('error');
          alert(error.message);
      }
  }

  function createPitchVisualization(teams) {
      // Get the pitch container element
      const pitchContainer = document.querySelector('.pitch-container');
      if (!pitchContainer) {
          console.error('Pitch container not found');
          return;
      }
      
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
  }
  
  function createTeamInfoPanel(teamKey, teamPlayers) {
      const panel = document.createElement('div');
      panel.className = `team-info-panel team-${teamKey.toLowerCase()}`;
      const totalSkill = calculateTeamSkill(teamPlayers).toFixed(1);
      const positions = countPositions(teamPlayers);
      
      // Check if this team is wearing vests
      const isWearingVest = teamPlayers.needsVest;
      
      panel.innerHTML = `
          <h2>
              <div class="team-name-container">
                  Equipa ${teamKey}
                  ${isWearingVest ? '<span class="vest-badge">Coletes</span>' : ''}
              </div>
          </h2>
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
      
      // If the skill value exists in the map, return it
      if (skillMap[skillValue]) {
          return skillMap[skillValue];
      }
      
      // If the skill value is undefined or invalid, return a default value
      return '1'; // Default to level 1 if invalid
  }
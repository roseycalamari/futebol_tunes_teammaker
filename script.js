// Sound Manager (global scope) - DISABLED to prevent 404 errors
const SoundManager = {
  sounds: {
      // click: new Audio('sounds/click.mp3'),
      // generate: new Audio('sounds/generate.mp3'),
      // success: new Audio('sounds/success.mp3'),
      // error: new Audio('sounds/error.mp3'),
      // addPlayer: new Audio('sounds/add_player.mp3'),
      // removePlayer: new Audio('sounds/remove_player.mp3')
  },
  
  play: function(soundName) {
      // Sounds disabled to prevent 404 errors
      // try {
      //     if (this.sounds[soundName]) {
      //         // Reset the sound to start
      //         this.sounds[soundName].currentTime = 0;
      //         // Play the sound
      //         this.sounds[soundName].play().catch(error => {
      //             console.log('Sound play failed:', error);
      //         });
      //     }
      // } catch (error) {
      //     console.log('Sound error:', error);
      // }
  }
};

// Enhanced Team Generator Global Variables
let currentStep = 1;
let totalPlayers = 10; // Changed default from 15 to 10
let currentPlayerIndex = 0;
let players = [];
let generatedTeams = [];

// Player attributes definitions with scoring multipliers
const attributeDefinitions = {
  malabarista: {
      name: "Malabarista",
      description: "Dribbler, flashy, bom remate",
      attackModifier: 1.3,
      defenseModifier: 0.8,
      creativityModifier: 1.4,
      teamworkModifier: 0.9
  },
  muralha: {
      name: "A Muralha",
      description: "Forte na marcação, excelente defesa",
      attackModifier: 0.7,
      defenseModifier: 1.5,
      creativityModifier: 0.8,
      teamworkModifier: 1.2
  },
  sweeper: {
      name: "Sweeper",
      description: "Versátil guarda-redes + campo",
      attackModifier: 1.0,
      defenseModifier: 1.3,
      creativityModifier: 1.1,
      teamworkModifier: 1.4,
      goalkeeperModifier: 1.6
  },
  luva: {
      name: "Luva D'or",
      description: "Excelente guarda-redes nato",
      attackModifier: 0.5,
      defenseModifier: 1.2,
      creativityModifier: 0.7,
      teamworkModifier: 1.0,
      goalkeeperModifier: 2.0
  },
  sr90: {
      name: "Sr. 90 Minutos",
      description: "Completo, criativo, trabalhador",
      attackModifier: 1.2,
      defenseModifier: 1.2,
      creativityModifier: 1.3,
      teamworkModifier: 1.4
  },
  arquiteto: {
      name: "O Arquiteto",
      description: "Ótimo passe, controla ritmo",
      attackModifier: 1.1,
      defenseModifier: 1.0,
      creativityModifier: 1.5,
      teamworkModifier: 1.3
  },
  matador: {
      name: "El Matador",
      description: "Finalizador elite, baixa defesa",
      attackModifier: 1.6,
      defenseModifier: 0.6,
      creativityModifier: 1.1,
      teamworkModifier: 0.8
  }
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoFoGuzuZHVys-bF02P1mrg6-NbjQj8pY",
  authDomain: "niterun-sports-app.firebaseapp.com",
  projectId: "niterun-sports-app",
  storageBucket: "niterun-sports-app.firebasestorage.app",
  messagingSenderId: "320354701270",
  appId: "1:320354701270:web:53302cfe9a63112e95de77",
  measurementId: "G-VXLNF0KB61"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully!");
} catch (error) {
  console.log("Firebase initialization error:", error);
}

// Authentication state management
let currentUser = null;

// Check authentication state on page load
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    updateUIForAuthenticatedUser(user);
    console.log("User logged in:", user.displayName || user.email);
  } else {
    currentUser = null;
    updateUIForUnauthenticatedUser();
  }
});

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  const userSection = document.getElementById('userSection');
  const authButtons = document.getElementById('authButtons');
  
  if (userSection && authButtons) {
    userSection.style.display = 'flex';
    authButtons.style.display = 'none';
    
    // Update user info
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) {
      userName.textContent = user.displayName || 'User';
    }
    
    if (userAvatar && user.photoURL) {
      userAvatar.src = user.photoURL;
    }
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  const userSection = document.getElementById('userSection');
  const authButtons = document.getElementById('authButtons');
  
  if (userSection && authButtons) {
    userSection.style.display = 'none';
    authButtons.style.display = 'flex';
  }
}

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    console.log("User logged out");
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Logout error:', error);
    window.location.href = 'login.html';
  });
}

// Navigate to feature with authentication check
function navigateToFeature(featurePath) {
  if (currentUser) {
    window.location.href = featurePath;
  } else {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
  }
}

// Data Storage and Management
const DataManager = {
  // Save data to localStorage
  saveToLocal: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Load data from localStorage
  loadFromLocal: function(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  },

  // Save team data
  saveTeam: function(teamData) {
    const teams = this.loadFromLocal('teams') || [];
    teamData.id = Date.now(); // Simple ID generation
    teamData.createdAt = new Date().toISOString();
    teamData.userId = currentUser ? currentUser.uid : 'anonymous';
    teams.push(teamData);
    return this.saveToLocal('teams', teams);
  },

  // Load user's teams
  loadUserTeams: function() {
    const teams = this.loadFromLocal('teams') || [];
    if (currentUser) {
      return teams.filter(team => team.userId === currentUser.uid);
    }
    return teams;
  },

  // Save player data
  savePlayer: function(playerData) {
    const players = this.loadFromLocal('players') || [];
    playerData.id = Date.now();
    playerData.createdAt = new Date().toISOString();
    playerData.userId = currentUser ? currentUser.uid : 'anonymous';
    players.push(playerData);
    return this.saveToLocal('players', players);
  },

  // Load user's players
  loadUserPlayers: function() {
    const players = this.loadFromLocal('players') || [];
    if (currentUser) {
      return players.filter(player => player.userId === currentUser.uid);
    }
    return players;
  },

  // Save match data
  saveMatch: function(matchData) {
    const matches = this.loadFromLocal('matches') || [];
    matchData.id = Date.now();
    matchData.createdAt = new Date().toISOString();
    matchData.userId = currentUser ? currentUser.uid : 'anonymous';
    matches.push(matchData);
    return this.saveToLocal('matches', matches);
  },

  // Load user's matches
  loadUserMatches: function() {
    const matches = this.loadFromLocal('matches') || [];
    if (currentUser) {
      return matches.filter(match => match.userId === currentUser.uid);
    }
    return matches;
  }
};

// Enhanced Team Generator with multiple sports support
const EnhancedTeamGenerator = {
  // Sport configurations
  sports: {
    football: {
      name: 'Football',
      positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
      minPlayers: 10,
      teamSizes: [5, 5], // 5v5
      fieldType: 'rectangular'
    },
    basketball: {
      name: 'Basketball',
      positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
      minPlayers: 10,
      teamSizes: [5, 5], // 5v5
      fieldType: 'rectangular'
    },
    volleyball: {
      name: 'Volleyball',
      positions: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
      minPlayers: 12,
      teamSizes: [6, 6], // 6v6
      fieldType: 'rectangular'
    },
    tennis: {
      name: 'Tennis',
      positions: ['Player'],
      minPlayers: 4,
      teamSizes: [2, 2], // 2v2
      fieldType: 'rectangular'
    }
  },

  // Generate balanced teams for any sport
  generateBalancedTeams: function(players, sportType = 'football', teamCount = 2) {
    const sport = this.sports[sportType] || this.sports.football;
    
    if (players.length < sport.minPlayers) {
      throw new Error(`Need at least ${sport.minPlayers} players for ${sport.name}`);
    }

    // Sort players by skill level
    const sortedPlayers = [...players].sort((a, b) => b.skillLevel - a.skillLevel);
    
    // Distribute players across teams to balance skill
    const teams = Array.from({ length: teamCount }, () => []);
    
    // Snake draft distribution for better balance
    for (let i = 0; i < sortedPlayers.length; i++) {
      const teamIndex = i % teamCount;
      teams[teamIndex].push(sortedPlayers[i]);
    }

    // Calculate team stats
    const teamStats = teams.map(team => ({
      players: team,
      totalSkill: team.reduce((sum, player) => sum + player.skillLevel, 0),
      averageSkill: team.reduce((sum, player) => sum + player.skillLevel, 0) / team.length,
      positions: this.analyzePositions(team, sport)
    }));

    return {
      teams: teamStats,
      sport: sport,
      generatedAt: new Date().toISOString(),
      totalPlayers: players.length
    };
  },

  // Analyze player positions for a team
  analyzePositions: function(players, sport) {
    const positionCounts = {};
    sport.positions.forEach(pos => positionCounts[pos] = 0);
    
    players.forEach(player => {
      if (player.position && positionCounts.hasOwnProperty(player.position)) {
        positionCounts[player.position]++;
      }
    });

    return positionCounts;
  },

  // Export teams to shareable format
  exportTeams: function(teamData) {
    const exportData = {
      ...teamData,
      shareable: true,
      exportDate: new Date().toISOString()
    };

    // Save to local storage
    DataManager.saveTeam(exportData);

    // Create shareable text
    let shareText = `🏆 ${teamData.sport.name} Teams\n\n`;
    
    teamData.teams.forEach((team, index) => {
      shareText += `Team ${index + 1}:\n`;
      team.players.forEach(player => {
        shareText += `• ${player.name} (${player.position || 'Player'})\n`;
      });
      shareText += `\n`;
    });

    return shareText;
  }
};

// Group Management System
const GroupManager = {
  // Create a new group
  createGroup: function(groupData) {
    const groups = DataManager.loadFromLocal('groups') || [];
    const newGroup = {
      id: Date.now().toString(),
      ...groupData,
      createdAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.uid : 'anonymous',
      members: currentUser ? [currentUser.uid] : [],
      inviteCode: this.generateInviteCode()
    };
    
    groups.push(newGroup);
    DataManager.saveToLocal('groups', groups);
    return newGroup;
  },

  // Generate invite code
  generateInviteCode: function() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Join group by invite code
  joinGroup: function(inviteCode) {
    const groups = DataManager.loadFromLocal('groups') || [];
    const group = groups.find(g => g.inviteCode === inviteCode);
    
    if (group && currentUser) {
      if (!group.members.includes(currentUser.uid)) {
        group.members.push(currentUser.uid);
        DataManager.saveToLocal('groups', groups);
        return group;
      }
    }
    
    return null;
  },

  // Get user's groups
  getUserGroups: function() {
    const groups = DataManager.loadFromLocal('groups') || [];
    if (currentUser) {
      return groups.filter(group => group.members.includes(currentUser.uid));
    }
    return [];
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize team generator if we're on that page
  const teamGeneratorPage = document.querySelector('.step-content');
  if (teamGeneratorPage) {
      initializeEnhancedTeamGenerator();
  }
  
  // Add click sound to feature cards on homepage
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
      card.addEventListener('click', () => {
          SoundManager.play('click');
      });
  });
});

// ===== ENHANCED TEAM GENERATOR FUNCTIONS =====

function initializeEnhancedTeamGenerator() {
  // Set up player count buttons
  const countButtons = document.querySelectorAll('.count-btn');
  countButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          // Remove active class from all buttons
          countButtons.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          btn.classList.add('active');
          // Update player count
          totalPlayers = parseInt(btn.dataset.count);
          SoundManager.play('click');
      });
  });

  // Set up attribute buttons
  setupAttributeButtons();
  
  // Initialize first step
  updateStepDisplay();
  updatePlayerCounter();
}

function setupAttributeButtons() {
  const attributeButtons = document.querySelectorAll('.attribute-btn');
  attributeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          btn.classList.toggle('active');
          SoundManager.play('click');
      });
  });
}

function nextStep() {
  if (currentStep === 1) {
      // Initialize players array
      players = [];
      currentPlayerIndex = 0;
      
      // Create player navigation grid
      createPlayerNavigation();
      
      // Go to step 2 (player configuration)
      currentStep = 2;
      updateStepDisplay();
      updatePlayerCounter();
      updateProgressBar();
      loadPlayerData();
      SoundManager.play('click');
  }
}

function createPlayerNavigation() {
  const playersGrid = document.getElementById('playersGrid');
  playersGrid.innerHTML = '';
  
  for (let i = 0; i < totalPlayers; i++) {
      const navBtn = document.createElement('button');
      navBtn.className = 'player-nav-btn';
      navBtn.textContent = i + 1;
      navBtn.onclick = () => goToPlayer(i);
      
      if (i === 0) {
          navBtn.classList.add('current');
      }
      
      playersGrid.appendChild(navBtn);
  }
}

function updatePlayerNavigation() {
  const navButtons = document.querySelectorAll('.player-nav-btn');
  
  navButtons.forEach((btn, index) => {
      btn.classList.remove('current', 'completed');
      
      if (index === currentPlayerIndex) {
          btn.classList.add('current');
      } else if (players[index] && players[index].name) {
          btn.classList.add('completed');
      }
  });
}

function updateProgressBar() {
  // Progress bar functionality removed since element doesn't exist in HTML
  // This function is kept for compatibility but doesn't do anything
}

function goToStep(step) {
  currentStep = step;
  updateStepDisplay();
  
  if (step === 2) {
      updatePlayerCounter();
      loadPlayerData();
  }
  
  SoundManager.play('click');
}

function updateStepDisplay() {
  // Show/hide step content
  const stepContents = document.querySelectorAll('.step-content');
  stepContents.forEach((content, index) => {
      if (index + 1 === currentStep) {
          content.classList.remove('hidden');
      } else {
          content.classList.add('hidden');
      }
  });
}

function updatePlayerCounter() {
  // Update previous button visibility
  const prevBtn = document.querySelector('.prev-player-btn');
  if (prevBtn) {
      prevBtn.style.visibility = currentPlayerIndex === 0 ? 'hidden' : 'visible';
  }
  
  // Update save button text
  const saveBtn = document.querySelector('.save-continue-btn span');
  if (saveBtn) {
      if (currentPlayerIndex === totalPlayers - 1) {
          saveBtn.textContent = 'Gerar Equipas';
      } else {
          saveBtn.textContent = 'Próximo';
      }
  }
}

function loadPlayerData() {
  // Load existing player data if available
  const player = players[currentPlayerIndex];
  
  if (player) {
      document.getElementById('playerName').value = player.name || '';
      document.getElementById('playerLevel').value = player.level || '3';
      document.getElementById('playerPosition').value = player.position || 'hibrido';
      
      // Set attributes
      const attributeButtons = document.querySelectorAll('.attribute-btn');
      attributeButtons.forEach(btn => {
          const attr = btn.dataset.attr;
          if (player.attributes && player.attributes.includes(attr)) {
              btn.classList.add('active');
          } else {
              btn.classList.remove('active');
          }
      });
  } else {
      // Clear form for new player
      document.getElementById('playerName').value = '';
      document.getElementById('playerLevel').value = '3';
      document.getElementById('playerPosition').value = 'hibrido';
      
      // Clear attributes
      document.querySelectorAll('.attribute-btn').forEach(btn => {
          btn.classList.remove('active');
      });
  }
  
  updatePlayersSummary();
}

function saveAndContinue() {
  const name = document.getElementById('playerName').value.trim();
  
  if (!name) {
      alert('Por favor, digite o nome do jogador.');
      return;
  }
  
  // Get selected attributes
  const selectedAttributes = [];
  document.querySelectorAll('.attribute-btn.active').forEach(btn => {
      selectedAttributes.push(btn.dataset.attr);
  });
  
  // Save player data
  players[currentPlayerIndex] = {
      name: name,
      level: parseFloat(document.getElementById('playerLevel').value),
      position: document.getElementById('playerPosition').value,
      attributes: selectedAttributes
  };
  
  // Update navigation and progress
  updatePlayerNavigation();
  updateProgressBar();
  
  // Check if we're done with all players
  if (currentPlayerIndex === totalPlayers - 1) {
      // Check if all players are configured
      const allConfigured = players.every(p => p && p.name);
      if (allConfigured) {
          // Show generate button and auto-scroll
          const generateSection = document.getElementById('generateSection');
          if (generateSection) {
              generateSection.classList.remove('hidden');
              generateSection.scrollIntoView({ behavior: 'smooth' });
          }
      } else {
          // Find first missing player and go to them
          const missingPlayers = players.findIndex(p => !p || !p.name);
          if (missingPlayers !== -1) {
              currentPlayerIndex = missingPlayers;
              updatePlayerCounter();
              updatePlayerNavigation();
              loadPlayerData();
          }
      }
  } else {
      // Move to next player
      currentPlayerIndex++;
      updatePlayerCounter();
      loadPlayerData();
  }
  
  SoundManager.play('addPlayer');
}

function prevPlayer() {
  if (currentPlayerIndex > 0) {
      // Save current player data first
      const name = document.getElementById('playerName').value.trim();
      if (name) {
          const selectedAttributes = [];
          document.querySelectorAll('.attribute-btn.active').forEach(btn => {
              selectedAttributes.push(btn.dataset.attr);
          });
          
          players[currentPlayerIndex] = {
              name: name,
              level: parseFloat(document.getElementById('playerLevel').value),
              position: document.getElementById('playerPosition').value,
              attributes: selectedAttributes
          };
          
          updatePlayerNavigation();
          updateProgressBar();
      }
      
      currentPlayerIndex--;
      updatePlayerCounter();
      updatePlayerNavigation();
      loadPlayerData();
      SoundManager.play('click');
  }
}

function updatePlayersSummary() {
  // Players summary functionality removed since element doesn't exist in HTML
  // This function is kept for compatibility but doesn't do anything
}

function goToPlayer(index) {
  // Save current player data first
  const name = document.getElementById('playerName').value.trim();
  if (name) {
      const selectedAttributes = [];
      document.querySelectorAll('.attribute-btn.active').forEach(btn => {
          selectedAttributes.push(btn.dataset.attr);
      });
      
      players[currentPlayerIndex] = {
          name: name,
          level: parseFloat(document.getElementById('playerLevel').value),
          position: document.getElementById('playerPosition').value,
          attributes: selectedAttributes
      };
      
      updatePlayerNavigation();
      updateProgressBar();
  }
  
  currentPlayerIndex = index;
  updatePlayerCounter();
  updatePlayerNavigation();
  loadPlayerData();
  SoundManager.play('click');
}

// ===== ENHANCED TEAM GENERATION ALGORITHM =====

function generateEnhancedTeams() {
  console.log('Generating teams with enhanced algorithm...');
  
  // Calculate enhanced player scores
  const enhancedPlayers = players.map(player => ({
      ...player,
      ...calculateEnhancedPlayerStats(player)
  }));
  
  // Determine team configuration - Only support 10 or 15 players (2 or 3 teams of 5)
  let teamConfig;
  if (totalPlayers === 10) {
      teamConfig = { numTeams: 2, playersPerTeam: 5 };
  } else if (totalPlayers === 15) {
      teamConfig = { numTeams: 3, playersPerTeam: 5 };
  } else {
      // Fallback to 10 players if somehow we get a different number
      console.warn('Invalid player count, defaulting to 10 players (2 teams of 5)');
      teamConfig = { numTeams: 2, playersPerTeam: 5 };
  }
  
  // Generate balanced teams
  generatedTeams = createBalancedTeams(enhancedPlayers, teamConfig);
  
  console.log('Teams generated:', generatedTeams);
  SoundManager.play('success');
}

function calculateEnhancedPlayerStats(player) {
  let attackScore = player.level;
  let defenseScore = player.level;
  let creativityScore = player.level;
  let teamworkScore = player.level;
  let goalkeeperScore = player.level * 0.5; // Base goalkeeper ability
  
  // Apply position modifiers
  switch (player.position) {
      case 'atacante':
          attackScore *= 1.3;
          defenseScore *= 0.7;
          creativityScore *= 1.1;
          break;
      case 'defensor':
          attackScore *= 0.7;
          defenseScore *= 1.3;
          teamworkScore *= 1.1;
          break;
      case 'hibrido':
          attackScore *= 1.0;
          defenseScore *= 1.0;
          creativityScore *= 1.1;
          teamworkScore *= 1.2;
          break;
      case 'gr':
          attackScore *= 0.3;
          defenseScore *= 1.4;
          creativityScore *= 0.8;
          teamworkScore *= 1.0;
          goalkeeperScore *= 2.5; // Significantly boost goalkeeper ability
          break;
  }
  
  // Apply attribute modifiers
  player.attributes.forEach(attr => {
      const attrDef = attributeDefinitions[attr];
      if (attrDef) {
          attackScore *= attrDef.attackModifier || 1;
          defenseScore *= attrDef.defenseModifier || 1;
          creativityScore *= attrDef.creativityModifier || 1;
          teamworkScore *= attrDef.teamworkModifier || 1;
          if (attrDef.goalkeeperModifier) {
              goalkeeperScore *= attrDef.goalkeeperModifier;
          }
      }
  });
  
  // Calculate overall score
  const overallScore = (attackScore + defenseScore + creativityScore + teamworkScore) / 4;
  
  return {
      attackScore: Math.round(attackScore * 10) / 10,
      defenseScore: Math.round(defenseScore * 10) / 10,
      creativityScore: Math.round(creativityScore * 10) / 10,
      teamworkScore: Math.round(teamworkScore * 10) / 10,
      goalkeeperScore: Math.round(goalkeeperScore * 10) / 10,
      overallScore: Math.round(overallScore * 10) / 10
  };
}

function createBalancedTeams(players, teamConfig) {
  const { numTeams, playersPerTeam } = teamConfig;
  
  // Always use multi-team balancing algorithm since we only support 10+ players
  let bestTeams = null;
  let bestBalance = Infinity;
  
  // Try multiple iterations for best balance
  for (let iteration = 0; iteration < 1000; iteration++) {
      const teams = initializeTeams(numTeams);
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      
      // Distribute players using fixed-size snake draft method
      distributePlayersSnakeDraft(shuffledPlayers, teams, playersPerTeam);
      
      // Calculate balance score
      const balance = calculateTeamBalance(teams);
      
      if (balance < bestBalance) {
          bestBalance = balance;
          bestTeams = JSON.parse(JSON.stringify(teams));
      }
  }
  
  return bestTeams;
}

function initializeTeams(numTeams) {
  const teams = {};
  const teamNames = ['Equipa A', 'Equipa B', 'Equipa C'];
  
  for (let i = 0; i < numTeams; i++) {
      teams[teamNames[i]] = [];
  }
  
  return teams;
}

function distributePlayersSnakeDraft(players, teams, playersPerTeam) {
  const teamNames = Object.keys(teams);
  const numTeams = teamNames.length;
  
  // Create a draft order array for snake draft
  const draftOrder = [];
  
  // Create the snake draft order
  for (let round = 0; round < playersPerTeam; round++) {
      if (round % 2 === 0) {
          // Even rounds: normal order
          for (let i = 0; i < numTeams; i++) {
              draftOrder.push(i);
          }
      } else {
          // Odd rounds: reverse order
          for (let i = numTeams - 1; i >= 0; i--) {
              draftOrder.push(i);
          }
      }
  }
  
  // Distribute players according to draft order
  players.forEach((player, index) => {
      if (index < draftOrder.length) {
          const teamIndex = draftOrder[index];
          const teamName = teamNames[teamIndex];
          
          // Only add if team doesn't have 5 players yet
          if (teams[teamName].length < playersPerTeam) {
              teams[teamName].push(player);
          }
      }
  });
  
  // Verify each team has exactly 5 players
  Object.keys(teams).forEach(teamName => {
      console.log(`${teamName} has ${teams[teamName].length} players`);
  });
}

function calculateTeamBalance(teams) {
  const teamStats = Object.values(teams).map(team => ({
      overall: team.reduce((sum, p) => sum + p.overallScore, 0),
      attack: team.reduce((sum, p) => sum + p.attackScore, 0),
      defense: team.reduce((sum, p) => sum + p.defenseScore, 0),
      creativity: team.reduce((sum, p) => sum + p.creativityScore, 0),
      teamwork: team.reduce((sum, p) => sum + p.teamworkScore, 0),
      goalkeeper: team.reduce((sum, p) => sum + p.goalkeeperScore, 0),
      positions: countPositions(team),
      attributes: countAttributes(team)
  }));
  
  // Calculate variance in overall scores (lower is better)
  const overallScores = teamStats.map(stat => stat.overall);
  const overallVariance = calculateVariance(overallScores);
  
  // Calculate position balance penalty
  const positionPenalty = calculatePositionPenalty(teamStats);
  
  // Calculate attribute distribution penalty
  const attributePenalty = calculateAttributePenalty(teamStats);
  
  // Combined balance score (lower is better)
  return overallVariance * 10 + positionPenalty * 5 + attributePenalty * 3;
}

function countPositions(team) {
  const positions = { atacante: 0, defensor: 0, hibrido: 0, gr: 0 };
  team.forEach(player => {
      positions[player.position]++;
  });
  return positions;
}

function countAttributes(team) {
  const attributes = {};
  team.forEach(player => {
      player.attributes.forEach(attr => {
          attributes[attr] = (attributes[attr] || 0) + 1;
      });
  });
  return attributes;
}

function calculateVariance(numbers) {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  return variance;
}

function calculatePositionPenalty(teamStats) {
  let penalty = 0;
  
  // Penalize teams with no defenders, no attackers, or no goalkeepers
  teamStats.forEach(stat => {
      if (stat.positions.defensor === 0) penalty += 10;
      if (stat.positions.atacante === 0) penalty += 10;
      if (stat.positions.gr === 0) penalty += 15; // Higher penalty for missing goalkeeper
  });
  
  return penalty;
}

function calculateAttributePenalty(teamStats) {
  let penalty = 0;
  
  // Prefer balanced attribute distribution
  const totalTeams = teamStats.length;
  const importantAttributes = ['muralha', 'luva', 'sweeper', 'matador'];
  
  importantAttributes.forEach(attr => {
      const teamsWithAttr = teamStats.filter(stat => stat.attributes[attr] > 0).length;
      if (teamsWithAttr < totalTeams && teamsWithAttr > 0) {
          penalty += (totalTeams - teamsWithAttr) * 5;
      }
  });
  
  return penalty;
}

// ===== TEAM DISPLAY FUNCTIONS =====

function displayGeneratedTeams() {
  const teamsDisplay = document.getElementById('teamsDisplay');
  const teamsStats = document.getElementById('teamsStats');
  
  teamsDisplay.innerHTML = '';
  teamsStats.innerHTML = '';
  
  // Display teams
  Object.entries(generatedTeams).forEach(([teamName, team]) => {
      const teamCard = createTeamCard(teamName, team);
      teamsDisplay.appendChild(teamCard);
  });
  
  // Display statistics
  const statsCard = createStatsCard();
  teamsStats.appendChild(statsCard);
}

function createTeamCard(teamName, team) {
  const teamCard = document.createElement('div');
  teamCard.className = 'team-card';
  
  const overallScore = team.reduce((sum, p) => sum + p.overallScore, 0);
  
  // Determine which team gets "Sem Colete" (no vest) - first team gets it
  const isSemColete = teamName === 'Equipa A';
  
  if (isSemColete) {
    teamCard.classList.add('sem-colete');
  }
  
  teamCard.innerHTML = `
      ${isSemColete ? '<div class="sem-colete-badge">Sem Colete</div>' : ''}
      <div class="team-header">
          <div class="team-name">${teamName}</div>
          <div class="team-skill">Score Total: ${overallScore.toFixed(1)} | ${team.length} jogadores</div>
      </div>
      <ul class="team-players">
          ${team.map(player => `
              <li class="team-player">
                  <div class="player-info">
                      <div class="player-name-team">${player.name}</div>
                      <div class="player-attributes">
                          ${player.position} | Nível: ${player.level}
                          ${player.attributes.length > 0 ? '<br>' + player.attributes.map(attr => attributeDefinitions[attr]?.name || attr).join(', ') : ''}
                      </div>
                  </div>
                  <div class="player-level-badge">${player.overallScore.toFixed(1)}</div>
              </li>
          `).join('')}
      </ul>
  `;
  
  return teamCard;
}

function createStatsCard() {
  const statsCard = document.createElement('div');
  statsCard.className = 'teams-stats';
  
  const teamNames = Object.keys(generatedTeams);
  const teamStats = Object.values(generatedTeams).map(team => ({
      overall: team.reduce((sum, p) => sum + p.overallScore, 0),
      attack: team.reduce((sum, p) => sum + p.attackScore, 0),
      defense: team.reduce((sum, p) => sum + p.defenseScore, 0),
      creativity: team.reduce((sum, p) => sum + p.creativityScore, 0),
      goalkeeper: team.reduce((sum, p) => sum + p.goalkeeperScore, 0),
      playerCount: team.length
  }));
  
  const maxDifference = Math.max(...teamStats.map(s => s.overall)) - Math.min(...teamStats.map(s => s.overall));
  
  statsCard.innerHTML = `
      <div class="stats-title">Estatísticas das Equipas</div>
      <div class="stats-grid">
          <div class="stat-item">
              <div class="stat-label">Diferença Máxima</div>
              <div class="stat-value">${maxDifference.toFixed(1)}</div>
          </div>
          <div class="stat-item">
              <div class="stat-label">Equipas Geradas</div>
              <div class="stat-value">${teamNames.length}</div>
          </div>
          <div class="stat-item">
              <div class="stat-label">Total de Jogadores</div>
              <div class="stat-value">${totalPlayers}</div>
          </div>
          <div class="stat-item">
              <div class="stat-label">Score Médio</div>
              <div class="stat-value">${(teamStats.reduce((sum, s) => sum + s.overall, 0) / teamStats.length).toFixed(1)}</div>
          </div>
      </div>
      <div class="team-size-info" style="margin-top: 10px; text-align: center; color: #666;">
          Cada equipa tem exatamente 5 jogadores
      </div>
  `;
  
  return statsCard;
}

function regenerateTeams() {
  generateEnhancedTeams();
  displayGeneratedTeams();
  SoundManager.play('generate');
}

function generateFinalTeams() {
  // Ensure all players are saved
  const name = document.getElementById('playerName').value.trim();
  if (name) {
      const selectedAttributes = [];
      document.querySelectorAll('.attribute-btn.active').forEach(btn => {
          selectedAttributes.push(btn.dataset.attr);
      });
      
      players[currentPlayerIndex] = {
          name: name,
          level: parseFloat(document.getElementById('playerLevel').value),
          position: document.getElementById('playerPosition').value,
          attributes: selectedAttributes
      };
  }
  
  // Check if all players have names
  const missingPlayers = players.findIndex(p => !p || !p.name);
  if (missingPlayers !== -1) {
      alert(`Por favor, configure o jogador ${missingPlayers + 1} antes de gerar as equipas.`);
      goToPlayer(missingPlayers);
      return;
  }
  
  // Generate teams and go to step 3
  generateEnhancedTeams();
  currentStep = 3;
  updateStepDisplay();
  displayGeneratedTeams();
}

// Legacy compatibility for homepage
function updatePlayerCount(count) {
  totalPlayers = count;
  SoundManager.play('addPlayer');
}

function generateTeams() {
  // Legacy function - redirect to enhanced version if we're in the new system
  if (players.length > 0) {
      generateEnhancedTeams();
      currentStep = 3;
      updateStepDisplay();
      displayGeneratedTeams();
  }
}
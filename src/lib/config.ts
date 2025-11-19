export const API_BASE = import.meta.env.PUBLIC_API_BASE || "";

// Utility function to transform game data to the desired format
export const transformGameConfig = (gameData: any) => {
  return {
    ok: true,
    data: {
      name: gameData.name,
      minPlayers: gameData.minPlayers,
      maxPlayers: gameData.maxPlayers,
      minMods: gameData.minMods,
      maxMods: gameData.maxMods,
      serverConfig: gameData.serverConfig
    }
  };
};

// Utility function to fetch and transform game configuration
export const fetchGameConfig = async (gameName: string) => {
  try {
    const response = await fetch(`${API_BASE}/?handler=pulldata&file=games.json`);
    const result = await response.json();
    
    // Handle the wrapped response format {ok: boolean, data: T}
    const gamesData = result.ok ? result.data : result;
    
    // Find the specific game
    const game = Array.isArray(gamesData) 
      ? gamesData.find((g: any) => g.name === gameName)
      : gamesData;
    
    if (!game) {
      throw new Error(`Game ${gameName} not found`);
    }
    
    // Transform to the desired format
    return transformGameConfig(game);
  } catch (error) {
    console.error('Error fetching game config:', error);
    return {
      ok: false,
      data: null
    };
  }
};
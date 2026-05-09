// API service stub - currently uses localStorage, will be swapped for HTTP client later

export interface GameRecord {
  id: string;
  players: { name: string; score: number; isBot: boolean }[];
  winner: string;
  date: string;
  rounds: number;
}

export interface ApiService {
  saveGame(record: GameRecord): Promise<void>;
  getGameHistory(): Promise<GameRecord[]>;
  clearHistory(): Promise<void>;
}

// Local implementation using localStorage
class LocalApiService implements ApiService {
  private readonly STORAGE_KEY = 'yahtzee_history';

  async saveGame(record: GameRecord): Promise<void> {
    const history = await this.getGameHistory();
    history.unshift(record);
    // Keep last 50 games
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  }

  async getGameHistory(): Promise<GameRecord[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const apiService: ApiService = new LocalApiService();

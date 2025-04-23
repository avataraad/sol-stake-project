export interface StakeAccount {
  stake_account: string;
  sol_balance: number;
  status: string;
  delegated_stake_amount: number;
  total_reward: number;
  voter: string;
  type: string;
  active_stake_amount: number;
  activation_epoch: number;
  role: string;
}

export interface SolscanResponse {
  data: StakeAccount[];
  metadata?: {
    hasNextPage: boolean;
    nextPage?: string;
    totalItems?: number;
  };
}

export interface SolscanPortfolioResponse {
  data: {
    native_balance: {
      balance: number;
    };
  };
}

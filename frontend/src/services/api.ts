const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export async function getHealth(): Promise<{ status: string; environment: string }> {
  const response = await fetch('/health');
  if (!response.ok) throw new Error('Backend health check failed');
  return response.json();
}

export async function getGasFees(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/web3/gas`);
  if (!response.ok) throw new Error('Could not load gas fees');
  return response.json();
}

export async function getTokenPrices(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/web3/prices`);
  if (!response.ok) throw new Error('Could not load token prices');
  return response.json();
}

export async function getStakingPools(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/web3/staking`);
  if (!response.ok) throw new Error('Could not load staking pools');
  return response.json();
}

export async function queryAIAnalyst(message: string, portfolio?: any): Promise<{ reply: string; suggested_actions: string[] }> {
  const response = await fetch(`${API_BASE_URL}/web3/ai-analyst`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, portfolio }),
  });
  if (!response.ok) throw new Error('Could not get AI analyst response');
  return response.json();
}

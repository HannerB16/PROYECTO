import axios from 'axios';

export const api = axios.create({
  baseURL: (__API_BASE_URL__ as string) + '/api/v1'
});

export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  industry?: string | null;
  created_at: string;
  owner_id?: number | null;
}

export interface AnalyticsOverview {
  health_index: number;
  velocity_index: number;
  automation_rate: number;
  ai_recommendations: string[];
  highlights: { label: string; value: number; trend?: number | null }[];
}

export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<Workspace[]>('/workspaces', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auroraops.token') ?? ''}`
    }
  });
  return response.data;
};

export const fetchAnalytics = async (): Promise<AnalyticsOverview> => {
  const response = await api.get<AnalyticsOverview>('/analytics/overview', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auroraops.token') ?? ''}`
    }
  });
  return response.data;
};

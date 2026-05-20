export interface AdzunaSearchResponse {
  count: number;
  mean?: number;
  results: AdzunaJobResult[];
}

export interface AdzunaJobResult {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  category?: { label?: string };
}

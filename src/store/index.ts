import { create } from 'zustand';
import { Company } from '../types';

const API_URL = '/api';

interface AppState {
  companies: Company[];
  settings: Record<string, string>;
  token: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  fetchCompanies: () => Promise<void>;
  submitCompany: (company: Partial<Company>) => Promise<void>;
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  getCompanyById: (id: string) => Company | undefined;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Record<string, string>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  companies: [],
  settings: {
    disclaimer: '测试网站   仅供参考   ',
    homeTitle: '现实[太饿]   吃掉我[希望]',
    homeDescription: '扯下黑心公司的遮羞布',
    footerDescription: '测试网站   仅供参考',
    footerCopyright: '© 2026 Norest. All Rights Reserved.'
  },
  token: localStorage.getItem('admin_token'),
  
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!res.ok) throw new Error('登录失败');
    
    const data = await res.json();
    localStorage.setItem('admin_token', data.token);
    set({ token: data.token });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null });
  },

  fetchCompanies: async () => {
    try {
      const res = await fetch(`${API_URL}/companies`);
      if (res.ok) {
        const data = await res.json();
        set({ companies: data });
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  },

  submitCompany: async (company) => {
    const res = await fetch(`${API_URL}/companies/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(company)
    });
    
    if (!res.ok) {
      throw new Error('提交失败');
    }
  },

  addCompany: async (company) => {
    const token = get().token;
    const res = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(company)
    });
    
    if (res.ok) {
      await get().fetchCompanies();
    }
  },
  
  updateCompany: async (id, updates) => {
    const token = get().token;
    const res = await fetch(`${API_URL}/companies/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (res.ok) {
      await get().fetchCompanies();
    }
  },
  
  deleteCompany: async (id) => {
    const token = get().token;
    const res = await fetch(`${API_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      await get().fetchCompanies();
    }
  },
  
  getCompanyById: (id) => {
    return get().companies.find(c => c.id === id);
  },

  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        set({ settings: { ...get().settings, ...data } });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  updateSettings: async (settings) => {
    const token = get().token;
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (res.ok) {
      await get().fetchSettings();
    }
  }
}));

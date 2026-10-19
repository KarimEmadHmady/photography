import axios from 'axios';
import {
  ApiResponse,
  IRegion,
  ILocation,
  IService,
  ISiteSettings,
  IAdmin,
} from '../types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds to prevent premature timeouts during cold DB handshakes
});

// Lightweight in-memory TTL cache for frequent read-heavy public data
const PUBLIC_CACHE_PREFIX = 'pub_';
const memoryCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

// بيزيد كل ما الكاش يتمسح، علشان طلب كان شغال وقت المسح ميرجّعش بيانات قديمة للكاش
let cacheVersion = 0;

export const clearApiCache = (prefix?: string) => {
  cacheVersion++;
  if (!prefix) {
    memoryCache.clear();
    inFlightRequests.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
    for (const key of inFlightRequests.keys()) {
      if (key.startsWith(prefix)) {
        inFlightRequests.delete(key);
      }
    }
  }
};

const getCachedData = <T>(key: string): T | null => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data as T;
};

const setCachedData = (key: string, data: any, ttlMs: number = 300000) => {
  memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
};

const fetchWithCacheAndDedup = async <T>(
  key: string,
  fetcher: () => Promise<ApiResponse<T>>,
  ttlMs: number = 300000
): Promise<ApiResponse<T>> => {
  const cached = getCachedData<ApiResponse<T>>(key);
  if (cached) return cached;

  const running = inFlightRequests.get(key);
  if (running) return running as Promise<ApiResponse<T>>;

  const versionAtStart = cacheVersion;

  const promise: Promise<ApiResponse<T>> = fetcher()
    .then((res) => {
      // لو الكاش اتمسح أثناء الطلب (حفظ في الأدمن مثلاً) منخزنش النتيجة القديمة
      if (res?.success && versionAtStart === cacheVersion) {
        setCachedData(key, res, ttlMs);
      }
      return res;
    })
    .finally(() => {
      // نمسح بس لو لسه هو نفس الطلب (clearApiCache ممكن يكون مسحه وبدأ طلب جديد)
      if (inFlightRequests.get(key) === promise) {
        inFlightRequests.delete(key);
      }
    });

  inFlightRequests.set(key, promise);
  return promise;
};

// Request interceptor to attach token if present in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor with 1 automatic retry for transient GET failures
apiClient.interceptors.response.use(
  (response) => {
    // أي تعديل ناجح من الأدمن (POST/PATCH/PUT/DELETE) بيمسح كاش الموقع العام تلقائياً
    const method = response.config.method?.toLowerCase();
    if (method && method !== 'get' && response.config.url?.startsWith('/admin')) {
      clearApiCache(PUBLIC_CACHE_PREFIX);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    // Auto-retry once for idempotent GET requests on network failure or 502/503/504
    if (
      config &&
      config.method?.toLowerCase() === 'get' &&
      !config._retry &&
      (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED')
    ) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 600));
      return apiClient(config);
    }

    let message = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'استغرقت الاستجابة وقتاً أطول من المعتاد، يرجى إعادة المحاولة.';
      } else if (error.message.includes('Network Error')) {
        message = 'تعذر الاتصال بالسيرفر، يرجى التأكد من اتصال الإنترنت.';
      } else {
        message = error.message;
      }
    }
    const customError = new Error(message) as any;
    customError.statusCode = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

// ================= API Endpoints =================

export const api = {
  // --- Auth ---
  auth: {
    login: async (phone: string, password: string): Promise<ApiResponse<{ admin: IAdmin; token?: string }>> => {
      const res = await apiClient.post('/auth/login', { phone, password });
      if (typeof window !== 'undefined' && res.data?.data?.token) {
        localStorage.setItem('admin_token', res.data.data.token);
      }
      return res.data;
    },
    logout: async (): Promise<ApiResponse> => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      const res = await apiClient.post('/auth/logout');
      return res.data;
    },
    me: async (): Promise<ApiResponse<IAdmin>> => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
      const res = await apiClient.patch('/admin/change-password', { currentPassword, newPassword });
      return res.data;
    },
    updateProfile: async (data: Partial<IAdmin>): Promise<ApiResponse<IAdmin>> => {
      const res = await apiClient.patch('/admin/profile', data);
      return res.data;
    },
  },

  // --- Public Content ---
  public: {
    getHomepage: async (): Promise<ApiResponse<{
      settings: ISiteSettings;
      sections: any[];
      featuredRegions: IRegion[];
      featuredLocations: ILocation[];
      featuredServices: IService[];
      portfolioItems: any[];
    }>> => {
      const res = await apiClient.get('/homepage');
      return res.data;
    },
    getSettings: async (): Promise<ApiResponse<ISiteSettings>> => {
      return fetchWithCacheAndDedup('pub_settings', async () => {
        const res = await apiClient.get('/settings/public');
        return res.data;
      });
    },
    getRegions: async (): Promise<ApiResponse<IRegion[]>> => {
      return fetchWithCacheAndDedup('pub_regions', async () => {
        const res = await apiClient.get('/regions');
        return res.data;
      });
    },
    getRegionBySlug: async (slug: string): Promise<ApiResponse<IRegion & { locations: ILocation[] }>> => {
      const res = await apiClient.get(`/regions/${encodeURIComponent(slug)}`);
      return res.data;
    },
    getLocations: async (params?: { region?: string; featured?: boolean; page?: number; limit?: number }): Promise<ApiResponse<ILocation[]>> => {
      const res = await apiClient.get('/locations', { params });
      return res.data;
    },
    getLocationBySlug: async (slug: string): Promise<ApiResponse<ILocation>> => {
      const res = await apiClient.get(`/locations/${encodeURIComponent(slug)}`);
      return res.data;
    },
    getRelatedLocations: async (identifier: string): Promise<ApiResponse<ILocation[]>> => {
      const res = await apiClient.get(`/locations/${encodeURIComponent(identifier)}/related`);
      return res.data;
    },
    getServices: async (params?: { homepage?: boolean; locationId?: string }): Promise<ApiResponse<IService[]>> => {
      const res = await apiClient.get('/services', { params });
      return res.data;
    },
    getServiceBySlug: async (slug: string): Promise<ApiResponse<IService>> => {
      const res = await apiClient.get(`/services/${encodeURIComponent(slug)}`);
      return res.data;
    },
  },

  // --- Admin Endpoints ---
  admin: {
    // Regions
    getRegions: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<IRegion[]>> => {
      const res = await apiClient.get('/admin/regions', { params });
      return res.data;
    },
    getRegionById: async (id: string): Promise<ApiResponse<IRegion>> => {
      const res = await apiClient.get(`/admin/regions/${id}`);
      return res.data;
    },
    createRegion: async (data: Partial<IRegion>): Promise<ApiResponse<IRegion>> => {
      const res = await apiClient.post('/admin/regions', data);
      return res.data;
    },
    updateRegion: async (id: string, data: Partial<IRegion>): Promise<ApiResponse<IRegion>> => {
      const res = await apiClient.patch(`/admin/regions/${id}`, data);
      return res.data;
    },
    deleteRegion: async (id: string): Promise<ApiResponse> => {
      const res = await apiClient.delete(`/admin/regions/${id}`);
      return res.data;
    },

    // Locations
    getLocations: async (params?: { search?: string; regionId?: string; status?: string; isFeatured?: boolean; page?: number; limit?: number }): Promise<ApiResponse<ILocation[]>> => {
      const res = await apiClient.get('/admin/locations', { params });
      return res.data;
    },
    getLocationById: async (id: string): Promise<ApiResponse<ILocation>> => {
      const res = await apiClient.get(`/admin/locations/${id}`);
      return res.data;
    },
    createLocation: async (data: Partial<ILocation>): Promise<ApiResponse<ILocation>> => {
      const res = await apiClient.post('/admin/locations', data);
      return res.data;
    },
    updateLocation: async (id: string, data: Partial<ILocation>): Promise<ApiResponse<ILocation>> => {
      const res = await apiClient.patch(`/admin/locations/${id}`, data);
      return res.data;
    },
    deleteLocation: async (id: string): Promise<ApiResponse> => {
      const res = await apiClient.delete(`/admin/locations/${id}`);
      return res.data;
    },
    updateGalleryOrder: async (id: string, gallery: any[]): Promise<ApiResponse> => {
      const res = await apiClient.patch(`/admin/locations/${id}/gallery-order`, { gallery });
      return res.data;
    },

    // Services
    getServices: async (params?: { search?: string; status?: string; isActive?: boolean; page?: number; limit?: number }): Promise<ApiResponse<IService[]>> => {
      const res = await apiClient.get('/admin/services', { params });
      return res.data;
    },
    getServiceById: async (id: string): Promise<ApiResponse<IService>> => {
      const res = await apiClient.get(`/admin/services/${id}`);
      return res.data;
    },
    createService: async (data: Partial<IService>): Promise<ApiResponse<IService>> => {
      const res = await apiClient.post('/admin/services', data);
      return res.data;
    },
    updateService: async (id: string, data: Partial<IService>): Promise<ApiResponse<IService>> => {
      const res = await apiClient.patch(`/admin/services/${id}`, data);
      return res.data;
    },
    deleteService: async (id: string): Promise<ApiResponse> => {
      const res = await apiClient.delete(`/admin/services/${id}`);
      return res.data;
    },

    // Homepage & Settings
    getSettings: async (): Promise<ApiResponse<ISiteSettings>> => {
      const res = await apiClient.get('/admin/settings');
      return res.data;
    },
    updateSettings: async (data: Partial<ISiteSettings>): Promise<ApiResponse<ISiteSettings>> => {
      const res = await apiClient.patch('/admin/settings', data);
      return res.data;
    },
    getHomepage: async (): Promise<ApiResponse<any>> => {
      const res = await apiClient.get('/admin/homepage');
      return res.data;
    },
    updateHomepage: async (data: any): Promise<ApiResponse<any>> => {
      const res = await apiClient.patch('/admin/homepage', data);
      return res.data;
    },

    // Uploads
    uploadImage: async (file: File, folder?: string): Promise<ApiResponse<{ publicId: string; url: string; width: number; height: number; format: string; bytes: number }>> => {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) formData.append('folder', folder);

      const res = await apiClient.post('/admin/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    deleteImage: async (publicId: string): Promise<ApiResponse<{ deleted: boolean; message: string }>> => {
      const res = await apiClient.delete(`/admin/uploads/${encodeURIComponent(publicId)}`);
      return res.data;
    },

    // Profile & Security
    updateProfile: async (data: { name?: string; email?: string; phone?: string }): Promise<ApiResponse<IAdmin>> => {
      const res = await apiClient.patch('/admin/profile', data);
      return res.data;
    },
    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
      const res = await apiClient.patch('/admin/change-password', data);
      return res.data;
    },
  },
};

export default api;

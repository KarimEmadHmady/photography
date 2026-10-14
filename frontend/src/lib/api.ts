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
  timeout: 15000,
});

// Response interceptor to unwrap errors and format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
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
      return res.data;
    },
    logout: async (): Promise<ApiResponse> => {
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
      const res = await apiClient.get('/settings/public');
      return res.data;
    },
    getRegions: async (): Promise<ApiResponse<IRegion[]>> => {
      const res = await apiClient.get('/regions');
      return res.data;
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
  },
};

export default api;

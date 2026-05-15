import axiosInstance from './axiosInstance';
import { ApiResponse } from '../types';

export interface TechnicianSkill {
  id: string;
  technicianId: string;
  skillName: string;
  experienceYears?: number;
  proficiencyLevel?: number;
  ratings?: number;
}

export const skillApi = {
  getByTechnicianId: async (technicianId: string) => {
    const response = await axiosInstance.get<ApiResponse<TechnicianSkill[]>>(
      '/private/technician-skill',
      { params: { technicianId } }
    );
    return response.data;
  },
};

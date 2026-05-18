import { useQuery } from 'react-query';
import { technicianApi } from '../api/technicianApi';
import { extractApiData } from '../lib/utils';

export const useTechnicians = () => {
  return useQuery('technicians', technicianApi.getAll, {
    select: extractApiData,
  });
};

export const useTechnicianLocations = () => {
  return useQuery('technicianLocations', technicianApi.getLocations, {
    refetchInterval: 10000,
    select: (response) => response.data ?? [],
  });
};

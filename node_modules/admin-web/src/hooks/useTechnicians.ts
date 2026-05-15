import { useQuery } from 'react-query';
import { technicianApi } from '../api/technicianApi';

export const useTechnicians = () => {
  return useQuery('technicians', technicianApi.getAll, {
    // UserController returns paginated: { content: [], totalElements, ... }
    select: (response) => response.data?.content ?? response.data ?? [],
  });
};

export const useTechnicianLocations = () => {
  return useQuery('technicianLocations', technicianApi.getLocations, {
    refetchInterval: 10000,
    select: (response) => response.data ?? [],
  });
};

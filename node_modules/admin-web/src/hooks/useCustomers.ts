import { useQuery } from 'react-query';
import { customerApi } from '../api/customerApi';

export const useCustomers = (params?: any) => {
  return useQuery(['customers', params], () => customerApi.getAll(params), {
    // Backend returns paginated: { content: [], totalElements, totalPages, currentPage }
    select: (response) => response.data?.content ?? response.data ?? [],
  });
};

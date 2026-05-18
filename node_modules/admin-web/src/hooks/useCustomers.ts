import { useQuery } from 'react-query';
import { customerApi } from '../api/customerApi';
import { extractApiData } from '../lib/utils';

export const useCustomers = (params?: any) => {
  return useQuery(['customers', params], () => customerApi.getAll(params), {
    select: extractApiData,
  });
};

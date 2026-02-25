import { select } from '@bridgeshop/postgres-query-builder';

export const getCustomerGroupsBaseQuery = () => {
  const query = select().from('customer_group');

  return query;
};

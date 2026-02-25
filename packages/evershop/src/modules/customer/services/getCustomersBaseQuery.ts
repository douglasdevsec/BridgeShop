import { select, SelectQuery } from '@bridgeshop/postgres-query-builder';

export const getCustomersBaseQuery = (): SelectQuery => {
  const query = select().from('customer');

  return query;
};

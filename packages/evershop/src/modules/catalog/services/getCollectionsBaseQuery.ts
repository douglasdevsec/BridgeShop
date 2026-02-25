import { select } from '@bridgeshop/postgres-query-builder';
import type { SelectQuery } from '@bridgeshop/postgres-query-builder';

export const getCollectionsBaseQuery = (): SelectQuery => {
  const query = select().from('collection');
  return query;
};

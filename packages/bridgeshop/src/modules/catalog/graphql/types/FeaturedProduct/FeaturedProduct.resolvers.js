import { node, select } from '@bridgeshop/postgres-query-builder';
import { camelCase } from '../../../../../lib/util/camelCase.js';
import { getConfig } from '../../../../../lib/util/getConfig.js';

export default {
  Query: {
    featuredProducts: async (root, { limit = 4 }, { pool }) => {
      const query = select('product.product_id')
        .select('product.uuid')
        .select('product.sku')
        .select('product.price')
        .select('product.status')
        .select('product.visibility')
        .select('product_description.product_description_id')
        .select('product_description.name')
        .select('product_description.url_key')
        // La imagen principal se obtiene desde la tabla product_image
        // el resolver ProductImage.image espera el campo originImage (camelCase de origin_image)
        .select('product_image.origin_image')
        .select('SUM(cart_item.qty)', 'soldQty')
        .from('product');

      query
        .leftJoin('product_description')
        .on(
          'product.product_id',
          '=',
          'product_description.product_description_product_id'
        );

      query
        .innerJoin('product_inventory')
        .on(
          'product.product_id',
          '=',
          'product_inventory.product_inventory_product_id'
        );

      query
        .leftJoin('cart_item')
        .on('cart_item.product_id', '=', 'product.product_id');

      // JOIN a la tabla de imágenes para obtener la imagen principal del producto
      query
        .leftJoin('product_image')
        .on('product_image.product_image_product_id', '=', 'product.product_id')
        .and('product_image.is_main', '=', true);

      query.where('product.status', '=', 1);
      query.andWhere('product.visibility', '=', 1);

      if (getConfig('catalog.showOutOfStockProduct', false) === false) {
        query
          .andWhere('product_inventory.manage_stock', '=', false)
          .addNode(
            node('OR')
              .addLeaf('AND', 'product_inventory.qty', '>', 0)
              .addLeaf('AND', 'product_inventory.stock_availability', '=', true)
          );
      }

      query.groupBy(
        'product.product_id',
        'product.uuid',
        'product.sku',
        'product.price',
        'product.status',
        'product.visibility',
        'product_description.product_description_id',
        'product_description.name',
        'product_description.url_key',
        'product_image.origin_image'
      );
      query.orderBy('SUM(cart_item.qty)', 'desc');
      query.limit(0, parseInt(limit, 10));

      const products = await query.execute(pool);
      return products.map((product) => camelCase(product));
    }
  }
};

export const PAGINATED_DROPS_QUERY = `
  query PaginatedDrops(
    $limit: Int!
    $offset: Int!
    $orderBy: [drops_order_by!]
    $where: drops_bool_exp
  ) {
    drops(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
      id
      fancy_id
      name
      description
      city
      country
      channel
      platform
      location_type
      drop_url
      image_url
      animation_url
      year
      start_date
      timezone
      private
      created_date
      expiry_date
      end_date
      stats_by_chain_aggregate {
        aggregate {
          sum {
            transfer_count
            poap_count
          }
        }
      }
    }
  }
`;

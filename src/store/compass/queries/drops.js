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
      virtual
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

export const DROPS_COUNT = `
  query PaginatedCountDrops(
    $where: drops_bool_exp
  ) {
    drops_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const SEARCH_PAGINATED_DROPS_QUERY = `
query SearchPaginatedDrops($limit: Int!, $offset: Int!, $orderBy: [drops_order_by!], $where: drops_bool_exp, $search: String = "") {
  search_drops(limit: $limit, offset: $offset, order_by: $orderBy, where: $where, args: {search: $search}) {
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
    virtual
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

export const SEARCH_DROPS_COUNT = `
  query SearchPaginatedCountDrops(
    $where: drops_bool_exp,
    $search: String = ""
  ) {
    search_drops_aggregate(where: $where, args: {search: $search}) {
      aggregate {
        count
      }
    }
  }
`;

export const TRANSFER_ACTIVITY_QUERY = `
query TransferActivity($limit: Int!, $orderBy: [transfers_order_by!]) {
  transfers(order_by: $orderBy, limit: $limit) {
    chain
    to_address
    from_address
    timestamp
    poap {
      id
      transfer_count
      collector_address
      drop {
        id
        image_url
      }
    }
  }
}
`;

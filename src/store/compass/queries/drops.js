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

export const MOST_MINTED_DROP_QUERY = `
query MostMintedDrop {
  drops_stats_by_chain(order_by: {poap_count:desc}, limit: 1) {
    poap_count
    transfer_count
    drop{
      animation_url
      channel
      city
      country
      description
      end_date
      expiry_date
      fancy_id
      id
      image_url
      location_type
      name
      platform
      private
      start_date
      timezone
      virtual
      year
    }
  }
}
`;

export const UPCOMING_DROP = `
query UpcomingDrop {
  drops(
    order_by: {start_date: asc}, 
    limit: 1, 
    where: {
      private: {_eq: "false"}, 
      start_date: {_gt: "now"},
      stats_by_chain: { poap_count: { _gte: 1 } },
    }) {
      animation_url
      channel
      city
      country
      description
      end_date
      expiry_date
      fancy_id
      id
      image_url
      location_type
      name
      platform
      private
      start_date
      timezone
      virtual
      year
      stats_by_chain_aggregate {
          aggregate {
              sum {
                  poap_count
                  transfer_count
              }
          }
      }
  }
}
`;

export const MOST_RECENT = `
query MostRecent {
  drops(
    order_by: {start_date: desc}, 
    limit: 1, 
    where: {
      private: {_eq: "false"}, 
      start_date: {_lt: "now"},
      stats_by_chain: { poap_count: { _gte: 1 } },
    }) {
      animation_url
      channel
      city
      country
      description
      end_date
      expiry_date
      fancy_id
      id
      image_url
      location_type
      name
      platform
      private
      start_date
      timezone
      virtual
      year
      stats_by_chain_aggregate {
          aggregate {
              sum {
                  poap_count
                  transfer_count
              }
          }
      }
  }
}
`;

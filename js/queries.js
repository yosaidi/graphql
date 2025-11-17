export const USER_QUERY = `
query {
  user {
    id
    login
    firstName 
    lastName  
    email     
    attrs
    totalUp
    totalDown
    auditRatio

    transactions(order_by: { createdAt: desc }) {
      id
      type
      amount
      createdAt
      path
    }

    xp_total: transactions_aggregate(
      where: {
        eventId: {_eq: 41}, 
        type: {_eq: "xp"}, 
        path: {_like: "%module%"}
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }

    progresses(
      where: {path: {_like: "%module%"}}, 
      order_by: { updatedAt: desc }
    ) {
      id
      grade
      path
      object {
        name
        type
      }
      group {
        members {
          userLogin
        }
      }
    }
    
    current_projects: groups(where: {group: {status: {_eq: working}}}) {
      group {
        path
      }
    }
  }
}
`;

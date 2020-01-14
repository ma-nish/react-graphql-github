export const ADD_STAR = `
  mutation ($repositoryId: ID!) {
    addStar(input:{starrableId:$repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

export const REMOVE_STAR = `
  mutation($repositoryId: ID!){
    removeStar(input: { starrableId: $repositoryId }){
      starrable {
        viewerHasStarred
      }
    }
  }
`;
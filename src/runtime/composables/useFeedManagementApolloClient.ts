import { getFeedManagementApolloClient } from '../auth/apollo'

export const useFeedManagementApolloClient = async () => {
  return await getFeedManagementApolloClient()
}

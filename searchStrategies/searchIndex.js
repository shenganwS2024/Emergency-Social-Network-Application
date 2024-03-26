import UserNameSearch from './userNameSearch.js'
import statusSearch from './userStatusSearch.js'

const getStrategy = (context, criteria) => {
    switch (context) {
        case 'username':
            return new UserNameSearch().search(criteria);
        case 'status':
            return new statusSearch.search(criteria);
        // case 'publicMessages':
        //     return new PublicMessageSearch();
        // case 'userProfiles':
        //     return new UserProfileSearch();
        default:
            throw new Error(`Unknown search context: ${context}`);
    }
}

export default getStrategy;
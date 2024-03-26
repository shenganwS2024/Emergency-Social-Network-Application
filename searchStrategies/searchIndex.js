import UserNameSearch from './userNameSearch.js'

const getStrategy = (context, criteria) => {
    switch (context) {
        case 'username':
            return new UserNameSearch(criteria);
        // case 'publicMessages':
        //     return new PublicMessageSearch();
        // case 'userProfiles':
        //     return new UserProfileSearch();
        default:
            throw new Error(`Unknown search context: ${context}`);
    }
}

export default getStrategy;
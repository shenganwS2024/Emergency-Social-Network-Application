import UserNameSearch from './userNameSearch.js'
import statusSearch from './userStatusSearch.js'

const getStrategy = async (context, criteria) => {
    switch (context) {
        case 'username':
            let ret =  await new UserNameSearch().search(criteria);
            console.log("ret",ret)
            return ret;
        case 'status':
            let ret2 =  await new statusSearch().search(criteria);
            
            return ret2;
        // case 'publicMessages':
        //     return new PublicMessageSearch();
        // case 'userProfiles':
        //     return new UserProfileSearch();
        default:
            throw new Error(`Unknown search context: ${context}`);
    }
}

export default getStrategy;
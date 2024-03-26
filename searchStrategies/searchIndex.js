import UserNameSearch from './userNameSearch.js'
import statusSearch from './userStatusSearch.js'
import publicMessageSearch from './publicMessageSearch.js'


const getStrategy = async (context, criteria, sender, receiver) => {
    switch (context) {
        case 'username':
            return await new UserNameSearch().search(criteria);
        case 'status':
            return await new statusSearch().search(criteria);
        // case 'publicMessage':
        //     return await new publicMessageSearch().search(criteria);
        case 'privateMessage':
            return await new privateMessageSearch().search(criteria, sender, receiver);
        // case 'announcement':
        //     return await new announcementSearch().search(criteria);
        default:
            throw new Error(`Unknown search context: ${context}`);
    }
}

export default getStrategy;
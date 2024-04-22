import { PRODUCTION_DB_URI, TEST_DB_URI, io } from '../config/serverConfig.js';
import DBAccessDAO from './dao/DBAccessDAO.js';
import {Users} from '../models/Users.js'
import { getIsSpeedTestMode, setIsSpeedTestMode } from '../config/globalVariables.js';

async function checkSpeedTestMode(req, res) {
    res.status(200).json({ data: { isSpeedTestMode : getIsSpeedTestMode() } })
}

const checkAllUsersOffline = async () => {
    let onlineUsersCount = await Users.countDocuments({ onlineStatus: true });
    console.log("how many online:", onlineUsersCount)
    return onlineUsersCount <= 1;
  };
  
  // Function to wait for a specific time
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function switchDatabase(req, res) {
    try {
        let oldSpeedTestMode = getIsSpeedTestMode()
        setIsSpeedTestMode(req.body.isSpeedTestMode);
        const username = req.body.username;
        let isSpeedTestMode = getIsSpeedTestMode();
        let newDbUri = isSpeedTestMode ? TEST_DB_URI : PRODUCTION_DB_URI;
        console.log ("currentDB: ",newDbUri,isSpeedTestMode)
        if(isSpeedTestMode){
            io.emit('speed test logout', { username: username })
            while (true) {
                const allOffline = await checkAllUsersOffline();
                if (allOffline) {
                    console.log("All users are offline. Proceeding with database switch.");
                    break;
                } else {
                    if(!isSpeedTestMode){
                        break;
                    }
                    console.log("Waiting for all users to go offline...");
                    await wait(2000);  // Wait for 2 seconds before checking again
                }
            }

            await DBAccessDAO.switchDatabase(newDbUri);

        }
        else{
            if(oldSpeedTestMode){
                if(newDbUri === PRODUCTION_DB_URI){
                    await DBAccessDAO.destroyTestDatabase();
                }
                
                await DBAccessDAO.switchDatabase(newDbUri);
            }
            
            
        }
    


        res.status(200).json({ message: 'Database switched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error switching database' });
    }
}

// add a helper checker function to check if the user's privilege level is Administrator then he should be able to switch the database
async function allowToSpeedTest(req, res) {
    const username = req.body.username;
    const user = await Users.findOne({ username: username });
    if (user.privilege !== 'Administrator') {
        res.status(403).send('User does not have the privilege to switch to speed test mode');
        return;
    }
    res.status(200).json({ message: 'User has the privilege to switch to speed test mode' });
}

export { switchDatabase, PRODUCTION_DB_URI, TEST_DB_URI, checkSpeedTestMode, allowToSpeedTest };

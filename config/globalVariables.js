let userRoomMap = new Map();
let userNotificationMap = new Map();
let isSpeedTestMode = false;

function setIsSpeedTestMode(value) {
    isSpeedTestMode = value;
}

function getIsSpeedTestMode() {
    return isSpeedTestMode;
}

export { userRoomMap, userNotificationMap, setIsSpeedTestMode, getIsSpeedTestMode };

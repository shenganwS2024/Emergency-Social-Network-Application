let userRoomMap = new Map();
let isSpeedTestMode = false;

function setIsSpeedTestMode(value) {
    isSpeedTestMode = value;
}

function getIsSpeedTestMode() {
    return isSpeedTestMode;
}

export { userRoomMap, setIsSpeedTestMode, getIsSpeedTestMode };

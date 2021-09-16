const moment = require('moment');
const status = {};

function initStatus(meetingId) {
    if (!status[meetingId]) {
        status[meetingId] = {};
    }
    const now = moment().unix();
    const bucket = now - (now % 10);
    if (!status[meetingId][bucket]) {
        status[meetingId][bucket] = 0;
    }
}

function getStatus(meetingId) {
    const now = moment().unix();
    const bucket = now - (now % 10);
    const count = status[meetingId][bucket] || 0;
    let r = 0;
    let g = 0;
    if (count < 5) {
        g = 15 - ( 2 * count );
    } else {
        let val = count < 10 ? count - 5 : 7;
        r =  15 - ( 2 * val);
    }
    const green = g.toString(16);
    const red = r.toString(16);
    return {
        count,
        color: `${red}${red}${green}${green}00`.toUpperCase(),
    }
}

module.exports = {
    status,
    initStatus,
    getStatus
}

const moment = require('moment');
const { status, initStatus } = require('./status');

module.exports = {
    cantSeeYou: ({ meetingId, userId }) => {
        const now = moment().unix();
        const bucket = now - (now % 10);
        initStatus(meetingId);
        status[meetingId][bucket]++;
    },
    hello: () => {}
};

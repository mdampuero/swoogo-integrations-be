const axios = require('axios');
const { calculateRutWithCheckDigit } = require('../helpers/utils');
const Checkin = require("../models/checkin");

const localRegistrantsSetScan = async (registrantId, integration) => {
    try {
        /**
         * EXIST CHECKIN
         */
        if (checkinExist = await Checkin.findOne({
            id: registrantId,
            document: calculateRutWithCheckDigit(registrantId),
            integration,
        })) {
            return checkinExist;
        }

        /**
         * CREATE CHECKIN
         */
        const checkin = new Checkin({
            id: registrantId,
            document: calculateRutWithCheckDigit(registrantId),
            integration,
            created_at: new Date()
        });
        checkin.save();
        return checkin;
    } catch (error) {
        return false;
    }
}

const localSendRequest = async (registrantId, integration, field) => {
    try {
        /**
         * EXIST CHECKIN
         */
        const result = await Checkin.updateOne(
            {
                id: registrantId,
                document: calculateRutWithCheckDigit(registrantId),
                integration,
            },
            {
                $set: {
                    request_label: field.name,
                    request_value: field.value,
                },
            }
        );
        console.log("result", result);

        return result.modifiedCount > 0;
    } catch (error) {
        return false;
    }
}

module.exports = {
    localRegistrantsSetScan,
    localSendRequest
}
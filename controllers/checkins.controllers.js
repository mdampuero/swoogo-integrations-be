const { response, request } = require("express");
const { swoogoRegistrantsGetByRut, swoogoRegistrantsIsScanned, swoogoRegistrantsSetScan } = require("../helpers/swoogo-registrants");

const byRutPost = async (req = request, res = response) => {

    try {

        const { sessionId, eventId, rut } = req.body;
        /* Search registrant by RUT */
        const registrant = await swoogoRegistrantsGetByRut(eventId, rut)
        if (!registrant)
            throw { response: { status: 404 } };

        /* Search Scaned by Session */
        const registrantScanned = await swoogoRegistrantsIsScanned(eventId, sessionId, registrant.id)
        if (registrantScanned)
            throw { response: { status: 403 } };

        const scan = await swoogoRegistrantsSetScan(sessionId, registrant.id)
        if (!scan)
            throw { response: { status: 402 } };

        /* Success */
        return res.json({
            result: true,
            data: registrant,
        });

    } catch (error) {
        return res.status((typeof error.response.status != "undefined") ? error.response.status : 500).json({
            "result": false,
            "data": error.message
        })
    }
}

const byRegistrantIDsPost = async (req = request, res = response) => {

    try {
        const { sessionId, eventId, registrantIDs } = req.body;
        console.log("registrantIDs",registrantIDs)
        console.log("sessionId",sessionId)
        console.log("eventId",eventId)
        for(let i=0; i<registrantIDs.length; i++){
            await swoogoRegistrantsSetScan(sessionId, registrantIDs[i])
        }
        
        /* Success */
        return res.json({
            result: true    
        });
    } catch (error) {
        return res.status((typeof error.response.status != "undefined") ? error.response.status : 500).json({
            "result": false,
            "data": error.message
        })
    }
}


module.exports = {
    byRutPost,
    byRegistrantIDsPost
}
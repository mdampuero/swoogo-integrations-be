const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const swoogoRegistrantsGetByRut = async (eventId, rut) => {
    try {
        const fieldRut = "c_4392417"
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants.json?event_id=${eventId}`,
            params: {
                fields: "first_name,last_name,email,id,company,full_name, c_4392417",
                search: `${fieldRut}=${rut}`,
                "per-page": 100
            },
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();
        const { items } = resp.data;
        if (items.length != 1)
            throw {}
        
        return items[0];
    } catch (error) {
        return null;
    }
}

const swoogoRegistrantsIsScanned = async (eventId, sessionId, registranId) => {
    try {
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}scans/sessions.json`,
            params: {
                fields: "first_name,last_name,email,id,company,full_name, c_4392417",
                search: `registrant_id=${registranId}`,
                session_id: sessionId,
                event_id: eventId,
                "per-page": 100
            },
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();
        const { items } = resp.data;
        if (items.length == 0)
            throw { }
        
        return true;
    } catch (error) {
        return false;
    }
}

const swoogoRegistrantsSetScan = async (sessionId, registrantId) => {
    try {
        const respPost = await axios.post(`${process.env.SWOOGO_APIURL}scans/registrant/${registrantId}/session/${sessionId}.json`, null, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { data } = respPost;
        if (!data)
            throw { }
        
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    swoogoRegistrantsGetByRut,
    swoogoRegistrantsIsScanned,
    swoogoRegistrantsSetScan
}
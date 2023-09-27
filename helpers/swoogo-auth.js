const axios = require('axios');
const authentication = async () => {
    try {
        const resp = await axios.post(process.env.SWOOGO_APIURL+'oauth2/token.json',
        {
            grant_type: "client_credentials"
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": "Basic "+btoa(process.env.SWOOGO_APIKEY+":"+process.env.SWOOGO_SECRET)
            }
        });
        const { access_token } = resp.data;
        return access_token;
        
    } catch (error) {
        return null;
    }
}

module.exports = {
    authentication
}
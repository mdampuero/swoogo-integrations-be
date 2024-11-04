const { response, request } = require("express");
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const Scan = require("../models/scan");

const eventSwoogoGet = async (req = request, res = response) => {

    try {
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}event.json`,
            params: { fields : "*", "per-page": 100 },
            headers: { "Authorization": "Bearer "+ await authentication() }
        });
        const resp = await instance.get();
        const { items, _meta } = resp.data;
        res.json({
            total: _meta.totalCount,
            pages: _meta.pageCount,
            limit: _meta.perPage,
            data: items
        });
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const demosGetOne = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findById(id);
    res.json({
        demo
    })
}

const eventSwoogoSession = async (req = request, res = response) => {

    try {
        const { id } = req.params;
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}sessions.json?event_id=${id}`,
            params: { fields : "*", "per-page": 100 },
            headers: { "Authorization": "Bearer "+ await authentication() }
        });
        const resp = await instance.get();
        const { items, _meta } = resp.data;
        res.json({
            total: _meta.totalCount,
            pages: _meta.pageCount,
            limit: _meta.perPage,
            data: items
        });
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const eventSwoogoSessionDownload = async (req = request, res = response) => {

    try {
        const { id,integrationId='' } = req.params;
        let data=[];
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}sessions.json?event_id=${id}`,
            params: { fields : "*", "per-page": 100 },
            headers: { "Authorization": "Bearer "+ await authentication() }
        });
        const resp = await instance.get();
        const { items, _meta } = resp.data;
        const fileName= 'Event_'+id+'.csv';
        const csvWriter = createObjectCsvWriter({
            path: fileName,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Nombre' },
                { id: 'link', title: 'Link QR Scan' }
            ]
        });
        items.forEach(item => {
            data.push({ id: item.id, name: item.name, link: `${process.env.QR_SCAN}?i=${integrationId}&e=${item.event_id}&s=${item.id}`})
        });

        csvWriter.writeRecords(data)
        .then(() => {
            res.download(fileName, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                } else {
                    // Elimina el archivo después de enviarlo
                    fs.unlinkSync(fileName);
                }
            });
        })
        .catch((error) => {
            res.status(500).send('Error al crear el archivo CSV.');
        });



    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const eventSwoogoRegistrant = async (req = request, res = response) => {

    try {
        const { id } = req.params;
        const { search='', searchBy='first_name' } = req.query;
        //console.log(searchBy+"*contains*"+search,`${process.env.SWOOGO_APIURL}registrants.json?event_id=${id}`);
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants.json?event_id=${id}`,
            params: {
                fields : "first_name,last_name,email,id,company,full_name",
                // fields : "*",
                search : searchBy+"*contains*"+search,
                "per-page": 100
            },
            headers: { "Authorization": "Bearer "+ await authentication() }
        });
        const resp = await instance.get();
        const { items, _meta } = resp.data;
        res.json({
            total: _meta.totalCount,
            pages: _meta.pageCount,
            limit: _meta.perPage,
            data: items
        });
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const eventSwoogoSessionPost = async (req = request, res = response) => {

    try {
        const { sessionId, registrantId } = req.body;
        const scanExists = await Scan.findOne({ sessionId, registrantId });
        if(scanExists){
            return res.status(400).json({
                "result": false,
                "data": "Already exists"
            });
        }
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants/${registrantId}.json?fields=id&expand=`,
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();

        const respPost = await axios.post(`${process.env.SWOOGO_APIURL}scans/registrant/${registrantId}/session/${sessionId}.json`, null, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });

        const scan = new Scan({
            registrantId,
            sessionId
        });
        scan.save();
        return res.json({
            registrant: resp.data,
            result: respPost.data
        });

    } catch (error) {
        console.log(error)
        res.status((typeof error.response != "undefined" && typeof error.response.status != "undefined") ? error.response.status : 500).json({
            "result": false,
            "data": error.message
        })
    }
}


module.exports = {
    eventSwoogoGet,
    eventSwoogoSession,
    eventSwoogoSessionDownload,
    eventSwoogoSessionPost,
    eventSwoogoRegistrant
}
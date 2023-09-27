const { response, request } = require("express");
var mercadopago = require('mercadopago');
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");

const createOrder = async (req = request, res = response) => {
    const { integration_id } = req.body;
    try {
        const integration = await Integration.findOne({ _id: integration_id, isDelete:false, isActive:true });
        if(!integration){
            return res.status(404).json({
                "result": false
            });
        }
        mercadopago.configure({
            access_token: integration.access_token
        });
        const result = await mercadopago.preferences.create({
            items: [{
                "id": integration.id,
                "title": integration.item_title,
                "quantity": 1,
                "currency_id": integration.item_currency,
                "unit_price": Number(integration.item_price)
            }],
            back_urls: {
                success: process.env.DOMAIN + "/api/payments/success",
                pending: process.env.DOMAIN + "/api/payments/pending",
                failure: process.env.DOMAIN + "/api/payments/failure"
            },
            notification_url: process.env.DOMAIN + "/api/payments/webhook?integration_id=" + integration.id
        })
        res.json({
            "result": true,
            "data": result.body.init_point
        })
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }

}

const backSuccess = (req = request, res = response) => {
    res.json({
        "result": true,
        "data": null
    });
}

const backFailure = (req = request, res = response) => {
    res.json({
        "result": true,
        "data": null
    });
}

const backPending = (req = request, res = response) => {
    res.json({
        "result": true,
        "data": null
    });
}

const webhook = async (req = request, res = response) => {
    const payment = req.query;
    let integration = await Integration.findById(payment.integration_id);

    try {
        let data;
        if (integration && payment.topic === "payment" && typeof payment.id != "undefined" && payment.id) {
            mercadopago.configure({
                access_token: integration.access_token
            });
            data = await mercadopago.payment.findById(payment.id);
            const transaction = new Transaction({
                created_at: new Date(),
                integration,
                status: data.response.status,
                amount: data.response.transaction_amount,
                response: data.response
            });
            integration.transactions.push(transaction);
            await Promise.all([
                 transaction.save(),
                 integration.save()
            ]);
            res.json({
                "result": true,
                "data": integration
            })
        }
        res.status(200);

    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}


module.exports = {
    createOrder,
    webhook,
    backFailure,
    backPending,
    backSuccess
}
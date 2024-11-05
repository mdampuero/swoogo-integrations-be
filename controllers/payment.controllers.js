const { response, request } = require("express");
var mercadopago = require('mercadopago');

const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Registrant = require("../models/registrant");
const { logger } = require('../helpers/utils');
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const createOrder = async (req = request, res = response) => {

    try {
        const { items } = req.body;
        const integration = req.integration

        let items_order = [];
        let registrants = [];
        const transaction = new Transaction({
            created_at: new Date(),
            integration,
            status: 'empty'
        });
        let errors = [];

        items.forEach(async item => {
            const registrantId = item[0];
            const name = item[1];
            const email = item[2];
            const description = item[3];
            let unit_price = item[4];

            if (typeof registrantId == "undefined" || registrantId.length <= 0) {
                errors.push("Registrant ID invalid");
            }
            if (typeof name == "undefined" || name.length <= 0) {
                errors.push("Name invalid");
            }
            if (typeof email == "undefined" || email.length <= 0) {
                errors.push("Email invalid");
            }
            if (typeof description == "undefined" || description.length <= 0) {
                errors.push("Description invalid");
            }
            if (typeof unit_price == "undefined" || unit_price.length <= 0) {
                errors.push("Unit price invalid");
            }
            unit_price = unit_price.replace(",", "");
            unit_price = unit_price.replace(".", "");
            unit_price = parseInt(unit_price.replace(integration.item_currency, ""));
            items_order.push({
                "title": description + " (" + name + ")",
                "quantity": 1,
                "currency_id": integration.item_currency,
                "unit_price": unit_price,
            });
            const registrant = new Registrant({
                swoogo_id: registrantId,
                email: email,
                price: unit_price,
                transaction,
                swoogo_event_id: integration.event_id
            });
            registrants.push(registrant);
            await registrant.save();
        });

        if (errors.length > 0) {
            logger.error(errors)
            res.status(400).json({
                "result": false,
                "data": errors
            })
        } else {
            logger.info("MercadoPago-ItemsOrder");
            logger.info(items_order);
            // res.json({
            //     items_order
            // })
            transaction.registrants = registrants
            transactionMeta = {
                id: transaction.id,
                status: transaction.status
            }
            integration.transactions.push(transaction);
            await Promise.all([
                transaction.save(),
                integration.save()
            ]);

            mercadopago.configure({
                access_token: integration.access_token
            });
            const result = await mercadopago.preferences.create({
                items: items_order,
                metadata: {
                    transaction: transactionMeta,
                    labels: {
                        btnSubmit: 'Waiting for payment'
                    }
                },
                notification_url: `${process.env.DOMAIN}/api/payments/webhook?integration_id=${integration.id}`
            });
            logger.info("MercadoPago-Order")
            logger.info(result)
            res.json({
                "data": result.body,
                integration
            })
        }

    } catch (error) {
        logger.error(error)
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }

}

const backSuccess = (req = request, res = response) => {
    logger.info("Success")
    res.json({
        "result": true,
        "data": null
    });
}

const backFailure = (req = request, res = response) => {
    logger.info("Failure")
    res.json({
        "result": true,
        "data": null
    });
}

const backPending = (req = request, res = response) => {
    logger.info("Pensing")
    res.json({
        "result": true,
        "data": null
    });
}

const webhook = async (req = request, res = response) => {
    try {
        const payment = req.query;
        logger.info("Payment")
        logger.info(payment)
        let integration = await Integration.findById(payment.integration_id);
        logger.info("Integration")
        logger.info(integration)
        let data;
        if (integration && payment.topic === "payment" && typeof payment.id != "undefined" && payment.id) {
            mercadopago.configure({
                access_token: integration.access_token
            });
            data = await mercadopago.payment.findById(payment.id);
            logger.info("MercadoPago-mercadopago.payment.findById")
            logger.info(data)
            const metadata = data.body.metadata;
            let transaction = await Transaction.findById(metadata.transaction.id);

            if (transaction && metadata.transaction.status != data.body.status) {
                transaction.status = data.body.status;
                transaction.amount = data.body.transaction_amount;
                transaction.response = data;
                await Promise.all([
                    transaction.save()
                ]);
            }
            if (data.body.status === "approved") {
                const socketData = {
                    "transaction_id": transaction.id,
                    "status": data.body.status,
                    "action": "themify.58ecddba064e63f7"
                }
                logger.info("Socket")
                logger.info(socketData)
                req.io.emit("message", socketData);

                transaction.registrants.forEach(async registrant => {
                    /** Update data in Swoogo */
                    const formData = new FormData();
                    formData.append('c_3473417', '17536652');
                    const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrant.swoogo_id}.json`, formData, {
                        headers: { "Authorization": "Bearer " + await authentication() }
                    });
                });
            }

            res.json({
                "result": true,
                "data": data
            })
        } else {
            logger.warn("Payment not found")
            res.status(200).json({
                "result": false,
                "data": null
            });
        }
    } catch (error) {
        logger.err(error)
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
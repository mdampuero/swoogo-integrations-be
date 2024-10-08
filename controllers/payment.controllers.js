const { response, request } = require("express");
var mercadopago = require('mercadopago');

const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Registrant = require("../models/registrant");
const { logger } = require('../helpers/utils');

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
            const name = item[0];
            const email = item[1];
            const description = item[2];
            let unit_price = item[3];

            if (typeof name == "undefined" || name.length <= 0) {
                errors.push("Name invalid");
                return;
            }
            if (typeof email == "undefined" || email.length <= 0) {
                errors.push("Email invalid");
                return;
            }
            if (typeof description == "undefined" || description.length <= 0) {
                errors.push("Description invalid");
                return;
            }
            if (typeof unit_price == "undefined" || unit_price.length <= 0) {
                errors.push("Unit price invalid");
                return;
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
            //transaction.registrants = registrants

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
                    transaction, labels: {
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
                const socketData ={
                    "transaction_id": transaction.id,
                    "status": data.body.status,
                    "action": "themify.58ecddba064e63f7"
                }
                logger.info("Socket")
                logger.info(socketData)
                req.io.emit("message", socketData);
            }

            res.json({
                "result": true,
                "data": data
            })
        }else{
            logger.warn("Payment not found")
            res.status(404).json({
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
var socket;
const registrantForm = "#registrant-form";
const socketServer = 'https://swoogo-integrations-be-production.up.railway.app';
var count = 0;
var intervalId;
var transaction_id = "";
var originalText = '';
var btnSubmit = '';
const processError = (payload) => {
    console.log(payload)
}

var makeJsonFromTable = function (tableID) {
    var tbl = jQuery(tableID)
    var tblhead = jQuery(tbl).find("thead")
    var tblbody = jQuery(tbl).find("tbody")
    var tblbodyCount = jQuery(tbl).find("tbody>tr").length;
    var header = [];
    var JObjectArray = [];
    jQuery.each(jQuery(tblhead).find("tr>th"), function (i, j) {
        header.push(jQuery(j).text())
    })
    jQuery.each(jQuery(tblbody).find("tr"), function (key, value) {
        var jObject = {};
        for (var x = 0; x < (header.length - 1); x++) {
            jObject[header[x]] = jQuery(this).find("td").eq(x).text()
        }
        JObjectArray.push(jObject)
    });
    var jsonObject = {};
    jsonObject["count"] = tblbodyCount
    jsonObject["value"] = JObjectArray;
    return JObjectArray;
}
function dynamicallyLoadScript(url) {
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
}
const createOrder = async () => {
    const jsonTable = makeJsonFromTable("#w_" + widgetId + " table[aria-labelledby=\"w_" + widgetId + "_label\"]");
    return jQuery.ajax({
        url: gateway + "api/payments/create-order",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                integration_id,
                items: jsonTable
            }
        ),

        crossDomain: true
    });
}
function isFormOK() {
    let isOK = true;
    $(registrantForm + " :input").each(function (index, element) {
        if ($(element).attr("aria-invalid") == "true") {
            isOK = false;
            return;
        }

    });
    return isOK;
}
const payment = async () => {
    originalText = btnSubmit.find("span").html();
    try {
        socket = io(socketServer);
        socket.on('message', (payload) => {
            if (payload.transaction_id == transaction_id)
                if (payload.action == 'themify.58ecddba064e63f7') $(registrantForm).submit(); else {
                    processError(payload);
                }
        })
        const res = await createOrder();

        console.log("Status", res.status)
        transaction_id = res.data.metadata.transaction.id;

        btnSubmit.find("span").html(res.data.metadata.labels.btnSubmit);
        let urlInitPoint = res.data.sandbox_init_point;
        if (mode === "prod") {
            urlInitPoint = res.data.init_point
        }
        $MPC.openCheckout({
            url: urlInitPoint,
            mode: "modal",
            onreturn: checkoutReturn
        });
        // window.open(res.data.init_point);

    } catch (err) {
        showErrorMessage("No es posible continuar con el pago, intenta nuevamente más tarde...")
        enabledButton();
        console.log(err);
    }
}
const checkoutReturn = (data) => {
    console.log(data)
    if (data.external_reference == null) {
        enabledButton();
        showErrorMessage('No pudimos procesar el pago, intenta nuevamente más tarde...')
    }
}
const showErrorMessage = (text) => {
    Swal.fire({
        icon: "error",
        title: "Error",
        text
    });
}

const enabledButton = () => {
    btnSubmit.attr("disabled", false);
    btnSubmit.find("span").html(originalText);
    transaction_id = '';
    count = 0;
}

const check = async () => {
    return jQuery.ajax({
        url: gateway + "api/transactions/check",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                transaction_id
            }
        ),
        crossDomain: true
    });
}
const captureForm = () => {
    $(registrantForm).submit(function (e) {
        if (transaction_id) return true;
        e.preventDefault();
        setTimeout(function () {
            if (count == 0 && isFormOK()) {
                count++;
                btnSubmit = $(registrantForm + " button[type=\"submit\"]");
                btnSubmit.attr("disabled", true);
                payment()
            } else if (transaction_id != "") {
                return true
            }
        }, 500)
        return false;
    });
}

function sweet() {
    Swal.fire("SweetAlert2 is working!");
}
document.addEventListener("DOMContentLoaded", function (event) {
    //do work
    dynamicallyLoadScript('https://www.mercadopago.com/org-img/jsapi/mptools/buttons/render.js');
    dynamicallyLoadScript('https://swoogo-integrations-be-production.up.railway.app/socket.io/socket.io.js');
    dynamicallyLoadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
});
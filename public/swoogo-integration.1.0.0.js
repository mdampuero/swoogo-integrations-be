
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
        // var jObject = {};
        var jObject = [];
        for (var x = 0; x < (header.length - 1); x++) {
            // jObject[header[x]] = jQuery(this).find("td").eq(x).text()
            jObject.push(jQuery(this).find("td").eq(x).text())
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
    const jsonTable = makeJsonFromTable(".swoogo-reg-summary table");
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
    if(isCustomPaymentSelected()){
        $(registrantForm + " :input").each(function (index, element) {
            if ($(element).attr("aria-invalid") == "true") {
                isOK = false;
                return;
            }

        });
    }else{
        return false;
    }
    return isOK;
}

function isCustomPaymentSelected() {
    const customPayment = document.querySelector('input[name="Registrant[payment_method]"][value="custom"]');
    return customPayment.checked;
}


document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('input[name="Registrant[payment_method]"]').forEach(input => {
        input.addEventListener("change", function () {
            //console.log(isCustomPaymentSelected()); // Verifica cada vez que cambia la selección
        });
    });
});

const customPayment = async () => {
    originalText = btnSubmit.find("span").html();
    try {
        socket = io(gateway);
        socket.on('message', (payload) => {
            if (payload.transaction_id == transaction_id)
                if (payload.action == 'themify.58ecddba064e63f7') $(registrantForm).submit(); else {
                    processError(payload);
                }
        })
        const res = await createOrder();

        // console.log("Status", res)
        transaction_id = res.data.metadata.transaction.id;

        btnSubmit.find("span").html(res.data.metadata.labels.btnSubmit);
        let urlInitPoint = res.data.sandbox_init_point;
        if (mode === "prod") {
            urlInitPoint = res.data.init_point
        }
        //mp.open
        // mp.checkout({
        //     preference: {
        //       id: res.data.id,
        //     },
        //   });
        // mp.bricks().create("wallet", "wallet_container", {
        //     initialization: {
        //         preferenceId: res.data.id,
        //         redirectMode: "modal"
        //     },
        //     callbacks: {
        //         onError: (error) => console.error(error),
        //         onReady: (data) => { console.log(data) }
        //       }
        // });
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
// const captureForm = () => {
//     $(registrantForm).submit(function (e) {
//         if (transaction_id) {
//             return true;
//         }
//         e.preventDefault();
//         setTimeout(function () {
//             if (count == 0 && isFormOK()) {
//                 count++;
//                 btnSubmit = $(registrantForm + " button[type=submit]");
//                 btnSubmit.attr("disabled", true);
//                 customPayment()
//             } else if (transaction_id != "") {
//                 return true
//             }
//         }, 500)
//         return false;
//     });
// }

function sweet() {
    Swal.fire("SweetAlert2 is working!");
}
document.addEventListener("DOMContentLoaded", function (event) {
    //do work
    dynamicallyLoadScript('https://www.mercadopago.com/org-img/jsapi/mptools/buttons/render.js');
    dynamicallyLoadScript('https://clickgroup-be.latamhosting.com.ar/socket.io/socket.io.js');
    dynamicallyLoadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
});
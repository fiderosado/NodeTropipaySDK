const axios = require("axios");
const jwt = require('jsonwebtoken');
const {Tropipay} = require("Tropipay");
const {Endpoints} = require("Endpoints");
// TropipayPayment
Object.defineProperty(exports, "__esModule", {value: true});

class TropipayPayment {

    /* TODO: ACA VA LO REFERENTE A LOS PAGOS */

    #_context;
    #request;

    constructor(context = Tropipay) {
        this.#_context = context
        if (!this.#request) {
            console.error('- Error: TropipayPayment: Axios: Instance not exist, creating...');
            this.#request = axios.create({
                baseURL: context.getTppServerUrl(),
                headers: context.getHeader(),
            });
            if (this.#request) console.error('- Success: TropipayPayment: Axios: Instance is ready...');
        }
    }

    /* TODO: CREAR INTENTOS DE PAGO
    *  https://tpp.stoplight.io/docs/tropipay-api-doc/fa7bde61f971b-create-payment-card
    *  POST: https://tropipay-dev.herokuapp.com/api/v2/paymentcards
    * */
    async CreatePaymentCard(orderId) {
        //
    }

    /* TODO: CREAR INTENTOS DE PAGO MEDIADOS
    *  https://tpp.stoplight.io/docs/tropipay-api-doc/12a128ff971e4-creating-a-mediation-payment-card
    *  POST: https://tropipay-dev.herokuapp.com/api/v2/paymentcards/mediation
    * */
    async CreateMediationPaymentCard(context = Tropipay, payload = {}) {
        try {
            const mediation_response = {
                data: {
                    url : Endpoints.mediation.create,
                    payload: payload,
                }
            }
            /*await this.#request.post(
            Endpoints.mediation.create,
            payload,
        );*/
            return mediation_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: CreatingMediationPaymentCard...', error);
            return false;
        }
    }


}

module.exports = TropipayPayment;
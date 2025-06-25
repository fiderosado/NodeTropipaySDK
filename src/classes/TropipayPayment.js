const axios = require("axios");
const jwt = require('jsonwebtoken');
const Tropipay = require("./Tropipay");
const TropipayEndpoints = require("./TropipayEndpoints");
// TropipayPayment
Object.defineProperty(exports, "__esModule", {value: true});

class TropipayPayment { /* TODO: ACA VA LO REFERENTE A LOS PAGOS */

    static _instance;
    _render = 0;
    #_context;
    #request;

    constructor(context = Tropipay.getInstance()) {
        this._render += 1;
        this.#_context = context;
        if (!this.#request) {
            console.error('- Error: TropipayPayment: Axios: Instance not exist, creating...');
            console.log(context.getData());
            this.#request = axios.create({
                baseURL: context.getTppServerUrl(),
                headers: context.getHeader(),
            });
            if (this.#request) console.error('- Success: TropipayPayment: Axios: Instance is ready...');
        }
    }

    static getInstance(context) {
        if (!context) {
            throw new Error(`TropipayPayment need the Tropipay context...`);
        }
        if (!TropipayPayment._instance) {
            TropipayPayment._instance = new TropipayPayment(context);
        }
        return TropipayPayment._instance;
    }

    /* TODO: CREAR INTENTOS DE PAGO : need a PaymentCardPayload Model
    *   https://tpp.stoplight.io/docs/tropipay-api-doc/fa7bde61f971b-create-payment-card
    *   POST: https://tropipay-dev.herokuapp.com/api/v2/paymentcards
    * */
    async CreatePaymentCard( paymentCardPayload ) {
        if (!paymentCardPayload) {
            return { error : 'CreatePaymentCard need a PaymentCardPayload Model...' };
        }
        try {
            const payment_response = await this.#request.post(
                TropipayEndpoints.payment.create,
                paymentCardPayload,
            );
            return {success: { data : payment_response.data }};
        } catch (error) {
            console.error('- Error: TropipayPayment: CreatePaymentCard...', error.response.data );
            return {error : error.response.data }
        }
    }

    /* TODO: CREAR INTENTOS DE PAGO MEDIADOS
    *  https://tpp.stoplight.io/docs/tropipay-api-doc/12a128ff971e4-creating-a-mediation-payment-card
    *  POST: https://tropipay-dev.herokuapp.com/api/v2/paymentcards/mediation
    * */
    async CreateMediationPaymentCard(payload) {
        if (!payload) {
            return { error : 'CreateMediationPaymentCard need a payload...' };
        }
        try {
            const mediation_response = await this.#request.post(
                TropipayEndpoints.payment.mediation.create,
                payload,
            );
            return mediation_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: CreatingMediationPaymentCard...', error);
            return false;
        }
    }

}

module.exports = TropipayPayment;
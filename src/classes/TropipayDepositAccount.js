//TropipayDepositAccount
const axios = require("axios");
const jwt = require('jsonwebtoken');
const Tropipay = require("./Tropipay");
const TropipayEndpoints = require("./TropipayEndpoints");
Object.defineProperty(exports, "__esModule", {value: true});

class TropipayDepositAccount { /* TODO: ACA VA LO REFERENTE A LOS PAGOS */

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
        if (!TropipayDepositAccount._instance) {
            TropipayDepositAccount._instance = new TropipayDepositAccount(context);
        }
        return TropipayDepositAccount._instance;
    }

    /* TODO:
    *   Create a new Deposit Account
    *   https://tpp.stoplight.io/docs/tropipay-api-doc/6bc05a0be7e81-create-a-new-deposit-account
    *   POST: https://tropipay-dev.herokuapp.com/api/v2/deposit_accounts
    */
    async CreateNewDepositAccount(payload) {
        if (!payload) {
            return {error: 'CreateNewDepositAccount need a payload...'};
        }
        try {
            const beneficiary_response = await this.#request.post(
                TropipayEndpoints.beneficiary.create,
                payload,
            );
            return beneficiary_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: CreateNewDepositAccount...', error);
            return false;
        }
    }

    /*
     *  TODO: Get Deposit Accounts List
     *   https://tpp.stoplight.io/docs/tropipay-api-doc/e232d0427f703-get-deposit-accounts-list
     *   GET: https://tropipay-dev.herokuapp.com/api/v2/deposit_accounts
     *   Returns the list of beneficiaries (depositAccounts) of logged user.
     *   Beneficiaries can be active (status: 0) or inactive (status: 1)
     */
    async GetDepositAccountsList() {
        try {
            const depositAccounts_response = await this.#request.get(
                TropipayEndpoints.beneficiary.getAll,
            );
            return depositAccounts_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: GetDepositAccountsList...', error);
            return false;
        }
    }

}

module.exports = TropipayDepositAccount;
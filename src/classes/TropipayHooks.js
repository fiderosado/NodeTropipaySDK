//TropipayHooks
const axios = require("axios");
const jwt = require('jsonwebtoken');
const Tropipay = require("./Tropipay");
const TropipayEndpoints = require("./TropipayEndpoints");
Object.defineProperty(exports, "__esModule", {value: true});

class TropipayHooks { /* TODO: ACA VA LO REFERENTE A LOS PAGOS */
    static _instance;
    _render = 0;
    #_context;
    #request;
    constructor(context = Tropipay.getInstance()) {
        this._render += 1;
        this.#_context = context;
        if (!this.#request) {
            console.error('- Error: TropipayPayment: Axios: Instance not exist, creating...');
            //console.log(context.getData());
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
        if (!TropipayHooks._instance) {
            TropipayHooks._instance = new TropipayHooks(context);
        }
        return TropipayHooks._instance;
    }

    /*
    *  TODO: Get a list with all events that allow a subscription
    *   Endpoint for get full list of available events.
    *   Events are made up of an object with two fundamental properties (name, description)
    *   GET: https://tropipay-dev.herokuapp.com/api/v2/hooks/events
    */
    async GetEventsAllowSubscriptionList() {
        try {
            const subscription_response = await this.#request.get(
                TropipayEndpoints.hooks.allow.list,
            );
            return subscription_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: GetEventsAllowSubscriptionList...', error);
            return false;
        }
    }

    /*
    *  TODO: Get a list of all events subscribed with Hooks
    *   Endpoint for getting event hooks list by merchant.
    *   Events are made up of an object with three fundamental properties (event, target, value)
    *   https://tpp.stoplight.io/docs/tropipay-api-doc/a02a3c816f111-get-a-list-of-all-events-subscribed-with-hooks
    *   GET: https://tropipay-dev.herokuapp.com/api/v2/hooks
    */
    async GetEventsSubscribedHooksList() {
        try {
            const subscription_response = await this.#request.get(
                TropipayEndpoints.hooks.list,
            );
            return subscription_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: GetEventsSubscribedHooksList...', error);
            return false;
        }
    }

    /**
     * TODO: Subscribe to new event with a hook
     *  Endpoint allows a merchant to subscribe to an event,
     *  specifying the options to receive information at the time it is trigger.
     *  https://tpp.stoplight.io/docs/tropipay-api-doc/0b7235bfedb66-subscribe-to-new-event-with-a-hook
     *  Event : Events are made up of an object with three fundamental properties (event, target, value)
     *  POST: https://tropipay-dev.herokuapp.com/api/v2/hooks , Authorization required Bearer {token}
     */
    async SubscribeNewEventHook( hook_payload ) {
        if (!hook_payload) {
            return { error : 'SubscribeNewEventHook need a NewEventHook Model...' };
        }
        try {
            const hook_response = await this.#request.post(
                TropipayEndpoints.hooks.add,
                hook_payload,
            );
            return hook_response.data;
        } catch (error) {
            console.error('- Error: TropipayPayment: SubscribeNewEventHook...', error);
            return false;
        }
    }
}

module.exports = TropipayHooks;
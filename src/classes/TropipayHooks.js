//TropipayHooks (legacy 1.x wrapper)

/**
 * @deprecated use `tropipay.hooks`. Kept so 1.x code keeps working.
 */
class TropipayHooks {
    static _instance;
    #_context;

    constructor(context) {
        if (!context) {
            throw new Error('TropipayHooks need the Tropipay context...');
        }
        this.#_context = context;
    }

    static getInstance(context) {
        if (!context) {
            throw new Error('TropipayHooks need the Tropipay context...');
        }
        if (!TropipayHooks._instance || TropipayHooks._instance.#_context !== context) {
            TropipayHooks._instance = new TropipayHooks(context);
        }
        return TropipayHooks._instance;
    }

    async GetEventsAllowSubscriptionList() {
        return this.#_context.GetEventsAllowSubscriptionList();
    }

    async GetEventsSubscribedHooksList() {
        return this.#_context.GetEventsSubscribedHooksList();
    }

    async SubscribeNewEventHook(hookPayload) {
        return this.#_context.SubscribeNewEventHook(hookPayload);
    }
}

module.exports = TropipayHooks;

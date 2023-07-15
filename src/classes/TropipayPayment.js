const axios = require("axios");
const jwt = require('jsonwebtoken');
const {Tropipay} = require("Tropipay");
// TropipayPayment
Object.defineProperty(exports, "__esModule", {value: true});

class TropipayPayment {
    #_context;
    constructor(context = Tropipay ) {
        this.#_context = context
    }

    

}

module.exports = TropipayPayment;
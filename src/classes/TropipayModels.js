//TropipayModels

/**
 * Represents the InternalDepositAccountModel class.
 * This class represents the Model for an internal deposit account.
 *
 * @param {number} beneficiaryType - The type of beneficiary for the account.
 *                                  1: Another Tropipay user
 *                                  2: External bank account
 * @param {number} searchBy - The search criteria for the beneficiary.
 *                            Required when beneficiaryType === 1.
 *                            1: Search user by email.
 *                            2: Search user by phone number.
 * @param {string} searchValue - The email to look for among Tropipay users when beneficiaryType is 1 (INTERNAL).
 * @param {string} alias - The alias for the beneficiary.
 * @param {number} userRelationTypeId - The user relation type ID.
 *
 */
class InternalDepositAccountModel {
    beneficiaryType;
    searchBy;
    searchValue;
    alias;
    userRelationTypeId;

    /**
     * Gets an object with defined values from the current instance.
     * @param obj - The object to extract defined values from.
     * @returns An object with only the defined values from the input object.
     */
    getDefinedValues(obj) {
        const definedValues = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                definedValues[key] = obj[key];
            }
        }
        return definedValues;
    }

    constructor(
        beneficiaryType,
        searchBy,
        searchValue,
        alias,
        userRelationTypeId
    ) {
        this.beneficiaryType = beneficiaryType;
        this.searchBy = searchBy;
        this.searchValue = searchValue;
        this.alias = alias;
        this.userRelationTypeId = userRelationTypeId;
    }

    /**
     * Converts the InternalDepositAccountModel instance to a plain object.
     * @returns {Object} The plain object representing the InternalDepositAccountModel instance.
     */
    toObject() {
        const output = {
            beneficiaryType: this.beneficiaryType,
            searchBy: this.searchBy,
            searchValue: this.searchValue,
            alias: this.alias,
            userRelationTypeId: this.userRelationTypeId,
        };

        return this.getDefinedValues(output);
    }
}

/**
 * Represents the ExternalDepositAccountModel class.
 * This class represents the Model for an external deposit account.
 *
 * @param {number} beneficiaryType - The type of beneficiary for the account.
 *                                  1: Another Tropipay user
 *                                  2: External bank account
 * @param {number} searchBy - The search criteria for the beneficiary.
 *                            Mandatory when beneficiaryType === 1.
 *                            1: Search user by email.
 *                            2: Search user by phone number.
 * @param {string} searchValue - The email to look for among Tropipay users when beneficiaryType is 1 (INTERNAL).
 * @param {string} accountNumber - The number of the bank account.
 * @param {string} alias - Name of the store or alias (INTERNAL-ID).
 * @param {number} userRelationTypeId - The user relation type ID.
 * @param {string} swift - The SWIFT code of the bank account.
 * @param {number} type - The type of the bank account.
 * @param {string} firstName - The first name of the account holder.
 * @param {string} lastName - The last name of the account holder.
 * @param {string} secondLastName - The second last name (mandatory for Cuban beneficiaries).
 * @param {number} countryDestinationId - The ID of the destination country.
 *                                        See list of countryDestinations for details.
 *                                        Example: Spain -> countryDestinationId: 1
 * @param {number} paymentType - The type of payment for the account.
 *                               See list of countryDestinations for details.
 *                               Example: Spain -> countryPaymentTypes -> paymentTypeId: 2, paymentType: Depósito
 * @param {string} province - The province of the account.
 * @param {string} city - The city of the account.
 * @param {string} address - The address of the account.
 * @param {string} documentNumber - The ID or passport of the account holder.
 * @param {string} phone - The phone number of the account holder.
 * @param {string} documentExpirationDate - The expiration date of the account holder's document.
 * @param {string} postalCode - The postal code of the account holder's address.
 * @param {string} documentTypeId - The document type ID of the account holder.
 *
 */
class ExternalDepositAccountModel {
    beneficiaryType = 2;
    searchBy = 1;
    searchValue;
    accountNumber;
    alias;
    userRelationTypeId = 3;
    swift;
    type;
    firstName;
    lastName;
    secondLastName;
    countryDestinationId;
    paymentType;
    province;
    city;
    address;
    documentNumber;
    phone;
    documentExpirationDate;
    postalCode;
    documentTypeId;

    /**
     * Gets an object with defined values from the current instance.
     * @param obj - The object to extract defined values from.
     * @returns An object with only the defined values from the input object.
     */
    getDefinedValues(obj) {
        const definedValues = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                definedValues[key] = obj[key];
            }
        }
        return definedValues;
    }

    constructor(
        beneficiaryType,
        searchBy,
        searchValue,
        accountNumber,
        alias,
        userRelationTypeId,
        swift,
        type,
        firstName,
        lastName,
        secondLastName,
        countryDestinationId,
        paymentType,
        province,
        city,
        address,
        documentNumber,
        phone,
        documentExpirationDate,
        postalCode,
        documentTypeId
    ) {
        this.beneficiaryType = beneficiaryType;
        this.searchBy = searchBy;
        this.searchValue = searchValue;
        this.accountNumber = accountNumber;
        this.alias = alias;
        this.userRelationTypeId = userRelationTypeId;
        this.swift = swift;
        this.type = type;
        this.firstName = firstName;
        this.lastName = lastName;
        this.secondLastName = secondLastName;
        this.countryDestinationId = countryDestinationId;
        this.paymentType = paymentType;
        this.province = province;
        this.city = city;
        this.address = address;
        this.documentNumber = documentNumber;
        this.phone = phone;
        this.documentExpirationDate = documentExpirationDate;
        this.postalCode = postalCode;
        this.documentTypeId = documentTypeId;
    }

    /**
     * Converts the ExternalDepositAccountModel instance to a plain object.
     * @returns {Object} The plain object representing the ExternalDepositAccountModel instance.
     */
    toObject() {
        const output = {
            beneficiaryType: this.beneficiaryType,
            searchBy: this.searchBy,
            searchValue: this.searchValue,
            accountNumber: this.accountNumber,
            alias: this.alias,
            userRelationTypeId: this.userRelationTypeId,
            swift: this.swift,
            type: this.type,
            firstName: this.firstName,
            lastName: this.lastName,
            secondLastName: this.secondLastName,
            countryDestinationId: this.countryDestinationId,
            paymentType: this.paymentType,
            province: this.province,
            city: this.city,
            address: this.address,
            documentNumber: this.documentNumber,
            phone: this.phone,
            documentExpirationDate: this.documentExpirationDate,
            postalCode: this.postalCode,
            documentTypeId: this.documentTypeId,
        };

        return this.getDefinedValues(output);
    }
}

/**
 * Represents the PaymentCardModel class.
 * This class represents the Model for a payment card.
 *
 * @param {string} reference - The reference for the payment card.
 * @param {string} concept - The concept of the payment card.
 * @param {string} description - The description of the payment card.
 * @param {boolean} favorite - Indicates if the payment card is marked as favorite.
 * @param {number} amount - The amount for the payment card.
 * @param {string} currency - The currency for the payment card.
 * @param {boolean} singleUse - Indicates if the payment card is for single use.
 * @param {number} reasonId - The reason ID for the payment card.
 * @param {number} expirationDays - The expiration days for the payment card.
 * @param {string} lang - The language for the payment card.
 * @param {string} urlSuccess - The URL for the successful payment.
 * @param {string} urlFailed - The URL for the failed payment.
 * @param {string} urlNotification - The URL for the payment notification.
 * @param {string} serviceDate - The service date for the payment card.
 * @param {boolean} directPayment - Indicates if the payment is a direct payment.
 * @param {Array} paymentMethods - The payment methods available for the payment card.
 * @param {boolean} saveToken - Indicates if the payment token should be saved.
 * @param {any} cient - The client data for the payment card.
 */
class PaymentCardModel {
    reference;
    concept;
    description;
    favorite;
    amount;
    currency;
    singleUse;
    reasonId;
    expirationDays;
    lang;
    urlSuccess;
    urlFailed;
    urlNotification;
    serviceDate;
    directPayment;
    paymentMethods;
    saveToken;
    cient;

    constructor(
        reference,
        concept,
        description,
        favorite,
        amount,
        currency,
        singleUse,
        reasonId,
        expirationDays,
        lang,
        urlSuccess,
        urlFailed,
        urlNotification,
        serviceDate,
        directPayment,
        paymentMethods,
        saveToken,
        cient
    ) {
        this.reference = reference;
        this.concept = concept;
        this.description = description;
        this.favorite = favorite;
        this.amount = amount;
        this.currency = currency;
        this.singleUse = singleUse;
        this.reasonId = reasonId;
        this.expirationDays = expirationDays;
        this.lang = lang;
        this.urlSuccess = urlSuccess;
        this.urlFailed = urlFailed;
        this.urlNotification = urlNotification;
        this.serviceDate = serviceDate;
        this.directPayment = directPayment;
        this.paymentMethods = paymentMethods;
        this.saveToken = saveToken;
        this.cient = cient;
    }

    /**
     * Converts the PaymentCardModel instance to a plain object.
     * @returns {Object} The plain object representing the PaymentCardModel instance.
     */
    toObject() {
        return {
            reference: this.reference,
            concept: this.concept,
            description: this.description,
            favorite: this.favorite,
            amount: this.amount,
            currency: this.currency,
            singleUse: this.singleUse,
            reasonId: this.reasonId,
            expirationDays: this.expirationDays,
            lang: this.lang,
            urlSuccess: this.urlSuccess,
            urlFailed: this.urlFailed,
            urlNotification: this.urlNotification,
            serviceDate: this.serviceDate,
            directPayment: this.directPayment,
            paymentMethods: this.paymentMethods,
            saveToken: this.saveToken,
            cient: this.cient,
        };
    }
}

/**
 * Represents the CientModel class.
 * This class represents the Model for Cient data.
 *
 * @see {@link https://tpp.stoplight.io/docs/tropipay-api-doc/b3A6OTgyOTQ1Mg-get-deposit-accounts-list}
 *
 * @param {string} name - The name of the client.
 * @param {string} lastName - The last name of the client.
 * @param {string} address - The address of the client.
 * @param {string} phone - The phone number of the client.
 * @param {string} email - The email of the client.
 * @param {string} termsAndConditions - The terms and conditions accepted by the client.
 * @param {number} [countryId] - The ID of the country. (Optional if countryIso has a value)
 * @param {string} [countryIso] - The ISO code of the country. (Optional if countryId has a value)
 */
class CientModel {
    name;
    lastName;
    address;
    phone;
    email;
    termsAndConditions;
    countryId;
    countryIso;

    // @ts-ignore
    constructor(
        name,
        lastName,
        address,
        phone,
        email,
        termsAndConditions,
        countryId,
        countryIso,
    ) {
        this.name = name;
        this.lastName = lastName;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.countryId = countryId;
        this.countryIso = countryIso;
        this.termsAndConditions = termsAndConditions;
    }

    toObject() {
        return {
            name: this.name,
            lastName: this.lastName,
            address: this.address,
            phone: this.phone,
            email: this.email,
            countryId: this.countryId,
            countryIso: this.countryIso,
            termsAndConditions: this.termsAndConditions,
        };
    }
}

module.exports = {InternalDepositAccountModel, ExternalDepositAccountModel, PaymentCardModel, CientModel}

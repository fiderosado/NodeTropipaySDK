;//TropipayModels

/* TODO > InternalDepositAccountPayload */
class InternalDepositAccountPayload {
    // The parameters to pass depend on the type of beneficiary you are creating. Beneficiaries can be;//

    beneficiaryType; // 1 Another Tropipay user , 2 External bank account ( number ---> required )
    searchBy; // Required when beneficiaryType === 1. Possible values are; 1 search user by email. 2 search user by phone number
    searchValue; // "someuser@email.com", ( string ) the email to look for among tropipay users when beneficiaryType is 1 (INTERNAL)
    alias; // "My Friend in Tropipay",
    userRelationTypeId; // 3, (number --> required ),

    constructor({beneficiaryType, searchBy, searchValue, alias, userRelationTypeId}) {
        this.beneficiaryType = beneficiaryType;
        this.searchBy = searchBy;
        this.searchValue = searchValue;
        this.alias = alias;
        this.userRelationTypeId = userRelationTypeId;
    }

    toObject() {
        return {
            beneficiaryType: this.beneficiaryType,
            searchBy: this.searchBy,
            searchValue: this.searchValue,
            alias: this.alias,
            userRelationTypeId: this.userRelationTypeId
        };
    }
}

/* TODO > ExternalDepositAccountPayload */
class ExternalDepositAccountPayload {

    /*
    * TODO: (beneficiaryType : number)
    *  The parameters to pass depend on the type of beneficiary you are creating.
    *   Beneficiaries can be;
    *   1: Another Tropipay user
    *   2: External bank account
    */
    beneficiaryType = 2;

    /*
     * TODO: (searchBy : number)
     *  Search by number. Mandatory when BeneficiaryType === 1.
     *  Possible values are:
     *  1: search user by email.
     *  2: search user by phone number.
     */
    searchBy = 1;

    /*
    * TODO: (searchValue: string)
    *  The email to look for among tropipay users when beneficiaryType is 1 (INTERNAL)
    */
    searchValue;

    /*
    * TODO: (accountNumber: string)
    *  Number of account bank
    */
    accountNumber;

    /*
    * TODO: (alias: string) "Name of Store in case", "INTERNAL-ID"
    */
    alias;

    /*
    * TODO: (userRelationTypeId: number : required )
    */
    userRelationTypeId = 3;

    /*
    * TODO: (swift: string )
    *  Of account number
    */
    swift;

    /*
    * TODO: (type: number )
    *  Of account number
    */
    type;

    /*
    * TODO: (firstName: string  , lastName :string  )
    *  Of account number
    *  secondLastName : string ( For cuban beneficiaries, second surname is mandatory )
    */
    firstName;
    lastName;

    /*
    * TODO: ( secondLastName : string , For cuban beneficiaries, second surname is mandatory )
    *  Of account number
    */
    secondLastName;

    /*
    * TODO: ( countryDestinationId : number  )
    *  Of account number, See list of countryDestinations for details
    *  https://tropipay-dev.herokuapp.com/api/v2/countries/destinations
    *  Ej.: España 1
    */
    countryDestinationId;

    /*
    * TODO: ( paymentType : number  )
    *  Of account number, See list of countryDestinations for details
    *  https://tropipay-dev.herokuapp.com/api/v2/countries/destinations
    *  Ej.: España -> countryPaymentTypes -> paymentTypeId : 2 , paymentType : Depósito
    */
    paymentType;

    /*
    * TODO: ( province : string , city : string  , address : string )
    *  Of account property
    *  Ej.: Barcelona
    */
    province;
    city;
    address;

    /*
    * TODO: ( documentNumber : string )
    *  Id or Passport Of account property
    *  Ej.: 56546546546546465
    */
    documentNumber;

    /*
    * TODO: ( phone : string )
    *  phone of account property
    *  Ej.: +34911234567
    */
    phone;// string,

    /*
    * TODO: ( documentExpirationDate : string )
    *  of account property
    *  Ej.: +34911234567 or null
    */
    documentExpirationDate;

    /*
    * TODO: ( documentExpirationDate : string )
    *  postalCode of account property
    *  Ej.: 08001
    */
    postalCode;// ( number ),

    /*
    * TODO: ( documentTypeId : string )
    *  documentTypeId of account property
    *  Ej.: null
    */
    documentTypeId;

    constructor({beneficiaryType, searchBy, searchValue, accountNumber, alias, userRelationTypeId, swift, type, firstName, lastName, secondLastName, countryDestinationId, paymentType, province, city, address, documentNumber, phone, documentExpirationDate, postalCode, documentTypeId}) {
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
    toObject() {
        return {
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
            documentTypeId: this.documentTypeId
        };
    }
}

module.exports = {InternalDepositAccountPayload, ExternalDepositAccountPayload}
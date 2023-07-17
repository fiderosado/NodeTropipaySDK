;//TropipayModels


class InternalDepositAccountPayload {

    /* TODO > InternalDepositAccountPayload
            createPymemarketBeneficiary este--->
            {
              searchValue: 'fiderosado@gmail.com',
              alias: 'FIDEL REMEDIOS ROSADO',
              userRelationTypeId: 3,
              beneficiaryType: 1,
              searchBy: 1
            }
            strapi_result---> {
              id: 58850,
              accountNumber: 'fiderosado@gmail.com',
              alias: 'Fidel',
              swift: null,
              type: 9,
              country: null,
              firstName: 'Fidel',
              default: null,
              state: 0,
              userId: 'f89833b0-f97b-11eb-bbb1-c19c62049f20',
              countryDestinationId: 1,
              lastName: 'Remedios Rosado',
              documentNumber: null,
              userRelationTypeId: 8,
              city: 'Pinar del Rio',
              postalCode: '22300',
              address: 'Calle 6ta. No.7A Entre A y C, Rpto. Celso Maragoto Lara, Vele Nuevo',
              phone: '+5352592698',
              checked: true,
              province: 'Pinar del Rio',
              beneficiaryType: 1,
              relatedUserId: 'd48f0800-25a0-11ea-9773-1315b442db0a',
              currency: null,
              correspondent: null,
              location: null,
              office: null,
              officeValue: null,
              paymentType: 99,
              paymentEntityBeneficiaryId: null,
              paymentEntityAccountId: null,
              verified: null,
              paymentEntityInfo: null,
              documentTypeId: null,
              documentExpirationDate: null,
              email: null,
              regionId: null,
              routingNumber: null,
              createdAt: '2022-11-16T20:52:26.724Z',
              updatedAt: '2022-11-16T20:52:26.724Z'
            }
    * */

    // The parameters to pass depend on the type of beneficiary you are creating. Beneficiaries can be;//

    beneficiaryType; // 1 Another Tropipay user , 2 External bank account ( number ---> required )
    searchBy; // Required when beneficiaryType === 1. Possible values are; 1 search user by email. 2 search user by phone number
    searchValue; // "someuser@email.com", ( string ) the email to look for among tropipay users when beneficiaryType is 1 (INTERNAL)
    alias; // "My Friend in Tropipay",
    userRelationTypeId; // 3, (number --> required )

    getDefinedValues(obj) {
        const definedValues = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                definedValues[key] = obj[key];
            }
        }
        return definedValues;
    }

    constructor(beneficiaryType, searchBy, searchValue, alias, userRelationTypeId) {
        this.beneficiaryType = beneficiaryType;
        this.searchBy = searchBy;
        this.searchValue = searchValue;
        this.alias = alias;
        this.userRelationTypeId = userRelationTypeId;
    }

    toObject() {
        const ouput = {
            beneficiaryType: this.beneficiaryType,
            searchBy: this.searchBy,
            searchValue: this.searchValue,
            alias: this.alias,
            userRelationTypeId: this.userRelationTypeId
        };
        return this.getDefinedValues(ouput);
    }
}

/* TODO > ExternalDepositAccountPayload */
class ExternalDepositAccountPayload {

    /* TODO:
        {
          searchBy: 1,
          searchValue: 'fiderosado@gmail.com',
          userRelationTypeId: 3,
          beneficiaryType: 2,
          paymentType: 2,
          type: 7,
          documentTypeId: null,
          documentExpirationDate: null,
          currency: '',
          correspondent: null,
          firstName: 'Nombre',
          lastName: 'Apellidos',
          secondLastName: 'Segundo Apellido',
          alias: 'id corto del usuario',
          countryDestinationId: 1,
          province: 'Barcelona',
          city: 'Barcelona',
          phone: '+34911234567',
          address: 'Gran Via de les Corts Catalanes, 765',
          postalCode: '08001',
          accountNumber: 'ES9121000418450200051332',
          swift: 'BBVAESMMXXX',
          documentNumber: '88031400687'
        }
        result---> {
          isInEP: 226049,
          state: 0,
          id: 59191,
          alias: 'Variedades Pinar',
          countryDestinationId: 1,
          type: 7,
          default: null,
          userId: 'f89833b0-f97b-11eb-bbb1-c19c62049f20',
          userRelationTypeId: 3,
          checked: true,
          firstName: 'Nombre',
          lastName: 'Apellidos',
          documentNumber: '4654654654654',
          beneficiaryType: 2,
          paymentType: 2,
          documentTypeId: null,
          documentExpirationDate: null,
          accountNumber: 'ES91 2100 0418 4502 0005 1332',
          routingNumber: null,
          swift: 'BBVAESMMXXX',
          city: 'Barcelona',
          postalCode: '08001',
          address: 'Gran Via de les Corts Catalanes, 765',
          phone: '+34911234567',
          province: 'Barcelona',
          currency: '',
          paymentEntityBeneficiaryId: 226049,
          paymentEntityAccountId: 223005,
          paymentEntityInfo: {
            isValid: true,
            contactId: 317325,
            addressId: 212959,
            accountId: 223005,
            documentId: 374561
          },
          updatedAt: '2023-07-16T20:40:20.585Z',
          createdAt: '2023-07-16T20:40:20.585Z',
          country: null,
          relatedUserId: null,
          correspondent: null,
          location: null,
          office: null,
          officeValue: null,
          verified: null,
          email: null,
          regionId: null
        }
        * */

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

    getDefinedValues(obj) {
        const definedValues = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                definedValues[key] = obj[key];
            }
        }
        return definedValues;
    }

    constructor(beneficiaryType, searchBy, searchValue, accountNumber, alias, userRelationTypeId, swift, type, firstName, lastName, secondLastName, countryDestinationId, paymentType, province, city, address, documentNumber, phone, documentExpirationDate, postalCode, documentTypeId) {
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
        const ouput = {
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

        return this.getDefinedValues(ouput);
    }
}

module.exports = {InternalDepositAccountPayload, ExternalDepositAccountPayload}
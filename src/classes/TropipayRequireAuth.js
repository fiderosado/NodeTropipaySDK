"use client";
"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const React = require("react");
const {useRouter} = require("next/navigation");
const TropipayRequireAuth = (params) => {
    return function (WrappedComponent) {
        const WithAuthComponent = function (props) {
            let router = null;
            let newparams = {};
            newparams = {
                ...props,
                ...params
            }
            try {
                router = useRouter();
                let errores = [];
                if (!(typeof params?.redirectIfNotAuthenticated === "boolean")) {
                    errores.push("Error: Faltan parametros: redirectIfNotAuthenticated ned to be a boolean");
                }

                if (!(typeof params?.redirectTo === "string")) {
                    errores.push('Error: Please provide redirectTo as redirection url');
                }
                if (!(typeof params?.forceRedirect === "boolean")) {
                    errores.push('Error: Please provide forceRedirect as Boolean params');
                }
                if (errores.length > 0) {
                    throw new Error(`${errores.join(', ')}`)
                }

                if (
                    !(typeof params?.redirectIfNotAuthenticated === "object") &&
                    !(typeof params?.session?.id === "string")
                ) {
                    if (params.redirectIfNotAuthenticated) {
                        if (!params.redirectTo) {
                            throw new Error('Please provide redirectTo as redirection url');
                        }
                        if ((typeof params?.forceRedirect === "boolean") && params?.forceRedirect ) {
                            console.warn('- Warning --> TropipayRequireAuth: Please provide redirectTo as redirection url');
                            router.replace(params.redirectTo);
                        }else {
                            const redirectComponent = React.createElement("script", {
                                dangerouslySetInnerHTML: {
                                    __html: `window.location.href = "${params.redirectTo}";`
                                }
                            });
                            return redirectComponent;
                        }
                    }
                }
            } catch (err) {
                //console.log("- TropipayRequireAuth: ", err);
            }
            return React?.createElement(WrappedComponent, newparams);
        }
        return WithAuthComponent;
    }
}
module.exports = TropipayRequireAuth;

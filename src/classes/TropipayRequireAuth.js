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
                if (params.redirectIfNotAuthenticated && !params.session.id) {
                    if (!params.redirectTo) {
                        console.warn('Please provide redirectTo as redirection url');
                    }
                    router.replace(params.redirectTo);
                }
            } catch (err) {}
            return React?.createElement(WrappedComponent, newparams);
        }
        return WithAuthComponent;
    }
}
module.exports = TropipayRequireAuth;

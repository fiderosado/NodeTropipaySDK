const React = require("react")
const TropipayRequireAuth = (params = {
    redirectTo: null,
    redirectIfNotAuthenticated: true,
}) => {
    console.log("TropipayRequireAuth -->", params);
    return function (WrappedComponent) {
        const WithAuthComponent = function (props) {
            return React.createElement(WrappedComponent, props);
        }
        return WithAuthComponent;
    }
}
module.exports = TropipayRequireAuth;
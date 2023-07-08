const React = require("react")
const TropipayRequireAuth  = (props = {}) => {
    console.log("TropipayRequireAuth -->", props);
    return function (WrappedComponent) {
        const WithAuthComponent = function (props) {
            return React.createElement(WrappedComponent, props);
        }
        return WithAuthComponent;
    }
}
module.exports = TropipayRequireAuth ;
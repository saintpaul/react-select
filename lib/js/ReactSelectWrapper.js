"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var Select = require("react-select");
var _ = require("lodash");

var _require = require("react-validation"),
    ValidationTypes = _require.ValidationTypes;

/**
 * Wrapper for react-select component.
 * It will returns object or array, depending on the "multi" props value.
 * If "valueKey" props is not provided, the value for an option will be the option object itself.
 * If "labelKey" props is not provided, the label for an option will be the option converted to string.
 *
 * You'll need to define value, options and onChange props like this:
 *   <ReactSelectWrapper value={this.state.selectedItem} options={this.state.availableItems} onChange={this.onChangeItem}/>
 * Or if you want to use asynchronous option loading:
 *   <ReactSelectWrapper async value={this.state.selectedItem} loadOptions={this.loadingOptions} onChange={this.onChangeItem}/>
 *
 * NB :
 * This lib use react-select in version 1.0.0-beta8.
 * This is really important since some bugs are introduced in latest version (1.0.0-rc1) still not fix, here is the list :
 * - Async mode + valueKey will always returns an object, not valueKey
 * - ignoreCase prop is true by default and it introduces a bug (it transforms text to lowercase)
 */


var ReactSelectWrapper = function (_React$Component) {
    _inherits(ReactSelectWrapper, _React$Component);

    function ReactSelectWrapper(props) {
        _classCallCheck(this, ReactSelectWrapper);

        var _this = _possibleConstructorReturn(this, (ReactSelectWrapper.__proto__ || Object.getPrototypeOf(ReactSelectWrapper)).call(this, props));

        _initialiseProps.call(_this);

        _this.debounce = _.debounce(_this._callLoadOption, _this.props.debounceTime);
        return _this;
    }

    return ReactSelectWrapper;
}(React.Component);

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this._cleanProps = function () {
        var newProps = _.clone(_this2.props);
        delete newProps.async;
        delete newProps.debounceTime;
        delete newProps.limit;

        return newProps;
    };

    this.getOptions = function () {
        if (!_this2.props.labelKey) return _this2.props.options.map(function (option) {
            return { value: option, label: option.toString() };
        });else return _this2.props.options;
    };

    this.getValue = function (value) {
        return _this2.props.valueKey ? value[_this2.props.valueKey] : value;
    };

    this.onChange = function (selectedItems) {
        return _this2.props.multi ? _this2._onChangeMulti(selectedItems) : _this2._onChangeSingle(selectedItems);
    };

    this._onChangeSingle = function (selectedItem) {
        // Tests on array prevent a bug: when pushing backspace key to delete the selected value, it returns a empty array instead of null
        if (selectedItem === null || _.isArray(selectedItem) && selectedItem.length === 0) return _this2.props.onChange(null);

        return _this2.props.labelKey ? _this2.props.onChange(selectedItem) : _this2.props.onChange(selectedItem.value);
    };

    this._onChangeMulti = function (selectedItems) {
        if (selectedItems === null) return _this2.props.onChange([]);

        _this2.props.labelKey ? _this2.props.onChange(selectedItems) : _this2.props.onChange(selectedItems.map(function (selectedItem) {
            return selectedItem.value;
        }));
    };

    this.loadOptions = function (input, callback) {
        if (input && input.length !== 0) {
            if (_this2.props.debounceTime) _this2.debounce(input, callback);else _this2._callLoadOption(input, callback);
        }
    };

    this.limitResults = function () {
        var limit = _this2.props.limit;
        if (limit && limit > 0) {
            return function (options, filter) {
                return _.chain(options).filter(function (o) {
                    return _this2.getValue(o).toUpperCase().includes(filter.toUpperCase());
                }).take(limit).value();
            };
        } else {
            return undefined;
        }
    };

    this._callLoadOption = function (input, callback) {
        _this2.props.loadOptions(input, function (data) {
            callback(null, { complete: false, options: data });
        });
    };

    this.renderLabel = function () {
        return React.createElement(
            "label",
            { className: "control-label" },
            React.createElement(
                "span",
                null,
                _this2.props.label
            )
        );
    };

    this.render = function () {
        var select = void 0;
        var props = _this2._cleanProps();
        props.filterOptions = _this2.limitResults();

        if (_this2.props.async) select = React.createElement(Select.Async, _extends({}, props, { onChange: _this2.onChange, loadOptions: _this2.loadOptions, filterOptions: false })); // TODO RCH: test if 'limit' prop is working with async
        else select = React.createElement(Select, _extends({}, props, { onChange: _this2.onChange, options: _this2.getOptions() }));

        return React.createElement(
            "div",
            { className: "react-select-wrapper" },
            _this2.props.label ? _this2.renderLabel() : null,
            select
        );
    };
};

ReactSelectWrapper.propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired,
    multi: React.PropTypes.bool,
    async: React.PropTypes.bool,
    debounceTime: React.PropTypes.number,
    options: React.PropTypes.array,
    loadOptions: React.PropTypes.func,
    limit: React.PropTypes.number // Limit number of displayed results. (this feature works for simple select only in sync mode only)
};

ReactSelectWrapper.defaultProps = {
    options: [],
    validationType: ValidationTypes.REACT_SELECT // Props required by Validation system
};

module.exports = ReactSelectWrapper;
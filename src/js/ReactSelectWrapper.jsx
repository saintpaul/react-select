const React = require("react");
const Select = require("react-select");
const _ = require("lodash");
const { ValidationTypes } = require("react-validation");
const Config = require("./Configuration");

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
class ReactSelectWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.debounce = _.debounce(this._callLoadOption, this.props.debounceTime);
        this.selectRef = null; // Ref to Select component
    }

    _cleanProps = () => {
        var newProps = _.clone(this.props);
        newProps.noResultsText = newProps.noResultsText || Config.NO_RESULT_TEXT;
        // newProps.noResultsText = newProps.noResultsText || Config.NO_RESULT_TEXT;
        delete newProps.async;
        delete newProps.debounceTime;
        delete newProps.limit;
        delete newProps.autoSelectOnBlur;

        return newProps;
    };

    getOptions = () => {
        if (!this.props.labelKey)
            return this.props.options.map((option) => ({value: option, label: option.toString()}));
        else
            return this.props.options;
    };

    getValue = (value) => this.props.valueKey ? value[this.props.valueKey] : value;

    onChange = (selectedItems) => (this.props.multi ? this._onChangeMulti(selectedItems) : this._onChangeSingle(selectedItems));
    onBlur = (e) => {
        var select = this.selectRef;
        // Auto focus first available option on blur
        if(select && select.filterOptions().length === 1)
            select.selectFocusedOption();
        if(this.props.onBlur)
            this.props.onBlur(e);
    };

    _onChangeSingle = (selectedItem) => {
        // Tests on array prevent a bug: when pushing backspace key to delete the selected value, it returns a empty array instead of null
        if (selectedItem === null || (_.isArray(selectedItem) && selectedItem.length === 0))
            return this.props.onChange(null);

        return this.props.labelKey ? this.props.onChange(selectedItem) : this.props.onChange(selectedItem.value);
    };
    _onChangeMulti = (selectedItems) => {
        if (selectedItems === null)
            return this.props.onChange([]);

        this.props.labelKey ? this.props.onChange(selectedItems) : this.props.onChange(selectedItems.map((selectedItem) => (selectedItem.value)));
    };

    loadOptions = (input, callback) => {
        if (input && input.length !== 0) {
            if (this.props.debounceTime)
                this.debounce(input, callback);
            else
                this._callLoadOption(input, callback);
        }
    };

    limitResults = () => {
        let limit = this.props.limit;
        if(limit && limit > 0) {
            return (options, filter) => _
                .chain(options)
                .filter( (o) => this.getValue(o).toUpperCase().includes(filter.toUpperCase()) )
                .take(limit)
                .value();
        } else {
            return undefined;
        }
    };

    _callLoadOption = (input, callback) => {
        this.props.loadOptions(input, (data) => {
            callback(null, {complete: false, options: data});
        });
    };

    renderLabel = () => (
        <label className="control-label">
            <span>{ this.props.label }</span>
        </label>
    );

    render = () => {
        let select;
        let onBlur = this.props.autoSelectOnBlur ? { onBlur: this.onBlur } : null;
        let props = this._cleanProps();
        props.filterOptions = this.limitResults();

        if (this.props.async)
            select = <Select.Async {...props} onChange={this.onChange} loadOptions={this.loadOptions} filterOptions={false}/>; // TODO RCH: test if 'limit' prop is working with async
        else
            select = <Select ref={ (ref) => this.selectRef = ref } {...props} onChange={this.onChange} {...onBlur} options={this.getOptions()}/>;

        return (
            <div className="react-select-wrapper">
                { this.props.label ? this.renderLabel() : null }
                {select}
            </div>
        );
    };
}

ReactSelectWrapper.propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired,
    multi: React.PropTypes.bool,
    async: React.PropTypes.bool,
    debounceTime: React.PropTypes.number,
    options: React.PropTypes.array,
    loadOptions: React.PropTypes.func,
    limit: React.PropTypes.number,               // Limit number of displayed results. (this feature works for simple select in sync mode only)
    autoSelectOnBlur: React.PropTypes.bool       // If true, auto select the first option onBlur (if there is one result only)
};

ReactSelectWrapper.defaultProps = {
    options: [],
    validationType: ValidationTypes.REACT_SELECT, // Props required by Validation system
    autoSelectOnBlur: true
};

ReactSelectWrapper.Config = Config;

module.exports = ReactSelectWrapper;
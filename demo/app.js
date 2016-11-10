const React = require('react');
const ReactDom = require('react-dom');
const ReactSelect = require('../src/js/ReactSelectWrapper');
// Override default configuration
ReactSelect.Config.NO_RESULT_TEXT = "No results found, try something else bro";

const STREETS = [
    "Rue du fort",
    "Allée des lilas",
    "Avenue du Général de Gaulle",
    "Impasse du pont",
    "Boulevard de Scarpone"
];

class Demo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
           street: null
        }
    }

    onChangeStreet = (value) => this.setState({ street: value });

    render = () => (
        <div className="demo">
            <ReactSelect value={this.state.street} onChange={this.onChangeStreet} options={STREETS}/>
        </div>
    );
}

ReactDom.render(<Demo />, document.getElementById('wrapper'));

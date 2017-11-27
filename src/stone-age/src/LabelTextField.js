import React, { Component } from 'react';

class LabelTextField extends Component {

  constructor(props){
    super(props);
  }

  render() {
    let {_value, _label, _key, onHandleChange, numeric} = this.props;
    let placeholder = (numeric) ? 0 : '';
    return (
        <div className="row">
            <div className="form-group col-xs-12 col-md-8">
            <label htmlFor={_key}>{_label}</label>
            <input type="text" className="form-control" id={_key} placeholder={placeholder} value={_value} onChange={onHandleChange.bind(this, _key)}/>
            </div>
        </div>
    );
  }
}

export default LabelTextField;

import React, { Component } from 'react';

class LabelTextField extends Component {

  render() {
    let {_value, _label, _key, onHandleChange, onHandleSetChange, numeric, index} = this.props;
    let placeholder = (numeric) ? 0 : '';
    let onFieldChange;
    let className = (numeric) ? 'short' : '';

    if(onHandleChange !== undefined){
      onFieldChange = onHandleChange.bind(this, _key, numeric);
    }
    if(onHandleSetChange !== undefined){
      onFieldChange = onHandleSetChange.bind(this, index);
    }
    return (
        <div className="row">
            <div className="form-group col-xs-12 col-md-8">
            <label htmlFor={_key}>{_label}</label>
            <input type="text" className={`form-control ${className}`} id={_key} placeholder={placeholder} value={_value} onChange={onFieldChange}/>
            </div>
        </div>
    );
  }
}

export default LabelTextField;

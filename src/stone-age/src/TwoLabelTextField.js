import React, { Component } from 'react';

class TwoLabelTextField extends Component {

  render() {
    let {_value, _label, _key, onHandleChange, numeric} = this.props;
    let placeholder = [];
    placeholder[0] = (numeric[0]) ? 0 : '';
    placeholder[1] = (numeric[1]) ? 0 : '';
    let className = (numeric) ? 'short' : '';

    return (
        <div className="row">
            <div className="form-group col-xs-6 col-md-6">
                <label htmlFor={_key[0]}>{_label[0]}</label>
                <input type="text" className={`form-control ${className}`} id={_key[0]} placeholder={placeholder[0]} value={_value[0]} 
                  onChange={onHandleChange.bind(this, [ _key[0], 0 ], numeric[0] )}/>
            </div>
            <div className="form-group col-xs-6 col-md-6">
                <label htmlFor={_key[1]}>{_label[1]}</label>
                <input type="text" className={`form-control ${className}`} id={_key[1]} placeholder={placeholder[1]} value={_value[1]} 
                  onChange={onHandleChange.bind(this, [ _key[0], 1 ], numeric[1] )}/>
            </div>
        </div>
    );
  }
}

export default TwoLabelTextField;

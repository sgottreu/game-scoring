import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';


import uuidV4  from 'uuid/v4';

const actions = [
  {name: 'Church', key: 'church'},
  {name: 'Mercato', key: 'mercato'},
  {name: 'Shipping Offices', key: 'shipping_offices'},
  {name: 'Docks', key: 'docks'} ,
  {name: 'Guild Hall', key: 'guild_hall'},
  {name: 'Shops', key: 'shops'},
  {name: 'Stock Market', key: 'stock_market'}
]

const styles = {
  thumbOff: {
    backgroundColor: 'rgba(0, 188, 212, 0.5)',
  },
  trackOff: {
    backgroundColor: 'rgb(0, 188, 212)',
  },
  thumbSwitched: {
    backgroundColor: 'red',
  },
  trackSwitched: {
    backgroundColor: '#ff9d9d',
  }
};
class ActionModal extends Component {

  render() {
    let {shops, stocks, open, handleClose, openActionModal, selectedAction, handleActionChange, initAction} = this.props;

    return (
      <div className="actions">
        <RaisedButton onTouchTap={openActionModal} label="Perform Action" primary={true} />
        <Dialog
          className="ActionModal"
          title="Perform Action"
          actions={[
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={handleClose.bind(this, 'actionModal')}
            />,
            <RaisedButton
              label="Submit"
              primary={true}
              keyboardFocused={true}
              onTouchTap={handleClose.bind(this, 'actionModal')}
            />
          ]}
          modal={false}
          open={open}
          onRequestClose={handleClose.bind(this, 'actionModal')}
        >
          <SelectField
            floatingLabelText="Action"
            value={selectedAction}
            onChange={handleActionChange}
          >
            {
              actions.map( (action, i) => {
                return <MenuItem key={i} value={action.key} primaryText={action.name} />
              })
            }
          </SelectField>
          <div className={'resources '+((selectedAction === 'stock_market') ? 'hide' : '')}>
            {
              shops.map( (shop, i) => {
                if(!shop.shop){
                  return false;
                }
                return (
                  <div className="resource" key={uuidV4()} >
                    <span className="name">{shop.resource}</span>
                    <TextField 
                      inputStyle={ {width: 100, fontSize: 40, height: 60, textAlign: 'center'} } 
                      style={{width: 100, fontSize: 40, height: 60}} 
                      key={uuidV4()} 
                      name={shop.key+'_resources'} 
                      type="number" value={initAction} />
                      <RadioButtonGroup name={shop.key+'_resources_radio'} defaultSelected="buy" className="radioBtns">
                        <RadioButton
                          value="buy"
                          label="Buy"
                        />
                        <RadioButton
                          value="sell"
                          label="Sell"
                        />
                      </RadioButtonGroup>
                  </div>
                )
              })
            }
          </div>
          <div className={'stocks '+((selectedAction !== 'stock_market') ? 'hide' : '')}>
            {
              shops.map( (shop, i) => {
                if(!shop.stocks){
                  return false;
                }
                return (
                  <div className="stock" key={uuidV4()} >
                    <span className="name">{shop.name}</span>
                    <TextField 
                      inputStyle={ {width: 100, fontSize: 40, height: 60, textAlign: 'center'} } 
                      style={{width: 100, fontSize: 40, height: 60}} 
                      key={uuidV4()} 
                      name={shop.key+'_stocks'} 
                      type="number" value={initAction} />
                      <RadioButtonGroup name={shop.key+'_stocks_radio'} defaultSelected="buy" className="radioBtns">
                        <RadioButton
                          value="buy"
                          label="Buy"
                        />
                        <RadioButton
                          value="sell"
                          label="Sell"
                        />
                      </RadioButtonGroup>
                  </div>
                )
              })
            }
          </div>
        </Dialog>
      </div>
    );
  }
}

export default ActionModal;
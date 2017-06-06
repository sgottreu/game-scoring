import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';


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


class ActionModal extends Component {

  render() {
    let {shops, open, handleClose, openActionModal, selectedAction, handleActionChange, initAction} = this.props;

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
          <div className="resources">
            {
              shops.map( (shop, i) => {
                return (
                  <div className="resource">
                    {shop.name}
                    <TextField 
                      name={shop.key+'_resources'} type="number" value={initAction} />
                      <Toggle
                        label="Buy"
                      /> Sell
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
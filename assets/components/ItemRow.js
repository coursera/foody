import React from 'react';
import authorization from 'authorization';

const ItemRow = (Component, apiPath) => class extends React.Component {
  static displayName = 'ItemRow'

  static propTypes = {
    edit: React.PropTypes.object.isRequired,
    editItem: React.PropTypes.func.isRequired,
    updateItem: React.PropTypes.func.isRequired,
    addItem: React.PropTypes.func.isRequired,
    removeItems: React.PropTypes.func.isRequired,
    item: React.PropTypes.object.isRequired,
    checked: React.PropTypes.bool.isRequired,
  }

  static contextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
  }

  componentInstance = null

  constructor(props) {
    super(props);
  }

  getFetchOptions(method, body) {
    return {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': authorization,
      }),
      method,
      body: JSON.stringify(body),
      credentials: 'same-origin',
    };
  }

  triggerEdit(cell) {
    this.props.editItem(this.props.item, cell);
  }

  triggerSave() {
    const formValues = this.componentInstance.getFormValues();
    const fetchOptions = this.getFetchOptions('POST', formValues);
    fetch('api/' + apiPath + '/' + this.props.item.id, fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          response.json().then(() => {
            formValues.id = this.props.item.id;
            this.props.updateItem(formValues);
          });
        } else {
          /* eslint-disable no-alert */
          response.text().then((text) => alert(text));
        }
      }).catch((err) => {
        throw new Error(err);
      });
  }

  triggerCancel() {
    if (this.props.item.id === -1) {
      this.props.removeItems([this.props.item]);
    } else {
      this.componentInstance.setState(this.componentInstance.initialState());
      this.props.updateItem(this.props.item);
    }
  }

  triggerAdd(keepAdding = false) {
    const formValues = this.componentInstance.getFormValues();
    const fetchOptions = this.getFetchOptions('PUT', formValues);
    fetch('api/' + apiPath, fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((stats) => {
            formValues.id = stats.id;
            this.props.addItem(formValues, keepAdding);
          });
        } else {
          /* eslint-disable no-alert */
          response.text().then((text) => alert(text));
        }
      }).catch((err) => {
        throw new Error(err);
      });
  }

  render() {
    const props = Object.assign({}, this.props, { ref: instance => this.componentInstance = instance });
    return (<Component
      {...props}
      {...this.state}
      triggerEdit={(cell) => this.triggerEdit(cell)}
      triggerSave={() => this.triggerSave()}
      triggerAdd={(...a) => this.triggerAdd(...a)}
      triggerCancel={() => this.triggerCancel()}
    />);
  }
};

module.exports = ItemRow;

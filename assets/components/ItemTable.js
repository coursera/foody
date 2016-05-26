import React from 'react';
import authorization from 'authorization';

const ItemTable = (Component, apiPath) => class extends React.Component {
  static displayName = 'ItemTable'

  static propTypes = {
    params: React.PropTypes.object,
    location: React.PropTypes.object,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  componentInstance = null

  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      edit: {
        on: false,
        item: null,
        column: null,
      },
    };
  }

  componentDidMount() {
    this.fetchItems();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.query.offset !== this.props.location.query.offset ||
      prevProps.location.query.items !== this.props.location.query.items) {
      this.fetchItems();
    }
  }

  fetchItems() {
    const fetchOptions = {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': authorization,
      }),
      method: 'GET',
      credentials: 'same-origin',
    };

    const offset = parseInt(this.props.location.query.offset, 10) || 0;
    const items = parseInt(this.props.location.query.items, 10) || 10;
    const url = `api/${apiPath}?offset=${offset}&items=${items}`;
    const promises = [fetch(url, fetchOptions)];

    if (this.componentInstance.metaDataUrl) {
      promises.push(fetch(this.componentInstance.metaDataUrl, fetchOptions));
    } else {
      promises.push({ status: 200, json: () => { Object(); } });
    }

    Promise.all(promises)
      .then((responses) => {
        if (responses[0].status === 200 && responses[1].status === 200) {
          Promise.all([responses[0].json(), responses[1].json()])
            .then((jsonResponses) => {
              const state = { items: jsonResponses[0] };
              Object.assign(state, jsonResponses[1]);
              this.componentInstance.setState(state);
            }).catch((err) => {
              throw new Error(err);
            });
        } else {
          /* eslint-disable no-alert */
          responses[0].text().then((text) => alert(text));
          if (responses[1].text) {
            responses[1].text().then((text) => alert(text));
          }
        }
      }).catch((err) => {
        throw new Error(err);
      });
  }

  editItem(item, column) {
    this.setState({ edit: { on: true, item, column: column || 1 }, checked: !column ? this.addChecked(item) : [item] });
  }

  removeItems(items) {
    this.setState({ edit: { on: false, item: {}, column: null }, checked: [] });
    this.fetchItems();
  }

  addChecked(item) {
    const checked = this.state.checked;
    if (checked.findIndex(check => check.id === item.id) === -1) {
      checked.push(item);
    }
    return checked;
  }

  removeChecked(item) {
    const checked = this.state.checked;
    const index = checked.findIndex(check => check.id === item.id);
    if (index !== -1) {
      checked.splice(index, 1);
    }

    return checked;
  }

  addItem(item, keepAdding = false) {
    const items = this.componentInstance.state.items;
    let addedIndex = -1;

    items.forEach((one, index) => {
      if (one.id === -1) {
        addedIndex = index;
      }
    });

    if (addedIndex !== -1) {
      items.splice(addedIndex, 1, item);

      this.componentInstance.setState({ items });
      this.setState({ edit: { on: false, item }, checked: this.removeChecked({ id: -1 }) });

      if (keepAdding) {
        this.triggerAdd();
      }
    }
  }

  updateItem(item) {
    let items = this.componentInstance.state.items;

    items = items.map((one) => {
      if (one.id === item.id) {
        return item;
      }
      return one;
    });

    this.componentInstance.setState({ items });
    this.setState({ edit: { on: false, item }, checked: this.removeChecked(item) });
  }

  triggerAdd() {
    const item = this.componentInstance.newItem || { id: -1 };
    const items = this.componentInstance.state.items;

    items.unshift(item);

    this.componentInstance.setState({ items });
    this.setState({ edit: { on: true, item }, checked: [item] });
  }

  triggerRemove() {
    const fetchOptions = {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': authorization,
      }),
      method: 'DELETE',
      body: JSON.stringify({ ids: this.state.checked.map(item => item.id) }),
      credentials: 'same-origin',
    };
    fetch(`api/${apiPath}`, fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          this.removeItems(this.state.checked);
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
      triggerAdd={(...a) => this.triggerAdd(...a)}
      triggerRemove={() => this.triggerRemove()}
      updateItem={(...a) => this.updateItem(...a)}
      addItem={(...a) => this.addItem(...a)}
      removeItems={(...a) => this.removeItems(...a)}
      editItem={(...a) => this.editItem(...a)}
    />);
  }
};

module.exports = ItemTable;

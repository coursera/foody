import React from 'react';
import moment from 'moment';
import authorization from 'authorization';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableBody from 'material-ui/Table/TableBody';
import Table from 'material-ui/Table/Table';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';

class MenuAddorEditDialog extends React.Component {
  static displayName = 'MenuAddorEditDialog'

  static propTypes = {
    params: React.PropTypes.object,
    meals: React.PropTypes.array,
    dishes: React.PropTypes.array,
    restrictions: React.PropTypes.array,
    caterers: React.PropTypes.array,
    updateDishes: React.PropTypes.func,
    open: React.PropTypes.bool,
    item: React.PropTypes.object,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      item: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ item: nextProps.item });
  }

  getFormValues() {
    return {
      title: this.refs.title.getValue(),
      description: this.refs.description.getValue(),
      served_on: moment(this.refs.served_on.getDate()).format('YYYY-MM-DD'),
      caterer: this.refs.caterer.props.value,
      meal: this.refs.meal.props.value,
      restrictions: this.getRestrictionsValue().join(','),
    };
  }

  getRestrictionsValue() {
    const diets = [];

    this.props.restrictions.forEach((diet) => {
      if (this.refs[`restriction${diet.id}`].isChecked()) {
        diets.push(diet.id);
      }
    });

    return diets;
  }

  getFetchOptions(method, body) {
    const options = {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': authorization,
      }),
      method,
      credentials: 'same-origin',
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  editItem() {
    const formValues = this.getFormValues();
    const fetchOptions = this.getFetchOptions('POST', formValues);
    fetch('api/dish/' + this.props.item.id, fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          response.json().then(() => {
            this.props.updateDishes(this.props.dishes.map(dish => {
              if (dish.id === this.props.item.id) {
                formValues.id = dish.id;
                return formValues;
              }
              return dish;
            }));
          });
        } else {
          /* eslint-disable no-alert */
          response.text().then((text) => alert(text));
        }
      }).catch((err) => {
        throw new Error(err);
      });
  }

  deleteItem() {
    const fetchOptions = this.getFetchOptions('DELETE');
    fetch('api/dish/' + this.props.item.id, fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          response.json().then(() => {
            this.props.updateDishes(this.props.dishes.filter(dish => dish.id !== this.props.item.id));
          });
        } else {
          /* eslint-disable no-alert */
          response.text().then((text) => alert(text));
        }
      }).catch((err) => {
        throw new Error(err);
      });
  }

  addItem(keepAdding = false) {
    const formValues = this.getFormValues();
    const fetchOptions = this.getFetchOptions('PUT', formValues);
    fetch('api/dish', fetchOptions)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((stats) => {
            formValues.id = stats.id;
            this.props.updateDishes(this.props.dishes.concat(formValues), keepAdding);
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
    const item = this.state.item;
    const adding = item.id ? false : true;

    return (
      <Dialog
        title="Add a dish"
        actions= {adding ? [
          <FlatButton label="Save" primary onTouchTap={() => this.addItem(false) } />,
          <FlatButton label="Save and keep adding" secondary onTouchTap={() => this.addItem(true) } />,
          <FlatButton label="Cancel" onTouchTap={() => this.props.updateDishes(this.props.dishes)} />,
        ] : [
          <FlatButton label="Edit" primary onTouchTap={() => this.editItem() } />,
          <FlatButton label="Delete" secondary onTouchTap={() => confirm('are you sure?') ? this.deleteItem() : null } />,
          <FlatButton label="Cancel" onTouchTap={() => this.props.updateDishes(this.props.dishes)} />,
        ]}
        modal
        open={this.props.open}
        autoScrollBodyContent
      >
        <br />
        <Table multiSelectable={false} selectable={false} >
          <TableBody displayRowCheckbox={false}>
            <TableRow style={ { borderBottom: 'none' } }>
              <TableRowColumn>
                <TextField
                  type="text"
                  name="title"
                  ref="title"
                  autoFocus
                  defaultValue={item.title || ''}
                  // onChange={ (e) => { item.title = e.target.value; this.setState({ item }); }}
                  hintText="Name of dish"
                />
              </TableRowColumn>
              <TableRowColumn>
                <DatePicker
                  value={item.served_on ? moment(item.served_on).toDate() : new Date()}
                  onChange={(e, date) => { item.served_on = date; this.setState({ item }); }}
                  name="served_on"
                  ref="served_on"
                  container="inline"
                  mode="landscape"
                  autoOk
                  formatDate={(date) => moment(date).format('ddd M/D') }
                />
              </TableRowColumn>
              <TableRowColumn>
                <SelectField
                  value={item.meal}
                  name="meal"
                  ref="meal"
                  onChange={(e, index, value) => { item.meal = value; this.setState({ item }); }}
                  hintText="Meal"
                  menuStyle={ { overflowX: 'hidden' } }
                  labelStyle={ { paddingLeft: '0px' } }
                >
                  {this.props.meals.map((one) =>
                    <MenuItem value={one.id} primaryText={one.title} key={one.id} />
                  )}
                </SelectField>
              </TableRowColumn>
            </TableRow>
            <TableRow style={ { borderBottom: 'none' } }>
              <TableRowColumn colSpan={2}>
                <TextField
                  type="text"
                  hintText="Description of dish"
                  name="description"
                  ref="description"
                  multiLine
                  style={ { width: '100%' } }
                  defaultValue={item.description || ''}
                  // onChange={ (e) => { item.description = e.target.value; this.setState({ item }); }}
                />
              </TableRowColumn>
              <TableRowColumn>
                <SelectField
                  value={item.caterer}
                  name="caterer"
                  ref="caterer"
                  onChange={(e, index, value) => { item.caterer = value; this.setState({ item }); }}
                  hintText="Caterer"
                  menuStyle={ { overflowX: 'hidden' } }
                  labelStyle={ { paddingLeft: '0px' } }
                >
                  {this.props.caterers.map((one) =>
                    <MenuItem value={one.id} primaryText={one.title} key={one.id} />
                  )}
                </SelectField>
                <br />
                {this.props.restrictions.map((diet) => {
                  return (
                    <Checkbox
                      key={diet.id}
                      label={diet.title}
                      name={`restriction${diet.id}`}
                      ref={`restriction${diet.id}`}
                      checked={(item.restrictions || []).indexOf(diet.id.toString()) !== -1}
                      onCheck={() => { item.restrictions = this.getRestrictionsValue().join(','); this.setState({ item }); }}
                    />
                  );
                })}
             </TableRowColumn>
           </TableRow>
         </TableBody>
       </Table>
      </Dialog>
    );
  }
}

module.exports = MenuAddorEditDialog;

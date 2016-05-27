import React from 'react';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import moment from 'moment';
import AppRow from './AppRow';
import ItemRow from './ItemRow';

class DishRow extends React.Component {
  static displayName = 'DishRow'

  static propTypes = {
    item: React.PropTypes.object,
    edit: React.PropTypes.object,
    triggerEdit: React.PropTypes.func.isRequired,
    triggerSave: React.PropTypes.func.isRequired,
    triggerCancel: React.PropTypes.func.isRequired,
    triggerAdd: React.PropTypes.func.isRequired,
    caterers: React.PropTypes.array,
    meals: React.PropTypes.array,
    restrictions: React.PropTypes.array,
    style: React.PropTypes.object,
    checked: React.PropTypes.bool.isRequired,
  }

  static contextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = this.initialState();
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

  initialState() {
    return {
      caterer: this.props.item.caterer,
      meal: this.props.item.meal,
      title: this.props.item.title,
      served_on: this.props.item.served_on,
      restrictions: this.props.item.restrictions,
      description: this.props.item.description,
    };
  }

  render() {
    const editable = this.props.edit.on && this.props.edit.item.id === this.props.item.id && this.props.checked;

    const colServed = (
      <TableRowColumn style={this.props.style.served_on}>
        <DatePicker
          value={this.state.served_on ? moment(this.state.served_on).toDate() : new Date()}
          onChange={(e, date) => this.setState({ served_on: date }) }
          name="served_on"
          ref="served_on"
          underlineShow={editable}
          container="inline"
          mode="landscape"
          autoOk
          style={this.props.style.served_on}
          formatDate={(date) => moment(date).format('ddd M/D') }
        />
      </TableRowColumn>);

    const colTitle = (
      <TableRowColumn style={this.props.style.title}>
        <TextField
          type="text"
          name="title"
          ref="title"
          autoFocus
          underlineShow={editable}
          value={this.state.title || ''}
          onChange={ (e) => this.setState({ title: e.target.value }) }
          hintText="Name of dish"
          style={this.props.style.title}
        />
      </TableRowColumn>);

    const colDescription = (
      <TableRowColumn colSpan={2}>
        <TextField
          type="text"
          hintText="Description of dish"
          name="description"
          ref="description"
          multiLine
          underlineShow={editable}
          value={this.state.description || ''}
          onChange={ (e) => this.setState({ description: e.target.value }) }
          style={ { width: '100%' } }
        />
      </TableRowColumn>);

    const colCatererAndRestriction = (
      <TableRowColumn style={this.props.style.caterer} style={ { verticalAlign: 'top' } } >
        <SelectField
          value={this.state.caterer}
          name="caterer"
          ref="caterer"
          underlineStyle={ { visibility: editable ? 'visible' : 'hidden', marginLeft: '0px', bottom: '12px' }}
          onChange={(e, index, value) => this.setState({ caterer: value })}
          hintText="Caterer"
          menuStyle={ { overflowX: 'hidden' } }
          style={this.props.style.caterer}
          labelStyle={ { paddingLeft: '0px' } }
        >
          {this.props.caterers.map((one) =>
            <MenuItem value={one.id} primaryText={one.title} key={one.id} />
          )}
        </SelectField>
        {this.props.restrictions.map((diet) => {
          return (
            <Checkbox
              key={diet.id}
              label={diet.title}
              name={`restriction${diet.id}`}
              ref={`restriction${diet.id}`}
              checked={(this.state.restrictions || '').split(',').indexOf(diet.id.toString()) !== -1}
              onCheck={() => this.setState({ restrictions: this.getRestrictionsValue().join(',') }) }
            />
          );
        })}
      </TableRowColumn>);

    const colMeal = (
      <TableRowColumn style={this.props.style.meal}>
        <SelectField
          value={this.state.meal}
          name="meal"
          ref="meal"
          underlineStyle={ { visibility: editable ? 'visible' : 'hidden', marginLeft: '0px', bottom: '12px' }}
          openImmediately={editable ? this.props.edit.column === 3 : false}
          onChange={(e, index, value) => this.setState({ meal: value })}
          hintText="Meal"
          menuStyle={ { overflowX: 'hidden' } }
          labelStyle={ { paddingLeft: '0px' } }
          style={this.props.style.meal}
        >
          {this.props.meals.map((one) =>
            <MenuItem value={one.id} primaryText={one.title} key={one.id} />
          )}
        </SelectField>
      </TableRowColumn>);

    return (<AppRow editing={editable} edit={(cell) => this.props.triggerEdit(cell) }>
      <TableRow selected={editable} style={ { border: 'none' } }>
        <TableRowColumn style={this.props.style.checkbox}>
          <Checkbox checked={this.props.checked} onCheck={(e, checked) => checked ? this.props.triggerEdit() : this.props.triggerCancel() } />
        </TableRowColumn>
        {colTitle}
        {colServed}
        {colMeal}
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none', borderBottom: 'none' } }>
        <TableRowColumn />
        {editable ? colDescription : <TableRowColumn colSpan={2}/>}
        {editable ? colCatererAndRestriction : <TableRowColumn />}
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none' } }>
        <TableRowColumn />
        <TableRowColumn colSpan={3}>
          <RaisedButton label="Save" primary onClick={() => this.props.item.id === -1 ? this.props.triggerAdd() : this.props.triggerSave() } />
          { this.props.item.id === -1 ?
            <FlatButton label="Save and Keep Adding" secondary onClick={() => this.props.triggerAdd(true) } /> :
            <span /> }
          <FlatButton label="Cancel" onClick={() => this.props.triggerCancel() } />
        </TableRowColumn>
      </TableRow>
    </AppRow>);
  }
}

/* eslint-disable new-cap */
module.exports = ItemRow(DishRow, 'dish');

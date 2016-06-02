import React from 'react';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import AppRow from './AppRow';
import ItemRow from './ItemRow';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';

class MealRow extends React.Component {
  static displayName = 'DishRow'

  static propTypes = {
    item: React.PropTypes.object,
    edit: React.PropTypes.object,
    triggerEdit: React.PropTypes.func.isRequired,
    triggerSave: React.PropTypes.func.isRequired,
    triggerCancel: React.PropTypes.func.isRequired,
    triggerAdd: React.PropTypes.func.isRequired,
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
      title: this.state.title,
      starttime: moment(this.state.starttime).valueOf(),
      endtime: moment(this.state.endtime).valueOf(),
      required: this.state.required,
    };
  }

  initialState() {
    return {
      title: this.props.item.title || '',
      starttime: this.props.item.starttime ? moment(this.props.item.starttime).toDate() : null,
      endtime: this.props.item.endtime ? moment(this.props.item.endtime).toDate() : null,
      required: this.props.item.required || 0,
    };
  }

  render() {
    const editable = this.props.edit.on && this.props.edit.item.id === this.props.item.id && this.props.checked;

    const colTitle = (
      <TableRowColumn style={this.props.style.title}>
        <TextField
          type="text"
          ref="title"
          underlineShow={editable}
          value={this.state.title}
          onChange={ (e) => this.setState({ title: e.target.value }) }
          hintText="Meal name"
          style={this.props.style.title}
        />
      </TableRowColumn>);

    const colStart = (
      <TableRowColumn style={this.props.style.starttime}>
        <TimePicker
          underlineStyle={ { visibility: editable ? 'visible' : 'hidden' }}
          format="ampm"
          autoOk
          hintText="Start time"
          value={this.state.starttime}
          onChange={(e, date) => this.setState({ starttime: date })}
        />
      </TableRowColumn>);

    const colEnd = (
      <TableRowColumn style={this.props.style.endtime}>
        <TimePicker
          underlineStyle={ { visibility: editable ? 'visible' : 'hidden' }}
          format="ampm"
          autoOk
          hintText="End time"
          value={this.state.endtime}
          onChange={(e, date) => this.setState({ endtime: date })}
        />
      </TableRowColumn>);

    const colRequired = (
      <TableRowColumn style={this.props.style.required}>
        <SelectField
          underlineStyle={ { visibility: editable ? 'visible' : 'hidden' }}
          onChange={(e, index, value) => this.setState({ required: value })}
          openImmediately={editable ? this.props.edit.column === 4 : false}
          hintText="Required"
          style={this.props.style.required}
          value={this.state.required}
        >
          <MenuItem value={1} primaryText={'Yes'} />
          <MenuItem value={0} primaryText={'No'} />
        </SelectField>
      </TableRowColumn>);

    return (<AppRow editing={editable} edit={(cell) => this.props.triggerEdit(cell) }>
      <TableRow selected={editable} style={ { border: 'none' } }>
        <TableRowColumn style={this.props.style.checkbox}>
          <Checkbox checked={this.props.checked} onCheck={(e, checked) => checked ? this.props.triggerEdit() : this.props.triggerCancel()} />
        </TableRowColumn>
        {colTitle}
        {colStart}
        {colEnd}
        {colRequired}
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none', borderBottom: 'none' } }>
        <TableRowColumn colSpan={5}/>
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none' } }>
        <TableRowColumn />
        <TableRowColumn colSpan={4}>
          <RaisedButton label="Save" primary onClick={() => this.props.item.id === -1 ? this.props.triggerAdd() : this.props.triggerSave() } />
          <FlatButton label="Cancel" onClick={() => this.props.triggerCancel() } />
        </TableRowColumn>
      </TableRow>
    </AppRow>);
  }
}

/* eslint-disable new-cap */
module.exports = ItemRow(MealRow, 'meal');

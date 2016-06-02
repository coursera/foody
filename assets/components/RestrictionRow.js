import React from 'react';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import AppRow from './AppRow';
import ItemRow from './ItemRow';

class RestrictionRow extends React.Component {
  static displayName = 'RestrictionRow'

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
      color: this.state.color,
    };
  }

  initialState() {
    return {
      title: this.props.item.title || '',
      color: this.props.item.color || '#FFFFFF',
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
          hintText="Restriction name"
          style={this.props.style.title}
        />
      </TableRowColumn>);

    const colColor = (
      <TableRowColumn style={this.props.style.color}>
        <TextField
          type="text"
          ref="color"
          underlineShow={editable}
          value={this.state.color}
          onChange={ (e) => this.setState({ color: e.target.value }) }
          hintText="Color html hex"
          style={this.props.style.color}
        />
      </TableRowColumn>);

    return (<AppRow editing={editable} edit={(cell) => this.props.triggerEdit(cell) }>
      <TableRow selected={editable} style={ { border: 'none' } }>
        <TableRowColumn style={this.props.style.checkbox}>
          <Checkbox checked={this.props.checked} onCheck={(e, checked) => checked ? this.props.triggerEdit() : this.props.triggerCancel()} />
        </TableRowColumn>
        {colTitle}
        {colColor}
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none', borderBottom: 'none' } }>
        <TableRowColumn colSpan={3}/>
      </TableRow>
      <TableRow style={ { display: editable ? 'table-row' : 'none' } }>
        <TableRowColumn />
        <TableRowColumn colSpan={2}>
          <RaisedButton label="Save" primary onClick={() => this.props.item.id === -1 ? this.props.triggerAdd() : this.props.triggerSave() } />
          <FlatButton label="Cancel" onClick={() => this.props.triggerCancel() } />
        </TableRowColumn>
      </TableRow>
    </AppRow>);
  }
}

/* eslint-disable new-cap */
module.exports = ItemRow(RestrictionRow, 'restriction');

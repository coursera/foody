import React from 'react';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import { lighten } from 'material-ui/utils/colorManipulator';

class AppRow extends React.Component {
  static displayName = 'AppRow'

  static propTypes = {
    editing: React.PropTypes.bool,
    edit: React.PropTypes.func,
    children: React.PropTypes.node,
  }

  static contextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TableRow>
        <TableRowColumn style={ { padding: '0px' } }>
          <Table selectable={false} onCellClick={(row, cell) => !this.props.editing ? this.props.edit(cell) : true }>
            <TableBody
              displayRowCheckbox={false}
              style= { {
                background: this.props.editing ? lighten(this.context.muiTheme.palette.borderColor, 0.65) :
                  this.context.muiTheme.palette.canvasColor,
              } }
            >
            {this.props.children}
            </TableBody>
          </Table>
        </TableRowColumn>
      </TableRow>
    );
  }
}

module.exports = AppRow;

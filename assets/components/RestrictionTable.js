import React from 'react';
import RestrictionRow from './RestrictionRow';
import AppTable from './AppTable';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableHeader from 'material-ui/Table/TableHeader';
import TableBody from 'material-ui/Table/TableBody';
import ItemTable from './ItemTable';

class RestrictionTable extends React.Component {
  static displayName = 'MealTable'

  static propTypes = {
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    triggerAdd: React.PropTypes.func.isRequired,
    triggerRemove: React.PropTypes.func.isRequired,
    removeItems: React.PropTypes.func.isRequired,
    updateItem: React.PropTypes.func.isRequired,
    editItem: React.PropTypes.func.isRequired,
    addItem: React.PropTypes.func.isRequired,
    edit: React.PropTypes.object.isRequired,
    checked: React.PropTypes.array.isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };
  }

  render() {
    const style = {
      checkbox: { width: '12px' },
      title: { width: '250px' },
    };

    return (
      <AppTable
        editing={this.props.checked.length > 0}
        title="Restrictions"
        addItem={() => this.props.triggerAdd()}
        removeItems={() => this.props.triggerRemove() }
        pathname="restrictions"
        params={this.props.params}
        location={this.props.location}
        count={this.state.items.length}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={style.checkbox}>Select</TableHeaderColumn>
            <TableHeaderColumn style={style.title}>Title</TableHeaderColumn>
            <TableHeaderColumn style={style.color}>Color</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.items.map((item) => {
            return (
              <RestrictionRow
                key={item.id}
                item={item}
                style={style}
                edit={this.props.edit}
                checked={(this.props.checked.findIndex(check => check.id === item.id) !== -1)}
                editItem={(...a) => this.props.editItem(...a)}
                addItem={(...a) => this.props.addItem(...a)}
                removeItems={(...a) => this.props.removeItems(...a)}
                updateItem={(...a) => this.props.updateItem(...a)}
              />
            );
          })}
        </TableBody>
      </AppTable>
   );
  }
}

/* eslint-disable new-cap */
module.exports = ItemTable(RestrictionTable, 'restriction');

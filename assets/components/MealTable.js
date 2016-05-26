import React from 'react';
import MealRow from './MealRow';
import AppTable from './AppTable';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableHeader from 'material-ui/Table/TableHeader';
import TableBody from 'material-ui/Table/TableBody';
import ItemTable from './ItemTable';

class MealTable extends React.Component {
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
      title: { width: '150px' },
      starttime: { width: '50px' },
      endtime: { width: '50px' },
      required: { width: '50px' },
    };

    return (
      <AppTable
        editing={this.props.checked.length > 1}
        title="Meals"
        addItem={() => this.props.triggerAdd()}
        removeItems={() => this.props.triggerRemove() }
        pathname="meals"
        params={this.props.params}
        location={this.props.location}
        count={this.state.items.length}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={style.checkbox}>Select</TableHeaderColumn>
            <TableHeaderColumn style={style.title}>Title</TableHeaderColumn>
            <TableHeaderColumn style={style.starttime}>Start</TableHeaderColumn>
            <TableHeaderColumn style={style.endtime}>End</TableHeaderColumn>
            <TableHeaderColumn style={style.required}>Required</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.items.map((item) => {
            return (
              <MealRow
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
module.exports = ItemTable(MealTable, 'meal');

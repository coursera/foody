import React from 'react';
import DishRow from './DishRow';
import AppTable from './AppTable';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableHeader from 'material-ui/Table/TableHeader';
import TableBody from 'material-ui/Table/TableBody';
import ItemTable from './ItemTable';

class DishTable extends React.Component {
  static displayName = 'DishTable'

  static propTypes = {
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    triggerAdd: React.PropTypes.func.isRequired,
    triggerAddMany: React.PropTypes.func.isRequired,
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
      addItemsOpen: false,
      addItemsValue: '',
      items: [],
      restrictions: [],
      caterers: [],
      meals: [],
    };
  }

  newItem = {
    id: -1,
  }

  metaDataUrl = 'api/menu'

  render() {
    const style = {
      checkbox: { width: '12px' },
      title: { width: '300px' },
      served_on: { width: '100px' },
      meal: { width: '150px' },
      caterer: { width: '150px' },
    };

    if (this.state.items.length) {
      const firstItem = this.state.items[0];
      this.newItem = {
        id: -1,
        meal: firstItem.meal,
        caterer: firstItem.caterer,
        served_on: firstItem.served_on,
      };
    }

    return (
      <AppTable
        editing={this.props.checked.length > 0}
        title="Dishes"
        addItem={(...a) => this.props.triggerAdd(...a)}
        addItems={(...a) => this.props.triggerAddMany(...a)}
        removeItems={(...a) => this.props.triggerRemove(...a) }
        pathname="dishes"
        params={this.props.params}
        location={this.props.location}
        count={this.state.items.length}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={style.checkbox}>Select</TableHeaderColumn>
            <TableHeaderColumn style={style.title}>Title</TableHeaderColumn>
            <TableHeaderColumn style={style.served_on}>Served On</TableHeaderColumn>
            <TableHeaderColumn style={style.meal}>Meal</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.items.map((item) => {
            return (
              <DishRow
                key={item.id}
                item={item}
                restrictions={this.state.restrictions}
                caterers={this.state.caterers}
                meals={this.state.meals}
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
module.exports = ItemTable(DishTable, 'dish');

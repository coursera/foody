import React from 'react';
import CatererRow from './CatererRow';
import AppTable from './AppTable';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableHeader from 'material-ui/Table/TableHeader';
import TableBody from 'material-ui/Table/TableBody';
import ItemTable from './ItemTable';

class CatererTable extends React.Component {
  static displayName = 'CatererTable'

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
      website: { width: '250px' },
    };

    return (
      <AppTable
        editing={this.props.checked.length > 0}
        title="Caterers"
        addItem={() => this.props.triggerAdd()}
        removeItems={() => this.props.triggerRemove() }
        pathname="caterers"
        params={this.props.params}
        location={this.props.location}
        count={this.state.items.length}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={style.checkbox}>Select</TableHeaderColumn>
            <TableHeaderColumn style={style.title}>Name</TableHeaderColumn>
            <TableHeaderColumn style={style.website}>Website</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.items.map((item) => {
            return (
              <CatererRow
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
module.exports = ItemTable(CatererTable, 'caterer');

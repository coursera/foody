import React from 'react';
// import { Link } from 'react-router';
import moment from 'moment';
import authorization from 'authorization';
import DatePicker from 'material-ui/DatePicker';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableBody from 'material-ui/Table/TableBody';
import Table from 'material-ui/Table/Table';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import theme from '../style/theme';
import HomeIcon from 'material-ui/svg-icons/action/home';

class Menu extends React.Component {
  static displayName = 'Menu'

  static propTypes = {
    params: React.PropTypes.object,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      meals: [],
      dishes: [],
      caterers: [],
      restrictions: [],
    };
  }

  componentDidMount() {
    this.fetchItems();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.week !== this.props.params.week) {
      this.fetchItems();
    }
  }

  getDates() {
    const week = this.props.params.week === undefined ? moment().week() : this.props.params.week;
    return {
      today: moment().format('YYYY-MM-DD'),
      from: moment().week(week).day('Monday').format('YYYY-MM-DD'),
      to: moment().week(week).day('Friday').format('YYYY-MM-DD'),
    };
  }

  changeWeek(date) {
    const week = moment(date).week();
    if (week !== this.props.params.week) {
      this.context.router.push(`/menu/${week}`);
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

    const dates = this.getDates();
    const url = `api/menu?from=${dates.from}&to=${dates.to}&withDishes=1`;

    fetch(url, fetchOptions)
      .then((response) => response.json())
      .then((jsonResponse) => {
        this.setState(jsonResponse);
      }).catch((err) => {
        throw new Error(err);
      });
  }

  buildDishesColumn(menu, meal, date, index) {
    const dishes = menu[date][meal.id];
    const dates = this.getDates();

    const rowStyle = {
      borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
      verticalAlign: 'top',
      padding: '10px',
      backgroundColor: dates.today === date ? theme.palette.accent2Color : theme.palette.canvasColor,
    };

    if (dishes.length) {
      return (
        <TableRowColumn key={date + index} style={ rowStyle }>
          {dishes.map((dish, i) => {
            return (<div key={'dish' + meal.id + i} style={ { whiteSpace: 'normal', marginBottom: '12px' } }>
                <div>
                  <span style={ { fontWeight: 'bold' } }>{dish.title}</span>
                  <span> {this.buildRestrictions(dish)}</span>
                </div>
                <div className="dishDescription">{dish.description}</div>
              </div>);})}
        </TableRowColumn>);
    }

    const emptyRowStyle = {
      fontStyle: 'italic',
      borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
      verticalAlign: 'center',
      padding: '10px',
      textAlign: 'center',
      backgroundColor: dates.today === date ? theme.palette.accent2Color : theme.palette.canvasColor,
    };

    return (
      <TableRowColumn key={date + index} style={ emptyRowStyle }>
        <div>No {meal.title.toLowerCase()}</div>
      </TableRowColumn>);
  }

  buildRestrictions(dish) {
    if (!dish.restrictions) {
      return <span />;
    }

    const diets = dish.restrictions.split(',');

    return diets.map((diet, index) => {
      return (<span key={diet} style={ { fontStyle: 'italic' } }>
        {this.state.restrictions.find(r => r.id.toString() === diet).title.split(' ').map(word => word[0]).join('')}
        {index + 1 < diets.length ? ', ' : ''}
        </span>);});
  }

  render() {
    const dates = this.getDates();
    const hasMeal = {};
    const menu = {};
    const mealDates = [];
    const rows = [];
    const days = moment(dates.to).diff(dates.from, 'days');

    for (let i = 0; i <= days; i++) {
      const date = moment(dates.from).add(i, 'days').format('YYYY-MM-DD');
      mealDates.push(date);
    }

    mealDates.forEach((date) => this.state.meals.forEach((meal) => {
      menu[date] = menu[date] || {};
      menu[date][meal.id] = [];
    }));

    this.state.dishes.forEach((dish) => {
      menu[dish.served_on] = menu[dish.served_on] || { [dish.meal]: [] };
      menu[dish.served_on][dish.meal].push(dish);
      hasMeal[dish.meal] = true;
    });

    this.state.meals.sort((a, b) => moment(b.starttime).hour() < moment(a.starttime).hour()).forEach((meal) => {
      if (hasMeal[meal.id] || meal.required) {
        rows.push(<TableRow key={'meal' + meal.id}>
          <TableRowColumn style={ { borderRight: `solid 1px ${theme.tableRow.borderColor}`, padding: '10px', textAlign: 'center' } }>
            <div style={ { fontWeight: 'bold' } }>{meal.title}</div>
            <div>{moment(meal.starttime).format('h:mm a')} - {moment(meal.endtime).format('h:mm a')}</div>
          </TableRowColumn>
          {mealDates.map((date, index) => this.buildDishesColumn(menu, meal, date, index))}
        </TableRow>);
      }
    });

    const home = <IconButton onClick={() => this.context.router.push('')}><div><HomeIcon color={theme.palette.canvasColor} hoverColor={theme.palette.accent1Color}/></div></IconButton>;
    const title = (<div>
      <DatePicker
        mode="landscape"
        name="menu-date"
        autoOk
        value={moment(dates.from).toDate()}
        textFieldStyle={ { fontSize: '28px', height: 'auto', width: '50%' } }
        inputStyle={ { color: theme.palette.canvasColor, cursor: 'pointer' } }
        onChange={(e, date) => this.changeWeek(date) }
        formatDate={() => moment(dates.from).format('[Menu for] MMM D - ') + moment(dates.to).format('D, Y')}
      />
    </div>);

    return (
      <div className="menu" style={ { width: '85%', margin: 'auto' } }>
        <Paper zDepth={2}>
          <AppBar iconElementLeft={home} title={title} />
          <Table selectable={false} style= { { borderCollapse: 'collapse' }}>
            <TableHeader key="header" displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn style={ { textAlign: 'center', borderRight: `solid 1px ${theme.tableRow.borderColor}` } }>
                  Meal
                </TableHeaderColumn>
                {mealDates.map((date, index) => {
                  return (
                  <TableHeaderColumn key={index} style={ {
                    textAlign: 'center',
                    borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
                    backgroundColor: dates.today === date ? theme.palette.accent2Color : theme.palette.canvasColor,
                  } }
                  >
                    {moment(date).format('ddd')}
                  </TableHeaderColumn>);
                })}
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {rows}
            </TableBody>
          </Table>
        </Paper>
        <div className="menuFooter" style={ { textAlign: 'center', fontSize: '27px', marginTop: '20px', display: 'none' } }>
          {window.location.href}
        </div>
      </div>
    );
  }
}

module.exports = Menu;

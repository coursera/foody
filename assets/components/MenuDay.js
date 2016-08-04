import React from 'react';
import moment from 'moment';
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

/* eslint-disable no-nested-ternary */

class MenuDay extends React.Component {
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
      dialogOpen: false,
      editItem: {},
    };
  }

  componentDidMount() {
    this.fetchItems();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.day !== this.props.params.day) {
      this.fetchItems();
    }
  }

  getDate() {
    const day = this.props.params.day === undefined ? moment().dayOfYear() : this.props.params.day;
    return moment().dayOfYear(day);
  }

  getFetchOptions(method, body) {
    const options = {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method,
      credentials: 'same-origin',
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  fetchItems() {
    const fetchOptions = this.getFetchOptions('GET');
    const date = this.getDate();
    const fromTo = date.format('YYYY-MM-DD');
    const url = `api/menu?from=${fromTo}&to=${fromTo}&withDishes=1`;

    fetch(url, fetchOptions)
      .then((response) => response.json())
      .then((jsonResponse) => {
        this.setState(jsonResponse);
      }).catch((err) => {
        throw new Error(err);
      });
  }


  changeDay(date) {
    const day = moment(date).dayOfYear();
    if (day !== this.props.params.day) {
      this.context.router.push(`/menu/day/${day}`);
    }
  }

  buildCatererLine(caterer) {
    return (<span>
      Caterer: <a href={caterer.website}>{caterer.title}</a>
      <br /><br />
    </span>);
  }

  buildDishesColumn(menu, meal, date, index) {
    const dishes = menu[date][meal.id];

    const rowStyle = {
      borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
      verticalAlign: 'top',
      padding: '10px',
      backgroundColor: theme.palette.canvasColor,
    };

    if (dishes.length) {
      const catererMode = this.mode(dishes, 'caterer');
      const caterer = this.state.caterers.find(one => one.id === catererMode);

      return (
        <TableRowColumn key={date + index} style={ rowStyle }>
          {caterer ? this.buildCatererLine(caterer) : ''}
          {dishes.map((dish, i) => {
            return (
              <div
                key={'dish' + meal.id + i}
                style={ { whiteSpace: 'normal', marginBottom: '12px', cursor: 'default' }}
              >
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
      backgroundColor: theme.palette.canvasColor,
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

  buildSpecialMenu(mealDates, nonRequiredRows) {
    const date = this.getDate();
    const home = <IconButton onClick={() => this.context.router.push('')}><div><HomeIcon color={theme.palette.canvasColor} hoverColor={theme.palette.primary1Color}/></div></IconButton>;

    const specialMenu = (<Paper zDepth={2} style={ { marginTop: '20px' } }>
      <AppBar
        className="menuAppBar"
        iconElementLeft={home}
        title={moment(date).format('[Special Menu for] MMM D, Y')}
        style= { { backgroundColor: theme.palette.accent1Color } }
      />
      <Table selectable={false} style= { { borderCollapse: 'collapse' }}>
        <TableHeader key="header" displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            {mealDates.map((day, index) => {
              return (
              <TableHeaderColumn key={index} style={ {
                textAlign: 'center',
                borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
                backgroundColor: theme.palette.canvasColor,
                color: theme.palette.textColor,
              } }
              >
                {moment(day).format('dddd')} ({moment(day).format('MMM D')})
              </TableHeaderColumn>);
            })}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {nonRequiredRows}
        </TableBody>
      </Table>
    </Paper>);

    return nonRequiredRows.length ? specialMenu : '';
  }

  buildLogo() {
    return { __html: window.logo };
  }

  buildMenu(mealDates, requiredRows) {
    const date = this.getDate();
    const home = <IconButton onClick={() => this.context.router.push('')}><div><HomeIcon color={theme.palette.canvasColor} hoverColor={theme.palette.accent1Color}/></div></IconButton>;

    const title = (<div>
      <DatePicker
        mode="landscape"
        name="menu-date"
        autoOk
        value={moment(date).toDate()}
        textFieldStyle={ { fontSize: '28px', height: 'auto', width: '100%' } }
        inputStyle={ { color: theme.palette.canvasColor, cursor: 'pointer' } }
        onChange={(e, day) => this.changeDay(day) }
        formatDate={() => moment(date).format('[Menu for] MMM D, Y')}
      />
    </div>);

    return (<div className="mainMenuDay">
    <Paper zDepth={2}>
      <AppBar
        className="menuAppBar"
        iconElementLeft={home}
        title={title}
      />
      <Table selectable={false} style= { { borderCollapse: 'collapse' }}>
        <TableHeader key="header" displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            {mealDates.map((day, index) => {
              return (
              <TableHeaderColumn key={index} style={ {
                textAlign: 'center',
                borderRight: index < 4 ? `solid 1px ${theme.tableRow.borderColor}` : 'none',
                backgroundColor: theme.palette.canvasColor,
                color: theme.palette.textColor,
              } }
              >
                {moment(day).format('dddd')} ({moment(day).format('MMM D')})
              </TableHeaderColumn>);
            })}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {requiredRows}
        </TableBody>
      </Table>
    </Paper>
    <div style={ { marginTop: '15px', fontStyle: 'italic' } }>
        {this.state.restrictions.map((diet, index) => {
          return (
          <span key={'dietString' + index}>
            {diet.title.split(' ').map(word => word[0]).join('')} is for {diet.title}
            {index !== this.state.restrictions.length - 1 ? index !== this.state.restrictions.length - 2 ? ', ' : ', and ' : ''}
          </span>);
        })}
      </div>
    </div>);
  }

  mode(_arr, field) {
    const arr = _arr.concat();
    const sorted = arr.sort((a, b) =>
      arr.filter(v => v[field] === a[field]).length - arr.filter(v => v[field] === b[field]).length
    ).pop();

    return sorted ? sorted[field] : null;
  }

  updateDishes(dishes, keepAdding = false, newItem) {
    this.setState({ dishes, dialogOpen: keepAdding, editItem: newItem || {} });
  }

  render() {
    const date = this.getDate();
    const hasMeal = {};
    const menu = {};
    const mealDates = [];
    const requiredRows = [];
    const nonRequiredRows = [];
    const day = moment(date).format('YYYY-MM-DD');

    mealDates.push(day);

    mealDates.forEach((_day) => this.state.meals.forEach((meal) => {
      menu[day] = menu[_day] || {};
      menu[day][meal.id] = [];
    }));

    this.state.dishes.forEach((dish) => {
      menu[dish.served_on] = menu[dish.served_on] || { [dish.meal]: [] };
      if (menu[dish.served_on][dish.meal]) {
        menu[dish.served_on][dish.meal].push(dish);
      }
      hasMeal[dish.meal] = true;
    });

    this.state.meals.sort((a, b) => moment(b.starttime).hour() < moment(a.starttime).hour()).forEach((meal) => {
      if (hasMeal[meal.id] || meal.required) {
        const rows = meal.required ? requiredRows : nonRequiredRows;
        rows.push(<TableRow key={'meal-header' + meal.id}>
          <TableRowColumn
            style={ {
              backgroundColor: theme.palette.accent2Color,
              borderRight: `solid 1px ${theme.tableRow.borderColor}`,
              padding: '10px',
              textAlign: 'center' } }
          >
            <span style={ { fontWeight: 'bold' } }>{meal.title}</span>
            <span> ({moment(meal.starttime).format('h:mm a')} - {moment(meal.endtime).format('h:mm a')})</span>
          </TableRowColumn>
        </TableRow>);

        rows.push(<TableRow key={'meal' + meal.id}>
          {mealDates.map((_day, index) => this.buildDishesColumn(menu, meal, _day, index))}
        </TableRow>);
      }
    });

    return (<div className="menu" style={ { width: '90%', margin: 'auto' } }>
        <div style={ { marginTop: '5px', marginBottom: '10px' } }>
          <div dangerouslySetInnerHTML={this.buildLogo()} />
        </div>
        {this.buildMenu(mealDates, requiredRows)}
        {this.buildSpecialMenu(mealDates, nonRequiredRows)}
      </div>
    );
  }
}

module.exports = MenuDay;

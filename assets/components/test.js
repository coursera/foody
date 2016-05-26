import React from 'react';
import ReactDOM from 'react-dom';
import DishTable from './DishTable';
import CatererTable from './CatererTable';
import RestrictionTable from './RestrictionTable';
import MealTable from './MealTable';
import Menu from './Menu';
import Home from './Home';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import theme from '../style/theme';
import authorization from 'authorization';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const browserHistory = useRouterHistory(createHistory)({
  basename: '/foody',
});

const isAuthorized = (prevState, replace) => {
  if (!authorization) {
    replace('/menu');
    window.location.href = '';
  }
};

class App extends React.Component {
	static displayName = 'App'

  static propTypes = {
    children: React.PropTypes.node,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div>
          {this.props.children}
        </div>
      </MuiThemeProvider>
    );
  }
}

// <!-- <Route path="*" component={NoMatch}/> -->
// Declarative route configuration (could also load this config lazily
// instead, all you really need is a single root route, you don't need to
// colocate the entire config).
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App} >
      <IndexRoute component={Home} onEnter={isAuthorized} />
      <Route path="menu(/:week)" component={Menu} />
      <Route path="meals" component={MealTable} onEnter={isAuthorized}/>
      <Route path="caterers" component={CatererTable} onEnter={isAuthorized}/>
      <Route path="dishes" component={DishTable} onEnter={isAuthorized}/>
      <Route path="restrictions" component={RestrictionTable} onEnter={isAuthorized}/>
    </Route>
  </Router>
), document.getElementById('content'));

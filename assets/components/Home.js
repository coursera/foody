import React from 'react';
import { Link } from 'react-router';
import Today from 'material-ui/svg-icons/action/today';
import ShoppingBasket from 'material-ui/svg-icons/action/shopping-basket';
import Business from 'material-ui/svg-icons/communication/business';
import Restaurant from 'material-ui/svg-icons/maps/restaurant';
import DoNotDisturb from 'material-ui/svg-icons/notification/do-not-disturb';
import theme from '../style/theme';

class Home extends React.Component {
  static displayName = 'Home'

  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      height: '200px',
      width: '200px',
      margin: '24px',
    };

    const hoverColor = theme.palette.accent1Color;
    const color = theme.palette.primary2Color;

    return (
      <div style={ { width: '80%', margin: 'auto', textAlign: 'center' } }>
        <div>
          <Link to="/menu">
            <Today style={style} color={color} hoverColor={hoverColor} />
          </Link>
        </div>
        <div>
          <Link to="/caterers">
            <Business style={style} color={color} hoverColor={hoverColor} />
          </Link>
          <Link to="/dishes">
            <Restaurant style={style} color={color} hoverColor={hoverColor} />
          </Link>
          <Link to="/meals">
            <ShoppingBasket style={style} color={color} hoverColor={hoverColor} />
          </Link>
          <Link to="/restrictions">
            <DoNotDisturb style={style} color={color} hoverColor={hoverColor} />
          </Link>
        </div>
      </div>
    );
  }
}

module.exports = Home;

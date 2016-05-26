import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { blue500, blue700 } from 'material-ui/styles/colors';

const theme = getMuiTheme({
  palette: {
    primary1Color: blue500,
    primary2Color: blue700,
    pickerHeaderColor: blue700,
    /* primary3Color: _colors.grey400,
    accent1Color: _colors.pinkA200,
    accent2Color: _colors.grey100,
    accent3Color: _colors.grey500,
    textColor: _colors.darkBlack,
    alternateTextColor: _colors.white,
    canvasColor: _colors.white,
    borderColor: _colors.grey300,
    disabledColor: (0, _colorManipulator.fade)(_colors.darkBlack, 0.3),
    clockCircleColor: (0, _colorManipulator.fade)(_colors.darkBlack, 0.07),
    shadowColor: _colors.fullBlack */
  },
});

module.exports = theme;

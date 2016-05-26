import React from 'react';
import AppBar from 'material-ui/AppBar';
import Table from 'material-ui/Table/Table';
import Paper from 'material-ui/Paper';
import NoteAddIcon from 'material-ui/svg-icons/action/note-add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import HomeIcon from 'material-ui/svg-icons/action/home';
import IconButton from 'material-ui/IconButton';
import theme from '../style/theme';
import ArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import FlatButton from 'material-ui/FlatButton';

class AppTable extends React.Component {
  static displayName = 'AppTable'

  static propTypes = {
    editing: React.PropTypes.bool,
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    title: React.PropTypes.string,
    children: React.PropTypes.node,
    addItem: React.PropTypes.func,
    removeItems: React.PropTypes.func,
    pathname: React.PropTypes.string,
    count: React.PropTypes.number,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const appBarStyle = this.props.editing ? { backgroundColor: theme.palette.canvasColor } : {};
    const appBarTitleStyle = this.props.editing ? { color: theme.palette.primary1Color } : {};
    const home = this.props.editing ?
      <IconButton onClick={() => this.context.router.push('')}><div><HomeIcon hoverColor={theme.palette.accent1Color} color={theme.palette.primary1Color}/></div></IconButton> :
      <IconButton onClick={() => this.context.router.push('')}><div><HomeIcon hoverColor={theme.palette.accent1Color} color={theme.palette.canvasColor} /></div></IconButton>;
    const icon = this.props.editing ?
      <IconButton onClick={() => this.props.removeItems()}><div><DeleteIcon hoverColor={theme.palette.accent1Color} color={theme.palette.primary1Color}/></div></IconButton> :
      <IconButton onClick={() => this.props.addItem()}><div><NoteAddIcon hoverColor={theme.palette.accent1Color} color={theme.palette.canvasColor}/></div></IconButton>;

    return (
      <div style={ { width: '850px', margin: 'auto' } }>
        <Paper zDepth={2}>
          <AppBar iconElementLeft={home} iconElementRight={icon} title={this.props.title} style={appBarStyle} titleStyle={appBarTitleStyle} />
          <Table multiSelectable={false} selectable={false} >
            {this.props.children}
          </Table>
          <div style={ { textAlign: 'right', padding: '20px' } }>
            <FlatButton
              icon={<ArrowLeft/>}
              disabled={!parseInt(this.props.location.query.offset, 10)}
              onClick={() => this.context.router.push({ pathname: '/' + this.props.pathname, query: { offset: parseInt(this.props.location.query.offset || 0, 10) - 1 } }) }
            />
            <FlatButton
              icon={<ArrowRight/>}
              disabled={this.props.count < parseInt((this.props.location.query.items || 10), 10)}
              onClick={() => this.context.router.push({ pathname: '/' + this.props.pathname, query: { offset: parseInt(this.props.location.query.offset || 0, 10) + 1 } }) }
            />
          </div>
        </Paper>
      </div>
   );
  }
}

module.exports = AppTable;

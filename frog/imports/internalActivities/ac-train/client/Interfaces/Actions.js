import React from 'react';
import Mousetrap from 'mousetrap';

// UI
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Timer from '@material-ui/icons/Timer';
import Button from '@material-ui/core/Button';

import Help from './Help';
import { SwitchGuidelines } from '../Guidelines';

const styles = {
  card: {
    maxWidth: 800
  },
  buttons: {
    marginLeft: 'auto'
  },
  buy: {
    marginLeft: '20px'
  },
  ticker: {
    fontSize: '1.2rem',
    paddingLeft: '2px'
  },
  tickerButton: {
    cursor: 'default'
  }
};

class Actions extends React.Component {
  componentWillMount() {
    Mousetrap.bind('enter', this.props.submitAnswer);
  }

  componentWillUnmount() {
    Mousetrap.reset();
  }

  render() {
    const {
      ticker,
      whichInterface,
      onHelpOpen,
      onHelpClose,
      help,
      classes,
      submitAnswer
    } = this.props;
    return (
      <>
        <IconButton className={classes.tickerButton}>
          <Timer />
          <span className={classes.ticker}>:{ticker}</span>
        </IconButton>
        <div className={classes.buttons}>
          <Help onOpen={onHelpOpen} onClose={onHelpClose} open={help}>
            <SwitchGuidelines whichInterface={whichInterface} />
          </Help>
          <Button
            color="primary"
            variant="contained"
            className={classes.buy}
            onClick={submitAnswer}
          >
            Buy
          </Button>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(Actions);

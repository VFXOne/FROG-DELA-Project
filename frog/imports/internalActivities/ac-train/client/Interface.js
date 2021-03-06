// @ flow
import React from 'react';

// UI
import { isEqual, omit } from 'lodash';

import { Form, Command, DragDrop, MapInterface } from './Interfaces';
import TicketStatus from './TicketStatus';
import { getCommandForTicket, generateTicket } from '../ActivityUtils';

const RunActivity = props => {
  switch (props.whichInterface) {
    case 'command':
      return <Command {...props} />;
    case 'form':
      return <Form {...props} />;
    case 'dragdrop':
      return <DragDrop {...props} />;
    case 'map':
      return <MapInterface {...props} />;
    default:
      return <h1>Hello World</h1>;
  }
};

class Interface extends React.Component {
  constructor(props) {
    super(props);
    this.instanceCount = 0;
    this.timeOfEachIteration =
      this.props.activityData.config.timeOfEachIteration / 1000;

    this.initialState = {
      question: generateTicket(),
      isCorrect: false,
      start: Date.now(),
      secondsRemaining: this.timeOfEachIteration,
      showticketStatus: false,
      help: false
    };

    this.state = { ...this.initialState };
  }

  reset = () => {
    this.setState({
      ...this.initialState,
      start: Date.now(),
      question: generateTicket()
    });
    this.startTimer();
  };

  handleHelpOpen = () => {
    const { logger, whichInterface } = this.props;

    logger([
      {
        type: 'help',
        payload: { whichInterface }
      }
    ]);

    this.stopTimer();
    this.setState({ help: true });
  };

  handleHelpClose = () => {
    this.startTimer();
    this.setState({ help: false });
  };

  startTimer = () => {
    this.noAnswerTimeOut = setInterval(() => {
      this.checkAnswer(undefined);
    }, this.state.secondsRemaining * 1000);

    this.timerOnIteration = setInterval(this.ticker, 1000);
  };

  stopTimer = () => {
    clearTimeout(this.noAnswerTimeOut);
    clearInterval(this.timerOnIteration);
  };

  ticker = () => {
    this.setState({ secondsRemaining: this.state.secondsRemaining - 1 });
    if (this.state.secondsRemaining <= 0) {
      this.stopTimer();
    }
  };

  nextIteration = () => {
    const {
      dataFn,
      logger,
      activityData: {
        config: { iterationPerInterface }
      }
    } = this.props;

    dataFn.numIncr(1, 'iteration');

    const {
      data: { iteration }
    } = this.props;

    logger([
      {
        type: 'progress',
        value: iteration / (4 * iterationPerInterface)
      }
    ]);

    if (iteration % iterationPerInterface === 0) {
      dataFn.numIncr(1, 'step');
      dataFn.objInsert(true, 'guidelines');
    } else {
      this.reset();
    }
  };

  checkAnswer = answer => {
    const { dataFn, logger, whichInterface, data } = this.props;

    const { iteration } = data;
    const { question, start } = this.state;

    const answerWOText = omit(answer, 'text');
    const text = (answer && answer.text) || '';

    const isCorrect = isEqual(question, answerWOText);

    const timeTaken = Date.now() - start;

    const value = [data.score + (isCorrect ? 1 : 0), -(data.time + timeTaken)];

    logger([
      {
        type: 'answer',
        payload: {
          whichInterface,
          iteration,
          question,
          answer,
          isCorrect,
          timeTaken,
          text
        }
      },
      { type: 'score', value }
    ]);

    dataFn.numIncr(isCorrect ? 1 : 0, 'score');
    dataFn.numIncr(timeTaken, 'time');

    this.stopTimer();
    this.setState({ showticketStatus: true, isCorrect });
  };

  componentWillMount() {
    this.setState({ start: Date.now() });
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  render() {
    const {
      question,
      isCorrect,
      showticketStatus,
      help,
      secondsRemaining
    } = this.state;

    const {
      whichInterface,
      activityData: {
        config: { ticketStatusDisplayTime }
      }
    } = this.props;

    if (showticketStatus) {
      return (
        <TicketStatus
          nextIteration={this.nextIteration}
          isCorrect={isCorrect}
          timeToDisplay={ticketStatusDisplayTime}
        />
      );
    }

    return (
      <>
        <RunActivity
          whichInterface={whichInterface}
          ticket={getCommandForTicket(question)}
          submit={this.checkAnswer}
          help={help}
          onHelpOpen={this.handleHelpOpen}
          onHelpClose={this.handleHelpClose}
          ticker={secondsRemaining}
        />
      </>
    );
  }
}

export default Interface;

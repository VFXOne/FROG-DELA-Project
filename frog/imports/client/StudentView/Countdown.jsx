// @flow

import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { TimeSync } from 'meteor/mizzao:timesync';
import styled from 'styled-components';

import { msToString } from '/imports/frog-utils';

const Countdown = ({ session, currentTime }) => {
  const secondsLeft =
    session.countdownStartTime > 0
      ? Math.round(
          session.countdownStartTime + session.countdownLength - currentTime
        )
      : session.countdownLength;
  return (
    <div>
      {session.countdownStartTime !== -1 && (
        <CountdownDiv>
          <h4>{msToString(secondsLeft)}</h4>
        </CountdownDiv>
      )}
    </div>
  );
};

const CountdownDiv = styled.div`
  border: solid 5px #aa0000;
  background-color: #ff0000;
  border-radius: 20%;
  width: fit-content;
  min-width: 50px;
  height: 50px;
  position: fixed;
  margin: 5px;
  right: 0px;
  text-align: center;
  z-index: 999;
`;

export default withTracker(props => {
  const currentTime = TimeSync.serverTime();
  return { ...props, currentTime };
})(Countdown);

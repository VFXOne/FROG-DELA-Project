// @flow

import path from 'path';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { InjectData } from 'meteor/staringatlights:inject-data';
import * as Sentry from '@sentry/browser';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import Modal from 'react-modal';
import { Loadable } from '/imports/frog-utils';
import { ToastController } from '/imports/ui/Toast';
import { ModalController } from '/imports/ui/Modal';
import queryString from 'query-string';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import { withRouter } from 'react-router';
import CircularProgress from '@material-ui/core/CircularProgress';
import { toObject as queryToObject } from 'query-parse';
import { ErrorBoundary } from './ErrorBoundary';
import StudentView from '../StudentView';
import StudentLogin from '../StudentView/StudentLogin';
import { LocalSettings } from '/imports/api/settings';
import Wizard from '/imports/client/Wizard';
import WikiRouter from '../Wiki/WikiRouter';
import { connection } from './connection';
import LearnLandingPage from './LearnLanding';

import AccountModal from '/imports/client/AccountModal/AccountModal';
import Dialog from '@material-ui/core/Dialog';
import { getUserType } from '/imports/api/users';

const TeacherContainer = Loadable({
  loader: () => import('./TeacherContainer'),
  loading: () => null,
  serverSideRequirePath: path.resolve(__dirname, './TeacherContainer'),
  componentDescription: 'Teacher container'
});

const APICall = Loadable({
  loader: () => import('./APICall'),
  loading: () => null,
  serverSideRequirePath: path.resolve(__dirname, './APICall'),
  componentDescription: 'API Call'
});

Accounts._autoLoginEnabled = false;
try {
  Accounts._initLocalStorage();
} catch (e) {
  console.error('Initializing local storage', e);
}

const changeUser = () => {
  connection.createFetchQuery('rz', { resetUserId: Meteor.userId() });
  Sentry.configureScope(scope => {
    scope.setUser({
      email: Meteor.user()?.emails?.[0]?.address || Meteor.userId()
    });
  });
};

const subscriptionCallback = (error, response, setState, storeInSession) => {
  if (response === 'NOTVALID') {
    setState('error');
  } else {
    if (!storeInSession) {
      Accounts.makeClientLoggedIn(
        response.id,
        response.token,
        response.tokenExpires
      );
    } else {
      Meteor.connection.setUserId(response.id);
      changeUser();
    }

    Meteor.subscribe('userData', {
      onReady: () => {
        setState('ready');
        changeUser();
      }
    });
  }
};

const FROGRouter = withRouter(
  class RawRouter extends React.Component<
    Object,
    {
      mode:
        | 'ready'
        | 'loggingIn'
        | 'error'
        | 'waiting'
        | 'studentlist'
        | 'nostudentlist'
        | 'tooLate'
        | 'noSession',
      settings?: Object
    }
  > {
    wait: boolean = false;

    constructor(props) {
      super(props);

      this.state = { mode: 'waiting' };
      if (Meteor.user()) {
        Meteor.subscribe('userData', {
          onReady: () => {
            this.setState({ mode: 'ready' });
            changeUser();
          }
        });
      }
    }

    componentDidMount() {
      this.update();
      Modal.setAppElement('#render-target');
      window.notReady = this.notReady;
    }

    componentDidUpdate(prevProps) {
      if (
        this.state.mode === 'waiting' &&
        prevProps.location.search !== this.props.location.search
      ) {
        this.update();
      }
    }

    login = ({
      username,
      token,
      isStudentList,
      loginQuery
    }: {
      username?: string,
      token?: string,
      isStudentList?: boolean,
      loginQuery?: boolean
    }) => {
      this.setState({ mode: 'loggingIn' });
      Meteor.call(
        'frog.username.login',
        username,
        token,
        isStudentList,
        this.props.match.params.slug,
        (err, res) => {
          if (res) {
            changeUser();
          }
          subscriptionCallback(
            err,
            res,
            x => this.setState({ mode: x }),
            loginQuery
          );
        }
      );
    };

    tokenLogin(token, slug) {
      this.setState({ mode: 'loggingIn' });
      Accounts.loginWithToken(token, err => {
        if (err) {
          Accounts._unstoreLoginToken();
          sessionStorage.removeItem('frog.sessionToken');
          this.setState({ mode: 'waiting' });
        } else {
          Meteor.subscribe('userData', {
            onReady: () => {
              changeUser();
              this.setState({ mode: 'ready' });
            }
          });
          if (slug) {
            this.props.history.push('/' + slug + LocalSettings.UrlCoda);
          }
        }
      });
    }

    notReady = () => {
      this.setState({ mode: 'waiting' }, () => this.update());
    };

    update = () => {
      this.wait = true;
      InjectData.getData('login', data => {
        if (data && data.token) {
          this.tokenLogin(data.token, data.slug);
        } else {
          this.wait = false;
        }
      });
      if (!this.wait) {
        const query = queryToObject(this.props.location.search.slice(1));
        if (query.setAdmin) {
          Meteor.call('make.admin', query.setAdmin, (err, res) => {
            if (err) {
              alert(`Error setting admin account: ${err}`);
            } else if (res === 'Fail') {
              alert('Failed to promote user to admin');
            } else if (res === 'Success') {
              alert('User promoted to admin');
            }
            this.props.history.push('/');
          });
          return;
        }
        if (query.u) {
          this.setState({ mode: 'loggingIn' });
          const userId = query.u;
          let token = 'Anonymous';
          if (query.token) {
            token = query.token;
            LocalSettings.UrlCoda = `?u=${userId}&token=${token}`;
          } else {
            LocalSettings.UrlCoda = `?u=${userId}`;
          }
          Meteor.call('frog.userid.login', userId, token, (err, res) => {
            if (err) {
              console.error(err);
              this.setState({ mode: 'noSession' });
              return;
            }
            subscriptionCallback(
              err,
              res,
              x => this.setState({ mode: x }),
              false
            );
            this.setState({ mode: 'ready' });
          });
          return;
        }
        const username =
          query.login ||
          query.researchLogin ||
          query.debugLogin ||
          query.followLogin;
        if (query.scaled) {
          LocalSettings.scaled = parseInt(query.scaled, 10) || 50;
        }

        if (this.state.mode !== 'loggingIn') {
          if (query.researchLogin) {
            LocalSettings.researchLogin = query.researchLogin;
            LocalSettings.UrlCoda =
              '?' +
              queryString.stringify({
                scaled: LocalSettings.scaled,
                researchLogin: query.researchLogin
              });
          } else if (query.debugLogin) {
            LocalSettings.debugLogin = true;
            LocalSettings.UrlCoda =
              '?' +
              queryString.stringify({
                scaled: LocalSettings.scaled,
                debugLogin: query.debugLogin
              });
          } else if (query.followLogin && query.follow) {
            LocalSettings.follow = query.follow;
            LocalSettings.UrlCoda =
              '?' +
              queryString.stringify({
                scaled: LocalSettings.scaled,
                follow: query.follow,
                followLogin: query.followLogin
              });
          }

          if (username) {
            this.login({
              username,
              token: query.token,
              loginQuery:
                query.debugLogin || query.researchLogin || query.followLogin
            });
          }
          if (!username && this.state.mode !== 'ready') {
            if (!query.reset) {
              let storedLoginToken;
              try {
                storedLoginToken = Accounts._storedLoginToken();
              } catch (e) {
                console.error('Getting stored login token', e);
              }
              if (storedLoginToken) {
                return this.tokenLogin(storedLoginToken);
              }
            }
            if (
              !this.props.match.params.slug ||
              this.props.match.params.slug.slice(0, 4) === 'wiki' ||
              this.props.match.params.slug.slice(0, 9) === 'duplicate'
            ) {
              this.login({});
            } else if (this.props.match.params.slug) {
              this.setState({ mode: 'loggingIn' });
              Meteor.call(
                'frog.session.settings',
                this.props.match.params.slug,
                (err, result) => {
                  if (err || result === -1) {
                    this.setState({ mode: 'noSession' });
                  } else {
                    this.setState({ settings: result, mode: 'studentlist' });
                  }
                }
              );
            }
          }
        }
      }
    };

    render() {
      const learnUrl = window.location.hostname.slice(0, 6) === 'learn.';
      const user = Meteor.user();
      if (this.state.mode === 'tooLate') {
        return (
          <LearnLandingPage errorMessage="Too late to join this session" />
        );
      }
      const query = queryToObject(this.props.location.search.slice(1));
      if (query.login) {
        return <Redirect to={this.props.location.pathname} />;
      } else if (this.state.mode === 'loggingIn') {
        return <CircularProgress />;
      } else if (this.state.mode === 'ready' && user) {
        return learnUrl ? (
          <Switch>
            <Route path="/:slug" component={StudentView} />
            <Route
              path="/"
              exact
              render={() =>
                LocalSettings.follow ? <StudentView /> : <LearnLandingPage />
              }
            />
          </Switch>
        ) : (
          <Switch>
            {getUserType() === 'Legacy' ? (
              <Dialog open PaperProps={{ elevation: 1 }}>
                <AccountModal
                  formToDisplay="signup"
                  variant="legacy"
                  closeModal={() => {}}
                />
              </Dialog>
            ) : null}
            <Route path="/duplicate" component={Wizard} />
            <Route path="/wiki" component={WikiRouter} />
            <Route path="/teacher/projector/:slug" component={StudentView} />
            <Route path="/teacher/" component={TeacherContainer} />
            <Route path="/t/:slug" component={TeacherContainer} />
            <Route path="/t" component={TeacherContainer} />
            <Route path="/wizard" component={Wizard} />
            <Route path="/" exact component={TeacherContainer} />
          </Switch>
        );
      }
      if (this.state.mode === 'error') {
        return <h1>There was an error logging in</h1>;
      }
      if (this.state.mode === 'noSession' && learnUrl) {
        return <LearnLandingPage errorMessage="This session does not exist" />;
      }
      return (
        this.state.mode === 'studentlist' &&
        learnUrl && (
          <StudentLogin
            settings={this.state.settings}
            login={this.login}
            slug={this.props.match.params.slug}
          />
        )
      );
    }
  }
);

const ConnectionDiv = () => (
  <div
    style={{
      backgroundColor: 'white',
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: '0.8',
      zIndex: '1500'
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)'
      }}
    >
      <h2>Disconnected, waiting for reconnection…</h2>
      <CircularProgress />
    </div>
  </div>
);

export default class Root extends React.Component<
  {},
  {
    mode: string,
    api?: boolean,
    data?: Object,
    connected: boolean
  }
> {
  constructor() {
    super();
    this.state = { mode: 'waiting', connected: true };
  }

  componentDidMount = () => {
    window.setTimeout(
      () =>
        Tracker.autorun(() =>
          this.setState({ connected: Meteor.status().connected })
        ),
      5000
    );
    InjectData.getData('api', data => {
      this.setState({ mode: 'ready', api: !!data, data });
    });
  };

  render() {
    if (this.state.mode === 'waiting') {
      return <p>Waiting</p>;
    } else if (this.state.api && this.state.data) {
      return (
        <>
          {!this.state.connected && <ConnectionDiv />}
          <APICall data={this.state.data} />
        </>
      );
    } else {
      // We wrap ModalController to allow FROG to display modals
      // We wrap ToastController to allow FROG to display toasts
      return (
        <ErrorBoundary>
          {!this.state.connected && <ConnectionDiv />}
          <ToastController>
            <ModalController>
              <Router>
                <Switch>
                  <Route path="/:slug" component={FROGRouter} />
                  <Route component={FROGRouter} />
                </Switch>
              </Router>
            </ModalController>
          </ToastController>
        </ErrorBoundary>
      );
    }
  }
}

// @flow

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { PlayArrow, ArrowDropDown } from '@material-ui/icons';

import { Button } from '.';
import { StorybookContainer } from '/imports/ui/StorybookContainer';

storiesOf('UI/Button', module)
  .add('with text only', () => (
    <StorybookContainer padding={16}>
      <Button>Hello World!</Button>
      <Button variant="minimal">Hello World!</Button>
      <Button variant="primary">Hello World!</Button>
      <Button variant="raised">Hello World!</Button>
    </StorybookContainer>
  ))
  .add('with icon only', () => (
    <StorybookContainer padding={16}>
      <Button icon={<PlayArrow fontSize="small" />} />
      <Button icon={<PlayArrow fontSize="small" />} variant="minimal" />
      <Button icon={<PlayArrow fontSize="small" />} variant="primary" />
      <Button icon={<PlayArrow fontSize="small" />} variant="raised" />
    </StorybookContainer>
  ))
  .add('with left icon', () => (
    <StorybookContainer padding={16}>
      <Button icon={<PlayArrow fontSize="small" />}>Hello World!</Button>
      <Button icon={<PlayArrow fontSize="small" />} variant="minimal">
        Hello World!
      </Button>
      <Button icon={<PlayArrow fontSize="small" />} variant="primary">
        Hello World!
      </Button>
      <Button icon={<PlayArrow fontSize="small" />} variant="raised">
        Hello World!
      </Button>
    </StorybookContainer>
  ))
  .add('with right icon', () => (
    <StorybookContainer padding={16}>
      <Button rightIcon={<ArrowDropDown fontSize="small" />}>
        Hello World!
      </Button>
      <Button rightIcon={<ArrowDropDown fontSize="small" />} variant="minimal">
        Hello World!
      </Button>
      <Button rightIcon={<ArrowDropDown fontSize="small" />} variant="primary">
        Hello World!
      </Button>
      <Button rightIcon={<ArrowDropDown fontSize="small" />} variant="raised">
        Hello World!
      </Button>
    </StorybookContainer>
  ))
  .add('with both icons', () => (
    <StorybookContainer padding={16}>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="minimal"
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="primary"
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="raised"
      >
        Hello World!
      </Button>
    </StorybookContainer>
  ))
  .add('with both icons - large', () => (
    <StorybookContainer padding={16}>
      <Button
        size="large"
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
      >
        Hello World!
      </Button>
      <Button
        size="large"
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="minimal"
      >
        Hello World!
      </Button>
      <Button
        size="large"
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="primary"
      >
        Hello World!
      </Button>

      <Button
        size="large"
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="raised"
      >
        Hello World!
      </Button>
    </StorybookContainer>
  ))
  .add('disabled', () => (
    <StorybookContainer padding={16}>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        disabled
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="minimal"
        disabled
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="primary"
        disabled
      >
        Hello World!
      </Button>
      <Button
        icon={<PlayArrow fontSize="small" />}
        rightIcon={<ArrowDropDown fontSize="small" />}
        variant="raised"
        disabled
      >
        Hello World!
      </Button>
    </StorybookContainer>
  ));

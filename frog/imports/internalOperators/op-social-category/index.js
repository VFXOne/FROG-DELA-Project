// @flow

import { type productOperatorT } from '/imports/frog-utils';

const meta = {
  name: 'Social->Category',
  shortDesc: 'Tag student items with their social attribute as category',
  description: ''
};

const config = {
  type: 'object',
  properties: {
    socialAttribute: { type: 'socialAttribute', title: 'Grouping' }
  }
};

export default ({
  id: 'op-social-category',
  type: 'product',
  configVersion: 1,
  config,
  meta
}: productOperatorT);

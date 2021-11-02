
import React from 'react';
import PropTypes from 'prop-types';
import NodeContainer from '../node/Node';
import { Root } from '../../styles';

type Props = {
  data: any,
  classes?: any,
  render?: (data: any) => JSX.Element,
  renderContents?: (data: any) => JSX.Element,
  onClick?: (ev: any) => void,
  direction?: boolean
}

class Tree extends React.Component<Props> {
  render() {
    const { data } = this.props;

    const renderTree = (tree, multiChild) => {
      const {
        classes, render, renderContents, onClick, direction,
      } = this.props;
      const { lines } = classes;
      return (
        <Root styles={lines}>
          {tree.map((branch) => {
            const nextWithSingleChild = branch.children.length > 1;
            return (
              <NodeContainer
                item={branch}
                key={branch.id}
                onClick={onClick}
                classes={{ ...classes }}
                render={render}
                renderContents={renderContents}
                direction={direction}
                round={multiChild}
              >
                {branch.children.length > 0 && renderTree(branch.children, nextWithSingleChild)}
              </NodeContainer>
            );
          })}
        </Root>
      );
    };

    return renderTree(data, false);
  }
}

Tree['propTypes'] = {
  classes: PropTypes.objectOf(PropTypes.object),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  render: PropTypes.func,
  renderContents: PropTypes.func,
  onClick: PropTypes.func,
  direction: PropTypes.bool,
};

Tree['defaultProps'] = {
  classes: {
    lines: {
      height: '60px',
      width: '2px',
    },
    node: {},
    text: {},
    arrow: {},
  },
  render: null,
  onClick: null,
  direction: false,
};

export default Tree;

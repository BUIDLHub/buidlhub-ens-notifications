import React from "react";
import PropTypes from 'prop-types';

/** @jsx jsx */
import { jsx } from '@emotion/core'
import styled from '@emotion/styled'

export default class LoadingComponent extends React.PureComponent {

    render() {
        const DefaultSpinner = styled('div')`
        width: 40px;
        height: 40px;
        background-color: #333;
        margin: 10px;
        animation: sk-rotateplane 1.2s infinite ease-in-out;
        @keyframes sk-rotateplane {
          0% { 
            transform: perspective(120px) rotateX(0deg) rotateY(0deg);
          } 50% { 
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
          } 100% { 
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
          }
        }
        `;

        return (
            <div>
                <DefaultSpinner />
                {this.props.message}
            </div>
        );

    }
}

import React from 'react';
import { action } from '@storybook/addon-actions';
import styled from '@emotion/styled'

import BuidlhubEnsClient from '../../BuidlhubEnsClient';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import EmailComponent from './EmailComponent';

class BuidlhubEnsClientWithArtificalDelay extends BuidlhubEnsClient {
    async _fetchWithRetry(resourcePath, body) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        return BuidlhubEnsClient.prototype._fetchWithRetry.call(this, resourcePath, body);
    }
}

const publicAddress = '';
const buidlhub = new BuidlhubEnsClientWithArtificalDelay({ key: '123412341234' });


export default {
    component: EmailComponent,
    title: 'EmailComponent',
    // Our exports that end in "Data" are not stories.
    excludeStories: /.*Data$/,
};

export const taskData = {
    id: '1',
    title: 'Test EmailComponent',
    state: 'TASK_INBOX',
    updatedAt: new Date(2018, 0, 1, 9, 0),
};

export const actionsData = {
    publicAddress
};

export const Default = () => <EmailComponent task={{ ...taskData }} {...actionsData} buidlhub={buidlhub} />;

export const MissingClient = () => (
    <EmailComponent value="mike@buidlhub.com" {...actionsData} />
);

const buidlhubHasSubscription = {
    getSubscription: async (templateId, userId) => {
        const template = {
            isRegistered: true,
            url: 'https://buidlhub.com/settings'
        };
        return Promise.resolve(template);
    }
}

export const Subscription = () => (
    <EmailComponent buidlhub={buidlhubHasSubscription} value="mike@buidlhub.com" {...actionsData} />
);

const buidlhubNoSubscription = {
    getSubscription: async () => {
        const template = {
            isRegistered: false
        };
        return template;
    }
};

export const NoSubscription = () => (
    <EmailComponent buidlhub={buidlhubNoSubscription} value="mike@buidlhub.com" {...actionsData} />
);


const customLoading = (
    <iframe src="https://giphy.com/embed/feN0YJbVs0fwA"
        width="120"
        height="120"
        frameBorder="0"
        className="giphy-embed" allowFullScreen>
    </iframe>
)


const styleEnsInput = `
${({ wide }) => wide && 'width: 100%'};
background: #ffffff;
border: 1px solid #ededed;
box-shadow: inset 0 0 4px 0 rgba(181, 177, 177, 0.5);
border-radius: 8px;
height: 42px;
font-family: Overpass Mono;
font-weight: 300;
font-size: 14px;
color: #2b2b2b;
letter-spacing: 0;
padding: 10px 20px;
&:focus {
  outline: 0;
}
${p =>
        p.large &&
        `
  font-size: 14px;
`};

${p =>
        p.large &&
        mq.small`
  font-size: 18px;
`};
${p =>
        p.invalid &&
        `  
  color: #DC2E2E
`};
${p =>
        p.warning &&
        `  
  color: #F5A623
`};
`;

const styleEnsButton = `
&:visited {
  color: white;
}
&:hover {
  cursor: pointer;
  border: 2px solid #2c46a6;
  background: #2c46a6;
  box-shadow: 0 10px 21px 0 rgba(161, 175, 184, 0.89);
  border-radius: 23px;
}
`

const InputContainer = styled('div')`
  position: relative;
  margin-bottom: 20px;
  ${p => {
        if (p.invalid || p.warning) {
            return `
        &:before {
          background: url(${ p.warning ? yellowwarning : warning});
          content: '';
          height: 17px;
          width: 19px;
          position: absolute;
          right: 20px;
          top: 22px;
          transform: translateY(-50%);
        }
      `
        } else if (p.valid) {
            return `
        &:before {
          background: url(${tick});
          content: '';
          height: 14px;
          width: 20px;
          position: absolute;
          right: 20px;
          top: 22px;
          transform: translateY(-50%);
        }
      `
        }
    }};
`

const ensGlobalCss = css`
* {
    box-sizing: border-box;
  }
  body {
    font-family: Overpass;
    background: #F0F6FA;
    margin: 0;
  }

  a {
    color: #5284ff;
    text-decoration: none;
    transition: 0.2s;

    &:hover {
      color: #2C46A6;
    }

    &:visited {
      color: #5284ff
    } 
  }
`

export const CustomDemo = () => (
    <div css={ensGlobalCss}>
        <InputContainer>
            <EmailComponent
                submitStyle={styleEnsButton}
                inputStyle={styleEnsInput}
                loading={customLoading}
                buidlhub={buidlhub} />
        </InputContainer>
    </div>
);


export const CustomSubscription = () => (
    <div css={ensGlobalCss}>
        <InputContainer>
            <EmailComponent submitStyle={styleEnsButton} inputStyle={styleEnsInput} loading={customLoading} buidlhub={buidlhubHasSubscription} />
        </InputContainer>
    </div>
);


export const CustomNoSubscription = () => (
    <div css={ensGlobalCss}>
        <InputContainer>
            <EmailComponent submitStyle={styleEnsButton} inputStyle={styleEnsInput} loading={customLoading} buidlhub={buidlhubNoSubscription} />
        </InputContainer>
    </div>
);

// export const WithExistingSubscription

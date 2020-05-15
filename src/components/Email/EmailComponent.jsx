import React from "react";
import PropTypes from 'prop-types';

/** @jsx jsx */
import { jsx } from '@emotion/core'
import styled from '@emotion/styled'

import LoadingComponent from '../LoadingComponent/LoadingComponent';

export default class EmailComponent extends React.Component {

    static propTypes = {
        name: PropTypes.string,
        style: PropTypes.object,
        placeholder: PropTypes.string,
        value: PropTypes.string,
        css: PropTypes.object,
        publicAddress: PropTypes.string,
        buidlhub: PropTypes.object.isRequired
    };


    constructor(props) {
        super(props);

        if (!props.buidlhub) {
            throw new Error("buidlhub is required");
        }

        this.state = {
            loading: false,
            statusMessage: null,
            submitting: false,
            subscription: {}
        };


        this.fetchExistingSubscription = this.fetchExistingSubscription.bind(this);
        this.getClient = this.getClient.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.fetchExistingSubscription();
    }

    async getClient() {
        return Promise.resolve(this.props.buidlhub);
    }

    async onSubmit(event) {
        event.preventDefault();

        this.setState({
            loading: true,
            statusMessage: 'Registering subscription'
        });

        const buidlhub = await this.getClient();
        const { publicAddress } = this.props;
        const { emailAddress } = this.state;

        try {
            const subscription = await buidlhub.addSubscription(publicAddress, emailAddress)
            this.setSubscription(subscription);
        } catch (error) {
            this.handleError(error);
        }
    }

    async fetchExistingSubscription() {
        this.setState({
            loading: true,
            statusMessage: 'Requesting subscription status'
        });

        const buidlhub = await this.getClient();
        const { publicAddress } = this.props;

        try {
            const subscription = await buidlhub.getSubscription(publicAddress);
            this.setSubscription(subscription);
        } catch (error) {
            this.handleError(error);
        }
    }

    setSubscription(subscription) {
        this.setState({
            loading: false,
            subscription,
            statusMessage: null
        });
    }

    handleError(error) {
        this.setState({
            loading: false,
            statusMessage: error.message
        });
    }


    
    render() {
        let body = null;
        if (this.state.error) {
            body = this._renderError();
        } else if (this.state.loading) {
            body = this._renderLoading();
        } else if (this.state.subscription.isRegistered) {
            body = this._renderExistingSubscription();
        } else {
            body = this._renderForm();
        }

        return (
            <div>
                {body}
            </div>
        );
    }

    _renderError() {
        return ("Error: " + this.state.error)
    }

    _renderLoading() {
        let loadingComponent = this.props.loading;
        if (!loadingComponent) {
            loadingComponent = (<LoadingComponent message={this.state.statusMessage} />);
        }
        return loadingComponent;
    }

    _renderExistingSubscription() {
        // TODO: set management url from subscription
        return (<a href='#'>Manage Subscription</a>)
    }

    _renderForm() {
        let { name, placeholder, value } = this.props;
        const className = '';
        const label = 'Email Address';
        placeholder = 'example@buidlhub.com';

        let containerStyle = this.props.style || '';
        let labelStyle = this.props.labelStyle || 'margin-right: 8px;';
        let inputStyle = this.props.inputStyle || '';
        let submitStyle = this.props.submitStyle || '';

        let Form = styled('form')(containerStyle)
        let Label = styled('label')(labelStyle);
        let EmailInput = styled('input')(inputStyle);
        let SubmitButton = styled('input')(submitStyle);

        return (
            <Form onSubmit={this.onSubmit}>
                <Label for={name}>{label}</Label>

                <EmailInput
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    className={className} />

                <SubmitButton type='submit' />

            </Form>
        )
    }

}

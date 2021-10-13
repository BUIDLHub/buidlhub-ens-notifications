/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from "react";
import styled from '@emotion/styled'

import BuidlhubEnsClient from '../../BuidlhubEnsClient';
import LoadingComponent from '../LoadingComponent/LoadingComponent';


const DEFAULT_TRANSLATION = {
    cancel: 'Cancel',
    close: 'Ok',
    error: 'Error',
    loading: 'Registering subscription',
    placeholder: 'Enter Email address',
    registerSuccess: "Please check confirmation email to complete subscription.",
    registerFailure: "Sorry, unable to setup subscription.",
    invalidEmailAddress: "Invalid email address",
    submit: 'Submit',
};


const DEFAULT_STYLES = {
    actionsContainer: `
        display: flex;
        justify-content: flex-start;
    `,
    emailInput: `
        width: 100%; 
        margin: 1em 0;
        padding: 1px 2px 1px 10px;
    `
};


export default class EmailComponent extends React.Component {

    constructor(props) {
        super(props);

        this.buidlhub = new BuidlhubEnsClient();

        const emailAddress = props.emailAddress || '';

        const translation = props.translation || {};

        this.translation = {
            ...DEFAULT_TRANSLATION,
            ...translation
        };

        this.state = {
            loading: false,
            statusMessage: null,
            hasSubmitted: false,
            subscription: {},
            emailAddress,

            // // FIXME: show loading state
            // hasSubmitted: true,
            // loading: true,
            // error: null,
            // statusMessage: this.translation.loading

            // FIXME: show completed state
            // hasSubmitted: true,
            // statusMessage: this.translation.registerSuccess 
            // "Sorry, unable to setup subscription.";
        };

        this.components = this.buildStyledComponents(props);

        // bind 'this'
        this.getClient = this.getClient.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleEmailInputChange = this.handleEmailInputChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    buildStyledComponent(props, prefix, defaultType) {
        const passedComponent = props[`${prefix}Component`];
        let component = passedComponent || defaultType;
        
        const componentStyle = passedComponent ?
            null : 
            props[`${prefix}Style`] || DEFAULT_STYLES[prefix];
            
        if (componentStyle) {
            console.log(`styling ${prefix}...`)
            component = styled(component)(componentStyle)
        }

        return component;
    }

    // https://stackoverflow.com/questions/22573494/react-js-input-losing-focus-when-rerendering
    buildStyledComponents(props) {
        const ActionsContainer = this.buildStyledComponent(props, 'actionsContainer', 'div');
        const Cancel = this.buildStyledComponent(props, 'cancel', 'button');
        const EmailInput = this.buildStyledComponent(props, 'emailInput', 'input');
        const Form = this.buildStyledComponent(props, 'form', 'form');
        const Label = this.buildStyledComponent(props, 'label', 'label');
        const MessageContainer = this.buildStyledComponent(props, 'messageContainer', 'div');
        const Submit = this.buildStyledComponent(props, 'submit', 'submit');

        const Loading = this.props.loadingComponent || LoadingComponent;

        return {
            ActionsContainer,
            Cancel,
            EmailInput,
            Form,
            Label,
            Loading,
            MessageContainer,
            Submit,
        };
    }

    async getClient() {
        return Promise.resolve(this.buidlhub);
    }

    async handleCancel(event) {
        if (this.props.onCancel) {
            this.props.onCancel(event);
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setState({
            loading: true,
            hasSubmitted: true,
            error: null,
            statusMessage: this.translation.loading
        });

        const buidlhub = await this.getClient();
        const { publicAddress, language } = this.props;
        const { emailAddress } = this.state;

        try {
            const response = await buidlhub.addSubscription({ publicAddress, emailAddress, language })

            const isRegistered = response.status;
            const statusMessage = isRegistered ?
                this.translation.registerSuccess :
                this.translation.registerFailure;

            this.setState({
                loading: false,
                statusMessage
            });


        } catch (error) {
            this.handleError(error);
        }
    }

    validateForm() {
        // validate email address
        this.emailInputElem

        const isValid = (typeof this.emailInputElem.checkValidity === 'function') ?
            this.emailInputElem.checkValidity() :
            /\S+@\S+\.\S+/.test(this.emailInputElem.value);

        if (!isValid) {
            this.setState({
                hasSubmitted: true,
                loading: false,
                statusMessage: this.translation.invalidEmailAddress
            });
        }
        return isValid;
    }

    handleError(error) {
        this.setState({
            loading: false,
            statusMessage: this.translation.error + ": " + error.message
        });
    }

    handleEmailInputChange(event) {
        this.setState({
            emailAddress: event.target.value
        });
    }

    render() {
        const {
            Cancel,
            Form,
            Loading,
            MessageContainer,
            ActionsContainer,
            Submit,
        } = this.components;


        let body = null;
        let formActions = this.state.statusMessage === this.translation.registerSuccess ? 
            (<Submit type='button' onClick={this.handleCancel}>{this.translation.close}</Submit>) : 
            null;
        
        if (! this.state.hasSubmitted) {
            body = this._renderFormBody();
            formActions = (
                <>
                    <Cancel type='button' onClick={this.handleCancel}>{this.translation.cancel}</Cancel>
                    <Submit type='submit'>{this.translation.submit}</Submit>
                </>
            );
        }

        return (
            <Form onSubmit={this.handleFormSubmit}>
                
                {body}
                
                {this.state.statusMessage && (
                    <MessageContainer>
                    {this.state.loading && (
                        <Loading />
                    )}
                    <span className='status'>{this.state.statusMessage}</span>
                    </MessageContainer>
                )}
            
                <ActionsContainer>
                    {formActions}
                </ActionsContainer>

            </Form>
        );
    }

    _renderFormBody() {
        const address = this.props.publicAddress;
        const className = this.props.className || 'buildhub-input-email';
        const label = this.props.label || 'Email Address';
        const name = this.props.name || 'buidlhub-input-email';

        const {
            EmailInput,
            Label,
        } = this.components;

        return (
            <>
                <Label address={address} name={name}>{label}</Label>

                <EmailInput
                    id={name}
                    name={name}
                    placeholder={this.translation.placeholder}
                    type="email"
                    required={true}
                    value={this.state.emailAddress}
                    className={className}
                    onChange={this.handleEmailInputChange}
                    ref={elem => this.emailInputElem = elem}
                />
            </>
        );
    }

}

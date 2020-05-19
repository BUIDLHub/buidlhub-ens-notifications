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

        const emailAddress = props.emailAddress || '';

        this.state = {
            loading: false,
            statusMessage: null,
            submitting: false,
            subscription: {},
            emailAddress
        };

        this.components = this.buildStyledComponents(props);

        // bind 'this'
        this.fetchExistingSubscription = this.fetchExistingSubscription.bind(this);
        this.getClient = this.getClient.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleEmailInputChange = this.handleEmailInputChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    // https://stackoverflow.com/questions/22573494/react-js-input-losing-focus-when-rerendering
    buildStyledComponents(props) {
        const cancelStyle = props.cancelStyle || '';
        const containerStyle = props.style || '';
        const emailInputStyle = props.emailInputStyle || '';
        const labelStyle = props.labelStyle || 'margin-right: 8px;';
        const submitStyle = props.submitStyle || '';

        const CancelButton = this.props.cancelComponent || styled('input')(cancelStyle);
        const EmailInput = this.props.emailInputComponent || styled('input')(emailInputStyle);
        const Form = this.props.formComponent || styled('form')(containerStyle)
        const Label = this.props.labelComponent || styled('label')(labelStyle);
        const SubmitButton = this.props.submitComponent || styled('input')(submitStyle);

        const LabelContainer = this.props.labelContainer || styled('div')('');
        const InputContainer = this.props.inputContainer || styled('div')('');
        const ActionsContainer = this.props.actionsContainer || styled('div')('');
        const MessageContainer = this.props.messageContainer || styled('div')('');

        return {
            ActionsContainer,
            CancelButton,
            EmailInput,
            Form,
            InputContainer,
            Label,
            LabelContainer,
            MessageContainer,
            SubmitButton,
        };
    }

    componentDidMount() {
        this.fetchExistingSubscription();
    }

    async getClient() {
        return Promise.resolve(this.props.buidlhub);
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
            errorMessage: null,
            statusMessage: 'Registering subscription'
        });

        const buidlhub = await this.getClient();
        const { publicAddress, language } = this.props;
        const { emailAddress } = this.state;

        try {
            const response = await buidlhub.addSubscription({ publicAddress, emailAddress, language })

            const isRegistered = response.status;
            const statusMessage = isRegistered ?
                "Please check confirmation email to complete subscription." :
                "Sorry, unable to setup subscription.";

            this.setState({
                loading: false,
                subscription: {
                    isPending: true
                },
                statusMessage
            });


        } catch (error) {
            this.handleError(error);
        }
    }

    async fetchExistingSubscription() {
        this.setState({
            loading: true,
            errorMessage: null,
            statusMessage: 'Requesting subscription status'
        });

        const buidlhub = await this.getClient();
        const { publicAddress, language } = this.props;

        try {
            const subscription = await buidlhub.getSubscription({ publicAddress });
            this.setState({
                loading: false,
                subscription,
                statusMessage: null
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
            /\S+@\S+\.\S+/.test(emailInputElem.value);

        if (!isValid) {
            this.setState({
                loading: false,
                errorMessage: "Invalid email address"
            });
        }
        return isValid;
    }

    handleError(error) {
        this.setState({
            loading: false,
            errorMessage: error.message,
            statusMessage: null
        });
    }

    handleEmailInputChange(event) {
        this.setState({
            emailAddress: event.target.value
        });
    }



    render() {
        const {
            ActionsContainer,
            CancelButton,
            EmailInput,
            Form,
            InputContainer,
            Label,
            LabelContainer,
            MessageContainer,
            SubmitButton,    
        } = this.components;

        
        let body = null;
        let footer = (<i>Service provided by <a href='https://buidlhub.com'>BUIDLHub</a>.</i>);
        if (this.state.error) {
            body = this._renderError();
        } else if (this.state.loading) {
            body = this._renderLoading();
        } else if (this.state.subscription.isRegistered) {
            body = this._renderExistingSubscription();
            footer = (<CancelButton type='button' onClick={this.handleCancel} value="Close" />);
        } else if (this.state.subscription.isPending) {
            body = '';
            footer = (<CancelButton type='button' onClick={this.handleCancel} value="Close" />);
        } else {
            body = this._renderForm();
        }

        return (
            <div>
                {body}

                <MessageContainer>
                    {this.state.statusMessage && (
                        <span className='status'>{this.state.statusMessage}</span>
                    )}
                    {this.state.errorMessage && (
                        <span className='error'>{this.state.errorMessage}</span>
                    )}
                </MessageContainer>

                {footer}

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
        return (<a href='https://buidlhub.com'>Manage Subscription</a>)
    }

    _renderForm() {
        let { name, placeholder } = this.props;
        const className = '';
        const label = 'Email Address';
        placeholder = 'example@buidlhub.com';

        const {
            ActionsContainer,
            CancelButton,
            EmailInput,
            Form,
            InputContainer,
            Label,
            LabelContainer,
            MessageContainer,
            SubmitButton,    
        } = this.components;


        return (
            <Form onSubmit={this.handleFormSubmit}>
                <LabelContainer>
                    <Label htmlFor={name}>{label}</Label>
                </LabelContainer>

                <EmailInput
                    name={name}
                    placeholder={placeholder}
                    type="email"
                    required={true}
                    value={this.state.emailAddress}
                    className={className}
                    onChange={this.handleEmailInputChange}
                    ref={elem => this.emailInputElem = elem}
                />

                <ActionsContainer>
                    <CancelButton type='button' onClick={this.handleCancel} value="Cancel" />
                    <SubmitButton type='submit' />
                </ActionsContainer>

            </Form>
        )
    }

}

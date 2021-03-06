import React, { Component } from 'react';
import * as API from './../../api/API';
import { Route, withRouter, Switch } from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {generateSurveyForm, createSurveyResponse} from './../../actions/surveyresponse';
import {login_success} from './../../actions/login'
import uuidv4 from "uuid";
import QuestionComponent from './questioncomponent';
import Header from './../header';
import '../../stylesheets/surveyresponse/surveyresponse.css';

import {alert_types} from '../../config/alert_types';
import AlertContainer from 'react-alert';
import {alertOptions, showAlert} from "../../config/alertConfig";

class SurveyResponse extends Component {

    constructor(){
        super();
        this.state={
            readOnly : false,
            loggedIn : false,
            sendcopy : false,
            email : "",
            emailcolor : "red",
            showEmail : false
        }
    }

    validateSession = (()=>{
        API.validateSession().then((response)=>{
            if(response.status===200){
                response.json().then((data)=>{
                    console.log("[SurveyResponse] ValidateSession: ", data);
                    this.setState({
                        ...this.state,
                        loggedIn : true,
                        email : data.email
                    });
                    this.props.login_success(data);
                });
            }
            else if(response.status===404){
                console.log("[SurveyResponse] ValidateSession user not logged in");
                this.setState({
                    ...this.state,
                    loggedIn : false
                });
            }
            else if(response.status===401){
                console.log("[SurveyResponse] ValidateSession user not logged in");
                this.setState({
                    ...this.state,
                    loggedIn : false
                });
            }
            else {
                showAlert("Error while checking session existance", alert_types.ERROR, this);
                // alert("[SurveyResponse] Error while checking session existance");
            }
        });
    });

    componentDidMount(){
        console.log("SurveyResponse params: ", this.props.match.params);
        console.log("SurveyResponse params: ", this.props.match);
        if(this.props.match.params.hasOwnProperty("survey_id")){
            API.validateSession().then((response1)=>{
                if(response1.status===200){
                    response1.json().then((data)=>{
                        console.log("[SurveyResponse] ValidateSession: ", data);
                        this.setState({
                            ...this.state,
                            loggedIn : true,
                            email : data.email
                        });
                        this.props.login_success(data);
                    });
                    console.log(this.props.match.params);
                    console.log("[surveyresponse] param hasProperty survey_id :", this.props.match.params.hasOwnProperty("survey_id"));
                    API.getGeneralSurveyById(this.props.match.params.survey_id).then((response)=>{
                        console.log(response.status);
                        if(response.status===200){
                            response.json().then((data)=>{
                                console.log("[SurveyResponse]", data);
                                if(data.survey.ispublished){
                                    if(this.redirectOnExpiredSurvey(data.survey.end_date)){
                                        this.props.handlePageChange("/");
                                    }
                                    this.props.generateSurveyForm(data.survey);
                                    this.props.createSurveyResponse(data);
                                    this.setReadOnly(data);
                                    this.setState({
                                        ...this.state,
                                        email : data.email,
                                        showEmail : true
                                    })
                                }
                                else{
                                    showAlert("Survey is not published", alert_types.ERROR, this);
                                    // alert("Survey is not published");
                                    this.props.handlePageChange("/")
                                }
                            });
                        }
                        else if(response.status === 206){
                            response.json().then((data)=>{
                                console.log("[SurveyResponse]", data);
                                if(data.ispublished){
                                    if(this.redirectOnExpiredSurvey(data.end_date)){
                                        this.props.handlePageChange("/");
                                    }
                                    this.props.generateSurveyForm(data);
                                    this.createSurveyResponse();
                                }
                                else{
                                    showAlert("Survey is not published", alert_types.ERROR, this);
                                    // alert("Survey is not published");
                                    this.props.handlePageChange("/")
                                }
                            });
                        }
                        else if(response.status===412){
                            showAlert("User not authorized to access this survey!!", alert_types.ERROR, this);
                        }
                        else if(response.status===404){
                            showAlert("Survey not found", alert_types.ERROR, this);
                            // alert("Error 404 in getSurveyById");
                        }
                        else {
                            showAlert("Error while fetching survey data", alert_types.ERROR, this);
                            // alert("Error 400 in getSurveyById");
                        }
                    });
                }
                else {
                    API.getSurveyById(this.props.match.params.survey_id).then((response)=>{
                        console.log(response.status);
                        if(response.status===200){
                            response.json().then((data)=>{
                                console.log("[SurveyResponse]", data);
                                if(data.ispublished){
                                    if(this.redirectOnExpiredSurvey(data.end_date)){
                                        this.props.handlePageChange("/");
                                    }
                                    this.props.generateSurveyForm(data);
                                    this.createSurveyResponse();
                                }
                                else{
                                    showAlert("Survey is not published", alert_types.ERROR, this);
                                    // alert("Survey is not published");
                                    this.props.handlePageChange("/")
                                }
                            });
                        }
                        else if(response.status===404){
                            showAlert("Survey not found", alert_types.ERROR, this);
                            // alert("Error 404 in getSurveyById");
                        }
                        else {
                            showAlert("Error while fetching survey data", alert_types.ERROR, this);
                            // alert("Error 400 in getSurveyById");
                        }
                    });
                }
            });

        }
        else if(this.props.match.params.hasOwnProperty("response_id")){
            API.validateSession().then((response)=>{
                if(response.status===200){
                    response.json().then((data)=>{
                        this.props.login_success(data);
                        this.setState({
                            ...this.state,
                            email : data.email,
                            loggedIn : true
                        })
                    });
                    API.getSurveyAndResponseByResponseId(this.props.match.params.response_id).then((response)=>{
                        if(response.status===200){
                            response.json().then((data)=>{
                                console.log("getSurveyAndResponseByResponseId: ", data);
                                if(data.survey.ispublished){
                                    this.props.generateSurveyForm(data.survey);
                                    this.props.createSurveyResponse(data);
                                    this.setReadOnly(data);
                                }
                                else{
                                    showAlert("Survey is not published", alert_types.ERROR, this);
                                    this.props.handlePageChange("/")
                                }
                            });
                        }
                        else if(response.status===404){
                            showAlert("Response doesn't exist", alert_types.ERROR, this);
                        }
                        else if(response.status===400){
                            showAlert("Error while fetching response data", alert_types.ERROR, this);
                        }
                    });
                }
                else {
                    this.props.handlePageChange("/login");
                }
            });
        }
        //Closed Survey
        else if(this.props.match.params.hasOwnProperty("cresponse_id")){
            this.validateSession();
            API.getSurveyAndResponseByResponseId(this.props.match.params.cresponse_id).then((response)=>{
                console.log(response.status);
                if(response.status===200){
                    response.json().then((data)=>{
                        console.log("getSurveyAndResponseByResponseId: ", data);
                        if(data.survey.ispublished){
                            this.props.generateSurveyForm(data.survey);
                            this.props.createSurveyResponse(data);
                            this.setReadOnly(data);
                            this.setState({
                                ...this.state,
                                email : data.email,
                                showEmail : true
                            })
                        }
                        else{
                            showAlert("Survey is not published", alert_types.ERROR, this);
                            // alert("Survey is not published");
                            this.props.handlePageChange("/")
                        }
                    });
                }
                else if(response.status===403){
                    showAlert("User not authorized to access this survey", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/login");
                    }),1000);
                }
                else if(response.status===401){
                    // alert("User is not Logged In");
                    showAlert("User is not Logged In", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/login");
                    }),1000);
                }
                else if(response.status===402){
                    // alert("User not registered. Please sign up and provide your response");
                    showAlert("User not registered. Please sign up and provide your response", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/signup");
                    }),1000);
                }
                else if(response.status===404){
                    // alert("Survey Not Available");
                    showAlert("Survey Response does not exist", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/signup");
                    }),1000);

                }
                else if(response.status===400){
                    // alert("Error while fetching response data");
                    showAlert("Error while fetching response data", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/");
                    }),1000);

                }
            });
        }
//Open Survey
        else if(this.props.match.params.hasOwnProperty("oresponse_id")){
            this.validateSession();
            API.getSurveyAndResponseByResponseId(this.props.match.params.oresponse_id).then((response)=>{
                console.log(response.status);
                if(response.status===200){
                    response.json().then((data)=>{
                        console.log("getSurveyAndResponseByResponseId: ", data);
                        if(data.survey.ispublished){
                            this.redirectOnExpiredSurvey();
                            this.props.generateSurveyForm(data.survey);
                            this.props.createSurveyResponse(data);
                            this.setReadOnly(data);
                        }
                        else{
                            showAlert("Survey is not published", alert_types.ERROR, this);
                            // alert("Survey is not published");
                            this.props.handlePageChange("/")
                        }
                    });
                }
                else if(response.status===404){
                    showAlert("Response doesn't exist", alert_types.ERROR, this);
                    // alert("Error 404 in getSurveyAndResponseByResponseId");
                }
                else if(response.status===403){
                    showAlert("User not authorized to access this survey", alert_types.ERROR, this);
                    setTimeout((()=>{
                        this.props.handlePageChange("/login");
                    }),1000);
                }
                else {
                    showAlert("Error while fetching response data", alert_types.ERROR, this);
                    // alert("Error 400 in getSurveyAndResponseByResponseId");
                }
            });
        }
    }

    survey_response = {
        response_id: "",
        survey:{
            survey_id:""
        },
        email : "",
        responses:[]
    };

    createSurveyResponse = (()=>{
        this.survey_response.response_id = uuidv4();
        this.survey_response.email = this.props.user.email;
        this.survey_response.survey.survey_id = this.props.match.params.survey_id;
        this.survey_response.responses = [];
        console.log("Created Survey Response: " , this.survey_response);
        this.props.createSurveyResponse(this.survey_response);
    });

    generateSurveyForm = (()=> {
        console.log("SurveyResponse generateSurveyForm: ", this.props.survey);
        return(
            this.props.survey.questions.map((question, index) => {
                return (
                    <QuestionComponent
                        question_type={question.question_type}
                        index_id={index}
                        readOnly = {this.state.readOnly}
                        isLoggedIn = {this.state.isLoggedIn}
                    />
                )
            })
        )
    });

    setReadOnly = ((data)=>{
        console.log("[SurveyResponse] setVisibility: ", data);
        console.log("[SurveyResponse] setReadOnly :" , data.survey.end_date);
        if(data.issubmitted){
            this.setState({
                ...this.state,
                readOnly : true
            })
        }
        else if(data.survey.end_date!==null && data.survey.end_date!==undefined){
            if(this.redirectOnExpiredSurvey(data.survey.end_date)){
                this.setState({
                    ...this.state,
                    readOnly : true
                })
            }
        }
    });

    redirectOnExpiredSurvey = ((end_date)=>{
        console.log("[SurveyResponse] enddate", end_date);
        if(end_date!==null && end_date!==undefined){
            let current_date_time = new Date();
            let end_date_time = new Date(end_date);
            console.log("[SurveyResponse] end_date_time :" , end_date_time);
            console.log("[SurveyResponse] current_date_time :" , current_date_time);
            console.log("[SurveyResponse] redirectOnExpiredSurvey :" , current_date_time > end_date_time);
            return current_date_time > end_date_time;
        }
    });

    sendSubmitRequest = ((payload)=>{
        API.submitSurveyResponse(payload).then((response) => {
            if (response.status === 200) {
                response.json().then((data)=>{
                    console.log("[SurveyResponse submitSurveyResponse: Succesful]", data);
                    showAlert("Survey Submission Successful", alert_types.SUCCESS, this);
                    // alert("Survey Submission Successful");
                });
                this.setState({
                    ...this.state,
                    readOnly : true
                })
            }
            else if (response.status === 404) {
                showAlert("Survey Response not provided by User. Hence cannot submit survey", alert_types.INFO, this);
                // alert("Survey Response not provided by User. Hence cannot submit survey");
            }
            else {
                showAlert("Error " +response.status + "submitting Survey Response", alert_types.ERROR, this);
                // alert("Error "+response.status+"submitting Survey Response");
            }
        });
    });

    onSubmitHandle = (()=>{
        let payload = {
            response_id:this.props.survey_response.response_id,
            email: this.state.email,
            sendcopy: this.state.sendcopy
        };
        // console.log()
        if(this.state.sendcopy){
            if(this.state.email===undefined || this.state.email===null || this.state.email===""){
                showAlert("Please provide valid email id", alert_types.INFO, this);
                // alert("Please provide valid email id");
            }
            else {
                let regex_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                console.log("[SurveyResponse] email veriication result: " + regex_email.test(this.state.email.toLowerCase()));

                if(!regex_email.test(this.state.email.toLowerCase())){
                    document.getElementById('emailError').innerHTML='Email is invalid';
                    document.getElementById('emailError').onfocus = true;
                }
                else {
                    this.sendSubmitRequest(payload);
                }
            }
        }
        else {
            this.sendSubmitRequest(payload);
        }
    });

    showSubmitForm= (()=>{
        // if((!this.state.readOnly && this.props.survey_response.responses>0)
        if((!this.state.readOnly)
        ){
            let regex_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return (
                <div align="center">
                    <div>
                        Email:
                        <input type="text" value={this.state.email}
                               disabled={(this.state.loggedIn || this.state.showEmail)}
                               style={{color:this.state.emailColor}}
                               onChange={(event)=>{
                                   this.setState({
                                       ...this.state,
                                       email : event.target.value,
                                       emailColor : regex_email.test(this.state.email) ? 'black' : 'Red'
                                   })
                               }}
                        />
                        <span id="emailError" style={{color:this.state.emailColor}}></span>
                    </div>
                    <div>
                        <input type="checkbox" className="option-"
                               defaultChecked={false}
                               onChange={(event)=>{
                                   console.log("QuestionComponent: ", event.target.checked);
                                   this.setState({
                                       ...this.state,
                                       sendcopy : event.target.checked
                                   })
                               }}
                        /> I want to receive confirmation email
                    </div>
                    <button type="button" className="survey-response-submit-button"
                            onClick={()=> {
                                this.onSubmitHandle()
                            }}
                    >
                        Submit
                    </button>
                </div>
            )
        }
    });

    render() {
        return (
            <div className="">
                <Header
                    loggedIn = {this.state.loggedIn}
                    handlePageChange = {this.props.handlePageChange}
                />
                <div className="survey-response-main-div">
                    {/*Survey ID: {this.props.survey.survey_id}<br/>*/}
                    <label style={{fontSize:32}}>Survey Name: {this.props.survey.survey_name}</label>
                    {this.generateSurveyForm()}
                    <br/>
                    <br/>

                    <div>
                        {this.showSubmitForm()}
                    </div>
                </div>
                <AlertContainer ref={a => this.msg = a} {...alertOptions}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("SurveyResponse state: ", state);
    return{
        survey: state.survey_surveyresponse.survey,
        survey_response : state.survey_surveyresponse.survey_response,
        user : state.user.user
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            createSurveyResponse: createSurveyResponse,
            generateSurveyForm : generateSurveyForm,
            login_success: login_success
        }, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SurveyResponse));

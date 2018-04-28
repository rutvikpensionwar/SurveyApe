package com.example.surveyape.service;

import com.example.surveyape.entity.OptionAns;
import com.example.surveyape.entity.Question;
import com.example.surveyape.entity.Survey;
import com.example.surveyape.entity.User;
import com.example.surveyape.repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SurveyService {

    @Autowired
    SurveyRepository surveyRepository;

    @Autowired
    UserService userService;

    public Survey createSurvey(Map map, User user){
        Survey survey = null;
        try{
            survey = new Survey();
            survey.setSurveyName(map.get("survey_name").toString());
            survey.setSurveyType(map.get("survey_type").toString());
            survey.setCreationDate(new Date());
            survey.setUser(user);
//            survey.setPublishDate(new SimpleDateFormat("yyyy-MM-dd-HH").parse(map.get("publish_date").toString()));
            survey = surveyRepository.save(survey);
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return survey;
    }

    public Survey updateSurvey(Map map){
        Survey survey = null;
        try{
            survey = surveyRepository.findBySurveyId(map.get("survey_id").toString());
            if(survey!=null){
                survey.setSurveyName(map.get("survey_name").toString());
                survey.setSurveyType(map.get("survey_type").toString());
                survey.setCreationDate(new Date());
                survey.setPublishDate(new SimpleDateFormat("yyyy-MM-dd-HH").parse(map.get("publish_date").toString()));
                List<Map> questionMapList = (List)map.get("questions");
                survey.setQuestions(generateQuestionList(questionMapList));
            }
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return survey;
    }

    private List<Question> generateQuestionList(List<Map> questionMapList) {
        Question question = null;
        List<Question> questionList = new LinkedList<>();
        for(Map map : questionMapList){
            question = new Question();
            question.setQuestionId(map.get("question_id").toString());
            question.setQuestionText(map.get("question_text").toString());
            question.setQuestionType(map.get("question_type").toString());
            if(question.getQuestionType().equals("checkbox") || question.getQuestionType().equals("radio") || question.getQuestionType().equals("dropdown")){
                question.setMultipleChoice(true);
                List<Map> answerMapList = (List)map.get("options");
                question.setOptions(generateAnswersOptions(answerMapList));
            }
            questionList.add(question);
        }
        return questionList;
    }

    private List<OptionAns> generateAnswersOptions(List<Map> answerMapList) {
        OptionAns answerOptions = null;
        List<OptionAns> answerOptionsList = new LinkedList<>();
        for(Map map : answerMapList){
            answerOptions = new OptionAns();
            answerOptions.setOptionType(map.get("option_type").toString());
            answerOptions.setOptionText(map.get("option_text").toString());
            answerOptions.setOptionId(map.get("answer_id").toString());
            answerOptionsList.add(answerOptions);
        }
        return answerOptionsList;
    }
}
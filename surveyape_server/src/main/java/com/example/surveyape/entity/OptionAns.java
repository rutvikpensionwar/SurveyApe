package com.example.surveyape.entity;

import com.example.surveyape.view.SurveyView;
import com.fasterxml.jackson.annotation.JsonView;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
public class OptionAns {

    @Id
//    @GeneratedValue(generator = "uuid")
//    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @JsonView({SurveyView.summary.class})
    private String optionId;

    @ManyToOne(targetEntity = Question.class, cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "questionId", nullable = false)
    private Question question;

    @JsonView({SurveyView.summary.class})
    private String optionText;

    //TODO: text/image
    @JsonView({SurveyView.summary.class})
    private String optionType;

    public String getOptionId() {
        return optionId;
    }

    public void setOptionId(String optionId) {
        this.optionId = optionId;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public String getOptionType() {
        return optionType;
    }

    public void setOptionType(String optionType) {
        this.optionType = optionType;
    }
}
package com.example.surveyape.controller;

import com.example.surveyape.entity.*;
import com.example.surveyape.service.*;
import com.example.surveyape.utils.*;
import java.util.*;
import com.example.surveyape.view.*;
import com.fasterxml.jackson.annotation.JsonView;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "*", allowCredentials = "true")
@RequestMapping(path = "/user")
public class UserController {

	@Autowired
	UserService userService;

	@Autowired
	MailService mailService;

	@Autowired
	SurveyResponseServices surveyResService;

	@JsonView({ UserView.summary.class })
	@RequestMapping(value = "/signup", method = RequestMethod.POST)
	public ResponseEntity signup(@RequestBody String body) {
		ResponseEntity responseEntity = new ResponseEntity(null, HttpStatus.BAD_REQUEST);
		try {
			System.out.println("body:" + body);
			JSONObject jsonObject = new JSONObject(body);
			User user = new User(jsonObject.getString("email"), jsonObject.getString("firstname"),
					jsonObject.getString("lastname"), jsonObject.getString("password"));
			user = userService.registerUser(user);
			if (user != null) {
				String msgBody = MailUtility.createVerificationMsg(user.getVerificationcode());
				mailService.sendEmail(user.getEmail(), msgBody, " Verify Account");
				responseEntity = new ResponseEntity(user, HttpStatus.OK);
			} else {
				responseEntity = new ResponseEntity(user, HttpStatus.FOUND);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return responseEntity;
	}

	@JsonView({ UserView.summary.class })
	@RequestMapping(value = "/login", method = RequestMethod.POST)
	public ResponseEntity login(@RequestBody Map<String, String> map, HttpSession httpSession) {
		ResponseEntity responseEntity = new ResponseEntity(null, HttpStatus.BAD_REQUEST);
		try {
			User user = userService.findByEmail(map.get("email"));
			if (user != null) {
				if (user.getVerified()) {
					if (user.getPassword().equals(map.get("password"))) {
						httpSession.setAttribute("email", map.get("email"));
						responseEntity = new ResponseEntity(user, HttpStatus.OK);
					}
					else{
						responseEntity = new ResponseEntity(user, HttpStatus.UNAUTHORIZED);
					}
				} else {
					responseEntity = new ResponseEntity(null, HttpStatus.NON_AUTHORITATIVE_INFORMATION);
				}
			} else {
				responseEntity = new ResponseEntity(null, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return responseEntity;
	}

	@RequestMapping(value = "/logout", method = RequestMethod.POST)
	public ResponseEntity logout(HttpSession httpSession) {
		ResponseEntity responseEntity = new ResponseEntity(null, HttpStatus.BAD_REQUEST);
		try {
			httpSession.removeAttribute("email");
			responseEntity = new ResponseEntity(null, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return responseEntity;
	}

	@JsonView({ UserView.summary.class })
	@RequestMapping(value = "/validateSession", method = RequestMethod.POST)
	public ResponseEntity validateSession(HttpSession session) {
		ResponseEntity responseEntity = new ResponseEntity(null, HttpStatus.NOT_FOUND);
		try {
			System.out.println(session.getAttribute("email"));
			if (session.getAttribute("email") != null) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("email", session.getAttribute("email"));
				User user = userService.findByEmail(session.getAttribute("email").toString());
				System.out.println(jsonObject);
				responseEntity = new ResponseEntity(user, HttpStatus.OK);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return responseEntity;
	}

	@RequestMapping(value = "/verifyaccount", method = RequestMethod.GET)
	public ResponseEntity<?> verifyUserAccount(@RequestParam Map<String, String> passengerQueryMap) {
		HttpStatus status = HttpStatus.BAD_REQUEST;
		Map<String, String> responseMap = new HashMap<>();
		responseMap.put("message", "Not a valid code !!!");
		try {
			Integer verificationCode = Integer.parseInt(passengerQueryMap.get("verificationcode"));
			System.out.println("verification Code: " + verificationCode);
			Integer verificationStatus = userService.verifyUserAccount(verificationCode);
			if (verificationStatus == UserUtility.SUCCESSFULLY_VERIFIED) {
				responseMap.put("message", "User successfully verified.");
				status = HttpStatus.OK;
			} else if (verificationStatus == UserUtility.ALREADY_VERIFIED) {
				responseMap.put("message", "Link expired as user already verified");
			} else if (verificationStatus == UserUtility.USER_NOT_FOUND) {
				responseMap.put("message", "Not a valid code !!!");
			}
		} catch (Exception exp) {
			System.out.println("[UserController] Exception:" + exp.getMessage());
			responseMap.put("message", exp.getMessage());
		}
		return new ResponseEntity(responseMap, null, status);
	}
	@JsonView(SurveyListView.summary.class)
	@RequestMapping(value = "/surveylist", method = RequestMethod.GET)
	public ResponseEntity<?> getUserSurveyList(HttpSession session) {
		HttpStatus status = HttpStatus.BAD_REQUEST;
		Map responseMap = new HashMap<>();
		try {
			List<Survey> createdSurveys = userService.getAllUserSurvey(session.getAttribute("email").toString());
			System.out.println("created" + createdSurveys);
			List<SurveyResponse> responseSurveyList = surveyResService.getsurveyResponseByEmail(session.getAttribute("email").toString());
			responseMap.put("created_surveys", createdSurveys);
			responseMap.put("requested_surveys", responseSurveyList);
			status = HttpStatus.OK;

		} catch (Exception exp) {
			System.out.println("[UserController] getUserServeyList() exception : " + exp.getMessage());
		}
		return new ResponseEntity<>(responseMap, null, status);
	}
}

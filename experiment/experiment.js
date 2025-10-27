const jsPsych = initJsPsych({
    show_progress_bar: true,
    override_safe_mode: true, // for local testing only
    max_load_time: 120000, //120 seconds
    on_finish: function() {
        jsPsych.data.displayData('csv');
  }
});

let timeline = []; //Empty timeline

//PRELOAD AUDIO//
var preload_trial = {
    type: jsPsychPreload,
    audio: [
    'audio/330_705_B4.wav',
    'audio/493_705_B4.wav',
    'audio/516_705_B4.wav', 
    'audio/573_705_B4.wav', 
    'audio/672_705_B4.wav', 
    'audio/752_705_B4.wav',
    'audio/799_705_B4.wav', 
    'audio/955_705_B4.wav',
    'audio/gift.wav'
    ],
    auto_preload: true
};

//IRB - SKIP FOR PILOT
const irb = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="font-size: 16px; text-align: center; margin-top: 25px; margin-right: 100px; margin-left: 100px; margin-bottom: 25px;">
            <img src="./image/SUSig_2color_Stree_Left.png" alt="Stanford Logo" style="max-width: 500px; margin-bottom: 20px;">
            <h3>DESCRIPTION</h3>
            <p>You are invited to participate in a research study. Its general purpose is to understand how people perceive spoken language. We are interested in how people make use of varying properties of language to infer social information about a speaker. In this study, you will hear spoken sentences, and you will be asked to describe the speaker of each sentence in your own words. Following this, you will be asked to complete an optional demographic survey. Participation in this research is voluntary, and you are free to withdraw your consent at any time.</p>
            <h3>TIME INVOLVEMENT</h3> 
            <p>Your participation will take approximately 10 to 15 minutes.</p>
            <h3>PAYMENT</h3> 
            <p>You will be paid at the posted rate.</p>
            <h3>PRIVACY AND CONFIDENTIALITY</h3> 
            <p>The risks associated with this study are minimal. This judgment is based on a large body of experience with the same or similar procedures with people of similar ages, sex, origins, etc. Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confidentiality breach. Your individual privacy will be maintained during the research and in all published and written data resulting from the study.</p>
            <h3>CONTACT INFORMATION</h3>
            <p>If you have any questions, concerns or complaints about this research study, its procedures, risks and benefits, you should contact the Protocol Director Grace Brown at (616) 498-8188. If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650) 723-2480 or toll free at 1-866-680-2906. You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306 USA.</p> 
            <h3>WAIVER OF DOCUMENTATION</h3>
            <p>If you agree to participate in this research, please click the 'Continue' button.</p>
        </div>
    `,
    choices: ['Continue'],
    margin_vertical: '10px',
};

//timeline.push(irb);

//audio warning
const audio_warn = {
    type: jsPsychHtmlButtonResponse,
    choices: ['Start'],
    stimulus: `
    <div style="font-size: 16px; text-align: center; margin-top: 25px; margin-right: 100px; margin-left: 100px; margin-bottom: 25px;">
        <p>This study requires you to listen to audio clips. To ensure you can adequately hear the audio presented in this study, the next page will have an audio attention check. Please wear headphones, and be prepared to adjust the volume on your device if necessary.<br><br>When you are ready to begin the audio attention check, click 'Start'.</p>
    </div>
`,
    response_ends_trial: true,
    trial_duration: 10000
};
    
//push to the timeline
timeline.push(audio_warn);
    
//audio check
const audio_check = {
    type: jsPsychAudioButtonResponse,
    stimulus: 'audio/gift.wav',
    choices: ['dog', 'friend', 'gift', 'smile', 'blue'],
    prompt: '<p><br>This is an attention check. <br><br> Click on the word that is being repeated by the speaker.</p>',
    response_ends_trial: true,
    trial_duration: 20000,
    on_finish: function(data) {
        data.correct = (data.response == 2); // mark correct or incorrect
    }    
};

// feedback trial
const feedback = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    const last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
    if (last_trial_correct) {
      return "<p>Correct! You are ready to begin the study.</p>";
    } else {
      return "<p>Incorrect. Please make sure your audio is working and try again.</p>";
    }
  },
  choices: function() {
    const last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
    if (last_trial_correct) {
      return ['Begin Study'];
    } else {
      return ['Try Again'];
    }
  }
};

// loop node: repeats until participant passes
const audio_check_loop = {
  timeline: [audio_check, feedback],
  loop_function: function() {
    const last_trial_correct = jsPsych.data.get().last(2).values()[0].correct;
    if (last_trial_correct) {
      return false; // stop looping when correct
    } else {
      return true; // repeat until correct
    }
  }
};

// add to main timeline
timeline.push(audio_check_loop);

//INSTRUCTIONS
const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>In this study, you are going to hear multiple people produce the same sentence. In a given trial, you will hear a speaker, and on a separate page, you will be prompted to provide a short description of that speaker in an empty textbox. You do not have to provide your response in complete sentences. You may list words or phrases, separated by commas, if you prefer to do so. You may take as long as you need to respond, but you will only be able to listen to each person once. After you provide a description of the speaker, you may click ‘Continue’ to advance to the next trial. You will not be able to return a trial after completing it.<br><br>If you understand the instructions and are ready to hear the first speaker, click ‘Continue’.</p>",
    choices: ['Continue']
};

timeline.push(instructions);

//LISTENING TRIALS
let tv_array = create_tv_array(trial_objects);

const trials = {
  timeline: [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: jsPsych.timelineVariable('stimulus'),
      response_allowed_while_playing: false,
      trial_ends_after_audio: true,
      choices: "NO_KEYS",
      data: {
        id: jsPsych.timelineVariable('id')
      }
    },
    {
      type: jsPsychSurveyText,
      questions: [
        {
          prompt: 'List the first 5-10 words that come to mind to describe the speaker you just heard.',
          name: 'Response',
          rows: 5,
          required: true
        }
      ]
    }
  ],
  timeline_variables: tv_array,
  randomize_order: true
};

timeline.push(trials);

//SURVEY INSTRUCTIONS
const transition = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>You have completed the listening trials. You will now be directed to an optional demographic survey. Please answer the survey questions if you feel comfortable doing so. After seeing the survey, you will be able to end the study.</p>",
    choices: ['Continue']
};

timeline.push(transition);

//SURVEY
const questionnaire = {
  type: jsPsychSurvey,
  theme: "modern",
  survey_json: {
    showQuestionNumbers: "off",
    widthMode: "responsive",
    completeText: "Finish",
    elements: [
      {
        type: "html",
        html: "<p>Please respond to the following questions if you are comfortable doing so. If you'd like to skip to the end of the experiment, click 'Finish' at the bottom of the page.</p>"
      },
      {
        type: "boolean",
        name: "understood",
        title: "Did you read and understand the instructions?",
        labelTrue: "Yes",
        labelFalse: "No",
        renderAs: "radio"
      },
      {
        type: "text",
        name: "age",
        title: "Age:",
        inputType: "number"
      },
      {
        type: "radiogroup",
        name: "gender",
        title: "What is your gender identity?",
        choices: ["Male", "Female", "Non-binary", "Prefer not to answer"],
        showOtherItem: true,
        otherText: "Other (describe)"
      },
      {
        type: "comment",
        name: "ethnicity",
        title: "What is your race and/or ethnicity?"
      },
      {
        type: "comment",
        name: "language",
        title: "What language(s) did you speak at home when you were growing up?"
      },
      {
        type: "radiogroup",
        name: "education",
        title: 'Highest level of education obtained:',
        choices: [
          "Some high school",
          "Graduated high school",
          "Some college",
          "Graduated college",
          "Hold a higher degree"
        ],
        showOtherItem: true,
        otherText: "Other (describe)"
      },
      {
        type: "radiogroup",
        name: "enjoy",
        title: 'Did you enjoy this study?',
        choices: [
          "Worse than average study",
          "Average study",
          "Better than average study"
        ]
      },
      {
        type: "radiogroup",
        name: "payment",
        title: "Do you think the payment was fair?",
        choices: [
          "The payment was fair",
          "The payment was too low"
        ]
      },
      {
        type: "comment",
        name: "comments",
        title: "Do you have any additional comments about this study?"
      }
    ]
  }
};

timeline.push(questionnaire);

//DATA COLLECTION
// capture info from Prolific
var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
  subject_id: subject_id,
  study_id: study_id,
  session_id: session_id
});

const p_id = jsPsych.randomization.randomID(10);
const filename = `${p_id}.csv`;

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "pDKOe8WY8f6N",
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv()
};

timeline.push(save_data);

//THANKS//
var thanks = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>You've finished the study. Thank you for your time!</p>
    <p><a href="https://app.prolific.com/submissions/complete?cc=C1BQGMWP">Click here to return to Prolific and complete the study</a>.</p>`,
  choices: "NO_KEYS"
};

timeline.push(thanks);

//RUN//
jsPsych.run([preload_trial, timeline]);



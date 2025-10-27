const jsPsych = initJsPsych({
    show_progress_bar: true,
    override_safe_mode: true, // for local testing only
    max_load_time: 120000, //120 seconds
    on_finish: function() {
        jsPsych.data.displayData('csv');
  }
});

let timeline = []; //Empty timeline

//IRB - SKIP FOR PILOT
//const irb = {
    //type: jsPsychHtmlButtonResponse,
    //stimulus: "ADD IRB TEXT",
    //choices: ['Continue']
//};

//timeline.push(irb);

//PRELOAD AUDIO//
var preload_trial = {
    type: jsPsychPreload,
    audio: [
    'audio/573_807_B1.wav', 
    'audio/573_808_B1.wav',
    'audio/573_901_B1.wav',
    'audio/gift.wav'
    ],
    auto_preload: true
};

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
    stimulus: "INSTRUCTIONS HERE",
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
          prompt: 'List the first 5-10 words that come to mind to describe the speaker of the sentence you just heard.',
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
        title: "What was the language spoken at home when you were growing up?"
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
    <p><a href="https://app.prolific.com/submissions/complete?cc=C1H3NC6F">Click here to return to Prolific and complete the study</a>.</p>`,
  choices: "NO_KEYS"
};

timeline.push(thanks);

//RUN//
jsPsych.run([preload_trial, timeline]);



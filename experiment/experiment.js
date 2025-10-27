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
const preload_array = [
    'audio/573_802_B1.wav', 
    'audio/573_808_B1.wav',
    'audio/573_901_B1.wav'
];  

const preload_trial = {
    type: jsPsychPreload,
    audio: [
    'audio/573_802_B1.wav', 
    'audio/573_808_B1.wav',
    'audio/573_901_B1.wav'
    ],
    show_detailed_errors: true
};

timeline.unshift(preload_trial);


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
          prompt: 'Please describe the speaker of this sentence using at least five words or phrases.',
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

//THANKS//
var thanks = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>You've finished the study. Thank you for your time!</p>
    <p><a href="https://app.prolific.com/submissions/complete?cc=C1H3NC6F">Click here to return to Prolific and complete the study</a>.</p>`,
  choices: "NO_KEYS"
}

//RUN//
jsPsych.run(timeline);



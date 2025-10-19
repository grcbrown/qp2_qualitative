const jsPsych = initJsPsych({
    show_progress_bar: true,
    override_safe_mode: true, //remove after testing locally
    on_finish: function(data) {
        proliferate.submit({"trials": data.trials});
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
//const preload_array = [
//    "audio/573_802_B1.wav", 
//    "audio/573_808_B1.wav",
//    "audio/573_901_B1.wav"
//];  

//const preload_trial = {
//    type: jsPsychPreload,
//    audio: preload_array
//};

//timeline.unshift(preload_trial);


//INSTRUCTIONS
const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "INSTRUCTIONS HERE",
    choices: ['Continue']
};

timeline.push(instructions);

//TRIALS
let trial_array = create_tv_array(trial_objects);
const trials = {
  timeline: [
    {
      type: jsPsychSurveyHtmlForm,
      preamble: function() {
        const stim = jsPsych.timelineVariable('stimulus');
        return `
          <audio id="stimulus_audio" src="${stim}"></audio>
          <p><strong>Please describe the speaker of this sentence using at least five words or phrases.</strong></p>
          <button id="replay_button" type="button"> Replay Audio</button>
        `;
      },
      html: `
        <textarea name="description" rows="4" cols="60"
          placeholder="Type your response here..."></textarea>
      `,
      button_label: 'Continue',

      // assign metadata for tracking
      data: {
        id: jsPsych.timelineVariable('id'),
        stimulus: jsPsych.timelineVariable('stimulus'),
      },

      on_load: function() {
        const audio = document.getElementById("stimulus_audio");
        const replayButton = document.getElementById("replay_button");

        // Track replays
        window.replayCount = 0;

        // play automatically once at trial start
        if (audio) {
          setTimeout(() => audio.play(), 200);
        }

        // allow replay
        if (replayButton && audio) {
          replayButton.addEventListener("click", () => {
            audio.currentTime = 0;
            audio.play();
            window.replayCount++;
          });
        }
      },

      on_finish: function(data) {
        // Add the replay count and typed response to data
        data.replays = window.replayCount || 0;
        data.description = data.response.description; // make it easier to access later
        delete data.response; // optional cleanup

        console.log(`Trial ${data.id}: ${data.stimulus}`);
        console.log(`Response: ${data.description}`);
        console.log(`Replays: ${data.replays}`);
      }
    }
  ],
  timeline_variables: trial_array
};

timeline.push(trials);

//RUN//
jsPsych.run(timeline);



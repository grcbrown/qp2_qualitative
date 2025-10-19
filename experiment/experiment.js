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
// TRIALS
const trials = {
  timeline: [
    {
      type: jsPsychSurveyHtmlForm,

      // dynamically insert audio & prompt
      preamble: function() {
        const stim = jsPsych.timelineVariable('stimulus');
        return `
          <audio id="stimulus_audio" src="${stim}"></audio>
          <p><strong>Please describe the speaker of this sentence using at least five words or phrases.</strong></p>
          <button id="replay_button" type="button" disabled>🔁 Play again</button>
        `;
      },

      html: `
        <textarea name="description" rows="4" cols="60"
          placeholder="Type your description here..."></textarea>
      `,

      button_label: 'Continue',

      // metadata
      data: {
        id: jsPsych.timelineVariable('data').id,
        stimulus: jsPsych.timelineVariable('stimulus')
      },

      on_load: function() {
        const audio = document.getElementById("stimulus_audio");
        const replayButton = document.getElementById("replay_button");
        const continueButton = document.querySelector(".jspsych-btn");
        let replayCount = 0;
        let hasPlayedOnce = false;

        if (continueButton) continueButton.disabled = true;

        function playAudio() {
          if (!audio) return;
          audio.currentTime = 0;
          audio.play();
          replayButton.disabled = true; // disable during playback
        }

        audio.addEventListener("ended", () => {
          replayButton.disabled = false; // allow replay
          if (!hasPlayedOnce) {
            hasPlayedOnce = true;
            if (continueButton) continueButton.disabled = false;
          }
        });

        replayButton.addEventListener("click", () => {
          replayCount++;
          playAudio();
        });

        // play automatically once on trial start
        setTimeout(playAudio, 200);

        // store replay count for on_finish
        window.currentReplayCount = replayCount;
      },

      on_finish: function(data) {
        data.replays = window.currentReplayCount || 0;
        data.description = data.response.description;
        delete data.response;
      }
    }
  ],

  timeline_variables: trial_array
};

timeline.push(trials);

//RUN//
jsPsych.run(timeline);



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

      html: () => {
        const stim = jsPsych.timelineVariable('stimulus');
        console.log("Resolved stimulus:", stim);

        return `
          <p><strong>Please describe the speaker of this sentence using at least five words or phrases.</strong></p>

          <audio id="stimulus_audio" preload="auto">
            <source src="${stim}" type="audio/wav">
            Your browser does not support the audio element.
          </audio><br>

          <button id="play_button" type="button">Play audio</button>
          <p id="play_notice" style="color:red; font-style:italic; display:none;">
            Play the audio at least once to continue.
          </p>

          <textarea name="description" rows="4" cols="60"
            placeholder="Type your description here..." required></textarea>
        `;
      },

      button_label: "Continue",

      data: () => ({
        id: jsPsych.timelineVariable('id'),
        stimulus: jsPsych.timelineVariable('stimulus')
      }),

      on_load: function() {
        const audio = document.getElementById("stimulus_audio");
        const playButton = document.getElementById("play_button");
        const continueButton = document.querySelector(".jspsych-btn");
        const notice = document.getElementById("play_notice");

        let hasPlayed = false;
        let replayCount = 0;

        continueButton.disabled = true;
        notice.style.display = "block";

        playButton.addEventListener("click", () => {
          replayCount++;
          audio.currentTime = 0;
          audio.play();
          audio.dataset.replayCount = replayCount;
        });

        audio.addEventListener("ended", () => {
          if (!hasPlayed) {
            hasPlayed = true;
            continueButton.disabled = false;
            notice.style.display = "none";
          }
        });
      },

      on_finish: function(data) {
        const audio = document.getElementById("stimulus_audio");
        const replayCount = audio ? audio.dataset.replayCount || 0 : 0;
        data.replays = parseInt(replayCount);
        data.description = data.response.description;
        delete data.response;
      }
    }
  ],
  timeline_variables: trial_array,
  randomize_order: true
};

timeline.push(trials);

//RUN//
jsPsych.run(timeline);



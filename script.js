const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * 60;
const MILLSECONDS_PER_SECOND = 1000;

document.addEventListener("DOMContentLoaded", setup);

var alarmAudio = new Audio('audio/double-beep-beep-alarm.mp3');
alarmAudio.loop = true;

function setup(event) {
    // Setup Local storage with Pomodoro counter
    var npc = localStorage.getItem('num-pomodoros-completed');
    if(npc == null){
        //initialization
        localStorage.setItem('num-pomodoros-completed', '0');
        npc = 0;
    } else {
        npc = Number.parseInt(npc);
    }

    var pomodoroDiv = document.getElementById('pomodoro-count');
    pomodoroDiv.innerText = npc;

    // Set up event listeners for buttons
    var startButton = document.getElementById('start-stop-button');
    startButton.addEventListener('click', startStop);

    var resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', reset);

    // setting up inputs:
    // TODO: figure out a way to make it so that whenever you type in characters,
    // they "backfill" from right to left, with there still being a placeholder of 0
    // for a value that hasn't been completely filled in yet.
    // var seconds_input = document.getElementById('time-input-seconds')
    // var minutes_input = document.getElementById('time-input-minutes')
    // var hours_input = document.getElementById('time-input-hours')
}

var TimerState = {
    totalSeconds: undefined,
    timerStopped: false
};

// Changes a "Start" button into a "Stop" button
function startToStop(StartStopButton) {
    // change inner text to "Stop"
    StartStopButton.innerText = "Stop";
    StartStopButton.classList.remove("start");
    StartStopButton.classList.add("stop");
}

// Changes a "Stop" button into a "Start" button
function stopToStart(StartStopButton) {
    // change inner text to "Start"
    StartStopButton.innerText = "Start";
    StartStopButton.classList.remove("stop");
    StartStopButton.classList.add("start");
    alarmAudio.pause();
}

// Changes to perform whenever a user clicks on the Start/Stop button
function startStop(event) {
    var startStopButton = event.target;
    if(startStopButton.innerText == "Start") {
        // change inner text to "Stop"
        startToStop(startStopButton);
        startTimer();
    } else {
        // change inner text to "Start"
        stopToStart(startStopButton);
        stopTimer();
    }
}

// Start or resume the timer
function startTimer() {
    // Get the values of current input elements, 
    // and convert into a time
    var secondsInput = document.getElementById('time-input-seconds');
    var seconds = Number.parseInt(secondsInput.value);

    var minutesInput = document.getElementById('time-input-minutes');
    var minutes = Number.parseInt(minutesInput.value);

    var hoursInput = document.getElementById('time-input-hours');
    var hours = Number.parseInt(hoursInput.value);

    // Exit early if no time was specified
    if(hours == 0 && minutes == 0 && seconds == 0) {
        reset();
        return;
    }

    // Time-related code here
    var totalSeconds = undefined;
    TimerState.timerStopped = false;
    if(TimerState.totalSeconds === undefined) {
        totalSeconds = Number.parseInt(hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds);
    } else {
        totalSeconds = TimerState.totalSeconds;
    }
    // TODO: Consider changing times to a single numerical value
    var times = [];
    var timerId = setInterval(() => {
        // timer has counted all the way down
        if(times.length > 0 && times[times.length - 1] <= 0) {
            clearInterval(timerId);
            console.log('Done!');
            countdown_complete();
        } else if(TimerState.timerStopped) {
            console.log('Stopped!');
            clearInterval(timerId);
        } else {
            values = tick(hoursInput, minutesInput, secondsInput, totalSeconds, times);
            hoursInput = values[0];
            minutesInput = values[1];
            secondsInput = values[2];
            totalSeconds = values[3];
            times = values[4];
        }
    }, MILLSECONDS_PER_SECOND);
}

// Function that computes one tick of the timer clock
function tick(hInput, mInput, sInput, totalSeconds, times){
    var totalRemainingSeconds = totalSeconds - 1;
    if(totalRemainingSeconds == 0) {
        hInput.value = '00';
        mInput.value = '00';
        sInput.value = '00';
    } else if(totalRemainingSeconds > 0) {
        hours = Math.max(Math.floor(totalRemainingSeconds / SECONDS_PER_HOUR), 0);
        minutes = Math.max(Math.floor((totalRemainingSeconds - (hours * SECONDS_PER_HOUR)) / SECONDS_PER_MINUTE), 0);
        seconds = totalRemainingSeconds - ((hours * SECONDS_PER_HOUR) + (minutes * SECONDS_PER_MINUTE));
        if(hours == 0) {
            hInput.value = '00';
        } else {
            if(hours < 10) {
                hInput.value = '0' + hours;
            } else {
                hInput.value = hours;
            }
        }

        if(minutes == 0) {
            mInput.value = '00';
        } else {
            if(minutes < 10) {
                mInput.value = '0' + minutes;
            } else {
                mInput.value = minutes;
            }
        }

        if(seconds == 0) {
            sInput.value = '00';
        } else {
            if(seconds < 10) {
                sInput.value = '0' + seconds;
            } else {
                sInput.value = seconds;
            }
        }
    }
    times.push(totalRemainingSeconds);
    return [hInput, mInput, sInput, totalRemainingSeconds, times];
}

// Stops the timer
function stopTimer() {
    TimerState.timerStopped = true;
}

// Updates Pomodoro count based on current mode
function countdown_complete() {
    // Play sound
    alarmAudio.play();
    // Update Pomodoro count based on current state
    work_or_play_input = document.getElementById('work-or-play-mode');
    // If it's checked, we're working. If not, we're playing :)
    var pomodoroDiv = document.getElementById('pomodoro-count');
    var pomodoro_count = Number.parseInt(pomodoroDiv.innerText);
    if(work_or_play_input.checked) {
        pomodoroDiv.innerText = pomodoro_count + 1;
    } else {
        pomodoroDiv.innerText = pomodoro_count - 1;
    }
    localStorage.setItem('num-pomodoros-completed', pomodoroDiv.innerText);
}

// Reset the timer to the default state, but don't clear the Pomodoro count
function reset(event){
    stopTimer();
    TimerState.totalSeconds = undefined;

    var start_stop_button = document.getElementById('start-stop-button');
    stopToStart(start_stop_button);

    var secondsInput = document.getElementById('time-input-seconds');
    var minutesInput = document.getElementById('time-input-minutes');
    var hoursInput = document.getElementById('time-input-hours');

    secondsInput.placeholder = '00';
    secondsInput.value = '00';
    minutesInput.placeholder = '00';
    minutesInput.value = '00';
    hoursInput.placeholder = '00';
    hoursInput.value = '00';
}

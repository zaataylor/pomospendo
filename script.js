const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * 60
const MILLSECONDS_PER_SECOND = 1000

document.addEventListener("DOMContentLoaded", setup)

function setup(event) {
    // Setup Local storage with Pomodoro counter
    var npc = localStorage.getItem('num-pomodoros-completed')
    if(npc == null){
        //initialization
        localStorage.setItem('num-pomodoros-completed', '0')
        npc = 0
    } else {
        npc = Number.parseInt(npc)
    }

    var pomodoro_div = document.getElementById('pomodoro-count')
    pomodoro_div.innerText = npc

    // Set up event listeners for buttons
    var start_button = document.getElementById('start-stop-button')
    start_button.addEventListener('click', start_stop)

    var reset_button = document.getElementById('reset-button')
    reset_button.addEventListener('click', reset)

    // setting up inputs:
    // TODO: figure out a way to make it so that whenever you type in characters,
    // you they "backfill" from right to left, with there still being a placeholder of 0
    // for a value that hasn't been completely filled in yet.
    // var seconds_input = document.getElementById('time-input-seconds')
    // var minutes_input = document.getElementById('time-input-minutes')
    // var hours_input = document.getElementById('time-input-hours')
}

var TimerState = {
    total_seconds: undefined,
    timer_stopped: false
}

// Changes a "Start" button into a "Stop" button
function start_to_stop(start_stop_button) {
    // change inner text to "Stop"
    start_stop_button.innerText = "Stop"
    start_stop_button.classList.remove("start")
    start_stop_button.classList.add("stop")
}

// Changes a "Stop" button into a "Start" button
function stop_to_start(start_stop_button) {
    // change inner text to "Start"
    start_stop_button.innerText = "Start"
    start_stop_button.classList.remove("stop")
    start_stop_button.classList.add("start")
}

// Changes to perform whenever a user clicks on the Start/Stop button
function start_stop(event) {
    var start_stop_button = event.target
    if(start_stop_button.innerText == "Start") {
        // change inner text to "Stop"
        start_to_stop(start_stop_button)
        start_timer()
    } else {
        // change inner text to "Start"
        stop_to_start(start_stop_button)
        stop_timer()
    }
}

// Start or resume the timer
function start_timer() {
    // Get the values of current input elements, 
    // and convert into a time
    var seconds_input = document.getElementById('time-input-seconds')
    var seconds = Number.parseInt(seconds_input.value)

    var minutes_input = document.getElementById('time-input-minutes')
    var minutes = Number.parseInt(minutes_input.value)

    var hours_input = document.getElementById('time-input-hours')
    var hours = Number.parseInt(hours_input.value)

    // Exit early if no time was specified
    if(hours == 0 && minutes == 0 && seconds == 0) {
        reset()
        return
    }

    // Time-related code here
    var total_seconds = undefined
    TimerState.timer_stopped = false
    if(TimerState.total_seconds === undefined) {
        total_seconds = Number.parseInt(hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds)
    } else {
        total_seconds = TimerState.total_seconds
    }
    // TODO: Consider changing times to a single numerical value
    var times = []
    var timer_id = setInterval(() => {
        // timer has counted all the way down
        if(times.length > 0 && times[times.length - 1] <= 0) {
            clearInterval(timer_id)
            reset()
            console.log('Done!')
            countdown_complete()
        } else if(TimerState.timer_stopped) {
            console.log('Stopped!')
            clearInterval(timer_id)
        } else {
            values = tick(hours_input, minutes_input, seconds_input, total_seconds, times)
            hours_input = values[0]
            minutes_input = values[1]
            seconds_input = values[2]
            total_seconds = values[3]
            times = values[4]
        }
    }, MILLSECONDS_PER_SECOND)
}

// Function that computes one tick of the timer clock
function tick(h_input, m_input, s_input, total_seconds, times){
    total_remaining_seconds = total_seconds - 1
    if(total_remaining_seconds == 0) {
        h_input.value = '00'
        m_input.value = '00'
        s_input.value = '00'
    } else if(total_remaining_seconds > 0) {
        hours = Math.max(Math.floor(total_remaining_seconds / SECONDS_PER_HOUR), 0)
        minutes = Math.max(Math.floor((total_remaining_seconds - (hours * SECONDS_PER_HOUR)) / SECONDS_PER_MINUTE), 0)
        seconds = total_remaining_seconds - ((hours * SECONDS_PER_HOUR) + (minutes * SECONDS_PER_MINUTE))
        if(hours == 0) {
            h_input.value = '00'
        } else {
            if(hours < 10) {
                h_input.value = '0' + hours
            } else {
                h_input.value = hours
            }
        }

        if(minutes == 0) {
            m_input.value = '00'
        } else {
            if(minutes < 10) {
                m_input.value = '0' + minutes
            } else {
                m_input.value = minutes
            }
        }

        if(seconds == 0) {
            s_input.value = '00'
        } else {
            if(seconds < 10) {
                s_input.value = '0' + seconds
            } else {
                s_input.value = seconds
            }
        }
    }
    times.push(total_remaining_seconds)
    return [h_input, m_input, s_input, total_remaining_seconds, times]
}

// Stops the timer
function stop_timer() {
    TimerState.timer_stopped = true
}

// Updates Pomodoro count based on current mode
function countdown_complete() {
    // TODO: maybe add some sound effects here?

    // Update Pomodoro count based on current state
    work_or_play_input = document.getElementById('work-or-play-mode')
    // If it's checked, we're working. If not, we're playing :)
    var pomodoro_div = document.getElementById('pomodoro-count')
    var pomodoro_count = Number.parseInt(pomodoro_div.innerText)
    if(work_or_play_input.checked) {
        pomodoro_div.innerText = pomodoro_count + 1
    } else {
        pomodoro_div.innerText = pomodoro_count - 1
    }
    localStorage.setItem('num-pomodoros-completed', pomodoro_div.innerText)
}

// Reset the timer to the default state, but don't clear the Pomodoro count
function reset(event){
    var seconds_input = document.getElementById('time-input-seconds')
    var minutes_input = document.getElementById('time-input-minutes')
    var hours_input = document.getElementById('time-input-hours')

    seconds_input.placeholder = '00'
    seconds_input.value = '00'
    minutes_input.placeholder = '00'
    minutes_input.value = '00'
    hours_input.placeholder = '00'
    hours_input.value = '00'

    var start_stop_button = document.getElementById('start-stop-button')
    stop_to_start(start_stop_button)

    TimerState.total_seconds = undefined
    TimerState.timer_stopped = false
}
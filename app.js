var listening = false; //hold true when listening
var recognition; //will keep voice reconiation instance
var ignore_onend;

if (!('webkitSpeechRecognition' in window)) { //if browser is not supported
    alert('Not supported: please upgrade your browser');
} else {
    //make speech recogination instance for later use
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        listening = true;
        showInfo('listening...');
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            showInfo('no_speech_detected');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            showInfo('no_microphone_detected');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('permission_blocked');
            } else {
                showInfo('permission_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }

        if (!final_transcript) {
            showInfo('listening...');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('resultbox'));
            window.getSelection().addRange(range);
        }
    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        if (typeof (event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            upgrade();
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        resultbox.innerHTML = linebreak(final_transcript);
        interim.innerHTML = linebreak(interim_transcript);
        if (final_transcript || interim_transcript) {
            showButtons('inline-block');
        }
    };
}


function startlistening(event) {
    if (listening) {
        recognition.stop();
        return;
    }
    final_transcript = '';

    recognition.start();
    ignore_onend = false;

    resultbox.innerHTML = '';
    interim.innerHTML = '';
    var start_timestamp = event.timeStamp;

}
function showInfo(text) {

    setTimeout(() => {
        document.getElementById('info').innerText = text;
    }, 500)
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function (m) { return m.toUpperCase(); });
}
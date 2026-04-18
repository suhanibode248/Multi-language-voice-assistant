let recognition;
let lastReply = "";

// 🔥 Fix autoplay speech issue
document.body.addEventListener("click", () => {
    window.speechSynthesis.resume();
});


// 🎤 MIC
function startListening() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    const lang = document.getElementById("language").value;

    const langMap = {
        en: "en-US",
        hi: "hi-IN",
        mr: "mr-IN",
        fr: "fr-FR",
        es: "es-ES",
        de: "de-DE",
        it: "it-IT",
        pt: "pt-PT",
        ru: "ru-RU",
        ja: "ja-JP",
        ko: "ko-KR",
        zh: "zh-CN",
        ar: "ar-SA",
        tr: "tr-TR",
        te: "te-IN"
    };

    recognition.lang = langMap[lang] || "en-US";

    document.getElementById("status").innerText = "🎤 Listening...";

    recognition.start();

    // ✅ IMPORTANT FIX: speech goes to input box only
    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;

        document.getElementById("textInput").value = text;

        document.getElementById("status").innerText =
            "✅ Click Send to ask AI";
    };

    recognition.onerror = function(e) {
        document.getElementById("status").innerText =
            "Mic Error: " + e.error;
    };
}


// ⏹ STOP
function stopAll() {
    if (recognition) recognition.stop();
    window.speechSynthesis.cancel();
    document.getElementById("status").innerText = "⏹ Stopped";
}


// 💬 SEND
function sendText() {
    const text = document.getElementById("textInput").value;
    if (!text.trim()) return;

    addMessage("user", text);
    sendToServer(text);

    document.getElementById("textInput").value = "";
}


// 📡 API
function sendToServer(message) {
    const lang = document.getElementById("language").value;
    const autoTranslate = document.getElementById("autoTranslate").checked;

    addTyping();

    fetch('/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: message,
            lang: autoTranslate ? lang : "en"
        })
    })
    .then(res => res.json())
    .then(data => {
        removeTyping();

        addMessage("bot", data.reply);
        lastReply = data.reply;

        speakText(data.reply, lang);
    })
    .catch(() => {
        removeTyping();
        alert("Server Error");
    });
}


// 💬 UI MESSAGE
function addMessage(sender, text) {
    const chatBox = document.getElementById("chatBox");

    const div = document.createElement("div");
    div.className = sender;

    div.innerText = (sender === "user" ? "👤 " : "🤖 ") + text;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// ⌨️ typing
function addTyping() {
    const chatBox = document.getElementById("chatBox");

    const div = document.createElement("div");
    div.id = "typing";
    div.className = "bot";
    div.innerText = "Bot is typing...";

    chatBox.appendChild(div);
}

function removeTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
}


// 🔊 SPEECH (FIXED)
function speakText(text, lang) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    const langMap = {
        en: "en-US",
        hi: "hi-IN",
        mr: "hi-IN",
        fr: "fr-FR",
        es: "es-ES",
        de: "de-DE",
        it: "it-IT",
        pt: "pt-PT",
        ru: "ru-RU",
        ja: "ja-JP",
        ko: "ko-KR",
        zh: "zh-CN",
        ar: "ar-SA",
        tr: "tr-TR",
        te: "hi-IN"   // ⚠️ Telugu fallback (IMPORTANT)
    };

    speech.lang = langMap[lang] || "en-US";

    let voices = window.speechSynthesis.getVoices();

    function pickVoice() {
        let voice =
            voices.find(v => v.lang.includes(langMap[lang])) ||
            voices.find(v => v.lang.startsWith(langMap[lang].split("-")[0])) ||
            voices[0];

        speech.voice = voice;

        window.speechSynthesis.speak(speech);
    }

    if (!voices.length) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            pickVoice();
        };
    } else {
        pickVoice();
    }
}

// 🔊 repeat last
function speakLast() {
    if (lastReply) {
        const lang = document.getElementById("language").value;
        speakText(lastReply, lang);
    }
}


// 🌙 theme
function toggleTheme() {
    document.body.classList.toggle("dark");
}
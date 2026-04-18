from flask import Flask, render_template, request, jsonify
from openai import OpenAI

app = Flask(__name__)

# ✅ OpenRouter setup
client = OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Voice Assistant Project"
    }
)

# 🌍 Language Map (FIXED + IMPROVED)
lang_map = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "tr": "Turkish",
    "te": "Telugu"   # ✅ FIXED
}

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()

        user_text = data.get('message', '')
        target_lang = data.get('lang', 'en')

        target_lang_full = lang_map.get(target_lang, "English")

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""
You are a multilingual AI assistant.

RULES:
- Reply ONLY in {target_lang_full}
- Never mix languages
- Give clean, natural answers
- Keep it simple and correct
"""
                },
                {"role": "user", "content": user_text}
            ],
            temperature=0.6
        )

        reply = response.choices[0].message.content.strip()

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": "⚠️ Error: " + str(e)})


if __name__ == '__main__':
    app.run(debug=True)

if ("serial" in navigator) {
    // DataCollector and BrailleModel classes remain the same.
    class DataCollector {
        constructor() {
            this.sessionId = Date.now();
            this.attemptHistory = [];
            this.errorRates = {};
        }

        startNewAttempt(letter) {
            this.lastPromptTime = Date.now();
            if (!this.errorRates[letter]) {
                this.errorRates[letter] = { attempts: 0, errors: 0 };
            }
        }

        recordResponse(isCorrect, letter) {
            const latency = Date.now() - this.lastPromptTime;
            this.errorRates[letter].attempts++;
            if (!isCorrect) {
                this.errorRates[letter].errors++;
            }
            this.attemptHistory.unshift({
                letter: letter.toUpperCase(),
                time: latency / 1000,
                correct: isCorrect,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            if (this.attemptHistory.length > 5) this.attemptHistory.pop();
        }

        getErrorRate(letter) {
            const rateInfo = this.errorRates[letter.toLowerCase()];
            if (!rateInfo || rateInfo.attempts === 0) return { rate: 0, attempts: 0, errors: 0 };
            return {
                rate: (rateInfo.errors / rateInfo.attempts) * 100,
                attempts: rateInfo.attempts,
                errors: rateInfo.errors
            };
        }
        
        getFocusAreas() {
            return Object.entries(this.errorRates)
                .map(([letter, data]) => ({ letter, ...data, errorRate: data.attempts > 0 ? (data.errors / data.attempts) * 100 : 0 }))
                .filter(item => item.errors > 0)
                .sort((a, b) => b.errorRate - a.errorRate)
                .slice(0, 3);
        }

        saveToCSV() { /* This function remains unchanged */ }
    }

    class EnhancedBrailleTeacher {
        constructor() {
            // State and Hardware
            this.port = null;
            this.writer = null;
            this.reader = null;

            // Session and Mode Control
            this.mode = "learning";
            this.isPaused = false;
            this.isListening = false;
            this.recognition = null;
            this.sessionStartTime = null;
            this.sessionTimerInterval = null;
            
            // Data & Gamification
            this.dataCollector = new DataCollector();
            this.correctStreak = 0;
            this.bestStreak = 0;
            this.correctInputs = 0;
            this.totalInputs = 0;
            this.masteredLetters = new Set();
            
            // Content
            this.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
            this.words = ["cat", "bat", "sun", "moon", "star", "tree", "ice", "bee"];
            this.currentLetterIndex = 0;
            this.currentWordIndex = 0;
            this.currentWordLetterIndex = 0;
            this.alphabetFolds = { "a": [1], "b": [1, 2], "c": [1, 4], "d": [1, 4, 5], "e": [1, 5], "f": [1, 2, 4], "g": [1, 2, 4, 5], "h": [1, 2, 5], "i": [2, 4], "j": [2, 4, 5], "k": [1, 3], "l": [1, 2, 3], "m": [1, 3, 4], "n": [1, 3, 4, 5], "o": [1, 3, 5], "p": [1, 2, 3, 4], "q": [1, 2, 3, 4, 5], "r": [1, 2, 3, 5], "s": [2, 3, 4], "t": [2, 3, 4, 5], "u": [1, 3, 6], "v": [1, 2, 3, 6], "w": [2, 4, 5, 6], "x": [1, 3, 4, 6], "y": [1, 3, 4, 5, 6], "z": [1, 3, 5, 6] };
            
            this.initializeUI();
            this.initializeEventListeners();
            this.initializeSpeechRecognition();
        }

        initializeUI() {
            this.updateMasteryPath();
            this.updateAllStats();
        }

        initializeEventListeners() {
            document.getElementById("connectBtn").addEventListener("click", () => this.connectToSerial());
            document.getElementById("modeSelect").addEventListener("change", (e) => this.switchMode(e.target.value));
            document.getElementById("voiceBtn").addEventListener("click", () => this.toggleVoiceControl());
        }

        async connectToSerial() {
            try {
                this.port = await navigator.serial.requestPort();
                await this.port.open({ baudRate: 9600 });
                this.writer = this.port.writable.getWriter();
                this.reader = this.port.readable.getReader();

                document.getElementById('connectionStatus').textContent = '● Connected';
                document.getElementById('connectionStatus').className = 'connected';
                this.sessionStartTime = Date.now();
                this.startSessionTimer();
                if (!this.introDone) {
                    await this.playIntroduction();
                    this.introDone = true;
                }                
                this.readSerialLoop();
                this.speak("Device connected. Let's begin!");
                this.nextPrompt();

            } catch (error) { console.error(`Connection failed: ${error}`); }
        }

        async playIntroduction() {
            const fingers = [
                { num: 1, desc: "left ring finger" }, { num: 2, desc: "left middle finger" },
                { num: 3, desc: "left index finger" }, { num: 4, desc: "right index finger" },
                { num: 5, desc: "right middle finger" }, { num: 6, desc: "right ring finger" }
            ];
            await this.speak("Welcome to Waive! Let me introduce the finger mappings.");
            for (const finger of fingers) {
                await this.speak(`Finger ${finger.num} is your ${finger.desc}.`);
                await this.writeToSerial(String(finger.num)); // This now works reliably
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            await this.speak("Introduction complete. Let's begin!");
        }        

        async writeToSerial(data) {
            if (this.writer) {
                const encoder = new TextEncoder();
                await this.writer.write(encoder.encode(data));
            }
        }

        async readSerialLoop() {
            const decoder = new TextDecoder();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) break;
                    const cleanValue = decoder.decode(value).replace(/[\r\n]/g, '');
                    if (cleanValue) this.handleBrailleInput(cleanValue);
                }
            } catch (error) { console.error(`Error reading data: ${error}`); }
        }

        nextPrompt() {
            if (this.isPaused) return;
            let letter, word = "-";

            if (this.mode === 'learning') {
                letter = this.alphabet[this.currentLetterIndex];
                document.getElementById('current-word-display').textContent = 'A-Z Path';
                this.updateBraillePatternDisplay(letter);
                this.dataCollector.startNewAttempt(letter);
                const fingers = this.alphabetFolds[letter];
                this.speakWithVibration(`Next is ${letter.toUpperCase()}. Fold ${fingers.join(' and ')}.`, fingers);
            } else { // Practice Mode
                word = this.words[this.currentWordIndex];
                letter = word[this.currentWordLetterIndex];
                document.getElementById('current-word-display').textContent = word.toUpperCase();
                this.updateBraillePatternDisplay(letter);
                this.dataCollector.startNewAttempt(letter);
                const fingers = this.alphabetFolds[letter];
                this.speakWithVibration(`For ${word}, next is ${letter.toUpperCase()}. Fold ${fingers.join(' and ')}.`, fingers);
            }
            this.updateMasteryPath();
        }

        handleBrailleInput(data) {
            if (this.isPaused || !data) return;

            this.totalInputs++;
            const currentLetter = this.mode === 'learning'
                ? this.alphabet[this.currentLetterIndex]
                : this.words[this.currentWordIndex][this.currentWordLetterIndex];

            const isCorrect = data.toLowerCase() === currentLetter;
            this.dataCollector.recordResponse(isCorrect, currentLetter);

            if (isCorrect) {
                this.correctInputs++;
                this.correctStreak++;
                if (this.correctStreak > this.bestStreak) this.bestStreak = this.correctStreak;
                this.handleCorrectAnswer(currentLetter);

            } else {
                this.correctStreak = 0;
                this.speak("Not quite. Let's try that letter again.");
                setTimeout(() => this.nextPrompt(), 1200); // Re-prompt the same letter
            }
            this.updateAllStats();
        }

        handleCorrectAnswer(letter) {
            const { attempts } = this.dataCollector.getErrorRate(letter);
            if (attempts <= 2 && this.mode === 'learning') {
                this.masteredLetters.add(letter);
            }
            this.speak("Correct!");

            if (this.mode === 'learning') {
                this.currentLetterIndex = (this.currentLetterIndex + 1) % this.alphabet.length;
            } else { // Practice
                this.currentWordLetterIndex++;
                if (this.currentWordLetterIndex >= this.words[this.currentWordIndex].length) {
                    this.speak(`Excellent! You spelled ${this.words[this.currentWordIndex]}.`);
                    this.currentWordLetterIndex = 0;
                    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                    setTimeout(() => this.speak(`Your next word is ${this.words[this.currentWordIndex]}.`), 1000);
                }
            }
            setTimeout(() => this.nextPrompt(), 1200);
        }

        // --- VOICE COMMANDS ---
        initializeSpeechRecognition() {
            if ('webkitSpeechRecognition' in window) {
                this.recognition = new webkitSpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = false;
                this.recognition.lang = 'en-US';

                this.recognition.onresult = (event) => {
                    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                    console.log("Voice command:", command);
                    this.handleVoiceCommand(command);
                };
                this.recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
                this.recognition.onend = () => { if (this.isListening) this.recognition.start(); };
            }
        }

        toggleVoiceControl() {
            if (!this.recognition) return;
            this.isListening = !this.isListening;
            if (this.isListening) {
                this.recognition.start();
                this.speak("Voice commands activated.");
                document.getElementById('voice-status').textContent = 'Active';
            } else {
                this.recognition.stop();
                this.speak("Voice commands deactivated.");
                document.getElementById('voice-status').textContent = 'Inactive';
            }
        }
        
        handleVoiceCommand(command) {
            if (command.includes("learning")) {
                this.speak("Switching to learning mode.");
                this.switchMode("learning");
            } else if (command.includes("practice")) {
                this.speak("Switching to practice mode.");
                this.switchMode("practice");
            } else if (command.includes("accuracy") || command.includes("how am i doing")) {
                this.handleProgressQuery();
            } else if (command.includes("repeat")) {
                this.handleRepeatCommand();
            } else if (command.includes("remaining") || command.includes("left")) {
                this.handleRemainingQuery();
            } else if (command.includes("hint")) {
                this.provideHint();
            } else if (command.includes("skip")) {
                this.skipPrompt();
            } else if (command.includes("pause")) {
                this.isPaused = true;
                this.speak("Session paused.");
            } else if (command.includes("resume") || command.includes("continue")) {
                this.isPaused = false;
                this.speak("Resuming session.");
                this.nextPrompt();
            }
        }

        handleProgressQuery() {
            const accuracy = this.totalInputs > 0 ? (this.correctInputs / this.totalInputs * 100) : 0;
            let report = `Your current accuracy is ${accuracy.toFixed(0)} percent. `;
            const focus = this.dataCollector.getFocusAreas();
            if (focus.length > 0) {
                report += `You might want to focus a little more on letters like ${focus.map(f => f.letter).join(', ')}. `;
            }
            report += "You're doing a great job!";
            this.speak(report);
        }

        handleRepeatCommand() {
            this.speak("Repeating the instruction.");
            this.nextPrompt();
        }

        handleRemainingQuery() {
            if (this.mode !== 'learning') {
                this.speak("This command is only available in learning mode.");
                return;
            }
            const remaining = this.alphabet.length - this.masteredLetters.size;
            this.speak(`You have ${remaining} letters left to master. Keep going!`);
        }
        
        provideHint() {
            const letter = this.mode === 'learning' ? this.alphabet[this.currentLetterIndex] : this.words[this.currentWordIndex][this.currentWordLetterIndex];
            const fingers = this.alphabetFolds[letter];
            this.speakWithVibration(`Hint: For ${letter.toUpperCase()}, fold ${fingers.join(' and ')}.`, fingers);
        }

        skipPrompt() {
            this.speak("Skipping to the next one.");
            if (this.mode === 'learning') {
                this.currentLetterIndex = (this.currentLetterIndex + 1) % this.alphabet.length;
            } else {
                this.currentWordLetterIndex++;
                if (this.currentWordLetterIndex >= this.words[this.currentWordIndex].length) {
                    this.currentWordLetterIndex = 0;
                    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                }
            }
            this.nextPrompt();
        }
        
        // --- UTILITY AND UI UPDATE FUNCTIONS ---
        switchMode(newMode) {
            this.mode = newMode;
            document.getElementById('modeSelect').value = newMode;
            this.currentLetterIndex = 0;
            this.currentWordIndex = 0;
            this.currentWordLetterIndex = 0;
            this.nextPrompt();
        }

        speakWithVibration(text, fingers) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.2;
            utterance.rate = 1.1;

            const foldIndex = text.toLowerCase().indexOf('fold');
            if (foldIndex !== -1 && fingers.length > 0) {
                const delay = (foldIndex / text.length) * (text.split(' ').length * 200);
                setTimeout(() => {
                    fingers.forEach((finger, i) => {
                        setTimeout(() => this.writeToSerial(String(finger)), i * 150);
                    });
                }, delay);
            }
            speechSynthesis.speak(utterance);
        }

        // All UI update functions (updateAllStats, updateMasteryPath, etc.) remain largely the same as my previous response.
        // They are already designed to be modular and will work with the new state management.
        updateAllStats() {
            const accuracy = this.totalInputs > 0 ? (this.correctInputs / this.totalInputs * 100) : 0;
            const history = this.dataCollector.attemptHistory;
            const totalTime = history.reduce((sum, item) => sum + item.time, 0);
            const avgTime = history.length > 0 ? totalTime / history.length : 0;

            document.getElementById('history-accuracy').textContent = `${accuracy.toFixed(0)}%`;
            document.getElementById('history-avg-time').textContent = `${avgTime.toFixed(1)}s`;
            document.getElementById('history-current-streak').textContent = this.correctStreak;
            document.getElementById('history-best-streak').textContent = this.bestStreak;

            document.getElementById('progress-accuracy').textContent = `${accuracy.toFixed(1)}%`;
            document.getElementById('progress-avg-time').textContent = `${avgTime.toFixed(1)}s`;
            document.getElementById('progress-total-attempts').textContent = this.totalInputs;
            document.getElementById('accuracy-progress-bar').style.width = `${accuracy}%`;

            this.updateAttemptHistoryList();
            this.updateFocusAreas();
        }

        updateBraillePatternDisplay(letter) {
            document.getElementById('braille-char-output').textContent = letter.toUpperCase();
            const positions = this.alphabetFolds[letter];
            document.getElementById('active-dots').textContent = positions.join(', ');
            for (let i = 1; i <= 6; i++) {
                document.getElementById(`dot-${i}`).classList.toggle('active', positions.includes(i));
            }
        }
        
        updateMasteryPath() {
            const container = document.getElementById('mastery-path-container');
            container.innerHTML = '';
            this.alphabet.forEach((letter, index) => {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                tile.textContent = letter.toUpperCase();
                
                const { attempts, errors } = this.dataCollector.getErrorRate(letter);

                if (this.mode === 'learning' && index === this.currentLetterIndex) {
                    tile.classList.add('current');
                } else if (this.masteredLetters.has(letter)) {
                    tile.classList.add('mastered');
                } else if (attempts > 2 && errors > 0) {
                    tile.classList.add('difficult');
                } else {
                    tile.classList.add('pending');
                }
                container.appendChild(tile);
            });
        }

        updateAttemptHistoryList() {
            const list = document.getElementById('history-list');
            list.innerHTML = '';
            this.dataCollector.attemptHistory.forEach(item => {
                const li = document.createElement('li');
                li.className = item.correct ? 'correct' : 'incorrect';
                li.innerHTML = `
                    <div class="status-icon">${item.correct ? '✔' : '✖'}</div>
                    <div class="attempt-details">Required: <strong>${item.letter}</strong><small>${item.timestamp}</small></div>
                    <div class="attempt-time">${item.time.toFixed(1)}s</div>
                `;
                list.appendChild(li);
            });
        }

        updateFocusAreas() {
            const container = document.getElementById('focus-areas');
            container.innerHTML = '';
            const areas = this.dataCollector.getFocusAreas();
            if (areas.length > 0) {
                areas.forEach(area => {
                    const item = document.createElement('div');
                    item.className = 'focus-item';
                    item.innerHTML = `<strong>${area.letter.toUpperCase()}</strong><small>${area.errors} errors in ${area.attempts} attempts</small>`;
                    container.appendChild(item);
                });
            } else {
                container.innerHTML = '<p>No specific focus areas yet. Great work!</p>';
            }
        }
        
        startSessionTimer() {
            if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
                const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
                const seconds = String(elapsed % 60).padStart(2, '0');
                document.getElementById('sessionTime').textContent = `Session: ${minutes}m ${seconds}s`;
            }, 1000);
        }

        speak(text) {
            return new Promise(resolve => {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.pitch = 1.2;
                    utterance.rate = 1.1;
                    utterance.onend = resolve;
                    speechSynthesis.speak(utterance);
                } else {
                    resolve();
                }
            });
        }
    }
    
    new EnhancedBrailleTeacher();

} else {
    alert("Web Serial API not supported. Please use Chrome or Edge.");
}
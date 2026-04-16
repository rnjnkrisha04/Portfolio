function signovaMeet() {
    return {
        aiEnabled: true,
        showLog: true,
        translation: '...',
        history: [],
        hands: null,
        camera: null,

        initAI() {
            const video = document.getElementById('webcam');
            const canvas = document.getElementById('ai_canvas');
            const ctx = canvas.getContext('2d');

            this.hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((res) => {
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);
                
                if (this.aiEnabled && res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
                    for (const pts of res.multiHandLandmarks) {
                        // Drawing skeleton connectors and landmarks [cite: 17, 38]
                        drawConnectors(ctx, pts, HAND_CONNECTIONS, {color: '#4285F4', lineWidth: 5});
                        drawLandmarks(ctx, pts, {color: '#ffffff', lineWidth: 1, radius: 3});
                    }
                    this.translation = "NAMASTE / HELLO"; // Word-level recognition placeholder [cite: 18]
                    this.updateLog("NAMASTE / HELLO");
                } else {
                    this.translation = "...";
                }
                ctx.restore();
            });

            this.camera = new Camera(video, {
                onFrame: async () => { await this.hands.send({image: video}); },
                width: 1280, height: 720
            });
            this.camera.start(); // User gesture start [cite: 31]
        },

        updateLog(text) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (this.history.length === 0 || this.history[0].text !== text) {
                this.history.unshift({ time: now, text: text });
            }
        }
    }
}
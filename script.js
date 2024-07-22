const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');
const historyLog = document.getElementById('history-log');
const historyMaxItems = 10; // Maximum number of history items

function drawCircle(ctx, x, y, radius) {
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawInscribedShape(ctx, x, y, numberOfSides, radius) {
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    const angle = (2 * Math.PI) / numberOfSides;
    for (let i = 0; i <= numberOfSides; i++) {
        const px = radius * Math.cos(i * angle) + x;
        const py = radius * Math.sin(i * angle) + y;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function drawCircumscribedShape(ctx, x, y, numberOfSides, radius) {
    ctx.strokeStyle = 'cyan';
    ctx.beginPath();
    const angle = (2 * Math.PI) / numberOfSides;
    const adjustedRadius = radius / Math.cos(angle / 2);
    for (let i = 0; i <= numberOfSides; i++) {
        const px = adjustedRadius * Math.cos(i * angle) + x;
        const py = adjustedRadius * Math.sin(i * angle) + y;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function animateDrawing(callback, duration = 666) { // Slower animation
    const totalDuration = duration;
    const stepDuration = 10;
    let currentDuration = 0;

    function animateStep() {
        currentDuration += stepDuration;
        const progress = currentDuration / totalDuration;
        ctx.setLineDash([progress * 1000, (1 - progress) * 1000]);
        callback();
        if (currentDuration < totalDuration) {
            requestAnimationFrame(animateStep);
        } else {
            ctx.setLineDash([]);
            callback();
        }
    }
    animateStep();
}

function drawShapes() {
    const numberOfSides = Math.min(parseInt(document.getElementById('sides').value), 10000);
    result.classList.remove('visible');
    if (numberOfSides >= 3) {
        // Clear canvas before drawing shapes
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up central drawing
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;

        // Draw circle immediately
        drawCircle(ctx, centerX, centerY, radius);

        // Animate inscribed shape
        setTimeout(() => {
            animateDrawing(() => drawInscribedShape(ctx, centerX, centerY, numberOfSides, radius), 666); // Slower animation
        }, 0); // No delay for immediate animation

        // Animate circumscribed shape
        setTimeout(() => {
            animateDrawing(() => drawCircumscribedShape(ctx, centerX, centerY, numberOfSides, radius), 666); // Slower animation
        }, 700); // Adjusted delay for slower animation

        // Calculate areas using the original math
        const angle = (2 * Math.PI) / numberOfSides;
        const c = Math.sqrt(2 - 2 * Math.cos(angle));
        const h = Math.sqrt(1 - (c / 2) ** 2);
        const area_abc = c * h / 2;
        const inscribedArea = area_abc * numberOfSides;
        const e = 1 / Math.cos(angle / 2);
        const f = Math.sqrt(2 * e * e - 2 * e * e * Math.cos(angle));
        const area_def = f / 2;
        const circumscribedArea = numberOfSides * area_def;

        // Update result display
        setTimeout(() => {
            result.innerHTML = `π Approximation: <span style="color: yellow;">${inscribedArea.toFixed(8)}</span> &lt; π &lt; <span style="color: cyan;">${circumscribedArea.toFixed(8)}</span>`;
            result.classList.add('visible');

            // Add to history log
            const historyEntry = document.createElement('p');
            historyEntry.innerHTML = `Sides: ${numberOfSides}, π Approximation: ${inscribedArea.toFixed(8)} &lt; π &lt; ${circumscribedArea.toFixed(8)}`;
            
            // Draw smaller shape in history log
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = 60; // Original width
            smallCanvas.height = 60; // Original height
            const smallCtx = smallCanvas.getContext('2d');

            // Draw circle
            drawCircle(smallCtx, smallCanvas.width / 2, smallCanvas.height / 2, 20); // Adjust size for smaller canvas
            
            // Draw inscribed and circumscribed shapes
            drawInscribedShape(smallCtx, smallCanvas.width / 2, smallCanvas.height / 2, numberOfSides, 20); // Adjust size for smaller canvas
            drawCircumscribedShape(smallCtx, smallCanvas.width / 2, smallCanvas.height / 2, numberOfSides, 20); // Adjust size for smaller canvas

            historyEntry.prepend(smallCanvas);

            // Manage history log size
            if (historyLog.children.length >= historyMaxItems) {
                historyLog.removeChild(historyLog.lastChild); // Remove the last child to keep latest entries on top
            }
            historyLog.insertBefore(historyEntry, historyLog.firstChild); // Add new entry at the top
        }, 2000); // Adjusted timing as needed
    } else {
        result.textContent = "Your number must be 3 or greater.";
        result.classList.add('visible');
    }
}

// Add event listener to handle Enter key
document.addEventListener('DOMContentLoaded', () => {
    const sidesInput = document.getElementById('sides');

    sidesInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default action to avoid form submission
            drawShapes();
        }
    });
});

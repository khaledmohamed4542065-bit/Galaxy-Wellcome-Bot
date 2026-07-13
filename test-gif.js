import { createCanvas, loadImage } from '@napi-rs/canvas';
import GIFEncoder from 'gif-encoder-2';
import fs from 'fs';

function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

const runBenchmark = async (frames, fps, quality) => {
    const width = 680;
    const height = 240;
    const label = `Frames: ${frames}, FPS: ${fps}, Quality: ${quality}`;
    console.time(label);

    const encoder = new GIFEncoder(width, height, 'neuquant', true);
    encoder.start();
    encoder.setRepeat(0);   
    encoder.setQuality(quality);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const particles = Array.from({ length: 20 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
    }));

    for (let i = 0; i < frames; i++) {
        encoder.setDelay(1000 / fps);

        ctx.fillStyle = '#0a0d16'; 
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();

        const pulse = Math.sin((i / frames) * Math.PI) * 0.5 + 0.5;
        
        ctx.save();
        const grad1 = ctx.createRadialGradient(150, 120, 10, 150, 120, 300);
        grad1.addColorStop(0, `rgba(168, 85, 247, ${0.1 + pulse * 0.05})`);
        grad1.addColorStop(1, 'rgba(10, 13, 22, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        ctx.fillStyle = `rgba(192, 132, 252, ${0.3 + pulse * 0.2})`;
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });

        // Animations Progress
        const panelProgress = easeOutExpo(Math.max(0, Math.min(i / 25, 1)));
        const avatarProgress = easeOutExpo(Math.max(0, Math.min((i - 15) / 20, 1)));
        const textProgress = easeOutExpo(Math.max(0, Math.min((i - 25) / 25, 1)));
        const shProgress = easeInOutQuad(Math.max(0, Math.min((i - 30) / 25, 1)));

        const fullPanelW = width - 40;
        const panelH = height - 40;
        const panelW = fullPanelW * panelProgress;
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2;

        if (panelProgress > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 + panelProgress * 0.2})`;
            ctx.lineWidth = 1;
            
            const r = 15;
            ctx.beginPath();
            ctx.moveTo(panelX + r, panelY);
            ctx.lineTo(panelX + panelW - r, panelY);
            ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + r, r);
            ctx.lineTo(panelX + panelW, panelY + panelH - r);
            ctx.arcTo(panelX + panelW, panelY + panelH, panelX + panelW - r, panelY + panelH, r);
            ctx.lineTo(panelX + r, panelY + panelH);
            ctx.arcTo(panelX, panelY + panelH, panelX, panelY + panelH - r, r);
            ctx.lineTo(panelX, panelY + r);
            ctx.arcTo(panelX, panelY, panelX + r, panelY, r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        const avatarSize = 130;
        const avatarX = (width - fullPanelW) / 2 + 30;
        const avatarY = (height - avatarSize) / 2;

        if (avatarProgress > 0) {
            ctx.save();
            ctx.translate(avatarX + avatarSize / 2, avatarY + avatarSize / 2);
            ctx.rotate((i * 4 * Math.PI) / 180); 
            
            ctx.beginPath();
            ctx.arc(0, 0, (avatarSize / 2) + 12, 0, Math.PI * 2);
            ctx.setLineDash([15, 10]); 
            ctx.strokeStyle = `rgba(192, 132, 252, ${avatarProgress})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(0, 0, (avatarSize / 2) + 5, 0, Math.PI * 2);
            ctx.setLineDash([]);
            ctx.strokeStyle = `rgba(139, 92, 246, ${avatarProgress * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.globalAlpha = avatarProgress;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = '#5865F2';
            ctx.fill();
            ctx.restore();
        }

        if (textProgress > 0) {
            const textX = avatarX + avatarSize + 30;
            ctx.textAlign = 'left';
            
            ctx.fillStyle = `rgba(180, 190, 210, ${textProgress})`;
            ctx.font = 'bold 16px "Segoe UI", Arial';
            ctx.fillText('Welcome to the Galaxy Server Community!', textX, avatarY + 40);

            ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
            ctx.font = 'bold 42px "Segoe UI", Arial';
            ctx.fillText('test_user', textX, avatarY + 85);

            ctx.save();
            const lineWidth = 300 * textProgress;
            const lineY = avatarY + 105;
            const lineGrad = ctx.createLinearGradient(textX, lineY, textX + lineWidth, lineY);
            lineGrad.addColorStop(0, `rgba(168, 85, 247, ${textProgress})`);
            lineGrad.addColorStop(1, 'rgba(168, 85, 247, 0)'); 
            ctx.fillStyle = lineGrad;
            ctx.fillRect(textX, lineY, lineWidth, 3);
            ctx.restore();
        }

        if (shProgress > 0) {
            const logoY = (height + panelH) / 2 - 30;
            const targetCenterX = (width + fullPanelW) / 2 - 50;
            
            ctx.font = 'italic bold 24px "Segoe UI", Arial';
            
            const gStartX = targetCenterX - 60;
            const gEndX = targetCenterX - 15;
            const gCurrentX = gStartX + (gEndX - gStartX) * shProgress;
            
            const sStartX = targetCenterX + 60;
            const sEndX = targetCenterX + 12;
            const sCurrentX = sStartX + (sEndX - sStartX) * shProgress;

            ctx.fillStyle = `rgba(192, 132, 252, ${shProgress})`;
            ctx.textAlign = 'center';
            ctx.fillText('&', targetCenterX, logoY);

            ctx.fillStyle = `rgba(255, 255, 255, ${shProgress})`;
            ctx.textAlign = 'right';
            ctx.fillText('G', gCurrentX, logoY);
            
            ctx.textAlign = 'left';
            ctx.fillText('S', sCurrentX, logoY);
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(targetCenterX, logoY - 8, 30, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(168, 85, 247, ${shProgress * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        encoder.addFrame(ctx);

        if (i % 15 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    encoder.finish();
    const buffer = encoder.out.getData();
    console.timeEnd(label);
    console.log(`-> Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n`);
    return buffer;
};

console.log('--- STARTING BENCHMARKS ---\n');
await runBenchmark(120, 25, 15);
await runBenchmark(80, 25, 15);
await runBenchmark(80, 25, 20);
await runBenchmark(60, 20, 15);
await runBenchmark(60, 20, 20);
console.log('--- BENCHMARKS COMPLETE ---');
process.exit(0);

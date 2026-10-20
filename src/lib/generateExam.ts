import type { QCM } from './qcm';

const RED = '#EF2B2D';
const GREEN = '#009E49';
const ORANGE = '#F4791F';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const escJs = (s: string): string => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export interface GenerateOptions {
  mode: 'immediate' | 'end';
  showJustification: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  durationMin: number;
}

export function generateExamHtml(title: string, questions: QCM[], options: GenerateOptions): string {
  const examTitle = title.trim() || 'EXAMEN — Alfa fisc';
  const dataJs = questions
    .map(
      (q) =>
        `    { id:'${escJs(q.id)}', index:${q.index}, question:'${escJs(q.question)}', options:[${q.options
          .map((o) => `{letter:'${o.letter}',text:'${escJs(o.text)}'}`)
          .join(',')}], answer:[${q.answer.map((a) => `'${a}'`).join(',')}], justification:'${escJs(q.justification)}' }`
    )
    .join(',\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(examTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<script>window.MathJax={tex:{inlineMath:[['
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<style>
:root{--red:#EF2B2D;--green:#009E49;--orange:#F4791F;--ink-900:#0e131f;--ink-800:#1a2030;--ink-700:#2a3140;--ink-600:#3f4757;--ink-500:#5f6878;--ink-400:#8a93a5;--ink-300:#b6bdca;--ink-200:#d9dde5;--ink-100:#eef0f4;--ink-50:#f7f8fa;}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Inter',-apple-system,system-ui,sans-serif;background:#f5f4ef;margin:0;color:#000;line-height:1.6;}
.app{max-width:880px;margin:0 auto;min-height:100vh;background:#f5f4ef;box-shadow:0 0 40px rgba(0,0,0,0.05);}

/* Water ripple effect on click */
.ripple{position:absolute;border-radius:50%;background:rgba(0,158,73,0.18);transform:scale(0);animation:rippleAnim 0.6s ease-out;pointer-events:none;z-index:999;}
@keyframes rippleAnim{to{transform:scale(4);opacity:0;}}

/* Page borders — single color, rounded top & bottom */
.page-border-top{height:10px;background:linear-gradient(90deg,var(--green) 0%,var(--green) 50%,var(--red) 50%,var(--red) 100%);border-radius:12px 12px 0 0;}
.page-border-bottom{height:10px;background:linear-gradient(90deg,var(--green) 0%,var(--green) 50%,var(--red) 50%,var(--red) 100%);border-radius:0 0 12px 12px;}

/* Header */
.exam-header{background:#f5f4ef;padding:24px 24px 20px;}
.exam-brand-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.brand-block{display:flex;align-items:center;gap:14px;}
.brand-logo{width:48px;height:48px;border-radius:12px;background:var(--ink-900);display:grid;place-items:center;}
.brand-logo svg{width:26px;height:26px;}
.brand-wordmark{font-family:'Times New Roman',Times,serif;font-weight:700;font-style:italic;font-size:28px;line-height:1;letter-spacing:0.01em;}
.brand-wordmark .alfa{color:var(--green);}
.brand-wordmark .fisc{color:var(--red);}
.brand-tag{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-400);font-weight:600;margin-top:4px;}
.contact-info{font-size:11px;color:var(--ink-400);text-align:right;line-height:1.5;}
.contact-info strong{color:var(--ink-600);}
.exam-title-box{margin-top:18px;padding:18px 22px;border:3px solid #000;border-radius:14px;text-align:center;background:#f9f9f9;box-shadow:5px 5px 0 #000;}
.exam-title-box h1{font-family:'Plus Jakarta Sans';font-size:21px;font-weight:800;color:#000;margin:0;letter-spacing:-0.01em;text-transform:uppercase;}
.exam-meta{margin-top:12px;display:flex;gap:18px;font-size:12px;color:var(--ink-400);flex-wrap:wrap;justify-content:center;}
.exam-meta b{color:var(--ink-600);font-weight:700;}

/* Toolbar */
.toolbar{position:sticky;top:0;z-index:50;background:rgba(245,244,239,0.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--ink-100);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.progress-wrap{flex:1;display:flex;align-items:center;gap:14px;min-width:0;}
.progress-bar{flex:1;height:8px;background:var(--ink-100);border-radius:99px;overflow:hidden;}
.progress-fill{height:100%;background:var(--green);border-radius:99px;transition:width 0.5s ease;}
.progress-label{font-size:13px;font-weight:700;color:var(--ink-700);white-space:nowrap;}
.timer-label{font-size:14px;font-weight:800;color:var(--ink-700);white-space:nowrap;display:flex;align-items:center;gap:6px;padding:5px 14px;border:2px solid var(--ink-300);border-radius:99px;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:all 0.3s;}
.timer-label.timer-warn{color:var(--orange);border-color:var(--orange);background:#fff5e9;animation:timerPulse 1s ease-in-out infinite;}
.timer-label.timer-danger{color:var(--red);border-color:var(--red);background:#fdeaea;animation:timerPulse 0.5s ease-in-out infinite;}
@keyframes timerPulse{0%,100%{opacity:1;}50%{opacity:0.5;}}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;font-family:'Inter';font-weight:700;font-size:14px;padding:11px 20px;border-radius:12px;transition:all 0.15s;}
.btn-green{background:var(--green);color:#fff;box-shadow:0 5px 0 #007a38,0 7px 16px rgba(0,158,73,0.3);}
.btn-green:hover{filter:brightness(1.06);}
.btn-green:active{transform:translateY(4px);box-shadow:0 1px 0 #007a38,0 2px 6px rgba(0,158,73,0.3);}
.btn-blue{background:#2980b9;color:#fff;box-shadow:0 5px 0 #1a6fb0,0 7px 16px rgba(41,128,185,0.3);}
.btn-blue:hover{filter:brightness(1.06);}
.btn-blue:active{transform:translateY(4px);box-shadow:0 1px 0 #1a6fb0,0 2px 6px rgba(41,128,185,0.3);}
.btn-red{background:var(--red);color:#fff;box-shadow:0 5px 0 #b82325,0 7px 16px rgba(239,43,45,0.3);}
.btn-red:active{transform:translateY(4px);box-shadow:0 1px 0 #b82325;}
.btn-ghost{background:var(--ink-50);color:var(--ink-600);border:1px solid var(--ink-200);}
.btn-ghost:hover{background:var(--ink-100);}
.btn-orange{background:var(--orange);color:#fff;box-shadow:0 5px 0 #c66215,0 7px 16px rgba(244,121,31,0.3);}
.btn-orange:hover{filter:brightness(1.06);}
.btn-orange:active{transform:translateY(4px);box-shadow:0 1px 0 #c66215,0 2px 6px rgba(244,121,31,0.3);}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-sm{padding:8px 14px;font-size:13px;border-radius:10px;}

/* Question card */
.content{padding:28px 24px 48px;}
.q-card{background:#fefdfb;border:1px solid var(--ink-100);border-radius:18px;padding:28px;box-shadow:0 6px 20px -8px rgba(26,32,48,0.1);animation:fadeIn 0.4s ease both;}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideDown{from{opacity:0;max-height:0;}to{opacity:1;max-height:700px;}}
@keyframes popIn{0%{opacity:0;transform:scale(0.6);}70%{transform:scale(1.06);}100%{opacity:1;transform:scale(1);}}
.q-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:14px;}
.q-chip.idle{background:var(--orange);color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;}
.q-chip.correct{background:#e6f7ed;color:var(--green);}
.q-chip.wrong{background:#fdeaea;color:var(--red);}
.multi-hint{font-size:12px;color:var(--orange);font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
.q-text{font-family:'Plus Jakarta Sans';font-size:19px;font-weight:800;color:#000;line-height:1.5;margin:0 0 22px;}
.options{display:grid;gap:12px;}
.opt{display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;background:#fefdfb;border:1.5px solid #000;border-radius:14px;padding:16px 18px;cursor:pointer;transition:all 0.2s;font:inherit;color:inherit;}
.opt:hover:not(:disabled){border-color:var(--ink-600);transform:translateY(-1px);box-shadow:0 4px 12px -4px rgba(0,0,0,0.1);}
.opt:disabled{cursor:default;}
.opt-check{flex-shrink:0;width:24px;height:24px;border-radius:6px;border:1.5px solid #000;background:#fefdfb;display:grid;place-items:center;margin-top:2px;transition:all 0.2s;}
.opt.is-selected .opt-check{background:var(--green);border-color:var(--green);}
.opt-check svg{width:15px;height:15px;color:#fff;opacity:0;transition:opacity 0.15s;}
.opt.is-selected .opt-check svg{opacity:1;}
.opt-letter{flex-shrink:0;width:36px;height:36px;border-radius:10px;background:var(--ink-50);color:var(--ink-600);font-family:'Plus Jakarta Sans';font-weight:800;font-size:14px;display:grid;place-items:center;transition:all 0.2s;}
.opt-text{flex:1;padding-top:5px;font-size:16px;color:#000;font-weight:400;}
.opt.is-correct{border:2px solid var(--green);background:#e6f7ed;}
.opt.is-correct .opt-letter{background:var(--green);color:#fff;}
.opt.is-wrong{border:2px solid var(--red);background:#fdeaea;}
.opt.is-wrong .opt-letter{background:var(--red);color:#fff;}
.opt-mark{margin-left:auto;padding-top:6px;font-weight:800;font-size:18px;}
.opt.is-correct .opt-mark{color:var(--green);}
.opt.is-wrong .opt-mark{color:var(--red);}

/* Justification */
.justif{margin-top:20px;background:#f0f7ff;border:1px solid #c5dcf2;border-left:5px solid #2980b9;border-radius:12px;padding:18px 20px;animation:slideDown 0.4s ease both;overflow:hidden;}
.justif-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.justif-badge{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-weight:800;font-size:13px;}
.justif-badge.correct{background:#c8efd8;color:var(--green);}
.justif-badge.wrong{background:#fbd5d5;color:var(--red);}
.justif-title{font-family:'Plus Jakarta Sans';font-weight:800;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#1a5a82;}
.justif-body{font-size:15px;color:#000;line-height:1.7;margin:0;}

/* Nav */
.q-nav{margin-top:22px;display:flex;justify-content:space-between;gap:12px;align-items:center;}
.btn-prev{background:var(--ink-50);color:var(--ink-600);border:2px solid var(--ink-200);font-size:15px;font-weight:700;padding:12px 22px;border-radius:14px;box-shadow:0 4px 0 var(--ink-200);cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center;gap:8px;}
.btn-prev:hover:not:disabled{background:var(--ink-100);}
.btn-prev:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink-200);}
.btn-prev:disabled{opacity:0.35;cursor:not-allowed;box-shadow:none;}
.btn-next{background:var(--green);color:#fff;font-size:16px;font-weight:800;padding:13px 28px;border-radius:14px;box-shadow:0 6px 0 #007a38,0 8px 20px rgba(0,158,73,0.35);border:none;cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center;gap:10px;}
.btn-next:hover{filter:brightness(1.06);}
.btn-next:active{transform:translateY(4px);box-shadow:0 2px 0 #007a38,0 3px 8px rgba(0,158,73,0.3);}
.btn-next:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none;transform:none;}
.answer-warn{font-size:13px;color:var(--orange);font-weight:600;text-align:center;flex:1;}

/* Dots */
.dots{margin-top:18px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}
.dot{width:10px;height:10px;border-radius:99px;background:var(--ink-200);transition:all 0.2s;border:none;cursor:pointer;padding:0;}
.dot.active{background:var(--orange);transform:scale(1.4);}
.dot.correct{background:var(--green);}
.dot.wrong{background:var(--red);}

/* Results */
.results-wrap{text-align:center;animation:fadeIn 0.5s ease both;padding:8px 0;}
.score-ring-wrap{position:relative;width:240px;height:240px;margin:0 auto 20px;animation:popIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;}
.score-ring{transform:rotate(-90deg);}
.ring-bg{fill:none;stroke:var(--red);stroke-width:18;}
.ring-fg{fill:none;stroke:var(--green);stroke-width:18;stroke-linecap:round;transition:stroke-dashoffset 1.2s ease-out;}
.ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ring-score{font-family:'Plus Jakarta Sans';font-size:52px;font-weight:800;color:var(--ink-900);line-height:1;}
.ring-total{font-size:20px;color:var(--ink-400);font-weight:700;}
.ring-pct{font-size:15px;font-weight:700;color:var(--green);margin-top:4px;}
.mention-box{display:inline-block;padding:10px 26px;border-radius:99px;font-family:'Plus Jakarta Sans';font-weight:800;font-size:16px;margin:6px 0;}
.mention-expert{background:#e6f7ed;color:var(--green);border:2px solid var(--green);}
.mention-confirmed{background:#e6f7ed;color:#007a38;border:2px solid var(--green);}
.mention-progress{background:var(--ink-100);color:var(--ink-600);border:2px solid var(--ink-300);}
.mention-weak{background:#fdeaea;color:var(--red);border:2px solid var(--red);}
.results-msg{color:var(--ink-500);font-size:15px;max-width:400px;margin:12px auto 0;}
.results-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:420px;margin:24px auto 0;}
.stat{background:var(--ink-50);border:1px solid var(--ink-100);border-radius:14px;padding:16px;}
.stat-val{font-family:'Plus Jakarta Sans';font-size:28px;font-weight:800;}
.stat-lbl{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-400);margin-top:2px;}
.stat-correct .stat-val{color:var(--green);}
.stat-wrong .stat-val{color:var(--red);}

/* Correction review */
.review-section{margin-top:32px;text-align:left;}
.review-title{font-family:'Plus Jakarta Sans';font-size:18px;font-weight:800;color:var(--ink-900);margin:0 0 16px;display:flex;align-items:center;gap:8px;}
.review-item{background:white;border:1px solid var(--ink-100);border-left:5px solid var(--red);border-radius:12px;padding:16px;margin-bottom:12px;}
.review-item.is-correct{border-left-color:var(--green);}
.review-q{font-size:15px;font-weight:700;color:var(--ink-900);margin:0 0 8px;}
.review-opts{display:grid;gap:6px;margin:10px 0;}
.review-opt{display:flex;gap:10px;align-items:flex-start;padding:8px 12px;border-radius:8px;font-size:14px;}
.review-opt.correct{background:#e6f7ed;color:#006633;font-weight:600;}
.review-opt.wrong-pick{background:#fdeaea;color:var(--red);font-weight:600;}
.review-opt .letter{font-weight:800;font-family:'Plus Jakarta Sans';min-width:18px;}
.review-justif{margin-top:10px;background:#f0f7ff;border-left:4px solid #2980b9;border-radius:8px;padding:12px 14px;font-size:14px;color:var(--ink-600);line-height:1.6;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(14,19,31,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;animation:fadeIn 0.2s ease;}
.modal{background:#fefdfb;border-radius:20px;padding:32px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}
.modal h3{font-family:'Plus Jakarta Sans';font-size:20px;font-weight:800;color:var(--ink-900);margin:0 0 8px;text-align:center;}
.modal p{font-size:14px;color:var(--ink-500);text-align:center;margin:0 0 20px;}
.modal input{width:100%;padding:13px 16px;border:2px solid var(--ink-200);border-radius:12px;font-size:15px;font-weight:600;color:var(--ink-900);outline:none;transition:border-color 0.2s;margin-bottom:16px;}
.modal input:focus{border-color:var(--green);}
.modal-actions{display:flex;gap:10px;}
.modal-actions .btn{flex:1;}

/* Print layout for correction PDF — flowing A4 with auto page breaks */
#print-root{display:none;}
@media print{
  body *{visibility:hidden;}
  #print-root,#print-root *{visibility:visible;}
  #print-root{display:block;position:absolute;left:0;top:0;width:100%;background:white;}
  @page{size:A4;margin:14mm 14mm 16mm 14mm;
    @bottom-right{content:"Page " counter(page) " / " counter(pages);font-family:'Inter',sans-serif;font-size:10px;font-weight:700;color:#000;}
    @bottom-center{content:"Alfa fisc — Avec Alfa fisc, visez l'excellence";font-family:'Times New Roman',serif;font-style:italic;font-size:9px;color:#777;}
  }
  .print-table{width:100%;border-collapse:collapse;}
  .print-table thead{display:table-header-group;}
  .print-table tbody{display:table-row-group;}
  .print-table > tbody > tr > td{padding:0;vertical-align:top;}
  .print-brand-bar{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--green);padding-bottom:8px;margin-bottom:14px;font-size:11px;font-weight:700;}
  .print-brand{font-family:'Times New Roman',Times,serif;font-style:italic;font-size:16px;font-weight:700;}
  .print-brand .alfa{color:var(--green);}
  .print-brand .fisc{color:var(--red);}
  .print-contact{font-size:10px;color:#444;font-style:italic;text-align:right;}
  .print-title-box{border:2px solid var(--green);border-radius:10px;padding:12px 14px;text-align:center;margin-bottom:14px;background:#fafffe;}
  .print-title-box h1{margin:0;font-size:18px;text-transform:uppercase;font-weight:800;font-family:'Plus Jakarta Sans';color:var(--ink-900);}
  .print-candidate{border:1.5px solid var(--ink-300);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;font-weight:700;text-align:center;background:var(--ink-50);}
  .print-candidate span{color:var(--ink-900);font-size:14px;}
  .print-question{page-break-inside:avoid;break-inside:avoid;margin-bottom:14px;border:1.5px solid var(--ink-200);border-radius:10px;padding:14px 16px;background:white;}
  .print-question:last-child{margin-bottom:0;}
  .print-question.is-correct{border-left:5px solid var(--green);}
  .print-question.is-wrong{border-left:5px solid var(--red);}
  .print-q-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;}
  .print-q-num{flex-shrink:0;width:26px;height:26px;border-radius:7px;background:var(--ink-900);color:#fff;font-weight:800;font-size:13px;display:grid;place-items:center;font-family:'Plus Jakarta Sans';margin-top:1px;}
  .print-q-num.ok{background:var(--green);}
  .print-q-num.no{background:var(--red);}
  .print-q-text{font-weight:700;font-size:14px;line-height:1.5;color:#000;flex:1;margin:0;}
  .print-opts{display:grid;gap:5px;margin:8px 0;}
  .print-opt{display:flex;gap:8px;align-items:flex-start;padding:7px 10px;border-radius:7px;font-size:13px;line-height:1.4;border:1px solid transparent;}
  .print-opt .letter{font-weight:800;min-width:18px;font-family:'Plus Jakarta Sans';}
  .print-opt .optbody{flex:1;}
  .print-opt .mark{margin-left:auto;font-weight:800;font-size:12px;white-space:nowrap;}
  .print-opt.is-correct{background:#e6f7ed;border-color:var(--green);color:#006633;font-weight:600;}
  .print-opt.is-correct .mark{color:var(--green);}
  .print-opt.is-wrong-pick{background:#fdeaea;border-color:var(--red);color:var(--red);font-weight:600;}
  .print-opt.is-wrong-pick .mark{color:var(--red);}
  .print-justif{margin-top:10px;background:#f0f7ff;border-left:4px solid #2980b9;border-radius:7px;padding:10px 12px;font-size:12.5px;color:#000;line-height:1.55;}
  .print-justif strong{color:#1a5a82;}
}

@media (max-width:640px){
  .exam-header,.toolbar,.content{padding-left:16px;padding-right:16px;}
  .q-card{padding:22px 16px;}
  .q-text{font-size:17px;}
  .q-nav{flex-direction:column-reverse;gap:10px;}
  .btn-next,.btn-prev{width:100%;justify-content:center;}
  .stats{grid-template-columns:1fr 1fr 1fr;}
  .ring-score{font-size:42px;}
  .brand-wordmark{font-size:22px;}
  .exam-meta{font-size:11px;gap:12px;}
}
</style>
</head>
<body>
<div class="app">
  <div class="page-border-top"></div>

  <header class="exam-header">
    <div class="exam-brand-row">
      <div class="brand-block">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="#009E49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" stroke="#EF2B2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="brand-wordmark"><span class="alfa">Alfa</span> <span class="fisc">fisc</span></div>
          <div class="brand-tag">Préparation Concours</div>
        </div>
      </div>
      <div class="contact-info">
        <strong>Facebook:</strong> Alfa fisc POUR LES DÉBUTANTS<br>
        <strong>WhatsApp:</strong> +226 66 47 70 70
      </div>
    </div>
    <div class="exam-title-box">
      <h1>${esc(examTitle)}</h1>
    </div>
    <div class="exam-meta">
      <span><b>Questions:</b> ${questions.length}</span>
      <span><b>Mode:</b> ${options.mode === 'immediate' ? 'Correction immédiate' : 'Correction à la fin'}</span>
    </div>
  </header>

  <div class="toolbar" id="toolbar">
    <div class="progress-wrap">
      <span class="progress-label" id="progressLabel">Question 1 / ${questions.length}</span>
      <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
    </div>
    <span class="timer-label" id="timerLabel" style="display:none;"></span>
  </div>

  <main class="content">
    <div id="quiz"></div>
    <div class="dots" id="dots"></div>
  </main>

  <div class="page-border-bottom"></div>
</div>

<!-- Print root for correction PDF -->
<div id="print-root"></div>

<!-- Modal container -->
<div id="modal-root"></div>

<script>
const RAW_QUESTIONS = [
${dataJs}
];
const MODE = '${options.mode}';
const SHOW_JUST = ${options.showJustification};
const SHUFFLE_Q = ${options.shuffleQuestions};
const SHUFFLE_O = ${options.shuffleOptions};
const DURATION_MIN = ${options.durationMin};

let timerInterval = null;
let timeLeft = 0;

let QUESTIONS = [];
let current = 0;
let answers = [];
let validated = [];
let candidateName = '';
let isPracticeSession = false; // true when retrying missed questions — results are NOT recorded/submitted

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

let _mjReady = null;
function mathJaxReady(){
  if(window.MathJax && MathJax.typesetPromise) return Promise.resolve();
  if(_mjReady) return _mjReady;
  _mjReady = new Promise(function(resolve){
    var check = function(){ if(window.MathJax && MathJax.typesetPromise){ resolve(); return; } setTimeout(check, 80); };
    check();
  });
  return _mjReady;
}
function typesetMath(el){
  if(!el) return Promise.resolve();
  return mathJaxReady().then(function(){ if(window.MathJax && MathJax.typesetPromise) return MathJax.typesetPromise([el]); }).catch(function(){});
}

function initQuestions(){
  let qs = RAW_QUESTIONS.map(q=>{
    const opts = SHUFFLE_O ? shuffle(q.options) : [...q.options];
    return {...q, options: opts};
  });
  if(SHUFFLE_Q) qs = shuffle(qs);
  return qs;
}

function startExam(){
  QUESTIONS = initQuestions();
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null).map(()=>[]);
  validated = new Array(QUESTIONS.length).fill(false);
  startTimer();
  render();
}

const quizEl = document.getElementById('quiz');
const dotsEl = document.getElementById('dots');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const timerLabel = document.getElementById('timerLabel');

function startTimer(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval=null; }
  if(DURATION_MIN > 0){
    timeLeft = DURATION_MIN * 60;
    timerLabel.style.display = 'flex';
    updateTimerDisplay();
    timerInterval = setInterval(()=>{
      timeLeft--;
      if(timeLeft <= 0){
        clearInterval(timerInterval); timerInterval=null;
        timeLeft = 0;
        updateTimerDisplay();
        finishExam();
        render();
        return;
      }
      updateTimerDisplay();
    }, 1000);
  } else {
    timerLabel.style.display = 'none';
  }
}

function updateTimerDisplay(){
  if(DURATION_MIN <= 0) return;
  const m = Math.floor(timeLeft/60);
  const s = timeLeft%60;
  timerLabel.textContent = '⏱ ' + m + ':' + (s<10?'0':'') + s;
  timerLabel.classList.remove('timer-warn','timer-danger');
  if(timeLeft <= 30) timerLabel.classList.add('timer-danger');
  else if(timeLeft <= 60) timerLabel.classList.add('timer-warn');
}

function arraysEqual(a,b){
  if(!a||!b) return false;
  if(a.length!==b.length) return false;
  const aa=[...a].sort(), bb=[...b].sort();
  return aa.every((x,i)=>x===bb[i]);
}

function renderDots(){
  dotsEl.innerHTML = '';
  QUESTIONS.forEach((q,i)=>{
    const b = document.createElement('button');
    const answered = answers[i] && answers[i].length > 0;
    b.className = 'dot' + (i===current?' active':'') + (validated[i]?(arraysEqual(answers[i],q.answer)?' correct':' wrong'):'') + (answered && !validated[i] ? ' answered':'');
    b.title = 'Question ' + (i+1);
    b.onclick = ()=>{ if(i<=current || answered || validated[i]) { current=i; render(); } };
    dotsEl.appendChild(b);
  });
}

function render(){
  if(current >= QUESTIONS.length){ renderResults(); return; }
  const q = QUESTIONS[current];
  const isV = validated[current];
  const userAns = answers[current] || [];
  const correct = isV && arraysEqual(userAns, q.answer);

  progressLabel.textContent = 'Question ' + (current+1) + ' / ' + QUESTIONS.length;
  progressFill.style.width = Math.round((current/QUESTIONS.length)*100) + '%';

  let html = '<div class="q-card">';
  html += '<span class="q-chip ' + (isV ? (correct?'correct':'wrong') : 'idle') + '">' + (isV ? (correct?'Correct':'Incorrect') : ('Question ' + (current+1))) + '</span>';
  html += '<h2 class="q-text">' + q.question + '</h2>';
  html += '<div class="options">';
  q.options.forEach(opt=>{
    const isAns = q.answer.indexOf(opt.letter) !== -1;
    const isUser = userAns.indexOf(opt.letter) !== -1;
    let cls = '', mark = '';
    if(isUser && !isV) cls = ' is-selected';
    if(isV){
      if(isAns){ cls=' is-correct'; mark=' ✓'; }
      else if(isUser && !isAns){ cls=' is-wrong'; mark=' ✕'; }
    }
    const handler = isV ? 'disabled' : 'onclick="toggleAnswer(\\''+opt.letter+'\\')"';
    html += '<button class="opt'+cls+'" '+handler+'>';
    if(!isV){
      html += '<span class="opt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
    }
    html += '<span class="opt-letter">'+opt.letter+'</span>';
    html += '<span class="opt-text">'+opt.text+'</span>';
    if(mark) html += '<span class="opt-mark">'+mark+'</span>';
    html += '</button>';
  });
  html += '</div>';

  if(isV && SHOW_JUST){
    html += '<div class="justif"><div class="justif-head">';
    html += '<div class="justif-badge '+(correct?'correct':'wrong')+'">'+(correct?'✓':'✕')+'</div>';
    html += '<div class="justif-title">Justification</div></div>';
    html += '<p class="justif-body">'+q.justification+'</p></div>';
  }

  // Navigation
  const hasAnswer = userAns.length > 0;
  const last = current+1 >= QUESTIONS.length;
  html += '<div class="q-nav">';
  html += '<button class="btn-prev" onclick="prev()" '+(current===0?'disabled':'')+'>← Précédent</button>';
  if(isV){
    html += '<button class="btn-next" onclick="next()">'+(last?'Voir les résultats':'Question suivante')+' →</button>';
  } else if(MODE === 'end'){
    html += '<button class="btn-next" onclick="confirmAndNext()" '+(hasAnswer?'':'disabled')+'>'+(last?'Terminer et corriger':'Valider et continuer')+' →</button>';
    if(!hasAnswer) html += '<span class="answer-warn">Veuillez sélectionner au moins une réponse</span>';
  } else {
    html += '<button class="btn-next" onclick="confirmAndNext()" '+(hasAnswer?'':'disabled')+'>'+(last?'Voir les résultats':'Valider')+' ✓</button>';
    if(!hasAnswer) html += '<span class="answer-warn">Veuillez sélectionner au moins une réponse</span>';
  }
  html += '</div>';
  html += '</div>';
  quizEl.innerHTML = html;
  renderDots();
  typesetMath(quizEl);
}

function toggleAnswer(letter){
  if(validated[current]) return;
  const arr = answers[current] || [];
  const idx = arr.indexOf(letter);
  if(idx === -1){ arr.push(letter); }
  else { arr.splice(idx,1); }
  answers[current] = arr;
  render();
}

function confirmAndNext(){
  const arr = answers[current] || [];
  if(arr.length === 0) return;
  if(MODE === 'end'){
    if(current+1 < QUESTIONS.length){ current++; }
    else { finishExam(); }
    render();
    return;
  }
  validated[current] = true;
  render();
}

function prev(){
  if(current > 0){ current--; render(); }
}

function next(){
  if(current+1 < QUESTIONS.length){ current++; }
  else { finishExam(); }
  render();
}

function finishExam(){
  for(let i=0;i<QUESTIONS.length;i++){
    if(answers[i] && answers[i].length > 0) validated[i]=true;
  }
  current = QUESTIONS.length;
  reportResults();
}

function reportResults(){
  var score = getScore();
  var total = QUESTIONS.length;
  var correctArr = [];
  var answersArr = [];
  for(var i=0;i<QUESTIONS.length;i++){
    correctArr.push(arraysEqual(answers[i], QUESTIONS[i].answer));
    answersArr.push(answers[i] || []);
  }
  var payload = { type:'alfa-exam-complete', score: score, total: total, correctArray: correctArr, answers: answersArr, candidateName: candidateName, isPractice: isPracticeSession };
  try { window.parent.postMessage(payload, '*'); } catch(e){}
}

function getScore(){ let s=0; for(let i=0;i<QUESTIONS.length;i++) if(arraysEqual(answers[i],QUESTIONS[i].answer)) s++; return s; }

function renderResults(){
  const score = getScore();
  const total = QUESTIONS.length;
  const pct = Math.round((score/total)*100);
  const circ = 2 * Math.PI * 105;
  const greenLen = (score/total) * circ;
  const offset = circ - greenLen;

  let mention='mention-weak', label='À renforcer', msg='Reprenez les points clés et relancez un test.';
  if(pct>=90){mention='mention-expert';label='Expert';msg='Maîtrise exceptionnelle. Vous êtes prêt pour le concours.';}
  else if(pct>=75){mention='mention-confirmed';label='Confirmé';msg='Très bon niveau. Quelques détails à peaufiner.';}
  else if(pct>=50){mention='mention-progress';label='En progrès';msg='Des bases solides, continuez vos révisions.';}

  progressFill.style.width='100%';
  progressLabel.textContent='Terminé';

  const allCorrect = score === total;
  const ringFgStyle = allCorrect
    ? 'stroke-dasharray:'+circ+';stroke-dashoffset:0;'
    : 'stroke-dasharray:'+circ+';stroke-dashoffset:'+offset+';';

  let html = '<div class="results-wrap">';
  html += '<div class="score-ring-wrap">';
  html += '<svg class="score-ring" width="240" height="240" viewBox="0 0 240 240">';
  html += '<circle class="ring-bg" cx="120" cy="120" r="105"/>';
  html += '<circle class="ring-fg" cx="120" cy="120" r="105" style="'+ringFgStyle+'"/>';
  html += '</svg>';
  html += '<div class="ring-label"><div class="ring-score">'+score+'</div><div class="ring-total">/ '+total+'</div><div class="ring-pct">'+pct+'%</div></div>';
  html += '</div>';
  html += '<div class="mention-box '+mention+'">'+label+'</div>';
  html += '<p class="results-msg">'+msg+'</p>';

  html += '<div class="stats">';
  html += '<div class="stat stat-correct"><div class="stat-val">'+score+'</div><div class="stat-lbl">Correctes</div></div>';
  html += '<div class="stat stat-wrong"><div class="stat-val">'+(total-score)+'</div><div class="stat-lbl">Ratées</div></div>';
  html += '<div class="stat"><div class="stat-val" style="color:var(--ink-700)">'+pct+'%</div><div class="stat-lbl">Réussite</div></div>';
  html += '</div>';

  const missed = QUESTIONS.filter((_,i)=>!arraysEqual(answers[i],QUESTIONS[i].answer)).length;
  html += '<div class="results-actions">';
  html += '<button class="btn btn-green" onclick="showCorrectionReview()">Voir la correction</button>';
  html += '<button class="btn btn-blue" onclick="promptNameForPdf()">Télécharger la correction (PDF)</button>';
  if(missed > 0){
    html += '<button class="btn btn-red btn-sm" onclick="retryMissed()">Reprendre les ratées ('+missed+')</button>';
  }
  html += '<button class="btn btn-orange btn-sm" onclick="restartAll()">Tout reprendre</button>';
  html += '</div>';

  html += '<div id="correction-review"></div>';
  html += '</div>';
  quizEl.innerHTML = html;
  dotsEl.innerHTML = '';
  typesetMath(quizEl);
}

function showCorrectionReview(){
  const el = document.getElementById('correction-review');
  if(!el) return;
  let html = '<div class="review-section"><h3 class="review-title">Correction détaillée</h3>';
  QUESTIONS.forEach((q,i)=>{
    const u = answers[i] || [];
    const ok = arraysEqual(u, q.answer);
    html += '<div class="review-item'+(ok?' is-correct':'')+'">';
    html += '<p class="review-q">Q'+(i+1)+'. '+q.question+'</p>';
    html += '<div class="review-opts">';
    q.options.forEach(opt=>{
      const isAns = q.answer.indexOf(opt.letter) !== -1;
      const isUser = u.indexOf(opt.letter) !== -1;
      let cls = '';
      if(isAns) cls = ' correct';
      else if(isUser && !isAns) cls = ' wrong-pick';
      html += '<div class="review-opt'+cls+'"><span class="letter">'+opt.letter+'.</span><span>'+opt.text+'</span></div>';
    });
    html += '</div>';
    if(SHOW_JUST){
      html += '<div class="review-justif"><strong>Justification:</strong> '+q.justification+'</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
  el.scrollIntoView({behavior:'smooth', block:'start'});
  typesetMath(el);
}

function retryMissed(){
  const missed = QUESTIONS.filter((_,i)=>!arraysEqual(answers[i],QUESTIONS[i].answer));
  if(missed.length === 0) return;
  QUESTIONS = missed.map(q=>{
    const opts = SHUFFLE_O ? shuffle(q.options) : [...q.options];
    return {...q, options: opts};
  });
  if(SHUFFLE_Q) QUESTIONS = shuffle(QUESTIONS);
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null).map(()=>[]);
  validated = new Array(QUESTIONS.length).fill(false);
  isPracticeSession = true; // do not record retries as a real attempt
  render();
}

function restartAll(){
  isPracticeSession = false; // full restart is a real exam again
  startExam();
}

/* Name modal → PDF */
function promptNameForPdf(){
  const root = document.getElementById('modal-root');
  root.innerHTML = '<div class="modal-overlay"><div class="modal">'+
    '<h3>Télécharger la correction</h3>'+
    '<p>Veuillez saisir votre nom et prénom pour personnaliser le fichier.</p>'+
    '<input id="nameInput" type="text" placeholder="Nom et prénom" autocomplete="name">'+
    '<div class="modal-actions">'+
    '<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>'+
    '<button class="btn btn-green" onclick="confirmDownloadPdf()">OK — Télécharger</button>'+
    '</div></div></div>';
  setTimeout(()=>{ const inp=document.getElementById('nameInput'); if(inp) inp.focus(); }, 100);
}

function closeModal(){ document.getElementById('modal-root').innerHTML = ''; }

function confirmDownloadPdf(){
  const inp = document.getElementById('nameInput');
  const name = inp ? inp.value.trim() : '';
  if(!name){ if(inp){ inp.style.borderColor='var(--red)'; inp.focus(); } return; }
  candidateName = name;
  closeModal();
  Promise.resolve(buildPrintDocument(name)).then(function(){ window.print(); });
}

function buildPrintDocument(name){
  const score = getScore();
  const total = QUESTIONS.length;
  const printRoot = document.getElementById('print-root');

  // Use a table so the <thead> (Alfa fisc header) repeats on every printed page.
  // A single <tbody><tr><td> wraps all questions so the browser flows content
  // across A4 pages automatically — no fixed-height page divs, no blank pages.
  let body = '';

  // First-page intro block (title + candidate) sits inside the body cell
  body += '<div class="print-title-box"><h1>${escJs(examTitle)}</h1></div>';
  body += '<div class="print-candidate">Candidat: <span>'+escapeHtml(name)+'</span> · Score: <span>'+score+' / '+total+'</span></div>';

  // Each question as a self-contained block that won't split across pages
  QUESTIONS.forEach((q,i)=>{
    const u = answers[i] || [];
    const ok = arraysEqual(u, q.answer);
    body += '<div class="print-question'+(ok?' is-correct':' is-wrong')+'">';
    body += '<div class="print-q-head"><span class="print-q-num'+(ok?' ok':' no')+'">'+(i+1)+'</span><p class="print-q-text">'+q.question+'</p></div>';
    body += '<div class="print-opts">';
    q.options.forEach(opt=>{
      const isAns = q.answer.indexOf(opt.letter) !== -1;
      const isUser = u.indexOf(opt.letter) !== -1;
      let cls = '', mark = '';
      if(isAns){ cls=' is-correct'; mark='BONNE'; }
      else if(isUser && !isAns){ cls=' is-wrong-pick'; mark='VOTRE RÉPONSE'; }
      body += '<div class="print-opt'+cls+'"><span class="letter">'+opt.letter+'.</span><span class="optbody">'+opt.text+'</span>'+(mark?'<span class="mark">'+mark+'</span>':'')+'</div>';
    });
    body += '</div>';
    if(SHOW_JUST){
      body += '<div class="print-justif"><strong>Justification:</strong> '+q.justification+'</div>';
    }
    body += '</div>';
  });

  const headerRow =
    '<thead><tr><td>'+
    '<div class="print-brand-bar"><span class="print-brand"><span class="alfa">Alfa</span> <span class="fisc">fisc</span> — POUR LES DÉBUTANTS</span><span class="print-contact">Facebook: Alfa fisc POUR LES DÉBUTANTS · WhatsApp: +226 66 47 70 70</span></div>'+
    '</td></tr></thead>';

  printRoot.innerHTML = '<table class="print-table">'+headerRow+'<tbody><tr><td>'+body+'</td></tr></tbody></table>';
  return typesetMath(printRoot);
}

function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* Water ripple effect on click */
document.addEventListener('click', function(e){
  const target = e.target.closest('.opt, .btn, .btn-next, .btn-prev, .dot');
  if(!target) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  if(getComputedStyle(target).position === 'static') target.style.position = 'relative';
  target.style.overflow = 'hidden';
  target.appendChild(ripple);
  setTimeout(()=>{ if(ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 600);
});

startExam();

/* Listen for PDF trigger from parent (candidate correction overlay button) */
window.addEventListener('message', function(e){
  if(!e.data || e.data.type !== 'alfa-trigger-pdf') return;
  var name = (e.data.candidateName && String(e.data.candidateName).trim()) || candidateName || 'Candidat';
  candidateName = name;
  Promise.resolve(buildPrintDocument(name)).then(function(){ window.print(); });
});
</script>
</body>
</html>`;
}

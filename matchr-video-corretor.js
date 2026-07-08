/*
  MatchR - vídeo "Para você, corretor"
  Como usar: incluir antes de </body> no index.html:
  <script src="matchr-video-corretor.js"></script>
*/
(function () {
  'use strict';

  var YOUTUBE_EMBED = 'https://www.youtube.com/embed/7o9W3ATGCl4';

  function injectStyle() {
    if (document.getElementById('matchrVideoCorretorStyle')) return;
    var style = document.createElement('style');
    style.id = 'matchrVideoCorretorStyle';
    style.textContent =
      '.matchr-video-card{margin-top:22px;background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:28px;padding:22px;box-shadow:0 22px 55px rgba(0,0,0,.12)}' +
      '.matchr-video-card h2{margin:0 0 12px;font-size:21px;letter-spacing:-.02em;color:#000}' +
      '.matchr-video-card p{color:#444;line-height:1.45;margin:0 0 16px}' +
      '.matchr-video-wrap{position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:20px;background:#000;box-shadow:0 20px 45px rgba(0,0,0,.18)}' +
      '.matchr-video-wrap iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}';
    document.head.appendChild(style);
  }

  function injectVideo() {
    injectStyle();
    var analytics = document.getElementById('analytics');
    if (!analytics || document.getElementById('video-corretor')) return;

    var card = document.createElement('div');
    card.className = 'matchr-video-card';
    card.id = 'video-corretor';
    card.innerHTML =
      '<h2>Assista: Para você, corretor</h2>' +
      '<p>Uma explicação direta sobre como o MatchR pode ajudar o corretor imobiliário a ganhar tempo, organizar buscas e encontrar imóveis mais compatíveis para cada cliente.</p>' +
      '<div class="matchr-video-wrap">' +
      '<iframe src="' + YOUTUBE_EMBED + '" title="Para você, corretor — MatchR" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
      '</div>';
    analytics.appendChild(card);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectVideo);
  else injectVideo();
})();

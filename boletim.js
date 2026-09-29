/* Boletim do dia — monta o cartão e gera o PNG pra mandar ao tutor (admin.html). */
(function () {
  /* Modelo do boletim — dá pra editar à vontade.
     Cada seção tem uma ou mais linhas; multi = aceita várias opções; padrao = já vem marcado;
     obs = opção que abre um campo de texto. */
  const SECOES = [
    { ic: "💗", t: "Como foi o dia?", linhas: [{ k: "dia", multi: true, op: ["Muito tranquilo", "Animado", "Brincalhão", "Mais quietinho", "Precisou de mais atenção"] }] },
    { ic: "🍽️", t: "Alimentação", linhas: [{ k: "comida", op: ["Comeu tudo", "Comeu parcialmente", "Não quis comer"], padrao: "Comeu tudo" }] },
    { ic: "💧", t: "Água", linhas: [{ k: "agua", op: ["Bebeu normalmente", "Bebeu bastante", "Bebeu pouco"], padrao: "Bebeu normalmente" }] },
    { ic: "🚽", t: "Necessidades", linhas: [
      { k: "coco", rot: "💩 Cocô", op: ["Normal", "Não fez", "Observação"], padrao: "Normal", obs: "Observação" },
      { k: "xixi", rot: "💦 Xixi", op: ["Normal", "Não fez", "Observação"], padrao: "Normal", obs: "Observação" }] },
    { ic: "🐕", t: "Atividades de hoje", linhas: [{ k: "ativ", multi: true, op: ["Brincadeiras com brinquedos", "Passeio", "Caça-petiscos", "Enriquecimento ambiental"] }] },
    { ic: "🤍", t: "Socialização", pergunta: "Como foi a interação com os outros cães?", linhas: [{ k: "social", op: ["Socializou com todos", "Socializou, mas evitou contato com alguns", "Ficou mais reservado"] }] },
    { ic: "😴", t: "Descanso", linhas: [{ k: "descanso", op: ["Relaxou", "Teve dificuldade no começo, mas conseguiu relaxar", "Não conseguiu relaxar"], padrao: "Relaxou" }] }
  ];
  /* Respostas iniciais de um boletim novo: { chave: [opções marcadas] } */
  function respostasPadrao() {
    var r = {};
    SECOES.forEach(function (s) { s.linhas.forEach(function (l) { r[l.k] = l.padrao ? [l.padrao] : []; }); });
    return r;
  }

  var esc = function (s) { return window.JuFicha ? JuFicha.esc(s) : String(s == null ? "" : s); };
  var PAW = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6.5" cy="9" r="2.1"/><circle cx="12" cy="6.4" r="2.3"/><circle cx="17.5" cy="9" r="2.1"/><path d="M12 11.4c-3 0-5.4 2.3-5.4 4.7 0 1.7 1.5 2.6 3.1 2.6 1 0 1.6-.4 2.3-.4s1.3.4 2.3.4c1.6 0 3.1-.9 3.1-2.6 0-2.4-2.4-4.7-5.4-4.7z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* Seção no cartão: todas as opções do modelo, com as escolhidas marcadas. Sem nada marcado, a seção não aparece. */
  function secaoHtml(s, resp, obs) {
    if (!s.linhas.some(function (l) { return (resp[l.k] || []).length; })) return "";
    return '<section class="bol-sec"><h3><span class="ic">' + s.ic + "</span>" + esc(s.t) + "</h3>" +
      (s.pergunta ? '<p class="bol-q">' + esc(s.pergunta) + "</p>" : "") +
      s.linhas.map(function (l) {
        var sel = resp[l.k] || [], nota = l.obs && sel.indexOf(l.obs) >= 0 ? String(obs[l.k] || "").trim() : "";
        return '<div class="bol-linha">' + (l.rot ? '<span class="bol-rot">' + esc(l.rot) + "</span>" : "") +
          '<div class="bol-ops">' + l.op.map(function (o) {
            var on = sel.indexOf(o) >= 0;
            return '<span class="bol-op' + (on ? " on" : "") + '">' + (on ? '<span class="ck">' + CHECK + "</span>" : "") + esc(o) + "</span>";
          }).join("") + "</div>" +
          (nota ? '<div class="bol-obs"><b>Obs.:</b> ' + esc(nota) + "</div>" : "") + "</div>";
      }).join("") + "</section>";
  }

  /* b = { nome, data ("03/07"), servico, resp: { chave: [opções] }, obs: { chave: texto }, recado, foto (data URL) } */
  function html(b) {
    return (
      '<div class="bol">' +
        '<div class="bol-top"><div class="tt"><div class="bol-h">Boletim do dia</div>' +
          '<div class="bol-sub">' + esc(b.servico || "Hospedagem") + " · Ju Pets</div></div>" +
          '<span class="bol-mk">' + PAW + "</span></div>" +
        '<div class="bol-body">' +
          (b.foto ? '<div class="bol-foto" style="background-image:url(\'' + b.foto + '\')"></div>' : "") +
          '<dl class="bol-kv"><div><dt>🐶 Pet</dt><dd>' + esc(b.nome) + "</dd></div><div><dt>📅 Data</dt><dd>" + esc(b.data) + "</dd></div></dl>" +
          SECOES.map(function (s) { return secaoHtml(s, b.resp || {}, b.obs || {}); }).join("") +
          (b.recado ? '<div class="bol-humor"><b>Recadinho:</b> ' + esc(b.recado) + "</div>" : "") +
        "</div>" +
        '<div class="bol-foot">Ju Pets · @jupetslimeira</div>' +
      "</div>"
    );
  }

  /* ---------- PNG ---------- */
  var lib = null;
  function loadLib() {
    if (window.html2canvas) return Promise.resolve();
    if (!lib) lib = new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = "vendor/html2canvas-1.4.1.min.js"; s.onload = ok;
      s.onerror = function () { lib = null; fail(new Error("Falha ao carregar o html2canvas")); };
      document.head.appendChild(s);
    });
    return lib;
  }
  function fontsReady() {
    if (!document.fonts) return null;
    return Promise.all([
      '800 26px "Bricolage Grotesque"', '700 20px "Bricolage Grotesque"',
      '400 15px "Nunito Sans"', '700 15px "Nunito Sans"', '800 15px "Nunito Sans"'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }
  function nomeArquivo(b) {
    var n = String(b.nome || "pet").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ._-]+/g, "").trim();
    return "Boletim - " + (n || "pet") + " - " + String(b.data || "").replace(/\//g, "-") + ".png";
  }
  /* Devolve um Blob PNG (1260 px de largura, bom pro WhatsApp e stories) */
  function png(b) {
    return Promise.all([loadLib(), fontsReady()]).then(function () {
      var box = document.createElement("div");
      box.className = "bol-shot";
      box.innerHTML = html(b);
      document.body.appendChild(box);
      return window.html2canvas(box, { scale: 3, backgroundColor: "#FBF1ED", useCORS: true, logging: false })
        .then(function (canvas) {
          return new Promise(function (ok, fail) {
            canvas.toBlob(function (blob) { blob ? ok(blob) : fail(new Error("Não gerou a imagem")); }, "image/png");
          });
        })
        .finally(function () { box.remove(); });
    });
  }
  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }
  /* Abre o menu de compartilhar do celular (WhatsApp etc.). Sem suporte, baixa o arquivo.
     Devolve "shared", "downloaded" ou "cancelled". */
  function compartilhar(blob, nome) {
    var file = new File([blob], nome, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file] }).then(function () { return "shared"; }, function (e) {
        if (e && e.name === "AbortError") return "cancelled";
        throw e;
      });
    }
    baixar(blob, nome);
    return Promise.resolve("downloaded");
  }

  /* Foto escolhida no celular → JPEG menor (máx. 1200 px), pra prévia e PNG ficarem leves */
  function lerFoto(file) {
    return new Promise(function (ok, fail) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error("Não consegui abrir essa foto")); };
      img.src = url;
    });
  }

  window.JuBoletim = {
    SECOES: SECOES, respostasPadrao: respostasPadrao,
    html: html, png: png, baixar: baixar, compartilhar: compartilhar, nomeArquivo: nomeArquivo, lerFoto: lerFoto
  };
})();

/* Ficha cadastral do pet — usada em cadastro.html (cliente) e admin.html (Júlia). */
(function () {
  /* Opções das perguntas — dá pra editar à vontade */
  const HOSPITAIS = ["Invet", "Pet Company - Covabra", "Vetlim", "Vital Vet"];
  const PODE_COMER = ["Sachê", "Petiscos do tipo bifinho", "Petiscos do tipo bolacinhas", "Maçã", "Banana", "Cenoura", "Brócolis", "Picolé de iogurte natural e banana", "Picolé de sachê"];
  const REACOES = ["Puxa muito", "Anda tranquilo", "Criança", "Homem", "Mulher", "Gato", "Pomba/passarinho", "Motos", "Caminhões", "Carro", "Bicicletas", "Trovão", "Fogos", "Chuva", "Costume de fugir e escapar"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function idade(p) {
    if (p.nascimento) {
      var n = new Date(p.nascimento + "T12:00:00"), h = new Date();
      var m = (h.getFullYear() - n.getFullYear()) * 12 + h.getMonth() - n.getMonth() - (h.getDate() < n.getDate() ? 1 : 0);
      if (m < 0) return "";
      var a = Math.floor(m / 12), r = m % 12;
      return (a ? a + (a > 1 ? " anos" : " ano") : "") + (a && r ? " e " : "") + (r ? r + (r > 1 ? " meses" : " mês") : (a ? "" : "menos de 1 mês"));
    }
    return p.idade_aproximada ? "~ " + p.idade_aproximada : "";
  }
  function dataBR(iso) { if (!iso) return ""; var s = iso.split("-"); return s[2] + "/" + s[1] + "/" + s[0]; }
  /* items: [rótulo, valor, "half"?, htmlJáPronto?] — itens sem valor não aparecem */
  function kv(items) {
    var rows = items.filter(function (x) { return x[1]; });
    if (!rows.length) return "";
    return '<dl class="kv">' + rows.map(function (x) {
      return '<div class="' + (x[2] || "") + '"><dt>' + esc(x[0]) + "</dt><dd>" + (x[3] ? x[1] : esc(x[1])) + "</dd></div>";
    }).join("") + "</dl>";
  }
  function tags(list, cls) { return list.map(function (t) { return '<span class="tag ' + (cls || "") + '">' + esc(t) + "</span>"; }).join(""); }
  function sec(title, body) { return body ? '<section class="fx-sec"><h3>' + esc(title) + "</h3>" + body + "</section>" : ""; }
  function lista(arr) { return arr.length > 1 ? arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1] : arr.join(""); }
  var PAW = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6.5" cy="9" r="2.1"/><circle cx="12" cy="6.4" r="2.3"/><circle cx="17.5" cy="9" r="2.1"/><path d="M12 11.4c-3 0-5.4 2.3-5.4 4.7 0 1.7 1.5 2.6 3.1 2.6 1 0 1.6-.4 2.3-.4s1.3.4 2.3.4c1.6 0 3.1-.9 3.1-2.6 0-2.4-2.4-4.7-5.4-4.7z"/></svg>';

  function petHtml(p) {
    var fem = p.sexo === "Fêmea";
    var head = [fem ? "♀ Fêmea" : "♂ Macho", p.raca, idade(p), p.peso_kg ? String(p.peso_kg).replace(".", ",") + " kg" : ""].filter(Boolean);
    var alerts = [];
    if (p.alergia) alerts.push('<div class="alert"><b>Alergia:</b> ' + esc(p.alergia) + "</div>");
    if (p.doenca_cronica) alerts.push('<div class="alert"><b>Doença crônica:</b> ' + esc(p.doenca_cronica) + "</div>");
    if (p.medicamento) alerts.push('<div class="alert"><b>Medicamento contínuo:</b> ' + esc(p.medicamento) + "</div>");
    if (!p.antipulgas_em_dia) alerts.push('<div class="alert"><b>Antipulgas/carrapatos:</b> não está em dia</div>');
    if (!alerts.length) alerts.push('<div class="alert ok"><b>Saúde:</b> sem doenças crônicas, alergias ou remédios contínuos · antipulgas em dia</div>');

    var pode = p.pode_comer, naoPode = PODE_COMER.filter(function (x) { return pode.indexOf(x) < 0; });
    var comer = (pode.length ? '<div class="fx-tags">' + tags(pode.map(function (x) { return "✓ " + x; }), "sage") + "</div>"
      : '<div class="fx-note">Nenhum petisco ou fruta autorizado.</div>') +
      (pode.length && naoPode.length ? '<div class="fx-note" style="margin-top:6px">Não pode: ' + esc(lista(naoPode)) + ".</div>" : "");

    return '<article class="fx-pet">' +
      '<div class="fx-pet-head"><div class="av">🐾</div><div><h4>' + esc(p.nome) + '</h4><div class="fx-tags">' +
        tags(head) + '<span class="tag ' + (p.castrado ? "sage" : "honey") + '">' + (fem ? (p.castrado ? "Castrada" : "Não castrada") : (p.castrado ? "Castrado" : "Não castrado")) + "</span>" +
      "</div></div></div>" +
      '<div class="fx-pet-body">' +
        sec("Saúde", '<div class="alerts">' + alerts.join("") + "</div>" +
          kv([["Veterinário", p.veterinario || "Não informado"], ["Hospital 24h", p.hospitais.join(" · ")]])) +
        sec("Dados", kv([["Nascimento", dataBR(p.nascimento), "half"], ["Idade aproximada", p.nascimento ? "" : p.idade_aproximada, "half"], ["Último cio", p.ultimo_cio, "half"]])) +
        sec("Alimentação", kv([["Rotina", p.alimentacao]]) + '<dl class="kv" style="margin-top:10px"><div><dt>Pode comer</dt><dd>' + comer + "</dd></div></dl>") +
        sec("Comportamento", (p.reacoes.length ? '<div class="fx-tags" style="margin-top:0">' + tags(p.reacoes, "rose") + "</div>" : "") +
          (p.info_adicional ? '<div style="margin-top:10px">' + kv([["Informações adicionais", p.info_adicional]]) + "</div>" : "")) +
      "</div></article>";
  }

  /* Monta o HTML da ficha. d = { tutor, pets }, id = id do tutor, when = Date do cadastro */
  function html(d, id, when) {
    var t = d.tutor;
    var code = id ? id.slice(0, 8).toUpperCase() : "";
    var dt = when.toLocaleDateString("pt-BR") + " às " + when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    var tel = String(t.telefone || "").replace(/\D/g, "");
    return (
      '<div class="ficha">' +
        '<div class="fx-top"><div class="fx-brand"><span class="mk">' + PAW + "</span><span>Ficha cadastral · Ju Petsitter</span></div>" +
          '<div class="fx-title">' + esc(lista(d.pets.map(function (p) { return p.nome; }))) + "</div>" +
          '<div class="fx-meta">' + esc(dt) + (code ? " · nº " + esc(code) : "") + "</div></div>" +
        '<div class="fx-body">' +
          '<div class="fx-block">' + sec("Tutor", kv([
            ["Nome", t.nome],
            ["Telefone", tel ? '<a href="tel:+55' + esc(tel) + '">' + esc(t.telefone) + "</a>" : "", "half", true],
            ["CPF", t.cpf, "half"],
            ["Endereço", t.endereco],
            ["Contato de emergência", t.contato_emergencia]])) + "</div>" +
          d.pets.map(petHtml).join("") +
          '<div class="fx-block">' + sec("Autorizações", '<div class="auths">' +
            '<div class="auth"><span class="ck' + (t.autoriza_fotos ? "" : " no") + '">' + (t.autoriza_fotos ? "✓" : "✕") + "</span><span>" +
              (t.autoriza_fotos ? "<b>Autoriza</b>" : "<b>Não autoriza</b>") + " fotos e vídeos nas redes sociais (sem nome do pet e do tutor).</span></div>" +
            '<div class="auth"><span class="ck">✓</span><span><b>Emergência:</b> autoriza as medidas veterinárias necessárias caso não seja localizado(a), com custos sob sua responsabilidade.</span></div>' +
          "</div>") + "</div>" +
        "</div>" +
        '<div class="fx-foot">Ju Petsitter · Limeira-SP · @jupetslimeira</div>' +
      "</div>"
    );
  }

  /* ---------- PDF no formato celular ----------
     Tira uma "foto" da ficha (html2canvas) e coloca num PDF estreito, numa página comprida
     (jsPDF). As bibliotecas ficam em vendor/ e só são carregadas quando alguém clica. */
  var libs = null;
  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = function () { fail(new Error("Falha ao carregar " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadLibs() {
    if (!libs) libs = Promise.all([loadScript("vendor/html2canvas-1.4.1.min.js"), loadScript("vendor/jspdf-2.5.2.umd.min.js")])
      .catch(function (e) { libs = null; throw e; });
    return libs;
  }
  function nomeArquivo(d) {
    // sem acentos nem símbolos: alguns navegadores trocam nomes com acento por "download"
    var nomes = lista(d.pets.map(function (p) { return p.nome; }))
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ._-]+/g, "").trim();
    return "Ficha - " + (nomes || "pet") + ".pdf";
  }
  function baixarPdf(d, id, when) {
    return Promise.all([loadLibs(), document.fonts ? document.fonts.ready : null]).then(function () {
      var box = document.createElement("div");
      box.style.cssText = "position:fixed;left:-10000px;top:0;width:460px;background:#fff;";
      box.innerHTML = html(d, id, when);
      var el = box.firstChild;
      el.classList.add("fx-export");
      el.querySelectorAll("a").forEach(function (a) { a.removeAttribute("href"); });
      document.body.appendChild(box);
      var fontsReady = document.fonts ? document.fonts.load('700 15px "Ficha Sans"').then(function () { return document.fonts.load('400 15px "Ficha Sans"'); }) : null;
      return Promise.resolve(fontsReady).then(function () {
        return window.html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
      }).then(function (canvas) {
        var jsPDF = window.jspdf.jsPDF;
        var W = 460 * 0.75;                           // largura em pontos (~12 cm)
        var pxPerPt = canvas.width / W;
        var maxH = 14000;                             // limite de altura de página do PDF
        var total = canvas.height / pxPerPt;
        var pdf = null;
        for (var y = 0; y < total; y += maxH) {
          var h = Math.min(maxH, total - y);
          var slice = document.createElement("canvas");
          slice.width = canvas.width; slice.height = Math.round(h * pxPerPt);
          slice.getContext("2d").drawImage(canvas, 0, Math.round(y * pxPerPt), canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          if (!pdf) pdf = new jsPDF({ unit: "pt", format: [W, h], orientation: "portrait", compress: true });
          else pdf.addPage([W, h], "portrait");
          pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, h);
        }
        pdf.setProperties({ title: nomeArquivo(d).replace(/\.pdf$/, ""), author: "Ju Petsitter" });
        var url = URL.createObjectURL(pdf.output("blob"));
        var a = document.createElement("a");
        a.href = url; a.download = nomeArquivo(d);
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      }).finally(function () { box.remove(); });
    });
  }

  window.JuFicha = {
    OPCOES: { HOSPITAIS: HOSPITAIS, PODE_COMER: PODE_COMER, REACOES: REACOES },
    html: html,
    baixarPdf: baixarPdf,
    esc: esc
  };
})();
